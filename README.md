# The Wedding Cheat Sheet (web app)

A mobile-first wedding planning app built with Next.js (App Router), React and Tailwind. It started as a rebuild of an earlier version whose source was lost, so **keep this GitHub repo as the source of truth** and commit changes as you go.

> `AGENTS.md` notes that this Next.js version has breaking changes from older releases. Check `node_modules/next/dist/docs/` before changing framework-level code.

## Running it locally

You'll need [Node.js](https://nodejs.org) (any recent version). From this folder:

```
npm install
npm run dev
```

Open http://localhost:3000. There is no access gate: the welcome screen leads straight into onboarding and the app.

To try the **Pro** features locally, create a `.env.local` file (already gitignored) with:

```
PRO_CODES=YOUR-TEST-CODE-1
PRO_TOKEN_SECRET=<a long random string, 32+ characters>
ANTHROPIC_API_KEY=sk-ant-...
```

Then tap "Already purchased? Enter your code" on the Overview tab and enter `YOUR-TEST-CODE-1`.

## Environment variables

| Variable | Required for | What it is |
| --- | --- | --- |
| `PRO_CODES` | Pro | Comma- or newline-separated list of valid Pro codes (each 8+ characters, case-insensitive). These are the codes buyers receive after paying. |
| `PRO_TOKEN_SECRET` | Pro | Long random string (32+ characters) used to sign the Pro cookie. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `ANTHROPIC_API_KEY` | AI vendor reviews | Key from [console.anthropic.com](https://console.anthropic.com). Each review costs a small amount. |

If `PRO_CODES` or `PRO_TOKEN_SECRET` is missing, **Pro stays locked for everyone**.

## How Pro is protected

Pro is enforced on the server, not in the browser:

1. Valid codes live only in the `PRO_CODES` environment variable. They are not in the repo or in the JavaScript sent to browsers.
2. Entering a code calls `POST /api/pro/redeem`, which checks it on the server and sets a signed, HttpOnly cookie (`pro_token`). Page scripts can't read or forge it, and editing localStorage or devtools state does nothing.
3. `POST /api/review-vendor` (the paid feature, and the one that costs Anthropic credits) checks that cookie on every request and returns `402` without it. It is also rate limited and caps input sizes.
4. `GET /api/pro/status` tells the UI whether to show Pro features. Pro status is never stored in localStorage.
5. **Revoking a code:** remove it from `PRO_CODES` and redeploy. Every cookie issued from that code stops working.

Limits to be aware of:

- A code is a shared secret. Someone can pass their code to a friend, so **issue a unique code per buyer** (add each to `PRO_CODES`) and revoke any that leak. Fully tying access to payment (one purchase, one account) needs a payment processor or database, e.g. Stripe Checkout plus a KV store.
- The "unlimited wishlist categories" perk is a UI lock over data stored on the user's own device, so it can't be enforced server-side. The paid feature with real value, AI vendor reviews, is fully server-enforced.
- The rate limiter is in memory per server instance: it slows abuse but isn't a hard global cap.

## Deploying to Vercel

1. Push this folder to GitHub (already set up: `faykanellos-dev/Wedding-App`).
2. Import the repo at vercel.com, then New Project.
3. Add the three environment variables above in Settings, then Environment Variables (Production).
4. Deploy.

Other things to know:

- The lock file (`package-lock.json`) is out of sync with `package.json` (it doesn't list `@anthropic-ai/sdk`). Vercel's `npm install` copes, but `npm ci` fails until you run `npm install` and commit the updated lock file.

## What's real vs. placeholder

- **Data storage**: onboarding, checklist, budget, guests (with tap-to-assign seating), wishlist and timeline all work, but data is stored in the browser's localStorage (per device, not synced, lost if the user clears site data). A real backend is needed before this holds customer data reliably.
- **Pro codes**: checked on the server against `PRO_CODES`, but codes are managed by hand (edit the env var and redeploy). There is no automatic delivery after a Squarespace purchase yet.
- **Pro upgrade link**: the Overview card links to the Squarespace product page; there is no in-app payment.
- **AI vendor reviews** (Pro): `app/api/review-vendor/route.ts` sends the vendor's name, category, link and notes to Claude with web search enabled and returns a green or red flag with sources. Edit the rubric at the top of that file, and the model name in the same file, to change behaviour or cost.
- **PWA**: `public/manifest.json` and `public/sw.js` make the app installable. The service worker deliberately caches nothing.
- **Fonts**: system fonts (Google Fonts weren't reachable when this was built). Swap in Inter + Playfair Display if you like.
- **Not built** (per `app-spec.md`): partner collaboration, drag-and-drop seating, vendor link auto-parsing, CSV guest import.

## Project structure

- `app/page.tsx` welcome screen, `app/onboarding/page.tsx` 4-step onboarding
- `app/(tabs)/{overview,checklist,budget,guests,timeline,wishlist}/page.tsx` the six tabs
- `app/api/pro/redeem/route.ts` checks a Pro code and sets the signed cookie
- `app/api/pro/status/route.ts` reports whether this browser has Pro
- `app/api/review-vendor/route.ts` AI vendor review (Pro only)
- `lib/proServer.ts` server-side Pro codes and cookie signing/verification (never import from client code)
- `lib/rateLimit.ts` small in-memory rate limiter for the API routes
- `lib/store.tsx` app data (localStorage-backed) plus the client's copy of Pro status
- `lib/types.ts` data model, mirrored from `app-spec.md`
- `lib/vendorStandards.ts` planning standards used by the vendor reviewer
- `lib/suggestedChecklist.ts`, `lib/suggestedTimeline.ts` starter content
- `components/ProUnlock.tsx` the "enter your Pro code" widget
