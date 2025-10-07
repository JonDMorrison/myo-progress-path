import { supabase } from "@/integrations/supabase/client";

export async function approveWeek(
  progressId: string,
  patientId: string,
  currentWeekNumber: number,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update current week to approved
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({
        status: "approved",
      })
      .eq("id", progressId);

    if (updateError) throw updateError;

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "approved_week",
      meta: {
        week_number: currentWeekNumber,
        note: note || "",
        timestamp: new Date().toISOString(),
      },
    });

    // Auto-unlock next week
    const nextWeekNumber = currentWeekNumber + 1;
    if (nextWeekNumber <= 24) {
      // Get next week
      const { data: nextWeek } = await supabase
        .from("weeks")
        .select("id")
        .eq("number", nextWeekNumber)
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

    // TODO: Send notification email to patient
    console.log("TODO: Send approval notification to patient");

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
    // Update status
    const { error: updateError } = await supabase
      .from("patient_week_progress")
      .update({
        status: "needs_more",
      })
      .eq("id", progressId);

    if (updateError) throw updateError;

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

    // TODO: Send notification email to patient
    console.log("TODO: Send needs-more notification to patient");

    return { success: true };
  } catch (error: any) {
    console.error("Request more practice error:", error);
    return { success: false, error: error.message };
  }
}
