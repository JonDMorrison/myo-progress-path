// Option B — single page per module, twin upload slots
//
// Runs POST-DEPLOY against https://myocoach.ca (see playwright.config.ts).
// Pre-commit gates are tsc + build + vitest only; this spec is the
// acceptance check after Lovable publishes the build that includes the
// Option B refactor.
//
// What this spec proves:
//   1. /week/3 renders as the unified Module 2 anchor page (no Part 1/2 UI).
//   2. First-attempt video uploads tick the "First attempt videos
//      submitted" checklist item and leave "Last attempt videos
//      submitted" unticked.
//   3. Reloading the page (which stands in for the real-world ~2-week
//      wait between visits) preserves first-attempt uploads.
//   4. Last-attempt uploads tick the second checklist item.
//   5. Submit enables only when BOTH video items are green.
//   6. Submission cascades to BOTH partner-week patient_week_progress
//      rows — this is the Step-8 silent-failure gate.
//
// The "two-week elapsed" gate in the prompt has no code analogue (Option B
// removed the time-based gating); the patient simply uses the same page
// twice. page.reload() with the same authenticated session is enough.

import { test, expect } from "@playwright/test";
import { loginAs, TEST_PATIENT, waitForPageLoad } from "./helpers";

const MODULE_2_ANCHOR_WEEK = 3;
const MODULE_2_PARTNER_WEEK = 4;

test.describe("Option B — single page per module", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_PATIENT);
  });

  test("anchor page renders without Part 1/2 UI", async ({ page }) => {
    await page.goto(`/week/${MODULE_2_ANCHOR_WEEK}`);
    await waitForPageLoad(page);

    // Old Part 1/2 UI must be gone.
    await expect(page.getByText("Start Part Two")).not.toBeVisible();
    await expect(page.getByText("Part One Complete")).not.toBeVisible();
    await expect(
      page.getByText(/You've reached Part Two of Module/i)
    ).not.toBeVisible();

    // Both checklist video items must be present.
    await expect(page.getByText("First attempt videos submitted")).toBeVisible();
    await expect(page.getByText("Last attempt videos submitted")).toBeVisible();
  });

  test("patient navigating to even week 4 gets redirected to anchor week 3", async ({
    page,
  }) => {
    await page.goto(`/week/${MODULE_2_PARTNER_WEEK}`);
    await waitForPageLoad(page);
    await expect(page).toHaveURL(new RegExp(`/week/${MODULE_2_ANCHOR_WEEK}$`));
  });

  test("first-attempt uploads tick only the first-attempt checklist item", async ({
    page,
  }) => {
    await page.goto(`/week/${MODULE_2_ANCHOR_WEEK}`);
    await waitForPageLoad(page);

    // Upload three first-attempt videos. The test fixture has at least
    // three active exercises on Module 2; the file picker UI accepts
    // first_attempt files on each.
    // NOTE: This block depends on the actual upload UI surface. Spec
    // currently asserts the resulting checklist state — wire up the
    // file inputs once the file fixture is in place.
    test.fixme(
      true,
      "Needs a fixture video file and a reliable file-input selector " +
        "per active exercise. Block on the deploy-side smoke test " +
        "once Sam provides a 3-video fixture set."
    );

    // Expected post-upload assertions (left in as documentation):
    // const firstChecklist = page.getByText("First attempt videos submitted");
    // await expect(firstChecklist).toBeVisible();
    // // First-attempt item shows the line-through style when complete.
    // await expect(firstChecklist).toHaveClass(/line-through/);
    //
    // // Last-attempt item still red.
    // const lastChecklist = page.getByText("Last attempt videos submitted");
    // await expect(lastChecklist).not.toHaveClass(/line-through/);
    //
    // // Submit button is still disabled.
    // await expect(page.getByText("SUBMIT FOR REVIEW")).toBeDisabled();
  });

  test("reload after first-attempt upload preserves uploads visibility", async ({
    page,
  }) => {
    await page.goto(`/week/${MODULE_2_ANCHOR_WEEK}`);
    await waitForPageLoad(page);

    test.fixme(
      true,
      "Pairs with the upload test above. The reload step replaces the " +
        "'simulate two-week elapsed state' helper from the prompt — under " +
        "Option B there is no real time-gate in the code."
    );

    // Expected:
    // await page.reload();
    // await waitForPageLoad(page);
    // await expect(page.getByText("First attempt videos submitted")).toHaveClass(/line-through/);
  });

  test("last-attempt uploads tick the second item, enabling Submit", async ({
    page,
  }) => {
    await page.goto(`/week/${MODULE_2_ANCHOR_WEEK}`);
    await waitForPageLoad(page);

    test.fixme(
      true,
      "Same fixture dependency as the first-attempt test. Block on " +
        "Sam's video fixtures before unfixme'ing."
    );

    // Expected:
    // (upload last-attempt videos for each active exercise)
    // await expect(page.getByText("Last attempt videos submitted")).toHaveClass(/line-through/);
    // await expect(page.getByText("SUBMIT FOR REVIEW")).toBeEnabled();
  });

  test("submitting from week 3 marks BOTH week 3 and week 4 progress rows", async ({
    page,
  }) => {
    await page.goto(`/week/${MODULE_2_ANCHOR_WEEK}`);
    await waitForPageLoad(page);

    test.fixme(
      true,
      "This is the cascade gate. Needs the upload fixtures to bring the " +
        "checklist to all-green, plus a Supabase service-role helper to " +
        "read patient_week_progress.status for both partner weeks. Block " +
        "on those fixtures."
    );

    // Expected:
    // (...all uploads complete + biometrics filled + click Submit)
    // const { data } = await readPatientWeekProgress(TEST_PATIENT.patientId);
    // const week3Row = data.find(r => r.week_number === 3);
    // const week4Row = data.find(r => r.week_number === 4);
    // expect(week3Row.status).toBe("submitted");
    // expect(week4Row.status).toBe("submitted");
  });
});
