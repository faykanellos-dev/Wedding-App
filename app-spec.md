# Wedding Planner by Fay K — App Spec

A plain-language reference for every screen designed so far: what it shows, what data it needs, and what each button does. Written for a developer or no-code builder to work from directly.

**Scope note:** This spec covers version 1 only. Partner collaboration, the Pro tier (AI vendor reviews), and a day-of timeline are intentionally left for a later version — see "Not in v1" at the end.

---

## 1. Entry: redemption code

**Purpose:** Gate the app behind the existing purchase flow (Squarespace → email → code).

| Element | Detail |
|---|---|
| Input | Text field, code format e.g. `FAYK-4821` |
| Button | "Unlock my planner" |
| Validation | Code checked against Vercel KV (already built in the existing paywall) |
| On success | Proceeds to onboarding |
| On failure | Inline error under the field — needs copy, not yet designed |

---

## 2. Onboarding (3 steps + welcome + confirmation)

**Purpose:** Collect the minimum data needed to populate Overview, Checklist, and Budget on first use.

| Step | Screen | Field | Type | Feeds into |
|---|---|---|---|---|
| 0 | Welcome | — | — | — |
| 1 | Wedding date | Date picker | date | Overview countdown, Checklist timeline groupings |
| 2 | Budget | Text/number | currency | Budget tracker total |
| 3 | Guest count | Text/number | integer | Guest list initial estimate (not the actual list) |
| 4 | Confirmation | — | — | Routes to Overview |

**Note:** A "planning with a partner" invite step was designed but cut from v1 — see "Not in v1."

---

## 3. Overview (home tab)

**Purpose:** At-a-glance summary + shortcuts into the other tabs.

| Element | Data needed | Behavior |
|---|---|---|
| Countdown | `wedding_date - today`, in days | Recalculates daily |
| Checklist stat card | `tasks_completed / tasks_total` | Tapping navigates to Checklist tab |
| Budget stat card | `spent / total_budget` as % | Tapping navigates to Budget tab |
| Guests stat card | `confirmed / invited` | Tapping navigates to Guest list tab |
| Wishlist stat card | count of saved vendors, count of categories used | Tapping navigates to Wishlist tab |
| "Up next" list | Next 2 incomplete checklist tasks, ordered by due milestone | Read-only preview |

---

## 4. Checklist tab

**Purpose:** Task list grouped by time-to-wedding milestone.

**Data model per task:**
```
{ id, title, milestone (e.g. "6 months to go"), completed: boolean }
```

**Default milestones (suggested starter checklist):** 12 months, 9 months, 6 months, 3 months, 1 month, Week of.

**Interactions:**
- Tap checkbox icon → toggles `completed`, applies strikethrough + greys out text
- Empty state: "Nothing on your list yet" with two buttons — **"Use suggested checklist"** (bulk-inserts the default list) and **"Add a task"** (manual single entry)

---

## 5. Budget tracker tab

**Purpose:** Track spending against budget, broken down by vendor/category.

**Data model per budget line:**
```
{ id, category, vendor_name, quoted_amount, paid_amount }
```

**Summary stats (computed, not stored):**
- Budget = sum of user's stated total budget
- Spent = sum of all `paid_amount`
- Left = Budget − Spent

**Interactions:**
- Tap an existing line → opens edit modal, pre-filled, with an extra **"Mark as fully paid"** button (sets `paid_amount = quoted_amount`)
- Tap **"Add a vendor to budget"** → opens same modal, blank, titled "Add a vendor to budget"
- Modal fields: Category (dropdown — should share the same list as Wishlist categories), Vendor name, Quoted amount, Paid so far
- Empty state: "No spending tracked yet" → **"Add a budget category"**

**Category dropdown values (should match Wishlist):** Venues, Flowers, Photo & video, Catering, Music, Hair & makeup, Celebrant, Stationery, Transport, Other.

---

## 6. Guest list tab

**Purpose:** Track invitees, RSVP, dietary needs, and table seating.

Two views, toggled at the top: **List** and **Seating**.

### List view

**Data model per guest:**
```
{ id, name, rsvp_status ("confirmed" | "pending"), dietary_tags: [string], table_id (nullable) }
```

**Summary stats:** Invited, Confirmed, Pending, Dietary (count of guests with ≥1 tag).

**Interactions:**
- Dietary tags render as small pills under a guest's name, only if present (no empty tag shown for guests with no requirements)
- **"Add a guest"** → form not yet designed in detail; needs name, RSVP status, dietary tags, party grouping (for couples/families invited together)
- Empty state: "No guests added yet" → **"Add a guest"** or **"Import a list"** (CSV import — not yet scoped)

### Seating view

**Data model per table:**
```
{ id, name (e.g. "Table 1"), capacity, guest_ids: [id] }
```

