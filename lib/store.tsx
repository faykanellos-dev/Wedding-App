"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  AppData,
  BudgetLine,
  Guest,
  Table,
  Task,
  TimelineEvent,
  Vendor,
  VendorReview,
  WishlistCategory,
  SUGGESTED_MILESTONES,
} from "./types";

const STORAGE_KEY = "wedding-planner:data";

const DEFAULT_DATA: AppData = {
  unlocked: true,
  onboarded: false,
  proUnlocked: false,
  onboarding: { weddingDate: null, totalBudget: null, guestCountEstimate: null },
  tasks: [],
  budgetLines: [],
  guests: [],
  tables: [],
  // `icon` is kept only for the data shape (see WishlistCategory) — the UI
  // resolves the actual icon from CATEGORY_ICONS in app/(tabs)/wishlist/page.tsx
  // by `id`, so these are just plain labels, not rendered.
  wishlistCategories: [
    { id: "venues", name: "Venues", icon: "venues", locked: false, vendorIds: [] },
    { id: "flowers", name: "Flowers", icon: "flowers", locked: false, vendorIds: [] },
    { id: "photo-video", name: "Photo & video", icon: "photo-video", locked: false, vendorIds: [] },
    { id: "catering", name: "Catering", icon: "catering", locked: false, vendorIds: [] },
    { id: "music", name: "Music", icon: "music", locked: false, vendorIds: [] },
    { id: "other", name: "Other", icon: "other", locked: true, vendorIds: [] },
  ],
  vendors: [],
  timelineEvents: [],
};

// --- External store: syncs `data` with localStorage via useSyncExternalStore,
// so hydration is handled by React itself rather than a manual load-on-mount
// effect (which trips the "no setState in an effect" rule and can flash the
// default/pre-hydration state on guarded routes). ---

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: AppData = DEFAULT_DATA;
let cacheLoaded = false;

function readFromStorage(): AppData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    // proUnlocked is never trusted from localStorage (anyone can edit it in
    // devtools) — Pro status comes from the server, see proState below.
    return { ...DEFAULT_DATA, ...JSON.parse(raw), proUnlocked: false };
  } catch {
    return DEFAULT_DATA;
  }
}

function getSnapshot(): AppData {
  if (!cacheLoaded) {
    cache = readFromStorage();
    cacheLoaded = true;
  }
  return cache;
}

function getServerSnapshot(): AppData {
  return DEFAULT_DATA;
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next: AppData) {
  cache = next;
  cacheLoaded = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort persistence — ignore quota/availability errors
  }
  listeners.forEach((listener) => listener());
}

function mutate(updater: (d: AppData) => AppData) {
  commit(updater(getSnapshot()));
}

// --- Pro entitlement: lives on the server (signed HttpOnly cookie, checked by
// /api/pro/status and by every paid API route). The client only mirrors it
// here for showing/hiding UI; it is never persisted to localStorage. ---
let proState = false;
const proListeners = new Set<Listener>();

function setProState(next: boolean) {
  if (proState === next) return;
  proState = next;
  proListeners.forEach((l) => l());
}

function subscribePro(listener: Listener) {
  proListeners.add(listener);
  return () => proListeners.delete(listener);
}

async function refreshProState() {
  try {
    const res = await fetch("/api/pro/status", { cache: "no-store", credentials: "same-origin" });
    if (!res.ok) return;
    const json = await res.json();
    setProState(json?.pro === true);
  } catch {
    // offline / server unreachable — leave the current state as-is
  }
}

// Standard useSyncExternalStore "has mounted" trick: returns false on the
// server and the first client render (matching SSR output), then true once
// hydration completes — without ever calling setState inside an effect.
function subscribeNoop() {
  return () => {};
}
function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}

