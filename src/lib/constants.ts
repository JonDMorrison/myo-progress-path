/**
 * Application constants
 */

// ─── ACCESS CODE → VARIANT MAPPING ───────────────────────────────
// Patients enter one of these codes during onboarding.
// The code determines their program_variant in the DB.
export const ACCESS_CODE_MAP: Record<string, string> = {
  'montrosefren':          'frenectomy',
  'montrosefrenvideo':     'frenectomy_video',
  'montrosenonfren':       'non_frenectomy',
  'montrosenonfrenvideo':  'non_frenectomy_video',
};

// ─── VARIANT HELPERS ─────────────────────────────────────────────
/**
 * Returns true if the variant is any frenectomy pathway
 */
export function isFrenectomyVariant(variant: string | null | undefined): boolean {
  const v = variant || 'frenectomy';
  return v === 'frenectomy' || v === 'frenectomy_video' || v === 'standard';
}

/**
 * Returns true if the variant includes video submissions
 * Per client update: emailing videos is now required for ALL pathways
 */
export function requiresVideo(variant: string | null | undefined): boolean {
  if (!variant) return true; // Default to true if not specified
  return true; // Force true for all variants as per the latest requirements
}

/**
 * Normalise the variant into the base program type for DB lookup
 * e.g. 'frenectomy_video' → 'frenectomy'
 */
export function getBaseVariant(variant: string | null | undefined): string {
  const v = variant || 'frenectomy';
  if (v === 'frenectomy_video') return 'frenectomy';
  if (v === 'non_frenectomy_video') return 'non_frenectomy';
  return v;
}

// ─── PROGRAM TITLES ──────────────────────────────────────────────
// All 4 variants (+ legacy 'standard') map to one of two display titles.
export const PROGRAM_TITLES: Record<string, string> = {
  'frenectomy':            'Frenectomy Program',
  'frenectomy_video':      'Frenectomy Program',
  'non_frenectomy':        'Non-Frenectomy Program',
  'non_frenectomy_video':  'Non-Frenectomy Program',
  'standard':              'Frenectomy Program', // legacy fallback
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
export const VIDEO_MAX_SIZE_MB = 500;
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