**Interactions:**
- Unassigned guests shown as a tray of chips at the top (dashed border)
- Each table card shows name, `guests_seated / capacity`, and guest chips (truncates to "+N more" past a few names)
- **Intended interaction: drag guest chip from unassigned tray onto a table** — this is a materially more complex build than anything else in the app (needs a drag-and-drop library, collision/overflow handling for full tables). Flag this to your developer early — it may be worth a simpler v1 (tap a guest → tap a table to assign) before investing in true drag-and-drop.
- **"Add a table"** → form needs table name + capacity

---

## 7. Wishlist tab

**Purpose:** Save and organize vendors under consideration, by category.

**Data model per category:**
```
{ id, name, icon, locked: boolean (Pro-gated), vendor_ids: [id] }
```

**Data model per saved vendor:**
```
{ id, category_id, name, url, notes, review_status (nullable — Pro only, see section 9) }
```

**Interactions:**
- **"Paste a vendor link"** field at top — on submit, needs to fetch/parse the pasted URL to guess a vendor name and category (or ask the user to confirm both) — this parsing logic isn't yet scoped in detail
- Tiles show category name + saved count; count badge only appears once count > 0
- Locked categories (Pro-gated) show a lock icon instead of a count
- Tapping a category opens its vendor list (not yet mocked up — needed next)
- **"Upgrade to Pro"** banner → opens Pro modal (section 8)
- Empty state: "No vendors saved yet" — the paste-link field itself serves as the empty state's call to action, no separate button needed

---

## 8. Pro upgrade modal

**Purpose:** Convert free users to the Pro tier.

**Trigger:** Tapping the "Upgrade to Pro" banner in Wishlist (or a locked category).

**Content:** Three benefit rows (red/green flag vendor reviews, unlimited categories, priority support), price, "Upgrade to Pro" CTA, "Cancel anytime" note.

**Open decision flagged earlier and still unresolved:** whether Pro is a second purchase stacked on top of the existing code-based paywall, or whether it replaces/absorbs it. **Recommend resolving this before building the Pro tier at all** — see "Not in v1" below for the reasoning to delay this.

---

## 9. Vendor AI review (Pro feature — not v1)

**Purpose:** AI checks a saved vendor against Fay's planning standards and returns a red-flag or all-clear result.

**Three states designed:**
1. **Loading** — step-by-step progress list ("Found vendor profile" → "Reading reviews and pricing" → "Comparing to planning standards"), not a percentage bar
2. **Flagged result** — headline ("2 things to check before booking"), 2-3 flagged items each with an observation + a concrete question to ask, plus at least one green checkmark item to keep it balanced. CTA: "Ask these questions at your next call"
3. **All-clear result** — headline ("Nothing concerning found") with a caveat ("Still worth a call before you book"), 3 green checkmark items. CTA: "Move to shortlist"

**Build note:** This needs a real backend AI call per vendor (cost per scan), plus whatever data source it's checking against (scraping the vendor's site/reviews, or a manual data set). This is the most technically involved feature in the whole app — budget real time for it.

---

## 10. Empty states — summary

Every tab needs a distinct empty state before any data exists. Pattern: faded icon, plain-language headline (never "no data"), one-line explanation, one clear primary action button.

| Tab | Headline | Primary action |
|---|---|---|
| Checklist | "Nothing on your list yet" | Use suggested checklist |
| Budget | "No spending tracked yet" | Add a budget category |
| Guest list | "No guests added yet" | Add a guest / Import a list |
| Wishlist | "No vendors saved yet" | (paste-link field itself) |

---

## Not in v1 (deliberately deferred)

Cutting these from the initial build keeps the scope realistic for a solo founder to actually ship:

- **Partner collaboration** — shared editing between two people planning together. Real backend complexity (auth, permissions, sync). Revisit once core app has real users.
- **Pro tier / AI vendor reviews** — genuinely valuable, but it's a second product with ongoing running costs. Ship the core app first, gauge interest, then build this deliberately rather than bundling it into v1 scope.
- **Day-of run-sheet / timeline** — most-used screen in the final week for many couples, but it's a v2 feature once the planning-phase app is solid.
- **True drag-and-drop seating** — a simpler tap-to-assign interaction may be the pragmatic v1; true drag-and-drop is its own scoped piece of work.
- **CSV guest import parsing** — needs its own scoping (expected column format, error handling for malformed files).
- **Vendor link parsing (auto-fill name/category from a pasted URL)** — needs its own scoping; a manual entry fallback should exist regardless.

---

## Suggested build order

1. Redemption code screen (may already exist from current paywall work)
2. Onboarding (3 data-collection steps)
3. Overview, Checklist, Budget, Guest List, Wishlist — core tabs with populated + empty states
4. Add/edit vendor flow in Budget
5. Dietary tags + tap-to-assign seating in Guest List (defer true drag-and-drop)
6. Ship, get real users
7. Only after that: Pro tier, AI vendor reviews, partner invites, day-of timeline