type AppDataContextValue = {
  data: AppData;
  ready: boolean;
  setUnlocked: (unlocked: boolean) => void;
  completeOnboarding: (onboarding: AppData["onboarding"]) => void;
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, "id" | "completed">) => void;
  bulkAddTasks: (tasks: Omit<Task, "id" | "completed">[]) => void;
  upsertBudgetLine: (line: BudgetLine) => void;
  addGuest: (guest: Omit<Guest, "id">) => void;
  addTable: (table: Omit<Table, "id">) => void;
  seatGuest: (guestId: string, tableId: string) => void;
  addVendor: (vendor: Omit<Vendor, "id">) => void;
  updateVendorReview: (vendorId: string, review: VendorReview | null) => void;
  upsertTimelineEvent: (event: TimelineEvent) => void;
  bulkAddTimelineEvents: (events: Omit<TimelineEvent, "id">[]) => void;
  deleteTimelineEvent: (id: string) => void;
  redeemProCode: (code: string) => Promise<"ok" | "invalid" | "limited" | "error">;
  recheckPro: () => void;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

let idCounter = 0;
function makeId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pro = useSyncExternalStore(subscribePro, () => proState, () => false);
  const ready = useHydrated();
  const data = useMemo(() => ({ ...stored, proUnlocked: pro }), [stored, pro]);

  useEffect(() => {
    void refreshProState();
  }, []);

  const setUnlocked = useCallback((unlocked: boolean) => {
    mutate((d) => ({ ...d, unlocked }));
  }, []);

  const completeOnboarding = useCallback((onboarding: AppData["onboarding"]) => {
    mutate((d) => ({ ...d, onboarding, onboarded: true }));
  }, []);

  const toggleTask = useCallback((id: string) => {
    mutate((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    }));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "completed">) => {
    mutate((d) => ({
      ...d,
      tasks: [...d.tasks, { ...task, id: makeId("task"), completed: false }],
    }));
  }, []);

  const bulkAddTasks = useCallback((tasks: Omit<Task, "id" | "completed">[]) => {
    mutate((d) => ({
      ...d,
      tasks: [
        ...d.tasks,
        ...tasks.map((t) => ({ ...t, id: makeId("task"), completed: false })),
      ],
    }));
  }, []);

  const upsertBudgetLine = useCallback((line: BudgetLine) => {
    mutate((d) => {
      const exists = d.budgetLines.some((l) => l.id === line.id);
      return {
        ...d,
        budgetLines: exists
          ? d.budgetLines.map((l) => (l.id === line.id ? line : l))
          : [...d.budgetLines, { ...line, id: line.id || makeId("budget") }],
      };
    });
  }, []);

  const addGuest = useCallback((guest: Omit<Guest, "id">) => {
    mutate((d) => ({ ...d, guests: [...d.guests, { ...guest, id: makeId("guest") }] }));
  }, []);

  const addTable = useCallback((table: Omit<Table, "id">) => {
    mutate((d) => ({ ...d, tables: [...d.tables, { ...table, id: makeId("table") }] }));
  }, []);

  const seatGuest = useCallback((guestId: string, tableId: string) => {
    mutate((d) => ({
      ...d,
      guests: d.guests.map((g) => (g.id === guestId ? { ...g, tableId } : g)),
      tables: d.tables.map((t) => {
        const withoutGuest = t.guestIds.filter((id) => id !== guestId);
        return { ...t, guestIds: t.id === tableId ? [...withoutGuest, guestId] : withoutGuest };
      }),
    }));
  }, []);

  const addVendor = useCallback((vendor: Omit<Vendor, "id">) => {
    mutate((d) => {
      const vendorId = makeId("vendor");
      return {
        ...d,
        vendors: [...d.vendors, { ...vendor, id: vendorId }],
        wishlistCategories: d.wishlistCategories.map((c) =>
          c.id === vendor.categoryId ? { ...c, vendorIds: [...c.vendorIds, vendorId] } : c
        ),
      };
    });
  }, []);

  const updateVendorReview = useCallback((vendorId: string, review: VendorReview | null) => {
    mutate((d) => ({
      ...d,
      vendors: d.vendors.map((v) => (v.id === vendorId ? { ...v, reviewStatus: review } : v)),
    }));
  }, []);

  const upsertTimelineEvent = useCallback((event: TimelineEvent) => {
    mutate((d) => {
      const exists = d.timelineEvents.some((e) => e.id === event.id);
      return {
        ...d,
        timelineEvents: exists
          ? d.timelineEvents.map((e) => (e.id === event.id ? event : e))
          : [...d.timelineEvents, { ...event, id: event.id || makeId("timeline") }],
      };
    });
  }, []);

  const bulkAddTimelineEvents = useCallback((events: Omit<TimelineEvent, "id">[]) => {
    mutate((d) => ({
      ...d,
      timelineEvents: [
        ...d.timelineEvents,
        ...events.map((e) => ({ ...e, id: makeId("timeline") })),
      ],
    }));
  }, []);

  const deleteTimelineEvent = useCallback((id: string) => {
    mutate((d) => ({ ...d, timelineEvents: d.timelineEvents.filter((e) => e.id !== id) }));
  }, []);

  const redeemProCode = useCallback(async (code: string) => {
    try {
      const res = await fetch("/api/pro/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        setProState(true);
        return "ok" as const;
      }
      if (res.status === 429) return "limited" as const;
      if (res.status === 401) return "invalid" as const;
      return "error" as const;
    } catch {
      return "error" as const;
    }
  }, []);

  const recheckPro = useCallback(() => {
    void refreshProState();
  }, []);

  const value = useMemo(
    () => ({
      data,
      ready,
      setUnlocked,
      completeOnboarding,
      toggleTask,
      addTask,
      bulkAddTasks,
      upsertBudgetLine,
      addGuest,
      addTable,
      seatGuest,
      addVendor,
      updateVendorReview,
      upsertTimelineEvent,
      bulkAddTimelineEvents,
      deleteTimelineEvent,
      redeemProCode,
      recheckPro,
    }),
    [
      data,
      ready,
      setUnlocked,
      completeOnboarding,
      toggleTask,
      addTask,
      bulkAddTasks,
      upsertBudgetLine,
      addGuest,
      addTable,
      seatGuest,
      addVendor,
      updateVendorReview,
      upsertTimelineEvent,
      bulkAddTimelineEvents,
      deleteTimelineEvent,
      redeemProCode,
      recheckPro,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

// --- Derived stats shared by Overview + tabs (app-spec.md §3) ---

export function daysUntil(dateIso: string | null): number | null {
  if (!dateIso) return null;
  const target = new Date(dateIso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function checklistStats(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  return { completed, total };
}

export function budgetStats(budgetLines: BudgetLine[], totalBudget: number | null) {
  const spent = budgetLines.reduce((sum, l) => sum + (l.paidAmount || 0), 0);
  const total = totalBudget ?? budgetLines.reduce((sum, l) => sum + (l.quotedAmount || 0), 0);
  return { spent, total };
}

export function guestStats(guests: Guest[], guestCountEstimate: number | null) {
  const confirmed = guests.filter((g) => g.rsvpStatus === "confirmed").length;
  const invited = guests.length > 0 ? guests.length : guestCountEstimate ?? 0;
  return { confirmed, invited };
}

export function wishlistStats(categories: WishlistCategory[]) {
  const vendorCount = categories.reduce((sum, c) => sum + c.vendorIds.length, 0);
  const categoriesUsed = categories.filter((c) => c.vendorIds.length > 0).length;
  return { vendorCount, categoriesUsed };
}

export function sortedTimelineEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => a.time.localeCompare(b.time));
}

const MILESTONE_URGENCY = [...SUGGESTED_MILESTONES].reverse(); // "Week of" is most urgent

export function upNextTasks(tasks: Task[], limit = 2): Task[] {
  const incomplete = tasks.filter((t) => !t.completed);
  return [...incomplete]
    .sort((a, b) => {
      const ai = MILESTONE_URGENCY.indexOf(a.milestone as (typeof MILESTONE_URGENCY)[number]);
      const bi = MILESTONE_URGENCY.indexOf(b.milestone as (typeof MILESTONE_URGENCY)[number]);
      const aRank = ai === -1 ? MILESTONE_URGENCY.length : ai;
      const bRank = bi === -1 ? MILESTONE_URGENCY.length : bi;
      return aRank - bRank;
    })
    .slice(0, limit);
}
