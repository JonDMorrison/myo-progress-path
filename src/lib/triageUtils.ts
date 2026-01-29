/**
 * Triage utility functions for therapist inbox
 * 
 * NOTE: AI-based triage has been disabled. Triage is now based on:
 * - Waiting time
 * - Consecutive needs_more status
 */

export type TriageLevel = 'green' | 'yellow' | 'red';

export interface TriageResult {
  level: TriageLevel;
  reasons: string[];
}

/**
 * Calculate triage level for a patient-week submission
 * 
 * GREEN: submitted, waiting < 48h, no consecutive needs_more
 * YELLOW: waiting 48-72h OR status = needs_more
 * RED: waiting > 72h OR 2+ consecutive needs_more
 */
export function calculateTriageLevel(
  status: string,
  submittedAt: string | null,
  consecutiveNeedsMore: number,
  _uploads?: { ai_feedback?: any; ai_feedback_status?: string | null }[] // Kept for API compatibility but unused
): TriageResult {
  const reasons: string[] = [];
  
  // Calculate waiting time in hours
  const waitingHours = submittedAt
    ? (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60)
    : 0;
  
  // RED conditions (highest priority)
  if (waitingHours > 72) {
    reasons.push('Waiting over 72 hours');
  }
  if (consecutiveNeedsMore >= 2) {
    reasons.push(`${consecutiveNeedsMore} consecutive needs_more`);
  }
  
  if (reasons.length > 0 && (waitingHours > 72 || consecutiveNeedsMore >= 2)) {
    return { level: 'red', reasons };
  }
  
  // YELLOW conditions
  if (waitingHours >= 48 && waitingHours <= 72) {
    reasons.push('Waiting 48-72 hours');
  }
  if (status === 'needs_more') {
    reasons.push('Needs more practice');
  }
  
  if (reasons.length > 0) {
    return { level: 'yellow', reasons };
  }
  
  // GREEN - all clear
  return { level: 'green', reasons: ['Ready for review'] };
}

/**
 * Get CSS classes for triage border color - high contrast, subtle
 */
export function getTriageBorderClass(level: TriageLevel): string {
  switch (level) {
    case 'red':
      return 'border-l-[3px] border-l-destructive';
    case 'yellow':
      return 'border-l-[3px] border-l-warning';
    case 'green':
      return 'border-l-[3px] border-l-success';
  }
}

/**
 * Get human-readable waiting time
 */
export function formatWaitingTime(submittedAt: string | null): string {
  if (!submittedAt) return 'Not submitted';
  
  const now = new Date();
  const submitted = new Date(submittedAt);
  const diffMs = now.getTime() - submitted.getTime();
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days}d ago`;
  }
  if (hours > 0) {
    return `${hours}h ago`;
  }
  return 'Just now';
}
