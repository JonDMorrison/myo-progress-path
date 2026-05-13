# Option B Refactor Plan — Collapse Part 1 / Part 2 into one module page

Author: 2026-05-12. Phase 0 inputs: `phase0a-json-shape.md`, `phase0c-code-references.md`, the entire `src/pages/WeekDetail.tsx`, and every file referenced by phase0c.

> **Stale-reference note** — `phase0c-code-references.md` lists `public/weeks-1-2-updated.json`, `weeks-3-4-updated.json`, `weeks-5-6-updated.json` (10 refs total). Those files and their three admin importer pages (`UpdateWeeks1And2/3And4/5And6.tsx`) were deleted in commit `83e4deb`. The phase0c grep dump is from before that cleanup. Treat those 10 references as already neutralised; the live count of Part 1/2 references is ~36 across ~15 files.

---

## 1. Current flow summary

### Data model
- `public/24-week-program.json`: flat list of 50 week-objects (frenectomy 1–25, standard 1–25). Each is keyed by `{program_variant, week, module}`. **`module` is already 1-indexed and shared between two consecutive weeks** (e.g. weeks 3 and 4 both carry `module: 2`). Phase 0a confirmed zero string literals matching "Part 1/2/One/Two" in the JSON — Part 1/Part 2 is a pure UI concept, derived from `weekNumber % 2`.
- `weeks` table (Supabase): one row per week per program. Weeks 1 and 2 (and every odd/even pair) are separate rows, each with their own UUID. `programs!inner` filters disambiguate.
- `patient_week_progress`: one row per (patient, week). A module has two rows. Status enum: `open | submitted | needs_more | approved`.
- `uploads`: per-exercise media, keyed on `week_id` + optional `exercise_key`. Patients can upload from either the odd or even week.
- `messages`, `therapist_feedback`, `notifications`: all keyed on `week_id`.

### Navigation & gating
- Route is `/week/:weekNumber` (`src/App.tsx:93`). The same `WeekDetail.tsx` renders both odd and even weeks.
- `WeekDetail` derives part-ness from `weekNumber % 2`:
  - **Lines 80–84** — "Part One Complete!" toast fires when `canSubmitState` becomes true on an odd week.
  - **Lines 754–772** — A "You've reached Part Two of Module N" banner shows when `wn % 2 === 0`, no exercise_completions yet, and status open.
  - **Lines 877–918** — Two divergent UIs at the bottom: when `isLastWeekOfModule` is true (even week), render `<SubmitButton>`. When it's the odd week, render a "Start Part Two →" CTA that calls `navigate(\`/week/${weekNumber + 1}\`)`.
  - **Lines 825–828** — A comment explicitly notes the `key={progress.id}` remount on `WeekProgressForm` exists to prevent stale Part One vitals leaking onto Part Two.
- `isLastWeekOfModule(weekNumber, variant)` lives in `src/lib/moduleUtils.ts:304`. It calls `getModuleInfo` and returns `weekNumber === info.weekRange[1]`. For biweekly modules that's the even week.
- Unlock logic in `src/lib/userProgress.ts:101–105` is **module-based**, not week-based: a week is locked iff its `getModuleInfo.moduleNumber > getModuleInfo(lastApprovedWeek+1).moduleNumber`. So approving the even week of module N unlocks **both weeks** of module N+1 simultaneously — the cascade is already module-aware on the unlock side.

### Submission cascade
- `handleSubmitForReview` (`WeekDetail.tsx:457–569`) is the only entry that flips status to `submitted`. Critically (**lines 480–498**) it queries both weeks of the module (`gte/lte` on `weekRange[0..1]`) and does `.update({status:"submitted"}).in("week_id", weekIds)`. So both Part One and Part Two progress rows flip to `submitted` at the same time, but only when the patient clicks Submit on the even week.
- Auto-approve for non-video patients (lines 532–558) calls `approveWeek(progress.id, ...)` with the **even-week progress.id only**. Combined with the next bullet, that leaves Part One sitting at `submitted` forever for non-video patients.

