import { supabase } from "@/integrations/supabase/client";
import { getProgramTitle } from "./constants";
import { getModuleInfo } from "./moduleUtils";

export interface WeekProgress {
  weekNumber: number;
  status: "open" | "submitted" | "approved" | "needs_more";
  completedAt?: string;
  isLocked: boolean;
  isComplete: boolean;
  awaitingApproval?: boolean; // True if previous week is submitted but not yet approved
}

export interface UserProgress {
  completedWeeks: number;
  currentWeek: number;
  totalWeeks: number;
  percentComplete: number;
  lastActivityDate?: string;
  weekStatuses: WeekProgress[];
}

/**
 * Get comprehensive progress data for a patient
 */
export async function getUserProgress(patientId: string): Promise<UserProgress | null> {
  try {
    // Check for STAFF bypass (Therapist/Admin can see everything)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let isStaff = false;
    if (authUser) {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();
      isStaff = userData?.role === "therapist" || userData?.role === "admin" || userData?.role === "super_admin";
    }

    // First get the patient's program_variant
    const { data: patient } = await supabase
      .from("patients")
      .select("program_variant")
      .eq("id", patientId)
      .single();

    const programVariant = patient?.program_variant || 'frenectomy';
    const programTitle = getProgramTitle(programVariant);

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
    let previousWeekStatus: string | null = null;

    // Process each week
    for (const week of weeks || []) {
      const progress = progressMap.get(week.id);
      const isComplete = progress?.status === "approved";

      if (isComplete) {
        completedCount++;
        lastApprovedWeek = Math.max(lastApprovedWeek, week.number);
      }

      // MODULE-BASED GATING:
      // A week is unlocked if it belongs to the same module as the next available week after lastApprovedWeek.
      // Example: If Week 2 is the last approved week, then Weeks 3 & 4 (Module 2) should be unlocked.
      const currentWeekModule = getModuleInfo(week.number, programVariant);
      const nextRequiredModule = getModuleInfo(lastApprovedWeek + 1, programVariant);

      const isLocked = isStaff ? false :
        (currentWeekModule.moduleNumber > nextRequiredModule.moduleNumber);

      // Check if this week is locked because previous week is awaiting approval
      const awaitingApproval = isLocked &&
        previousWeekStatus === "submitted" &&
        week.number > 1;

      const statusValue = progress?.status || "open";
      weekStatuses.push({
        weekNumber: week.number,
        status: statusValue as "open" | "submitted" | "approved" | "needs_more",
        completedAt: progress?.submitted_at,
        isLocked,
        isComplete,
        awaitingApproval,
      });

      // Track this week's status for next iteration
      previousWeekStatus = statusValue;

      // Current week is the first unlocked week that's not yet submitted or approved
      if (!currentWeekFound && !isLocked && statusValue !== "submitted" && statusValue !== "approved") {
        currentWeek = week.number;
        currentWeekFound = true;
      }
    }

    // If no open weeks were found, show the last approved week or the latest submitted week
    if (!currentWeekFound) {
      const latestActionWeek = [...weekStatuses].reverse().find(w => w.status === "submitted" || w.status === "approved");
      if (latestActionWeek) {
        currentWeek = latestActionWeek.weekNumber;
      }
    }

    // Get last activity date
    const lastActivityDate =
      progressData
        ?.filter((p) => p.submitted_at)
        .sort((a, b) =>
          new Date(b.submitted_at!).getTime() - new Date(a.submitted_at!).getTime()
        )?.[0]?.submitted_at;

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
 * Accessible means: not locked OR already completed (approved/submitted)
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

  // Allow access if:
  // 1. Week is not locked (current or future unlocked week)
  // 2. Week is already completed (approved) - for historical access
  // 3. Week is submitted (under review) - patient can view their submission
  return !weekStatus?.isLocked ||
    weekStatus?.status === "approved" ||
    weekStatus?.status === "submitted";
}

/**
 * Check if a week is read-only (completed and not reassigned)
 */
export async function isWeekReadOnly(
  patientId: string,
  weekNumber: number
): Promise<boolean> {
  const progress = await getUserProgress(patientId);
  if (!progress) return false;

  const weekStatus = progress.weekStatuses.find(
    (w) => w.weekNumber === weekNumber
  );

  // Week is read-only if it's approved or submitted
  return weekStatus?.status === "approved" || weekStatus?.status === "submitted";
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
