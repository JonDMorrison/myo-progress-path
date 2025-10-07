import { supabase } from "@/integrations/supabase/client";
import { notifyPatientApproval, notifyPatientNeedsMore } from "./notify";

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

    // Get patient data for email
    const { data: patientData } = await supabase
      .from("patients")
      .select("user_id")
      .eq("id", patientId)
      .single();

    // Send notification email to patient
    if (patientData?.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", patientData.user_id)
        .single();
      
      if (userData?.email) {
        await notifyPatientApproval(userData.email, userData.name || "there", currentWeekNumber);
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

    // Get patient data for email
    const { data: patientData } = await supabase
      .from("patients")
      .select("user_id")
      .eq("id", patientId)
      .single();

    // Send notification email to patient
    if (patientData?.user_id) {
      const { data: userData } = await supabase
        .from("users")
        .select("email, name")
        .eq("id", patientData.user_id)
        .single();
      
      if (userData?.email) {
        await notifyPatientNeedsMore(userData.email, userData.name || "there", weekNumber, comment);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Request more practice error:", error);
    return { success: false, error: error.message };
  }
}
