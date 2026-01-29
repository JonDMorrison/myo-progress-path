/**
 * Application constants
 */

// Program variant to title mapping
export const PROGRAM_TITLES: Record<string, string> = {
  'frenectomy': 'Frenectomy Program',
  'non_frenectomy': 'Non-Frenectomy Program',
  'standard': 'Frenectomy Program', // Default to frenectomy for legacy/standard users
};

/**
 * Get program title from variant, with fallback
 */
export function getProgramTitle(variant: string | null | undefined): string {
  return PROGRAM_TITLES[variant || 'frenectomy'] || PROGRAM_TITLES['frenectomy'];
}

// Program frequency settings
export const CHECKIN_FREQUENCY = "biweekly" as const;
export const BOLT_SCHEDULE = ["start", "mid", "end"] as const;

// Video upload settings
export const VIDEO_MAX_SIZE_MB = 100;
export const VIDEO_ACCEPTED_FORMATS = ["video/mp4", "video/quicktime"];

// Week requirements
export const STANDARD_WEEK_REQUIREMENTS = {
  requires_first_attempt: true,
  requires_last_attempt: true,
  requires_bolt: false,
} as const;

// Module configuration
export const MODULE_CONFIG = {
  // Post-frenectomy weeks (recovery period - weeks 9-10 only per source document)
  FRENECTOMY_POST_OP_WEEKS: [9, 10],
  // Total weeks in program
  TOTAL_WEEKS: 24,
  // Labels
  PRE_OP_LABEL: 'Pre-Op Module',
  POST_OP_PREFIX: 'Post-Op',
  MODULE_PREFIX: 'Module',
} as const;