### The "auto-close Part One" trigger — does it exist?
- **No DB trigger exists.** Grepped every migration file for `CREATE TRIGGER` / `CREATE OR REPLACE TRIGGER` against `patient_week_progress`. Only triggers found are `init_exercise_completions_trigger` (initialises a JSONB column on insert) and `on_auth_user_created` (creates patient row at signup). Neither cascades approvals.
- `approveWeek` in `src/lib/reviewActions.ts:27–34` only updates the single row keyed by the passed `progressId`. It does NOT cascade to the partner week. So when Sam approves Part Two, the matching Part One row stays at `submitted` forever (or stays `approved` if she previously approved it manually). The user's prompt assumed there was an auto-close trigger — there isn't. The asymmetry is real but it's an application-layer bug, not a DB-trigger feature to dismantle.

### Checklist
- `WeekCompletionChecklist.tsx` builds a single `requirements: Array<{label, complete, required, icon}>` list per week. The current shape for video items is **one row per video kind**, conditional on `week.requires_video_first` / `week.requires_video_last`:
  - `"First attempt videos submitted"` — requires every active exercise to have a `first_attempt` upload.
  - `"Last attempt videos submitted"` — same but for `last_attempt`.
  - Both flags are pulled from the **per-week** `weeks` row (`requires_video_first`, `requires_video_last`), which the JSON populates with `true/true` for every biweekly week — i.e. both rows currently say "you owe me both kinds of videos." In practice the patient uploads first attempts in the odd week and last attempts in the even week.

### Per-file Part 1/2 surface (after stale-cleanup)
| File | What it does with Part 1/2 |
|---|---|
| `src/pages/WeekDetail.tsx` | All UX described above (10 refs, lines 81, 82, 739, 749, 813, 874, 878, 890, 893, 898). |
| `src/pages/PatientOverview.tsx:87–119` | Therapist's module timeline. Computes `evenWeek`/`oddWeek` per module, prefers even-week progress for status, navigates to `/review/.../${evenWeek}`. |
| `src/pages/ReviewWeek.tsx:110–122, 451–454` | Loads uploads from BOTH partner weeks; tags messages with "Part One"/"Part Two" via `% 2`. |
| `src/lib/reviewActions.ts:50, 209, 275` | Builds `partLabel` in approve/needs_more/reassign **notifications + messages** (text only — no behavioural cascade). |
| `src/lib/emailTemplates.ts:6` | `getModuleLabel` does `Math.ceil/2 + Part One/Two` for every email subject and body. |
| `src/lib/moduleUtils.ts:294–297` | `cleanWeekTitle` strips "Part One:" / "Part Two:" prefixes from legacy DB titles. |
| `src/components/week/SubmitBar.tsx:46` | Idle-state copy mentions "Part Two". |
| `src/components/week/ClinicianReviewBanner.tsx:12` | Tags awaiting-review banner with Part One/Two. |
| `src/components/therapist/MaintenanceAssignmentDialog.tsx:81, 120, 178` | Practice-assignment dialog lets Sam pick a single week (odd or even) and labels by part. |
| `src/components/maintenance/MaintenanceDashboard.tsx:67` | Patient-facing maintenance list, same labeling. |
| `src/components/therapist/ReviewPanel.tsx:146` | Comment only; logic already correctly loads both partner weeks. |
| `src/components/therapist/TherapistFeedbackDialog.tsx:223, 269` | Builds "for Module N Part X" context string for feedback toast/dialog. |
| `supabase/functions/export-master-patients/index.ts:98` | CSV export labels current-week column with Part One/Two. |
| `supabase/functions/send-reminders/index.ts:59` | Daily email picks the patient's earliest `open` week and labels it. |
| `supabase/migrations/20251021185227_…sql:7, 22` | Updates two weeks rows' `title` column to "(Part 1)" / "(Part 2)" strings. Superseded by JSON-as-source-of-truth (`CLAUDE.md` rule), so these strings are dead data but still in the DB. |

---

## 2. Target flow (Option B)

**One patient-facing page per module, anchored on the odd week.** The even week is no longer visited by patients.

### Patient experience
- `/week/1`, `/week/3`, `/week/5`, … render the module page. Patient visits the same page twice across two weeks:
  - **Day 0 of module**: records first-attempt videos for each active exercise, logs day-0 BOLT / nasal % / tongue %, marks Learn Hub reviewed (Module 1 only) and frenectomy consult (Module 1 frenectomy only).
  - **Day ~14 of module**: returns to the same page, records last-attempt videos, optionally re-records biometrics, clicks **Submit Module**.
- No interim approval, no "Part One Complete" toast, no "Start Part Two →" button, no "You've reached Part Two" banner.
- Submission is a single event at the end of the module. Sam reviews and approves once. The next module unlocks.

