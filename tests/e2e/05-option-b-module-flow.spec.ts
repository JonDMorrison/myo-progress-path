// Option B — full single-page-per-module flow, against production.
//
// Gates POST-DEPLOY verification, not pre-commit. Run manually:
//   npx playwright test 05-option-b-module-flow.spec.ts
//
// Pre-requisites:
//   - tests/e2e/.auth/user.json — Playwright storage state for the test
//     patient (test.patient@myocoach.ca, id 73cc86e3-…). Create it via
//     the project's JWT/auth setup flow (e.g. a one-off run that calls
//     loginAs() then `context.storageState({ path })`).
//   - tests/e2e/fixtures/option-b-test-video.mp4 — 1-second black MP4
//     (~1.9KB) used as the dummy upload payload.
//   - Patient state reset by Jon's Supabase MCP runner before each run:
//     * patient_week_progress for week 1 + week 2 = 'open'
//     * patient_week_progress.learn_hub_reviewed = true on week 1
//     * no existing uploads under either week_id
//   - playwright.config.ts baseURL points at https://myocoach.ca by
//     default; override via PLAYWRIGHT_BASE_URL=... if testing staging.

import { test, expect } from "@playwright/test";
import { existsSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { TEST_PATIENT, waitForPageLoad } from "./helpers";

// __dirname isn't defined in ESM; derive it from import.meta.url.
const SPEC_DIR = path.dirname(fileURLToPath(import.meta.url));
const AUTH_STATE_PATH = path.join(SPEC_DIR, ".auth", "user.json");
const VIDEO_FIXTURE_PATH = path.join(SPEC_DIR, "fixtures", "option-b-test-video.mp4");

// Use the pre-generated storage state so we skip the login form. If the
// file is missing, beforeAll throws with instructions — Playwright would
// otherwise emit a cryptic ENOENT inside its context launcher.
test.use({ storageState: AUTH_STATE_PATH });

// All assertions in this file share one authenticated session and run in
// order: redirect → anchor render → first-attempt → reload → last-attempt
// → submit. Serial mode preserves the side effects (uploaded videos,
// checklist state) across tests.
test.describe.serial("Option B — full Module 1 flow (frenectomy test patient)", () => {
  // Upload tests walk 3+ accordion items and wait up to 60s per upload
  // for Supabase Storage; default 30s test timeout is too short.
  test.setTimeout(240_000);

  test.beforeAll(() => {
    if (!existsSync(AUTH_STATE_PATH)) {
      throw new Error(
        `\n\nMissing Playwright auth storage state at:\n  ${AUTH_STATE_PATH}\n\n` +
          `This spec runs against production and authenticates via a pre-saved JWT.\n` +
          `Generate the file by running a one-off script that logs in as ${TEST_PATIENT.email}\n` +
          `(see tests/e2e/helpers.ts: loginAs) and then calls\n` +
          `  await context.storageState({ path: "${AUTH_STATE_PATH}" })\n\n` +
          `Without this file the spec cannot run.`
      );
    }
    if (!existsSync(VIDEO_FIXTURE_PATH)) {
      throw new Error(
        `\n\nMissing video fixture at:\n  ${VIDEO_FIXTURE_PATH}\n\n` +
          `Expected a 1-second black MP4 (~1.9KB) for the upload tests.\n` +
          `Add it to the repo before running this spec.`
      );
    }
  });

  // ─── 1. Even-week redirect ──────────────────────────────────────────
  test("1. /week/2 redirects to /week/1 for patient role", async ({ page }) => {
    await page.goto("/week/2");
    await waitForPageLoad(page);
    // The redirect uses navigate(..., { replace: true }) so back-button
    // doesn't bounce. We assert the final URL ends at /week/1.
    await expect(page).toHaveURL(/\/week\/1(\?.*)?$/, { timeout: 15_000 });
  });

  // ─── 2. Anchor page renders without legacy Part 1/2 UI ──────────────
  test("2. anchor /week/1 page has no Part 1/2 strings, shows both video sections", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    const body = page.locator("body");
    await expect(body).not.toContainText(/Part One/i);
    await expect(body).not.toContainText(/Part Two/i);
    await expect(body).not.toContainText(/Start Part Two/i);

    // Both attempt sections are present on each exercise card.
    await expect(page.getByText(/first attempt/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/last attempt/i).first()).toBeVisible();

    // And the checklist exposes both items with stable testids.
    await expect(page.locator('[data-testid="checklist-first-attempt"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="checklist-last-attempt"]').first()).toBeVisible();
  });

  // ─── 3. First-attempt uploads ───────────────────────────────────────
  test("3. uploading first-attempt videos ticks the first checklist item; submit stays disabled", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    const uploaded = await uploadToEveryActiveExercise(page, "first_attempt");
    expect(uploaded, "expected at least one first-attempt upload").toBeGreaterThan(0);

    // Checklist item flips to complete (it depends on uploads existing for
    // EVERY active exercise across both partner weeks).
    const firstChecklist = page.locator('[data-testid="checklist-first-attempt"]').first();
    await expect(firstChecklist).toHaveAttribute("data-complete", "true", { timeout: 30_000 });

    // (We deliberately do NOT assert "last-attempt is still red" here —
    // that would require the MCP reset to DELETE FROM uploads between
    // runs, and leftover state would otherwise flake this test without
    // signaling anything Option-B-specific.)

    // Submit button still disabled — at minimum, biometrics + exercises
    // are still red, so this should hold regardless of upload history.
    const submit = page.locator('[data-testid="submit-week-button"]');
    if (await submit.count() > 0) {
      await expect(submit).toBeDisabled();
    }
  });

  // ─── 4. Page reload preserves uploads ───────────────────────────────
  test("4. reload preserves first-attempt uploads (stand-in for the two-week wait)", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    await page.reload();
    await waitForPageLoad(page);

    const firstChecklist = page.locator('[data-testid="checklist-first-attempt"]').first();
    await expect(firstChecklist).toHaveAttribute("data-complete", "true", { timeout: 30_000 });
  });

  // ─── 5. Last-attempt uploads ────────────────────────────────────────
  // NOTE: Submit-enabled is asserted in test 6 after the rest of the
  // checklist is satisfied. Videos alone don't enable Submit — BOLT,
  // nasal %, tongue %, and all exercise sessions also have to be green.
  test("5. uploading last-attempt videos ticks the second checklist item", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    const uploaded = await uploadToEveryActiveExercise(page, "last_attempt");
    expect(uploaded, "expected at least one last-attempt upload").toBeGreaterThan(0);

    const lastChecklist = page.locator('[data-testid="checklist-last-attempt"]').first();
    await expect(lastChecklist).toHaveAttribute("data-complete", "true", { timeout: 30_000 });
  });

  // ─── 6. Submit produces a success state ─────────────────────────────
  // Cascade verification (both week 1 + week 2 progress rows reach
  // 'submitted') is intentionally NOT asserted here — Jon's agent reads
  // patient_week_progress via Supabase MCP after the run. This test only
  // proves the UI completes the submit cycle, including the
  // not-Option-B-specific preconditions: filling biometrics and marking
  // every exercise done. Without those, Submit stays disabled regardless
  // of how many videos are uploaded.
  test("6. completing biometrics + exercises + clicking Submit reaches success state", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    await fillBiometrics(page);
    await markEveryExerciseDone(page);

    const submit = page.locator('[data-testid="submit-week-button"]');
    await expect(submit).toBeEnabled({ timeout: 15_000 });
    await submit.click();

    // WeekDetail.handleSubmitForReview shows one of two toasts depending
    // on requires_video, then navigates away after ~1.5s. Either signal
    // is sufficient evidence the submit completed.
    const toastVisible = page.getByText(/Submitted for review|Module complete/i);
    const navigatedAway = page.waitForURL((url) => !url.pathname.startsWith("/week/1"), {
      timeout: 10_000,
    });

    await Promise.race([
      expect(toastVisible).toBeVisible({ timeout: 10_000 }),
      navigatedAway,
    ]);
  });
});

