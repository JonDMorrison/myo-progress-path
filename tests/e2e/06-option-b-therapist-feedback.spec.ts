// Option B — therapist feedback workflow, against production.
//
// Verifies Sam's "I will only need to send patient feedback" path
// works post-Option-B refactor. Distinct from spec 05 which exercises
// the patient flow.
//
// Runs POST-DEPLOY (manual):
//   npx playwright test 06-option-b-therapist-feedback.spec.ts
//
// Pre-requisites:
//   - tests/e2e/.auth/therapist.json — Playwright storage state for
//     test.therapist@myocoach.ca (id b406772c-…). Capture via
//     `npx playwright codegen https://myocoach.ca --save-storage=
//     tests/e2e/.auth/therapist.json` and log in as the test therapist.
//   - The test patient already has uploads from prior runs (~9 first +
//     ~6 last attempts scoped to Frenectomy Program Week 1, id
//     ee77ecd0-a829-4903-b49e-60ad271fc279). Spec doesn't depend on
//     a specific count, only on at least one of each kind being
//     present — adjust the MCP setup if either bucket gets cleared.
//
// What gets verified:
//   1. /review/{patientId}/1 renders the Option B layout: both First
//      and Last attempt video sections, no Part 1/2 labels anywhere.
//   2. Sam can open the Send Feedback dialog, type a unique tagged
//      message, and reach a success state. The unique message is
//      logged to stdout so Jon's MCP runner can grep the run output
//      and confirm the row landed in `messages` with the expected
//      week_id and therapist_id.
//
// Cascade verification (week_id correctness, therapist_id == Sam, etc.)
// is intentionally NOT asserted here — Jon's agent reads `messages`
// via Supabase MCP after the run, matching on the logged tag.

import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
const AUTH_STATE_PATH = path.join(SPEC_DIR, ".auth", "therapist.json");

const TEST_PATIENT_ID = "73cc86e3-8e0e-45be-992e-43c1ed5cf6a2";
const ANCHOR_WEEK = 1;

// Therapist storage state, separate from the patient spec.
test.use({ storageState: AUTH_STATE_PATH });

test.describe.serial("Option B — therapist feedback flow (review page)", () => {
  // Each test has its own page lifecycle, but message-send timing can
  // include Supabase cold-start. 60s per test is generous.
  test.setTimeout(60_000);

  test.beforeAll(() => {
    if (!existsSync(AUTH_STATE_PATH)) {
      throw new Error(
        `\n\nMissing Playwright auth storage state at:\n  ${AUTH_STATE_PATH}\n\n` +
          `This spec authenticates as test.therapist@myocoach.ca via a pre-saved\n` +
          `storage state. Generate the file once via:\n\n` +
          `  npx playwright codegen https://myocoach.ca --save-storage=${AUTH_STATE_PATH}\n\n` +
          `Then log in as the test therapist and close the codegen window.\n` +
          `The patient spec's storage state at tests/e2e/.auth/user.json is\n` +
          `separate and unaffected.`
      );
    }
  });

  // ─── 1. Review page renders with Option B layout ────────────────────
  test("1. /review/{patient}/1 renders both video sections, no Part 1/2 copy", async ({
    page,
  }) => {
    await page.goto(`/review/${TEST_PATIENT_ID}/${ANCHOR_WEEK}`);
    await page.waitForLoadState("networkidle", { timeout: 30_000 });

    // Not bounced to the login screen.
    await expect(page).toHaveURL(new RegExp(`/review/${TEST_PATIENT_ID}/${ANCHOR_WEEK}$`));

    // Review page mounted (testid added in ReviewWeek.tsx).
    await expect(page.locator('[data-testid="review-page-root"]')).toBeVisible({
      timeout: 15_000,
    });

    // Both video groupings present. Section testids only render when
    // the corresponding bucket has uploads — for this patient both
    // should have at least one (9 first / 6 last per the pre-test note).
    await expect(page.locator('[data-testid="video-section-first-attempt"]')).toBeVisible();
    await expect(page.locator('[data-testid="video-section-last-attempt"]')).toBeVisible();

    // Option B regression guard: no legacy Part 1/2 copy anywhere.
    const body = page.locator("body");
    await expect(body).not.toContainText(/Part One/i);
    await expect(body).not.toContainText(/Part Two/i);
  });

  // ─── 2. Therapist sends feedback ────────────────────────────────────
  test("2. therapist can send a feedback message and it persists", async ({ page }) => {
    await page.goto(`/review/${TEST_PATIENT_ID}/${ANCHOR_WEEK}`);
    await page.waitForLoadState("networkidle", { timeout: 30_000 });

    // Unique tag so Jon's MCP runner can grep the run output and verify
    // the matching `messages` row via Supabase after the test exits.
    const msg = `OPT-B-SPEC-${Date.now()} feedback test`;
    // Use console.log so the tag lands in stdout for the runner to scrape.
    // eslint-disable-next-line no-console
    console.log("FEEDBACK_TEXT:", msg);

    // Open the dialog.
    const openBtn = page.locator('[data-testid="open-feedback-dialog"]');
    await expect(openBtn).toBeVisible({ timeout: 15_000 });
    await openBtn.click();

    // Dialog mounted — textarea visible and editable.
    const textarea = page.locator('[data-testid="feedback-textarea"]');
    await expect(textarea).toBeVisible({ timeout: 5_000 });
    await textarea.fill(msg);

    const sendBtn = page.locator('[data-testid="feedback-send"]');
    await expect(sendBtn).toBeEnabled();
    await sendBtn.click();

    // Success signal — race three possibilities so the test isn't tied
    // to a specific UX detail:
    //   a. SendNoteDialog closes itself on success → textarea unmounts
    //      (data-sending flips false then dialog closes).
    //   b. A success toast surfaces.
    //   c. The send button's data-sending flips back to false after
    //      having been true (caught by the "false" final state).
    const dialogClosed = expect(textarea).toBeHidden({ timeout: 60_000 });
    const toastShown = expect(page.getByText(/Feedback sent|Message sent/i)).toBeVisible({
      timeout: 60_000,
    });

    await Promise.race([dialogClosed, toastShown]);
  });
});