### Therapist experience
- `PatientOverview` timeline already lists one row per `moduleNum`; we just stop showing two underlying weeks.
- `ReviewWeek` continues to receive the even-week id from the timeline links (or we change the link to point at the odd week — see §5). It already loads uploads from both partner weeks (`ReviewWeek.tsx:110–122`), so the data shape is fine. The single approval action operates on the even week's progress row; the odd week's row is force-synced to `approved` at the same moment (see §7).

### Checklist (single page)
The right-column checklist on the module page gets:
- **First attempt videos submitted** (existing item, behaviour unchanged: must have a `first_attempt` upload for every active exercise tied to either week of the module).
- **Last attempt videos submitted** (existing item, behaviour unchanged: same shape for `last_attempt`).
- BOLT, Nasal %, Tongue on Spot %, Exercise sessions, Learn Hub (Module 1), Frenectomy consult (Module 1 frenectomy) — all unchanged.
- The "Submit Module" button enables only when BOTH video items + all biometric items are green. That's already what `calc_week_progress` requires for any week with `requires_video_first AND requires_video_last AND requires_bolt(or not)`; we just stop splitting which week each item is checked against.

---

## 3. File-by-file change list (in order)

Ordered so each step compiles on its own and the patient flow keeps working even if we stop midway.

### Step 1 — DB-layer truth (no patient-facing change yet)
1. **`src/lib/reviewActions.ts:27–34`** — change `approveWeek` to update **both partner-week progress rows** (the passed `progressId` plus the odd-week sibling) in one UPDATE. Mirror the submission-side cascade already in `WeekDetail.tsx:489–498`. This closes the bug where Part One stays `submitted` forever. Low blast radius because both rows already follow the same submit-status trajectory.
2. **New migration** — backfill: for every patient where Part Two is `approved` and the matching Part One is anything other than `approved`, set Part One to `approved`. One-shot SQL, no schema change. Required so existing patient data isn't inconsistent post-cutover.

### Step 2 — Single source of truth for "what week am I really on" (still no patient-facing change)
3. **`src/lib/moduleUtils.ts`** — add a new helper `getModuleAnchorWeek(weekNumber, variant): number` that returns the odd week of the module (the post-op weeks 9/10 stay as themselves; module 13 of standard / module 14 of frenectomy stay as themselves since they are single-week modules). All future patient-page navigation routes through this.
4. **`src/lib/userProgress.ts`** — unchanged externally, but `currentWeek` (line 83) should resolve to the anchor week. Today it can land on an even week if the odd week's progress is `approved`; under Option B that case shouldn't happen, but defensive: clamp via `getModuleAnchorWeek`.

### Step 3 — Patient page cutover (the actual UX change)
5. **`src/App.tsx:93`** — keep the route as `/week/:weekNumber` but add a small redirect wrapper: if a patient hits an even week and Option B is enabled, `navigate(\`/week/${weekNumber - 1}\`, { replace: true })`. Therapists/admins bypass the redirect (their preview must still let them see the even-week JSON). This is the cleanest cutover: no link rewriting elsewhere.
6. **`src/pages/WeekDetail.tsx`** — substantive edits:
   - Remove the "Part One Complete!" toast branch (lines 79–84).
   - Remove the Part-Two orientation banner (lines 754–772).
   - Remove the "non-last-week" else branch (lines 885–917) — the page always renders `<SubmitButton>` when the patient is on the anchor week and the checklist is green. The submit handler stays the same; the "this is the last week of the module" guard becomes "this is the anchor week of the module" via `getModuleAnchorWeek`.
   - Rewrite the `Part Two` copy in `SubmitBar.tsx:46` (call site: this same file).
   - Verify the `progress.id` remount on `WeekProgressForm` (lines 825–839) is still needed once we never navigate between odd/even weeks. It probably is — patients still navigate between **modules**, so the remount key still has work to do. No change.
   - Keep `handleSubmitForReview`'s `.in("week_id", weekIds)` cascade — same code, same blast radius.