// ─── helpers (file-scoped) ────────────────────────────────────────────

/**
 * Fill the Your Vitals form's three required inputs (BOLT, nasal %,
 * tongue %). WeekProgressForm auto-saves on change via debounce; a short
 * wait after the third input lets the save flight settle before the
 * spec moves on.
 */
async function fillBiometrics(page: import("@playwright/test").Page): Promise<void> {
  await page.locator("#bolt-score").fill("30");
  await page.locator("#nasal-pct").fill("80");
  await page.locator("#tongue-pct").fill("70");
  // The progress form debounces saves. Wait long enough for the
  // exercise_completions / vitals updates to flush AND for the
  // checklist sidebar to re-render with the new values.
  await page.waitForTimeout(2_000);
}

/**
 * Walk every exercise in the accordion (active, breathing, passive) and
 * click its inline "Mark Done" button so the WeekCompletionChecklist's
 * Exercise sessions item flips green. With completion_target=1 per
 * exercise, a single click per exercise satisfies the requirement.
 */
async function markEveryExerciseDone(page: import("@playwright/test").Page): Promise<void> {
  const triggers = page.locator('[data-testid="exercises-accordion"] button[aria-expanded]');
  const triggerCount = await triggers.count();
  for (let i = 0; i < triggerCount; i++) {
    const trigger = triggers.nth(i);
    await trigger.scrollIntoViewIfNeeded();
    const expanded = await trigger.getAttribute("aria-expanded");
    if (expanded === "false") {
      try {
        await trigger.click({ timeout: 5_000 });
      } catch {
        await trigger.click({ force: true, timeout: 5_000 });
      }
      await page.waitForTimeout(300);
    }

    // The Mark Done button only renders when the exercise is not yet
    // complete. If it's already complete (count >= target), skip.
    const markDone = page.locator('[data-state="open"] button', { hasText: /^Mark Done$/i });
    if ((await markDone.count()) > 0) {
      await markDone.first().click();
      // Give the optimistic update + checklist re-render a moment.
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Walk the exercise accordion (Radix Accordion type="single" collapsible)
 * and upload the fixture video to every visible upload slot of the given
 * kind. Each ExerciseVideoUpload is mounted lazily — its <input> only
 * exists in the DOM while its accordion item is open. type="single" also
 * means opening item N+1 closes item N, but the upload persists in the
 * DB, so sequential opening + uploading works.
 *
 * Returns the number of successful uploads (== number of active exercises
 * encountered).
 */
async function uploadToEveryActiveExercise(
  page: import("@playwright/test").Page,
  kind: "first_attempt" | "last_attempt"
): Promise<number> {
  const inputTestId = kind === "first_attempt" ? "upload-first-attempt" : "upload-last-attempt";
  const labelTestId = `${inputTestId}-label`;

  // Constrain to triggers inside the exercise Accordion (marker added in
  // WeekExercisesList.tsx via data-testid="exercises-accordion" on the
  // <Accordion>). Without this constraint we'd also match the
  // FrenectomyConsultTask / LearnHubReviewTask / Privacy Manager
  // disclosure buttons elsewhere on /week/1 — clicking those scrolls the
  // page and the subsequent click collides with overlay layers.
  const triggers = page.locator('[data-testid="exercises-accordion"] button[aria-expanded]');
  const triggerCount = await triggers.count();
  if (triggerCount === 0) {
    throw new Error(
      "No exercise accordion triggers found on /week/1. The exercises " +
        "section may not have mounted — verify the patient state " +
        "(program_variant, requires_video) and that exercises load from JSON."
    );
  }

  let uploaded = 0;
  for (let i = 0; i < triggerCount; i++) {
    const trigger = triggers.nth(i);
    // Use scrollIntoView before clicking to dodge sticky-header overlay
    // collisions; force the click as a last resort for stubborn cases.
    await trigger.scrollIntoViewIfNeeded();
    const expanded = await trigger.getAttribute("aria-expanded");
    if (expanded === "false") {
      try {
        await trigger.click({ timeout: 5_000 });
      } catch {
        await trigger.click({ force: true, timeout: 5_000 });
      }
      // Brief mount wait — Radix animates the AccordionContent in.
      await page.waitForTimeout(300);
    }

    // After opening, see whether THIS item has an upload input of the
    // requested kind. The input is intentionally className="hidden"
    // (display:none) because the user clicks the wrapping <label>, not
    // the input — but setInputFiles works on hidden inputs. So we scope
    // by Radix's data-state="open" on the AccordionItem ancestor:
    // type="single" guarantees at most one item is open at a time, so
    // this selector resolves to 0 or 1 matches.
    const openInput = page.locator(
      `[data-state="open"] input[data-testid="${inputTestId}"]`
    );

    if ((await openInput.count()) === 0) {
      // Not an active exercise (or already uploaded — input replaced by
      // the post-upload UI). Move on.
      continue;
    }

    await openInput.first().setInputFiles(VIDEO_FIXTURE_PATH);

    // Wait for this exercise's upload label to switch to "Uploaded".
    // Scope to the open accordion item to disambiguate from sibling cards.
    const completedLabel = page.locator(
      `[data-state="open"] [data-testid="${labelTestId}"]`
    );
    await expect(completedLabel).toContainText(/Uploaded/i, { timeout: 60_000 });

    uploaded++;
  }

  return uploaded;
}
