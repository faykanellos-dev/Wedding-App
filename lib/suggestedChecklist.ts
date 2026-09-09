import { SUGGESTED_MILESTONES } from "./types";

// Starter checklist bulk-inserted by "Use suggested checklist" (app-spec.md §4).
// Pulled straight from Fay's own "Wedding Checklist" chapter (Chapter 2 of the
// Wedding Planner book) — same stages, same task wording, same order she
// already teaches. Easy to edit or remove items after inserting.
export const SUGGESTED_CHECKLIST: { title: string; milestone: string }[] = [
  // 12–18 Months Before — The Big Decisions
  { title: "Set your total budget", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Decide your wedding style", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Create a preliminary guest list", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Choose your preferred wedding date", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Research venues", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Visit venues", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Secure ceremony venue", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Secure reception venue", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Choose your wedding party", milestone: SUGGESTED_MILESTONES[0] },
  { title: "Create your planning folder", milestone: SUGGESTED_MILESTONES[0] },

  // 9–12 Months Before — Build Your Vendor Team
  { title: "Book photographer", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book videographer", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book celebrant", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book florist", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book DJ or band", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book hair stylist", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Book makeup artist", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Begin dress shopping", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Research honeymoon options", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Create wedding website", milestone: SUGGESTED_MILESTONES[1] },
  { title: "Send Save the Dates", milestone: SUGGESTED_MILESTONES[1] },

  // 6–9 Months Before — Lock In The Details
  { title: "Finalise menu direction", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Confirm beverage package", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Book wedding cake", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Book transport", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Confirm styling direction", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Finalise bridal party attire", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Create mood boards", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Order invitations", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Begin ceremony planning", milestone: SUGGESTED_MILESTONES[2] },
  { title: "Set up gift registry", milestone: SUGGESTED_MILESTONES[2] },

  // 4–6 Months Before — Turning Plans Into Reality
  { title: "Send invitations", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Order wedding rings", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Book accommodation", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Schedule dress fittings", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Attend hair trial", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Attend makeup trial", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Draft wedding timeline", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Meet with photographer", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Meet with celebrant", milestone: SUGGESTED_MILESTONES[3] },
  { title: "Review vendor contracts", milestone: SUGGESTED_MILESTONES[3] },

  // 2–3 Months Before — Final Decisions
  { title: "Chase outstanding RSVPs", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Finalise guest numbers", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Create seating plan", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Finalise menu selections", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Confirm dietary requirements", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Confirm ceremony music", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Confirm reception playlist", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Finalise speeches", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Confirm wedding day transport", milestone: SUGGESTED_MILESTONES[4] },
  { title: "Confirm styling elements", milestone: SUGGESTED_MILESTONES[4] },

  // Final Month — Confirmation Month
  { title: "Confirm all vendors", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Confirm arrival times", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Confirm setup times", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Confirm bump-out times", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Finalise run sheet", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Finalise vendor payments", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Prepare emergency kit", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Confirm honeymoon documents", milestone: SUGGESTED_MILESTONES[5] },
  { title: "Confirm wedding party responsibilities", milestone: SUGGESTED_MILESTONES[5] },

  // Final Week — Stay Calm
  { title: "Collect attire", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Pack wedding day items", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Print timelines", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Print seating plans", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Pack honeymoon luggage", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Confirm weather forecast", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Delegate responsibilities", milestone: SUGGESTED_MILESTONES[6] },
  { title: "Get plenty of rest", milestone: SUGGESTED_MILESTONES[6] },

  // Wedding Day — Trust The Plan
  { title: "Eat breakfast", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Drink water", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Stay present", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Follow the timeline", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Let vendors do their jobs", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Enjoy every moment", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Take it all in", milestone: SUGGESTED_MILESTONES[7] },
  { title: "Marry your best friend", milestone: SUGGESTED_MILESTONES[7] },
];
