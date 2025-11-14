/**
 * Application constants
 */

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
