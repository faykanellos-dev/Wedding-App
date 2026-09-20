// Shared data model — mirrors the schemas in app-spec.md sections 4–7.

export type Task = {
  id: string;
  title: string;
  milestone: string; // e.g. "6 months to go"
  completed: boolean;
};

export type BudgetLine = {
  id: string;
  category: string;
  vendorName: string;
  quotedAmount: number;
  paidAmount: number;
};

export type Guest = {
  id: string;
  name: string;
  rsvpStatus: "confirmed" | "pending";
  dietaryTags: string[];
  tableId: string | null;
};

export type Table = {
  id: string;
  name: string;
  capacity: number;
  guestIds: string[];
};

export type WishlistCategory = {
  id: string;
  name: string;
  icon: string;
  locked: boolean;
  vendorIds: string[];
};

// One item in a vendor's AI review (app-spec.md §9).
export type VendorReviewItem = {
  type: "flag" | "green";
  observation: string;
  // Only present on "flag" items — a concrete question to ask the vendor.
  question?: string;
};

// Result of an AI vendor review — either "flagged" (allClear: false) or
// "all-clear" (allClear: true), matching the two result states in §9.
export type VendorReview = {
  allClear: boolean;
  headline: string;
  // Shown on the all-clear result, e.g. "Still worth a call before you book".
  caveat?: string;
  items: VendorReviewItem[];
  reviewedAt: string; // ISO timestamp
};

export type Vendor = {
  id: string;
  categoryId: string;
  name: string;
  url: string;
  notes: string;
  // Pro-only — null until a review has been run (or re-run) for this vendor.
  reviewStatus: VendorReview | null;
};

export type Onboarding = {
  weddingDate: string | null; // ISO date
  totalBudget: number | null;
  guestCountEstimate: number | null;
};

export type TimelineEvent = {
  id: string;
  time: string; // "HH:MM", 24-hour, sorted on
  title: string;
  notes: string;
};

export type AppData = {
  unlocked: boolean;
  onboarded: boolean;
  // Pro tier (app-spec.md §8) — no payment processor is wired up yet, so this
  // is flipped on client-side by the "Upgrade to Pro" button as a stand-in.
  isPro: boolean;
  onboarding: Onboarding;
  tasks: Task[];
  budgetLines: BudgetLine[];
  guests: Guest[];
  tables: Table[];
  wishlistCategories: WishlistCategory[];
  vendors: Vendor[];
  timelineEvents: TimelineEvent[];
};

export const CATEGORY_OPTIONS = [
  "Venues",
  "Flowers",
  "Photo & video",
  "Catering",
  "Music",
  "Hair & makeup",
  "Celebrant",
  "Stationery",
  "Transport",
  "Other",
] as const;

export const SUGGESTED_MILESTONES = [
  "12–18 Months Before",
  "9–12 Months Before",
  "6–9 Months Before",
  "4–6 Months Before",
  "2–3 Months Before",
  "Final Month",
  "Final Week",
  "Wedding Day",
] as const;
