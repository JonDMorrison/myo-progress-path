import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

const POINTS_PER_LEVEL = 500;
const MAX_DAILY_POINTS = 500;

export interface GamificationStats {
  points: number;
  current_streak: number;
  longest_streak: number;
  level: number;
  last_activity_date: string | null;
}

/**
 * Initialize gamification stats for a new patient
 */
export async function initializeGamification(patientId: string, clinicId: string) {
  const { data, error } = await supabase
    .from("gamification_stats")
    .insert({
      patient_id: patientId,
      clinic_id: clinicId,
      points: 0,
      current_streak: 0,
      longest_streak: 0,
      level: 1,
    })
    .select()
    .single();

  if (error && !error.message.includes("duplicate")) {
    console.error("Error initializing gamification:", error);
    throw error;
  }

  return data;
}

/**
 * Award points to a patient (server-side validation)
 */
export async function awardPoints(
  patientId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; newTotal?: number }> {
  try {
    const { data, error } = await supabase.functions.invoke("award-points", {
      body: { patientId, amount, reason },
    });

    if (error) throw error;
    return { success: true, newTotal: data.newTotal };
  } catch (error: any) {
    console.error("Error awarding points:", error);
    return { success: false };
  }
}

export interface BadgeInfo {
  key: string;
  name: string;
  icon: string;
  description: string;
}

export interface GrantBadgeResult {
  success: boolean;
  alreadyEarned?: boolean;
  badge?: BadgeInfo;
}

/**
 * Grant a badge to a patient (idempotent)
 */
export async function grantBadge(
  patientId: string,
  badgeKey: string
): Promise<GrantBadgeResult> {
  try {
    const { data, error } = await supabase.functions.invoke("grant-badge", {
      body: { patientId, badgeKey },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error granting badge:", error);
    return { success: false };
  }
}

/**
 * Grant a badge and show a toast notification if newly earned
 */
export async function grantBadgeWithToast(
  patientId: string,
  badgeKey: string,
  toastFn: (opts: { title: string; description: string }) => void
): Promise<GrantBadgeResult> {
  const result = await grantBadge(patientId, badgeKey);
  
  if (result.success && !result.alreadyEarned && result.badge) {
    // Trigger celebratory confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'],
    });
    
    // Show toast notification
    toastFn({
      title: `${result.badge.icon} Badge Earned!`,
      description: `You unlocked "${result.badge.name}"`,
    });
  }
  
  return result;
}

/**
 * Update patient's activity streak
 */
export async function updateStreak(
  patientId: string
): Promise<{ success: boolean; newStreak?: number }> {
  try {
    const { data, error } = await supabase.functions.invoke("update-streak", {
      body: { patientId },
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error updating streak:", error);
    return { success: false };
  }
}

/**
 * Track challenge progress
 */
export async function trackChallenge(
  patientId: string,
  goalKey: string,
  increment: number = 1
): Promise<{ success: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke("track-challenge", {
      body: { patientId, goalKey, increment },
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error tracking challenge:", error);
    return { success: false };
  }
}

/**
 * Get patient's gamification stats
 */
export async function getGamificationStats(
  patientId: string
): Promise<GamificationStats | null> {
  try {
    const { data, error } = await supabase
      .from("gamification_stats")
      .select("*")
      .eq("patient_id", patientId)
      .single();

    if (error) {
      console.error("Error fetching gamification stats:", error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("gamification_stats query failed:", e);
    return null;
  }
}

/**
 * Get earned badges for a patient
 */
export async function getEarnedBadges(patientId: string) {
  try {
    const { data, error } = await supabase
      .from("earned_badges")
      .select(`
        *,
        badge:badges(*)
      `)
      .eq("patient_id", patientId)
      .order("earned_at", { ascending: false });

    if (error) {
      console.error("Error fetching earned badges:", error);
      return [];
    }

    return data;
  } catch (e) {
    console.error("earned_badges query failed:", e);
    return [];
  }
}

/**
 * Get active challenges for a patient's clinic
 */
export async function getActiveChallenges(clinicId: string) {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("clinic_id", clinicId)
      .eq("active", true)
      .lte("starts_on", today)
      .gte("ends_on", today);

    if (error) {
      console.error("Error fetching challenges:", error);
      return [];
    }

    return data;
  } catch (e) {
    console.error("challenges query failed:", e);
    return [];
  }
}

/**
 * Get challenge progress for a patient
 */
export async function getChallengeProgress(patientId: string, challengeId: string) {
  try {
    const { data, error } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("patient_id", patientId)
      .eq("challenge_id", challengeId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching challenge progress:", error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("challenge_progress query failed:", e);
    return null;
  }
}

/**
 * Calculate level from points
 */
export function calculateLevel(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

/**
 * Calculate progress to next level
 */
export function getLevelProgress(points: number): {
  current: number;
  next: number;
  progress: number;
} {
  const currentLevelPoints = (calculateLevel(points) - 1) * POINTS_PER_LEVEL;
  const pointsIntoCurrentLevel = points - currentLevelPoints;
  const progress = (pointsIntoCurrentLevel / POINTS_PER_LEVEL) * 100;

  return {
    current: calculateLevel(points),
    next: calculateLevel(points) + 1,
    progress: Math.min(progress, 100),
  };
}
