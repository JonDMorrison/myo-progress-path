import { supabase } from "@/integrations/supabase/client";
import { getProgramTitle } from "./constants";

/**
 * Returns true if approving `weekNumber` should cascade approval to the
 * partner odd week (weekNumber - 1). Biweekly modules pair an odd and
 * even week; the patient submits both at once but historically only the
 * even row was flipped to 'approved', leaving the odd row stuck at
 * 'submitted' and undercounting `userProgress.completedWeeks`.
 *
 * Single-week modules — week 25 (post-program review, both variants)
 * and weeks 9/10 in the frenectomy variants (separate post-op modules)
 * — must NOT cascade. Note: 'standard' weeks 9 and 10 ARE paired (one
 * Module 5), so they cascade normally. We deliberately do NOT use
 * isFrenectomyVariant() here because that helper incorrectly includes
 * 'standard'; cascade behaviour follows the JSON module pairing, not
 * the constants helper.
 */
export function shouldCascadeApproval(weekNumber: number, programVariant: string | null | undefined): boolean {
  if (weekNumber % 2 !== 0) return false;
  if (weekNumber === 25) return false;
  const isFrenectomyOnly =
    programVariant === "frenectomy" || programVariant === "frenectomy_video";
  if (isFrenectomyOnly && (weekNumber === 9 || weekNumber === 10)) {
    return false;
  }
  return true;
}