7. **`src/components/week/SubmitBar.tsx:46`** — rewrite the idle copy. New copy: `"Complete all exercises and record your biometrics (BOLT score, nasal breathing %, tongue on spot %) to submit this module for review."` Drop "Part Two".
8. **`src/components/week/WeekCompletionChecklist.tsx`** — no functional change. The two video items (`requires_video_first`, `requires_video_last`) already exist and already do the right shape. Sanity check that on the anchor-week page, uploads from BOTH partner weeks are visible to the checklist's `uploads` prop. Today the page passes `uploads` filtered by the current week's `week.id` (line 333–341); for Option B we need it to query `.in("week_id", [oddWeekId, evenWeekId])` like `ReviewWeek.tsx` already does. **This is the easy-to-miss bit.** Mark it.
9. **`src/components/week/LearnHubReviewTask.tsx`** — already resolves synthetic week ids (commit `00c72d1`). No change.
10. **`src/pages/PatientDashboard.tsx:271`** — `navigate(\`/week/${weekNumber}\`)` currently sends patients to whatever week the dashboard thinks is current. Wrap in `getModuleAnchorWeek` so a patient mid-module always lands on the odd week.

### Step 4 — Therapist surface (labels only)
11. **`src/lib/emailTemplates.ts:6`** — `getModuleLabel` drops the "Part One/Part Two" suffix. New shape: `"Module ${moduleNum}"`. The next-module-label (line 46) becomes `Module ${moduleNum+1}` — actually a small bug: `getModuleLabel(weekNumber+1)` from an even week would land on the same module's odd week. Need to compute the *next module's* anchor instead. Flag this.
12. **`src/lib/reviewActions.ts:50, 209, 275`** — drop `partLabel`. `moduleLabel` becomes plain `Module ${moduleNum}`.
13. **`src/pages/ReviewWeek.tsx:451–454`** — strip the "Part One"/"Part Two" label on patient-message headers. Group messages by module instead.
14. **`src/components/therapist/MaintenanceAssignmentDialog.tsx:81, 120, 178`** — remove Part labels from the picker. Each module is one option; the dialog stores the even-week id under the hood for compatibility with downstream `maintenance_assignments.week_id`, OR (cleaner) we change `MaintenanceDashboard.tsx:67` and the assignment record to anchor on the odd week.
15. **`src/components/maintenance/MaintenanceDashboard.tsx:67`** — drop the Part label.
16. **`src/components/therapist/TherapistFeedbackDialog.tsx:223, 269`** — drop the Part label from the toast/dialog context string.
17. **`src/components/week/ClinicianReviewBanner.tsx`** — drop Part label; banner now says `"Module N: Awaiting clinician confirmation."`.
18. **`supabase/functions/export-master-patients/index.ts:98`** — CSV column drops Part suffix.
19. **`supabase/functions/send-reminders/index.ts:59`** — reminder email drops Part suffix and links to the anchor week.
20. **`src/lib/moduleUtils.ts:294–297`** — `cleanWeekTitle` keeps stripping legacy "Part One:" / "Part Two:" prefixes (defensive against the migration-written DB titles).

### Step 5 — Tidy the DB titles (optional, low priority)
21. **New migration** — `UPDATE weeks SET title = … WHERE title LIKE '%Part 1%' OR title LIKE '%Part 2%'`. Strip the suffixes from the two rows the old migration `20251021185227_…sql` wrote. Pure cosmetic — the JSON has overridden these everywhere except the legacy migration history.

### Non-trivial flags
- **Step 5 (App.tsx redirect)** is a routing change with subtle interaction: it must not break therapist preview (`?variant=` query param + isReadOnly logic in WeekDetail) and must not bounce patients who deep-link from an old email pointing to `/week/4`.
- **Step 8 (uploads scope)** is the easy-to-miss correctness bug. If we forget it, the anchor-week page won't show last-attempt videos uploaded in the even week (because that's a synthetic case anyway once even weeks aren't visited — but legacy uploads from existing mid-program patients live under the even-week id).
- **Step 11 (next-module-label)** has an off-by-one trap.

---

## 4. DB impact

### Schema changes — none required.
- `weeks` rows for even weeks remain in the DB. They keep their existing UUIDs, their exercises (from JSON anyway, so irrelevant), their `requires_video_*` flags. Patients no longer route to them but the data is preserved.
- `patient_week_progress` rows for even weeks remain. They continue to flip with their partner via the submission cascade (existing) and the new approval cascade (Step 1).
- `uploads`, `messages`, `therapist_feedback`, `notifications`, `maintenance_assignments` keep their `week_id` column unchanged. ReviewPanel and ReviewWeek already query across partner weeks (`partnerNum % 2` logic at `ReviewPanel.tsx:158` and `ReviewWeek.tsx:111`), so historical data stays visible to Sam.

