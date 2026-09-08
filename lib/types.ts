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

export type Vendor = {
  id: string;
  categoryId: string;
  name: string;
  url: string;
  notes: string;
  reviewStatus: null; // Pro-only, out of scope for v1
};

export type Onboarding = {
  weddingDate: string | null; // ISO date
  totalBudget: number | null;
  guestCountEstimate: number | null;
};

export type AppData = {
  unlocked: boolean;
  onboarded: boolean;
  onboarding: Onboarding;
  tasks: Task[];
  budgetLines: BudgetLine[];
  guests: Guest[];
  tables: Table[];
  wishlistCategories: WishlistCategory[];
  vendors: Vendor[];
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
  "12 months to go",
  "9 months to go",
  "6 months to go",
  "3 months to go",
  "1 month to go",
  "Week of",
] as const;
