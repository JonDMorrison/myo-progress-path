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

import { test, expect, Locator } from "@playwright/test";
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

    const firstInputs = page.locator('input[data-testid="upload-first-attempt"]');
    const count = await firstInputs.count();
    expect(count, "Module 1 should expose at least one first-attempt upload input").toBeGreaterThan(0);

    // Upload to every active exercise's first-attempt slot, sequentially
    // so we never race two concurrent uploads inside the same exercise's
    // ExerciseVideoUpload component (which disables both inputs while one
    // upload is in flight).
    for (let i = 0; i < count; i++) {
      const input = firstInputs.nth(i);
      await input.setInputFiles(VIDEO_FIXTURE_PATH);
      await waitForUploadCompletion(page, "first_attempt", i);
    }

    // Checklist item flips to complete.
    const firstChecklist = page.locator('[data-testid="checklist-first-attempt"]').first();
    await expect(firstChecklist).toHaveAttribute("data-complete", "true", { timeout: 30_000 });

    // Last-attempt item still not complete.
    const lastChecklist = page.locator('[data-testid="checklist-last-attempt"]').first();
    await expect(lastChecklist).toHaveAttribute("data-complete", "false");

    // Submit button still disabled — both video items must be green.
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

  // ─── 5. Last-attempt uploads + Submit enabled ───────────────────────
  test("5. uploading last-attempt videos ticks the second item and enables Submit", async ({
    page,
  }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    const lastInputs = page.locator('input[data-testid="upload-last-attempt"]');
    const count = await lastInputs.count();
    expect(count, "Module 1 should expose at least one last-attempt upload input").toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const input = lastInputs.nth(i);
      await input.setInputFiles(VIDEO_FIXTURE_PATH);
      await waitForUploadCompletion(page, "last_attempt", i);
    }

    const lastChecklist = page.locator('[data-testid="checklist-last-attempt"]').first();
    await expect(lastChecklist).toHaveAttribute("data-complete", "true", { timeout: 30_000 });

    const submit = page.locator('[data-testid="submit-week-button"]');
    await expect(submit).toBeEnabled({ timeout: 15_000 });
  });

  // ─── 6. Submit produces a success state ─────────────────────────────
  // Cascade verification (both week 1 + week 2 progress rows reach
  // 'submitted') is intentionally NOT asserted here — Jon's agent reads
  // patient_week_progress via Supabase MCP after the run. This test only
  // proves the UI completes the submit cycle.
  test("6. clicking Submit transitions out of the open state", async ({ page }) => {
    await page.goto("/week/1");
    await waitForPageLoad(page);

    const submit = page.locator('[data-testid="submit-week-button"]');
    await expect(submit).toBeEnabled();

    await submit.click();

    // WeekDetail.handleSubmitForReview shows one of two toasts depending on
    // requires_video, then navigates away after ~1.5s. Either signal is
    // sufficient evidence the submit completed.
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
 * Wait for an upload at a specific exercise card to flip from
 * "Uploading…" → "Uploaded". The ExerciseVideoUpload component replaces
 * its upload button content once handleFileSelect's resolve completes.
 * Generous timeout because production Supabase Storage signed-URL
 * generation can take a few seconds on cold-path uploads.
 */
async function waitForUploadCompletion(
  page: import("@playwright/test").Page,
  kind: "first_attempt" | "last_attempt",
  exerciseIndex: number
): Promise<void> {
  const labelTestId = kind === "first_attempt" ? "upload-first-attempt-label" : "upload-last-attempt-label";
  const card: Locator = page.locator(`[data-testid="${labelTestId}"]`).nth(exerciseIndex);
  // The "Uploaded" text replaces the upload prompt inside the same
  // <label>. Wait for the label to render the success copy.
  await expect(card).toContainText(/Uploaded/i, { timeout: 60_000 });
}
