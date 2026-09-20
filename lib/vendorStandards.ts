// Fay's baseline wedding-vendor planning standards, used to brief the AI
// reviewer in app/api/review-vendor/route.ts (app-spec.md §9).
//
// This is a starting rubric, not a fixed one — edit the wording here any
// time to match how you'd actually vet a vendor. No code changes needed
// elsewhere; the API route always reads the latest version of this file.

export const GENERAL_STANDARDS = [
  "A written contract exists covering exactly what's included, the final headcount/scope, and what happens if either side needs to cancel or reschedule.",
  "The deposit and payment schedule are clearly stated, including how much is refundable and under what conditions.",
  "The vendor carries public liability insurance (or the couple's venue requires it).",
  "There's a documented backup plan for illness, a no-show, or equipment failure (e.g. a second shooter, a backup celebrant, a wet-weather plan).",
  "Pricing is transparent up front — no vague \"packages from $X\" with the major inclusions left unclear.",
  "Reviews (Google, Facebook, The Knot / Easy Weddings, etc.) are broadly consistent — a few negative reviews are normal, but a repeated pattern of the same complaint is a flag.",
  "Initial enquiry response time and communication style were prompt and clear — a preview of what booking them will actually be like.",
];

export const CATEGORY_STANDARDS: Record<string, string[]> = {
  venues: [
    "Confirm exclusivity of the space for the booked hours, and what happens if another event on-site runs over.",
    "Check what's actually included (tables, chairs, staff, cleanup) versus billed as extras.",
    "Ask about noise curfews, decoration restrictions, and any preferred-supplier list that limits other vendor choices.",
  ],
  flowers: [
    "Confirm whether specified flowers are seasonal/guaranteed, or substitutions can happen without notice.",
    "Ask about delivery and setup timing relative to the ceremony, and who handles bouquets/buttonholes on the day.",
  ],
  "photo-video": [
    "Confirm turnaround time for edited photos/video and how many images/hours of footage are included.",
    "Ask who owns the raw files, and whether raw footage is available if the edited product is unsatisfactory.",
    "Confirm a second shooter or a backup photographer exists in case of illness.",
  ],
  catering: [
    "Confirm dietary requirement handling (allergies, vegan/halal/kosher) is a standard accommodation, not a costly add-on.",
    "Ask about food safety certification and how headcount changes close to the date are handled.",
  ],
  music: [
    "Confirm equipment backup (gear failure is a common wedding-day disaster) and a backup plan if the performer is unavailable.",
    "Ask about their song-request policy and whether they'll honour a \"do not play\" list.",
  ],
  other: [],
};

export function standardsForCategory(categoryId: string): string[] {
  return [...GENERAL_STANDARDS, ...(CATEGORY_STANDARDS[categoryId] ?? [])];
}