export async function approveWeek(
  progressId: string,
  patientId: string,
  currentWeekNumber: number,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get progress row plus the patient's program_variant in parallel so we
    // can decide whether to cascade the approval to the partner odd week.
    const [progressResult, patientResult] = await Promise.all([
      supabase
        .from("patient_week_progress")
        .select("week_id, week:weeks!inner(number, program_id)")
        .eq("id", progressId)
        .single(),
      supabase
        .from("patients")
        .select("program_variant")
        .eq("id", patientId)
        .single(),
    ]);

    const progressData = progressResult.data;
    const patientVariant = patientResult.data?.program_variant ?? "frenectomy";

    if (!progressData) {
      throw new Error("Progress not found");
    }

    // AI generated notes are no longer sent automatically.
    // Therapist provides feedback via a note if desired.
    let isAiGenerated = false;

    if (shouldCascadeApproval(currentWeekNumber, patientVariant)) {
      // Biweekly module — cascade approval to the partner odd week so
      // userProgress.completedWeeks stops undercounting. Use a single
      // .update() scoped by .in("week_id", [...]) for atomicity.
      const oddWeek = currentWeekNumber - 1;
      const programId = (progressData as any).week?.program_id;

      const { data: partnerWeeks, error: partnerLookupError } = await supabase
        .from("weeks")
        .select("id")
        .in("number", [oddWeek, currentWeekNumber])
        .eq("program_id", programId);

      if (partnerLookupError) throw partnerLookupError;

      const partnerWeekIds = (partnerWeeks ?? []).map((w: any) => w.id);
      if (partnerWeekIds.length === 0) {
        // Defensive: if the partner lookup somehow returns nothing, fall
        // back to the single-row update so we don't drop the approval.
        const { error: fallbackError } = await supabase
          .from("patient_week_progress")
          .update({ status: "approved" })
          .eq("id", progressId);
        if (fallbackError) throw fallbackError;
      } else {
        const { error: cascadeError } = await supabase
          .from("patient_week_progress")
          .update({ status: "approved" })
          .eq("patient_id", patientId)
          .in("week_id", partnerWeekIds);
        if (cascadeError) throw cascadeError;
      }
    } else {
      // Single-week module (post-program review, frenectomy post-op):
      // approve only this row.
      const { error: updateError } = await supabase
        .from("patient_week_progress")
        .update({ status: "approved" })
        .eq("id", progressId);

      if (updateError) throw updateError;
    }

    // Save therapist note if provided
    if (note && note.trim().length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("messages").insert({
        patient_id: patientId,
        week_id: progressData.week_id,
        therapist_id: user?.id,
        body: note,
        sent_by: 'therapist',
      });
    }

    // Create notification for patient
    const moduleNum = Math.ceil(currentWeekNumber / 2);
    const partLabel = currentWeekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
    const moduleLabel = `Module ${moduleNum} ${partLabel}`;
    
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: `Congratulations! ${moduleLabel} has been approved.${note ? " Your therapist left some feedback." : ""}`,
      read: false,
    });

    // Log event
    try {
      await supabase.from("events").insert({
        patient_id: patientId,
        type: "approved_week",
        meta: {
          week_number: currentWeekNumber,
          note: note || "",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (e) {
      console.warn("Could not log check event", e);
    }

    // Check if this is the final week (program completion).
    // Week 25 is the "Post Program Review" — approving it should also
    // mark the program complete, not try to unlock a nonexistent week 26.
    if (currentWeekNumber >= 24) {
      // Mark program as complete and save completion note
      await supabase
        .from("patients")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          completion_note: note || null,
        })
        .eq("id", patientId);

      // Log program completion event
      await supabase.from("events").insert({
        patient_id: patientId,
        type: "program_completed",
        meta: {
          completion_note: note || "",
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Auto-unlock next week (only if not the final week).
      // Reuse the program variant already fetched at the top of the function
      // instead of issuing a second patients query.
      const nextWeekNumber = currentWeekNumber + 1;
      const programTitle = getProgramTitle(patientVariant);

      // Get next week for the patient's program.
      // Use maybeSingle() so a missing row doesn't throw — we surface it
      // via console.warn so the approve itself still succeeds, but we
      // don't silently pretend the unlock worked.
      const { data: nextWeek } = await supabase
        .from("weeks")
        .select("id, programs!inner(title)")
        .eq("number", nextWeekNumber)
        .eq("programs.title", programTitle)
        .maybeSingle();

      if (!nextWeek) {
        console.warn(
          `approveWeek: no week found for number=${nextWeekNumber} title=${programTitle} — next week unlock skipped`
        );
        return { success: true };
      }

      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("patient_week_progress")
        .select("id, status")
        .eq("patient_id", patientId)
        .eq("week_id", nextWeek.id)
        .maybeSingle();

      if (!existingProgress) {
        // Create new progress entry
        await supabase.from("patient_week_progress").insert({
          patient_id: patientId,
          week_id: nextWeek.id,
          status: "open",
        });
      } else if (
        existingProgress.status !== "open" &&
        existingProgress.status !== "submitted" &&
        existingProgress.status !== "approved"
      ) {
        // Only reopen rows that were locked/needs_more. Never clobber a
        // submitted or approved week — that would destroy the patient's work.
        await supabase
          .from("patient_week_progress")
          .update({ status: "open" })
          .eq("id", existingProgress.id);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Approve error:", error);
    return { success: false, error: error.message };
  }
}

export async function requestMorePractice(
  progressId: string,
  patientId: string,
  weekNumber: number,
  comment: string
): Promise<{ success: boolean; error?: string }> {
  if (!comment || comment.trim().length === 0) {
    return { success: false, error: "Comment is required" };
  }

  try {
    // Get week data
    const { data: progressData } = await supabase
      .from("patient_week_progress")
      .select("week_id")
      .eq("id", progressId)
      .single();

    if (!progressData) {
      throw new Error("Progress not found");
    }

    // Update status
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({
        status: "needs_more",
      })
      .eq("id", progressId);

    if (updateError) throw updateError;

    // Save therapist comment
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("messages").insert({
      patient_id: patientId,
      week_id: progressData.week_id,
      therapist_id: user?.id,
      body: comment,
      sent_by: 'therapist',
    });

    // Create notification for patient
    const moduleNum = Math.ceil(weekNumber / 2);
    const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
    const moduleLabel = `Module ${moduleNum} ${partLabel}`;
    
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: `Your therapist has requested more practice for ${moduleLabel}. Check your dashboard for details.`,
      read: false,
    });

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "needs_more",
      meta: {
        week_number: weekNumber,
        comment,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Request more practice error:", error);
    return { success: false, error: error.message };
  }
}

export async function reassignWeek(
  progressId: string,
  patientId: string,
  weekNumber: number,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get week data
    const { data: progressData } = await supabase
      .from("patient_week_progress")
      .select("week_id, status")
      .eq("id", progressId)
      .single();

    if (!progressData) {
      throw new Error("Progress not found");
    }

    // Only allow reassigning approved or submitted weeks
    if (progressData.status !== "approved" && progressData.status !== "submitted") {
      return {
        success: false,
        error: "Can only reassign approved or submitted weeks"
      };
    }

    // Update status back to open (unlocks the week for patient)
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({
        status: "open",
        completed_at: null, // Clear completion timestamp
      })
      .eq("id", progressId);

    if (updateError) throw updateError;

    // Calculate module label
    const moduleNum = Math.ceil(weekNumber / 2);
    const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
    const moduleLabel = `Module ${moduleNum} ${partLabel}`;

    // Save therapist message if reason provided
    if (reason && reason.trim().length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("messages").insert({
        patient_id: patientId,
        week_id: progressData.week_id,
        therapist_id: user?.id,
        body: `${moduleLabel} has been reassigned for additional practice. ${reason}`,
        sent_by: 'therapist',
      });
    }

    // Create notification for patient
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: `${moduleLabel} has been unlocked for additional practice by your therapist.${reason ? ` Reason: ${reason}` : ""}`,
      read: false,
    });

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "reassigned_week",
      meta: {
        week_number: weekNumber,
        reason: reason || "",
        previous_status: progressData.status,
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reassign week error:", error);
    return { success: false, error: error.message };
  }
}
