# Wedding Planner by Fay K — fresh copy

This is a rebuilt copy of the app (the original project's source code couldn't be located — see notes below), matching `app-spec.md` for the redemption code gate, onboarding, and the four core tabs, with a fully built-out **Overview** screen per section 3 of the spec.

## Running it locally

You'll need [Node.js](https://nodejs.org) installed (any recent version). Then, from this folder:

```
npm install
npm run dev
```

Open http://localhost:3000 in your browser. Use redemption code **FAYK-4821** (or **FAYK-DEMO**) to get past the gate.

To try the AI vendor review feature locally, also create a `.env.local` file in this folder with:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key from [console.anthropic.com](https://console.anthropic.com) (API Keys). `.env.local` is already gitignored, so the key never gets committed.

## Deploying to Vercel

1. Push this folder to a GitHub repository (this makes future edits — by you, a developer, or me in a future session — much easier to track).
2. Import the repo at vercel.com → New Project.
3. Add the `ANTHROPIC_API_KEY` environment variable in the Vercel project settings (Settings → Environment Variables) so AI vendor reviews work in production.
4. Deploy.

**Keep the GitHub repo going forward** — that's what went missing with the original app, which is why this had to be rebuilt from the spec rather than edited directly.

## What's real vs. placeholder

- **Redemption code paywall**: functional, but checks codes against an in-memory list in `lib/codes.ts` rather than Vercel KV (no KV database is connected in this fresh copy). Swap in a real KV lookup there before relying on it for real purchases — the comment in that file shows where.
- **Onboarding, Overview, Checklist, Budget, Guest List (incl. tap-to-assign seating), Wishlist, Timeline**: fully functional, storing data in the browser's local storage (per-device, not synced across devices or to a server). Good for demoing and for you to click through; will need a real backend (a database) before this handles real customers' data reliably.
- **Fonts**: uses system fonts rather than next/font/google, because this build environment couldn't reach Google's font CDN. Fine to leave as-is, or swap in your preferred fonts (Inter + Playfair Display were used previously) once deployed somewhere with normal internet access — see the note at the top of `app/layout.tsx`.
- **Vendor link auto-parsing** (guessing a vendor's name/category from a pasted URL) and **CSV guest import**: both explicitly out of scope for v1 per the spec — the Wishlist "paste a link" flow asks you to confirm the name/category manually instead.
- **Day-of timeline**: now built — a sixth tab where you can start from a suggested 20-event run-sheet (8am–11pm) or build your own, and edit/delete any event.
- **Checklist**: the "Use suggested checklist" starter list has been expanded to 48 tasks across the six milestone buckets (12/9/6/3/1 months out, and week-of), covering budget, vendors, attire, legal paperwork, stationery, and final-week logistics.
- **Pro tier / AI vendor reviews**: now built (app-spec.md §8–9). Tapping "Upgrade to Pro" flips a client-side `isPro` flag on — there's no real payment processor wired up yet, so this is a stand-in for testing until you decide how Pro is actually sold (a separate purchase, or bundled into the existing redemption code — see the open decision noted in app-spec.md §8). Once Pro is on, each saved vendor gets a "Run AI review" button in its category's vendor list, which calls `app/api/review-vendor/route.ts`. That route sends the vendor's name/category/notes to Claude (Anthropic API) along with the planning-standards checklist in `lib/vendorStandards.ts`, and returns a flagged or all-clear result. **This costs a small amount per review** (an Anthropic API call) — see the model comment in `route.ts` if you want to swap to a cheaper model. It does not scrape the vendor's actual website or pull real reviews; it reasons from what you type in against general red flags for that vendor category. Edit `lib/vendorStandards.ts` any time to change what it checks for — no code changes needed elsewhere.
- **Partner collaboration, true drag-and-drop seating**: not built, per the spec's "Not in v1" list.

## Project structure

- `app/page.tsx` — redemption code screen
- `app/onboarding/page.tsx` — 4-step onboarding
- `app/(tabs)/overview/page.tsx` — **Overview screen (the requested deliverable)**
- `app/(tabs)/{checklist,budget,guests,wishlist,timeline}/page.tsx` — the other five tabs
- `app/api/verify-code/route.ts` — redemption code check
- `app/api/review-vendor/route.ts` — AI vendor review (Pro feature)
- `lib/store.tsx` — shared app data (local-storage backed) and the stat calculations Overview uses
- `lib/types.ts` — data model, mirrored from `app-spec.md`
- `lib/vendorStandards.ts` — the planning-standards checklist the AI vendor review checks against
- `lib/suggestedChecklist.ts` / `lib/suggestedTimeline.ts` — starter content for "Use suggested checklist" / "Use suggested run-sheet"