### Trigger work
- **None.** There's no auto-close trigger to drop or rewire. The whole "Part Two approve cascades to Part One" semantic has to be added in **application code** (Step 1) because it never existed at the DB layer in the first place.

### Backfill
- One-shot SQL to mark every `(patient, odd_week)` row `approved` where the matching `(patient, even_week)` is `approved`. Idempotent. Required to keep `userProgress.ts:91` (`isComplete = progress.status === "approved"`) accurate for historical patients.
- Optional: backfill `submitted` → `submitted` for in-flight rows where one half is `submitted` and the other isn't. Probably already in sync because `handleSubmitForReview` writes both, but a safety net SQL is cheap.

### Orphan question
- Even-week `weeks` rows are referenced by:
  - `patient_week_progress` (still kept and updated)
  - `uploads` (historical)
  - `messages` (historical)
  - `therapist_feedback`, `notifications` (historical)
  - `maintenance_assignments` (Sam can still assign an even week if we don't change `MaintenanceAssignmentDialog`)
- Nothing is orphaned. The even week becomes "addressable but not patient-visible" — fine.

---

## 5. Routing impact

### `/week/:weekNumber` — keep the route
- The route stays as the patient-facing entry. We add a redirect wrapper inside `WeekDetail` (Step 5): if `weekNumber` is even AND auth role is `patient` AND post-op weeks 9/10 are excluded (post-op weeks ARE displayed as themselves), redirect to `weekNumber - 1`.
- Therapist/admin/super_admin roles bypass the redirect — they need to be able to preview the even-week JSON (the JSON file still has 50 entries) and Sam needs to navigate to specific even weeks via `/review/:patientId/:weekNumber`.
- Post-op weeks 9 and 10 are NOT collapsed (each is its own module per `moduleUtils.ts:198–215`). The even-week redirect must check `FRENECTOMY_POST_OP_WEEKS.includes(weekNumber)` and skip in that case.

### `/review/:patientId/:weekNumber` (therapist) — unchanged
- The link from `PatientOverview` currently points to `weekNum = mod.evenWeek` (`PatientOverview.tsx:295, 352`). Could leave as-is (Sam reviews on the even-week id, which is where the approval lives) OR switch to the odd week and update `approveWeek` to know about the partner. Easier to leave it pointing at the even week.

### Stale email/SMS links
- The reminder email (`send-reminders/index.ts:71`) builds `…/week/${week.number}` from "the patient's earliest open week." With Option B that's still the anchor (odd) week because patients only land on odd weeks. No change needed beyond Step 4.
- Existing emails sitting in patients' inboxes pointing at `/week/4` will hit the redirect and bounce to `/week/3`. Acceptable.

### 404 vs redirect for even weeks
- Patients hitting an even week: **redirect**, not 404. They're presumably mid-program and the old link should still resolve.
- Sam hitting an even week: **render as today**. She might be reviewing historical Part Two content.
- Direct URL-typed even week as a patient: same as bullet 1, redirect.

---

## 6. Checklist impact

### Current shape (`WeekCompletionChecklist.tsx:64–132`)
```
[
  (week 1 only) Learning Hub topics reviewed,
  (if videoRequired) First attempt videos submitted,    ← controlled by week.requires_video_first
  (if videoRequired) Last attempt videos submitted,     ← controlled by week.requires_video_last
  BOLT Test done,
  Nasal Breathing chart completed,
  Tongue on Spot chart completed,
  Exercise sessions (N/M),
  (if module 1 frenectomy) Frenectomy consultation,
]
```

### Target shape (Option B)
**Identical.** Both video items are already present in the array. They are not currently coupled to "Part One vs Part Two" — they each check a different `kind` (`first_attempt` / `last_attempt`) across all active exercises. Today both video items appear in both Part One and Part Two checklists; that's redundant but not broken. Post-Option-B there's just one page so the redundancy disappears.

### Real change in this area
- **Source of `uploads` prop** must include both partner weeks (Step 8). Without that, the anchor page reads only the odd-week uploads and "Last attempt videos submitted" stays red even after the patient uploads last attempts. This is the single biggest correctness risk in the whole refactor.

### What happens to the existing `requires_video_first` / `requires_video_last` columns
- They stay on the `weeks` table. The odd-week row keeps both `true` (anchor) and the even-week row's flags become irrelevant (no patient ever sees a checklist computed from them). Sam's read-only preview of even weeks will still build a checklist, which is fine.

---

## 7. Approval flow impact

### Today
- Sam clicks Approve in `ReviewPanel` → `approveWeek(progress.id, patient.id, weekNumber, note)` in `reviewActions.ts`.
- `progress.id` is the patient_week_progress row for whatever week Sam navigated to (almost always the even week, because `PatientOverview` links to `evenWeek`).
- `approveWeek` updates that one row, fires notification, unlocks `weekNumber + 1` by creating/reopening the patient_week_progress row for the next week.
- **Today's bug**: the odd-week row is never updated. `userProgress.ts:91` (`isComplete = progress.status === "approved"`) therefore looks at the odd-week row and sees `submitted`, never `approved`. `completedCount` undercounts by 1 per module. The reason patients still progress is that `userProgress.ts:101–105` gates by **module**, not by individual week, so the unlock works anyway — but `completedWeeks` and `percentComplete` are off.

### Target
- Sam clicks Approve once at the end of the module. `approveWeek` updates the even-week row AND the odd-week row to `approved` (Step 1).
- Unlock logic: `approveWeek` currently increments `nextWeekNumber = currentWeekNumber + 1` (line 99) and creates progress for that week. For Option B that should become `nextAnchorWeek = currentWeekNumber + 1` if `currentWeekNumber` is even, or `currentWeekNumber + 2` if odd. (Sam's normal flow keeps her on even weeks, so the existing `+1` likely already points to the next odd week — confirm before refactoring.) Either way, the existing "create progress for next week" path is fine; we just want to also create or already-have the next even week's progress row so the cascade chain stays intact.
- Notification text drops Part suffix (Step 12).

### In-flight Part One approvals at cutover
- A patient currently sitting on Part Two of Module 5: when Option B ships, their next page-load runs the redirect, lands them on the odd week (Module 5 anchor). Their odd-week progress row is in whatever state they last left it (`open`, `submitted`, or `approved`). The submit-cascade already kept it in sync.
- A patient who has Part One `submitted` but never had Part Two `submitted` (rare; would require Sam to have manually toggled status): they land on the anchor, the checklist may already show as complete, the Submit button decides based on `calc_week_progress`. No data corruption.
- A patient whose Part One Sam approved manually but Part Two is still `open`: edge case. Lands on anchor, the page reads odd-week progress (`approved`), `notYetReviewed = false` (per `canSubmit` line 452), Submit button stays disabled. They're effectively done with the module. Backfill SQL in §4 catches this by force-syncing.

---

## 8. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Uploads not loading from partner week on anchor page** (Step 8) | Medium | High — patient can't see/satisfy last-attempt video item, submit blocked | Step 8 explicitly changes the uploads query to `.in("week_id", [oddWeekId, evenWeekId])`. Add an integration test on a fixture patient with first-attempt uploads on odd and last-attempt on even — confirm the checklist goes green. |
| **Patients mid-flow hit a redirect mid-session** | High | Low — visible bounce, no data loss | Acceptable; mention in release notes. |
| **`getModuleAnchorWeek` returns wrong week for post-op (9, 10)** | Medium | Medium — frenectomy patients on post-op weeks get redirected wrongly | Post-op weeks 9 and 10 are single-week modules in `moduleUtils.ts:198–215`. The anchor helper must return the week itself (not the partner). Add unit-style guard. |
| **Therapist preview broken** | Medium | Low — Sam sees synthetic flicker | Bypass redirect when `authRole !== 'patient'` (Step 5). |
| **`PatientOverview.tsx:91–105` derives module status from "prefer even-week" rule** | Low | Medium — once approval cascades to odd week, status logic still works because both rows match | Verify in §1's backfill that the rule still produces the right status. |
| **`userProgress.ts` `completedWeeks` count flips after backfill** | Medium | Low | The count goes UP for existing patients (each approved module now counts 2 weeks instead of 1). `percentComplete` will jump correspondingly. Decide whether to convert these metrics to "completed modules" instead of "completed weeks" — Sam-facing dashboards probably already show modules. |
| **Maintenance assignment dialog (`MaintenanceAssignmentDialog.tsx`) lets Sam pick an even week** | Low | Low — assignment still works, label just looks weird | Step 14 collapses to one option per module. Existing assignments keep their even-week `week_id`. |
| **Stale email links sending patients to `/week/${even}`** (`send-reminders`, `submittedWeekEmail`) | High | Low — redirect handles it | Redirect handles it, but update Step 19 and `submittedWeekEmail` link generation. |
| **Auto-approve for non-video patients (`WeekDetail.tsx:535`) currently calls `approveWeek` with only the even-week progress.id** | Medium | Low after Step 1 | Step 1 makes `approveWeek` cascade, so this becomes self-healing. |
| **The legacy migration `20251021185227_…sql` titles in `weeks.title`** | Low | Cosmetic | `cleanWeekTitle` already strips them. Step 21 cleans the DB too. |
| **24-week-program.json shape is unaffected** — but if anyone later tries to seed Supabase from JSON, both weeks of a module would re-create. | N/A | N/A | Out of scope; CLAUDE.md already forbids seeding scripts. |

---

## 9. Rollout plan

### Recommended: hard cutover, ordered steps

This is small enough that a feature flag is overkill — Sam is the only therapist, ~handful of patients. Hard cutover with backfill ahead of release.

1. **PR 1 (backend only, behaviourally invisible)**: Steps 1–2.
   - Cascade approval in `reviewActions.ts`.
   - Run backfill SQL.
   - Add `getModuleAnchorWeek` helper.
   - Ship & let bake for 24h. Verify no patient is stuck.
2. **PR 2 (patient surface)**: Steps 5–10.
   - Redirect, WeekDetail rewrites, uploads-scope fix, SubmitBar copy, PatientDashboard navigation.
   - Run smoke test as Jon's test account: submit a module from a freshly-reset state.
   - Ship.
3. **PR 3 (therapist surface + emails)**: Steps 11–19.
   - Label-only changes. Low risk.
4. **PR 4 (cosmetic)**: Steps 20–21. Optional, can wait.

### Why not behind a flag
- Feature flags add complexity for an audience of ~1 therapist + small patient cohort. The patient-side redirect (Step 5) is itself a kind of flag — if anything breaks, reverting that one file lets patients see Part Two again.
- The backfill is the only one-way operation, and it's idempotent.

### Mid-program migration
- Backfill SQL runs once. After that:
  - Approved modules: both weeks at `approved`.
  - In-flight modules where the patient hasn't yet submitted: both rows at `open` (already in sync via the submit cascade).
  - In-flight modules where Part One submitted but not Part Two: rare and should already be `submitted`/`submitted`. If not, the second pass of backfill SQL syncs them.
- No patient needs to redo anything.

### Rollback
- Revert PR 2. The redirect goes away, patients see Part Two again. PR 1's cascade is benign even if PR 2 is reverted.
- Backfill SQL is not reverted (force-syncing is correct in both worlds).

---

## 10. Open questions for Sam

1. **What happens to a patient currently sitting on a Part Two page when this ships?** Default answer: they hit the redirect, land on the anchor week, page-load completes normally, their progress is unchanged. Does Sam want any of them to see a "your flow has been simplified" banner the first time, or silent migration?
2. **Approval cascade — does Sam want to be able to approve "Part One only" as a checkpoint going forward?** Today she technically can (`approveWeek` only touches the single row); Option B removes that affordance because patients never visit Part One as a separate page. Confirm this is intended.
3. **Module-13 post-program review** (standard wk25) **and Module 14 post-program review** (frenectomy wk25) are single-week modules. They're already exempt from the Part 1/2 logic. Confirm Sam wants them displayed as-is.
4. **Post-op weeks 9 and 10** (frenectomy) are already single-week modules. They should NOT be collapsed. Confirm.
5. **`maintenance_assignments`** today lets Sam pick a specific week. Does she want one practice item per module post-cutover, or does she want to keep the ability to assign just "Part One exercises"?
6. **`completedWeeks` metric jump** — existing patients' `percentComplete` will jump up by ~half a module per approved module after backfill. Does Sam care, or do we just communicate?
7. **Email subject lines** — currently say `"Module 5 Part One Approved! 🎉"`. New form would be `"Module 5 Approved! 🎉"`. Confirm wording.
8. **Patient overview timeline** — the module row currently links to `/review/${patientId}/${evenWeek}`. After cutover, should it link to `/review/${patientId}/${oddWeek}` so Sam reviews "from the start of the module"? Or keep pointing at the even week where the approval action lives?
9. **`24-week-program.json`** keeps two entries per module today. Should we collapse to one entry per module long-term (separate refactor), or keep the two-entries shape forever as "Day-0 content vs Day-14 content" inside the same page? This decision is downstream of Option B, not blocking.
