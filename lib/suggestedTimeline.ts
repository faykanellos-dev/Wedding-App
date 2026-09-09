import { TimelineEvent } from "./types";

// Starter day-of run-sheet bulk-inserted by "Use suggested run-sheet".
// Times are a realistic default for an afternoon ceremony / evening reception —
// easy to drag the times around once inserted since every event is editable.
export const SUGGESTED_TIMELINE: Omit<TimelineEvent, "id">[] = [
  { time: "08:00", title: "Hair & makeup begins", notes: "" },
  { time: "10:30", title: "Photographer & videographer arrive", notes: "Getting-ready photos" },
  { time: "11:30", title: "Get dressed", notes: "" },
  { time: "12:00", title: "First look / bridal party photos", notes: "" },
  { time: "13:00", title: "Transport departs for ceremony venue", notes: "" },
  { time: "13:30", title: "Guests begin arriving", notes: "" },
  { time: "14:00", title: "Ceremony begins", notes: "" },
  { time: "14:30", title: "Ceremony ends — confetti & congratulations", notes: "" },
  { time: "14:45", title: "Family & group photos", notes: "" },
  { time: "15:30", title: "Cocktail hour", notes: "Guests transition to reception venue" },
  { time: "16:30", title: "Couple & bridal party photos", notes: "Golden hour if possible" },
  { time: "17:30", title: "Guests seated for reception", notes: "" },
  { time: "17:45", title: "Bridal party & couple entrance", notes: "" },
  { time: "18:00", title: "Welcome speech & meal service begins", notes: "" },
  { time: "19:00", title: "Speeches & toasts", notes: "" },
  { time: "19:45", title: "Cake cutting", notes: "" },
  { time: "20:00", title: "First dance", notes: "" },
  { time: "20:15", title: "Dancefloor opens", notes: "" },
  { time: "22:30", title: "Bouquet / garter toss (optional)", notes: "" },
  { time: "23:00", title: "Send-off", notes: "" },
];
