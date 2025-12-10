import { supabase } from "@/integrations/supabase/client";

export interface WeekProgress {
  weekNumber: number;
  status: "open" | "submitted" | "approved" | "needs_more";
  completedAt?: string;
  isLocked: boolean;
  isComplete: boolean;
}

export interface UserProgress {
  completedWeeks: number;
  currentWeek: number;
  totalWeeks: number;
  percentComplete: number;
  lastActivityDate?: string;
  weekStatuses: WeekProgress[];
}

// Map program_variant to program title for filtering
const PROGRAM_TITLES: Record<string, string> = {
  'frenectomy': 'Frenectomy Program',
  'non_frenectomy': 'Non-Frenectomy Program',
  'standard': 'Frenectomy Program', // Default to frenectomy for legacy users
};

/**
 * Get comprehensive progress data for a patient
 */
export async function getUserProgress(patientId: string): Promise<UserProgress | null> {
  try {
    // First get the patient's program_variant
    const { data: patient } = await supabase
      .from("patients")
      .select("program_variant")
      .eq("id", patientId)
      .single();

    const programVariant = patient?.program_variant || 'frenectomy';
    const programTitle = PROGRAM_TITLES[programVariant] || PROGRAM_TITLES['frenectomy'];

    // Get weeks for this patient's program
    const { data: weeks, error: weeksError } = await supabase
      .from("weeks")
      .select("id, number, programs!inner(title)")
      .eq("programs.title", programTitle)
      .order("number");

    if (weeksError) throw weeksError;

    // Get all progress records for this patient
    const { data: progressData, error: progressError } = await supabase
      .from("patient_week_progress")
      .select("*")
      .eq("patient_id", patientId);

    if (progressError) throw progressError;

    // Check if Week 0 (onboarding) is complete
    const { data: onboardingData } = await supabase
      .from("onboarding_progress")
      .select("completed_at")
      .eq("patient_id", patientId)
      .maybeSingle();

    const week0Complete = !!onboardingData?.completed_at;

    // Build progress map
    const progressMap = new Map(
      progressData?.map((p) => [p.week_id, p]) || []
    );

    const weekStatuses: WeekProgress[] = [];
    let completedCount = 0;
    let currentWeek = 1;
    let currentWeekFound = false;
    let lastApprovedWeek = 0;
    let lastSubmittedOrApprovedWeek = 0;

    // Process each week
    for (const week of weeks || []) {
      const progress = progressMap.get(week.id);
      const isComplete = progress?.status === "approved";
      
      if (isComplete) {
        completedCount++;
        lastApprovedWeek = week.number;
      }

      // Track submitted or approved weeks
      if (progress?.status === "submitted" || progress?.status === "approved") {
        lastSubmittedOrApprovedWeek = Math.max(lastSubmittedOrApprovedWeek, week.number);
      }

      // Week is locked if:
      // - Week 1 and Week 0 not complete
      // - Any week where previous week is not at least submitted
      const isLocked =
        (week.number === 1 && !week0Complete) ||
        (week.number > 1 && lastSubmittedOrApprovedWeek < week.number - 1);

      const statusValue = progress?.status || "open";
      weekStatuses.push({
        weekNumber: week.number,
        status: statusValue as "open" | "submitted" | "approved" | "needs_more",
        completedAt: progress?.completed_at,
        isLocked,
        isComplete,
      });

      // Current week is the first unlocked week that's not yet submitted or approved
      // This allows progression to the next week while the previous is in review
      if (!currentWeekFound && !isLocked && statusValue !== "submitted" && statusValue !== "approved") {
        currentWeek = week.number;
        currentWeekFound = true;
      }
    }

    // If no open weeks were found (all submitted/approved), show the last submitted/approved week
    if (!currentWeekFound && lastSubmittedOrApprovedWeek > 0) {
      currentWeek = lastSubmittedOrApprovedWeek;
    }

    // Get last activity date
    const lastActivityDate =
      progressData
        ?.filter((p) => p.completed_at)
        .sort((a, b) => 
          new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()
        )?.[0]?.completed_at;

    const totalWeeks = weeks?.length || 24;
    const percentComplete = Math.round((completedCount / totalWeeks) * 100);

    return {
      completedWeeks: completedCount,
      currentWeek,
      totalWeeks,
      percentComplete,
      lastActivityDate,
      weekStatuses,
    };
  } catch (error) {
    console.error("Error getting user progress:", error);
    return null;
  }
}

/**
 * Check if a specific week is accessible for a patient
 */
export async function isWeekAccessible(
  patientId: string,
  weekNumber: number
): Promise<boolean> {
  const progress = await getUserProgress(patientId);
  if (!progress) return false;

  const weekStatus = progress.weekStatuses.find(
    (w) => w.weekNumber === weekNumber
  );

  return !weekStatus?.isLocked;
}

/**
 * Mark a week as complete (approved)
 */
export async function completeWeek(
  patientId: string,
  weekId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("patient_week_progress")
      .update({
        status: "approved",
        completed_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId)
      .eq("week_id", weekId);

    return !error;
  } catch (error) {
    console.error("Error completing week:", error);
    return false;
  }
}
