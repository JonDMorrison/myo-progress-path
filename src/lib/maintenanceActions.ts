import { supabase } from "@/integrations/supabase/client";

/**
 * Move a completed patient to maintenance mode
 */
export async function moveToMaintenance(
  patientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("patients")
      .update({
        status: "maintenance",
      })
      .eq("id", patientId);

    if (error) throw error;

    // Create notification for patient
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: "Congratulations on completing the program! You've been moved to Maintenance Mode. Continue your progress with regular check-ins and therapist-assigned practice.",
      read: false,
    });

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "moved_to_maintenance",
      meta: {
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Move to maintenance error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Reactivate a maintenance or completed patient back to active status
 */
export async function reactivatePatient(
  patientId: string,
  weekNumber: number = 1,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("patients")
      .update({
        status: "active",
        completed_at: null,
      })
      .eq("id", patientId);

    if (error) throw error;

    // Create notification for patient
    await supabase.from("notifications").insert({
      patient_id: patientId,
      body: `Your therapist has reactivated your program${reason ? `: ${reason}` : ". Check your dashboard for next steps."}`,
      read: false,
    });

    // Log event
    await supabase.from("events").insert({
      patient_id: patientId,
      type: "reactivated",
      meta: {
        reason: reason || "",
        timestamp: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Reactivate patient error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get maintenance statistics for a patient
 */
export async function getMaintenanceStats(patientId: string) {
  try {
    // Get check-in count
    const { count: checkinCount } = await supabase
      .from("maintenance_checkins")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId);

    // Get assignment completion rate
    const { data: assignments } = await supabase
      .from("maintenance_assignments")
      .select("status")
      .eq("patient_id", patientId);

    const totalAssignments = assignments?.length || 0;
    const completedAssignments = assignments?.filter(a => a.status === "completed").length || 0;
    const completionRate = totalAssignments > 0 
      ? Math.round((completedAssignments / totalAssignments) * 100) 
      : 0;

    // Get average metrics from recent check-ins
    const { data: recentCheckins } = await supabase
      .from("maintenance_checkins")
      .select("nasal_breathing_percent, tongue_on_spot_percent, bolt_score")
      .eq("patient_id", patientId)
      .order("checkin_date", { ascending: false })
      .limit(4);

    const avgNasal = recentCheckins && recentCheckins.length > 0
      ? Math.round(recentCheckins.reduce((sum, c) => sum + c.nasal_breathing_percent, 0) / recentCheckins.length)
      : null;
    const avgTongue = recentCheckins && recentCheckins.length > 0
      ? Math.round(recentCheckins.reduce((sum, c) => sum + c.tongue_on_spot_percent, 0) / recentCheckins.length)
      : null;

    return {
      checkinCount: checkinCount || 0,
      totalAssignments,
      completedAssignments,
      completionRate,
      avgNasal,
      avgTongue,
    };
  } catch (error) {
    console.error("Error getting maintenance stats:", error);
    return null;
  }
}
