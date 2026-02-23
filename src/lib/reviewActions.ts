import { supabase } from "@/integrations/supabase/client";
import { getProgramTitle } from "./constants";

export async function approveWeek(
  progressId: string,
  patientId: string,
  currentWeekNumber: number,
  note?: string
): Promise<{ success: boolean; error?: string }> {
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

    // AI generated notes are no longer sent automatically. 
    // Therapist provides feedback via a note if desired.
    let isAiGenerated = false;

    // Update current week to approved
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({
        status: "approved",
      })
      .eq("id", progressId);

    if (updateError) throw updateError;

    // Save therapist note if provided
    if (note && note.trim().length > 0) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("messages").insert({
        patient_id: patientId,
        week_id: progressData.week_id,
        therapist_id: user?.id,
        body: note,
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

    // Check if this is the final week (program completion)
    if (currentWeekNumber === 24) {
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
      // Auto-unlock next week (only if not the final week)
      const nextWeekNumber = currentWeekNumber + 1;

      // Get patient's program variant to filter weeks correctly
      const { data: patientData } = await supabase
        .from("patients")
        .select("program_variant")
        .eq("id", patientId)
        .single();

      const variant = patientData?.program_variant || 'frenectomy';
      const programTitle = getProgramTitle(variant);

      // Get next week for the patient's program
      const { data: nextWeek } = await supabase
        .from("weeks")
        .select("id, programs!inner(title)")
        .eq("number", nextWeekNumber)
        .eq("programs.title", programTitle)
        .single();

      if (nextWeek) {
        // Check if progress exists
        const { data: existingProgress } = await supabase
          .from("patient_week_progress")
          .select("id")
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
        } else {
          // Update existing to open
          await supabase
            .from("patient_week_progress")
            .update({ status: "open" })
            .eq("id", existingProgress.id);
        }
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
