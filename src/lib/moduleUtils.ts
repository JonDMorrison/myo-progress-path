import { isFrenectomyVariant } from "./constants";
import { supabase } from "@/integrations/supabase/client";

/**
 * Module-based grouping utilities
 * 
 * Program structure per MFT_with_Frenectomy.docx:
 * 
 * Frenectomy Pathway (24 weeks):
 *   - Module 1: Weeks 1-2 (Foundation)
 *   - Module 2: Weeks 3-4 (Pre-Frenectomy)
 *   - Module 3: Weeks 5-6 (Pre-Frenectomy)
 *   - Module 4: Weeks 7-8 (Pre-Frenectomy Preparation)
 *   - [Pre-Op Protocol - Dr. Caylor p.28]
 *   - Post-Op: Week 9 (Days 1-3, Days 4-7), Week 10 (Days 8-14)
 *   - [Post-Op Protocol - Dr. Caylor p.32]
 *   - Module 5: Weeks 11-12
 *   - Module 6: Weeks 13-14
 *   - Module 7: Weeks 15-16
 *   - Module 8: Weeks 17-18
 *   - Module 9: Weeks 19-20
 *   - Module 10: Weeks 21-22
 *   - Module 11: Weeks 23-24
 * 
 * Non-Frenectomy Pathway: 12 modules (Module 1-12, each covering 2 weeks)
 */

// Post-frenectomy weeks (recovery period - weeks 9-10 only)
export const FRENECTOMY_POST_OP_WEEKS = [9, 10];

// Total weeks in program
export const TOTAL_PROGRAM_WEEKS = 24;

// Week 9 sub-sections per source document (Days 1-3 and Days 4-7)
export interface PostOpSubSection {
  id: string;
  label: string;
  shortLabel: string;
  dayRange: string;
  description: string;
}

export const WEEK_9_SUBSECTIONS: PostOpSubSection[] = [
  {
    id: 'days-1-3',
    label: 'Days 1–3',
    shortLabel: 'D1-3',
    dayRange: '1-3',
    description: 'Minimal activity. Gently lift tongue up/down, left/right. Focus on healing and rest.',
  },
  {
    id: 'days-4-7',
    label: 'Days 4–7',
    shortLabel: 'D4-7',
    dayRange: '4-7',
    description: 'Begin gentle exercises: Lingual Palatal Suction, Tongue Trace, Floor of Mouth Massage.',
  },
];

// Week 10 represents Days 8-14 (single section)
export const WEEK_10_INFO = {
  id: 'days-8-14',
  label: 'Days 8–14',
  shortLabel: 'D8-14',
  dayRange: '8-14',
  description: 'Continue gentle exercises and stretches. The tissue continues healing for several months.',
};

// Calculate total navigation items based on pathway
export function getTotalModules(programVariant: string): number {
  if (isFrenectomyVariant(programVariant)) {
    // Frenectomy per source document:
    // Modules 1-4: Weeks 1-8 (4 biweekly modules)
    // Post-Op: Weeks 9 and 10 (re-labeled as Module 5 and 6)
    // Modules 7-13: Weeks 11-24 (7 biweekly modules)
    return 4 + 2 + 7; // = 13 total navigation items
  }
  // Non-frenectomy: all weeks are biweekly modules
  return 12; // 24 weeks / 2 = 12 modules
}

/**
 * Get module info for a given week number
 */
export interface ModuleInfo {
  moduleNumber: number;
  moduleLabel: string;
  isWeekly: boolean; // True if this is a weekly (not biweekly) item
  weekRange: [number, number]; // [startWeek, endWeek]
  displayLabel: string; // What to show in UI
  shortLabel: string; // Compact label for timeline dots
}

export function getModuleInfo(weekNumber: number, programVariant: string): ModuleInfo {
  const isFrenectomy = isFrenectomyVariant(programVariant);

  // Frenectomy pathway: weeks 9-10 are post-op recovery (individual weeks)
  // Re-labeled as Module 5 and Module 6 per user request
  if (isFrenectomy && FRENECTOMY_POST_OP_WEEKS.includes(weekNumber)) {
    const moduleNum = weekNumber === 9 ? 5 : 6;

    return {
      moduleNumber: moduleNum,
      moduleLabel: `Module ${moduleNum}`,
      isWeekly: true,
      weekRange: [weekNumber, weekNumber],
      displayLabel: `Module ${moduleNum}`,
      shortLabel: `M${moduleNum}`,
    };
  }

  // Calculate module number for biweekly modules
  let moduleNum: number;
  let weekStart: number;
  let weekEnd: number;

  if (isFrenectomy) {
    if (weekNumber <= 8) {
      // Modules 1-4: Weeks 1-8 (pre-frenectomy)
      moduleNum = Math.ceil(weekNumber / 2);
      weekStart = (moduleNum - 1) * 2 + 1;
      weekEnd = weekStart + 1;
    } else if (weekNumber >= 11) {
      // Modules 7-13: Weeks 11-24 (post-recovery)
      // Week 11-12 = Module 7, Week 13-14 = Module 8, etc.
      moduleNum = Math.floor((weekNumber - 11) / 2) + 7;
      weekStart = ((moduleNum - 7) * 2) + 11;
      weekEnd = weekStart + 1;
    } else {
      // Weeks 9-10 are handled above as post-op
      moduleNum = weekNumber === 9 ? 5 : 6;
      weekStart = weekNumber;
      weekEnd = weekNumber;
    }
  } else {
    // Non-frenectomy: simple biweekly modules (Module 1-12)
    moduleNum = Math.ceil(weekNumber / 2);
    weekStart = (moduleNum - 1) * 2 + 1;
    weekEnd = weekStart + 1;
  }

  const moduleLabel = `Module ${moduleNum}`;

  return {
    moduleNumber: moduleNum,
    moduleLabel,
    isWeekly: false,
    weekRange: [weekStart, weekEnd],
    displayLabel: moduleLabel,
    shortLabel: `M${moduleNum}`,
  };
}

/**
 * Get all navigation items for the program timeline
 * Returns a list of items (modules or weekly weeks) for display
 */
export interface TimelineItem {
  id: string;
  weekNumbers: number[]; // Which weeks this item represents (empty for protocol pages)
  label: string;
  shortLabel: string;
  isPostOp: boolean;
  isProtocol?: boolean; // True for standalone protocol pages (not weeks)
  protocolSlug?: string; // URL slug for protocol pages
  order: number; // For sorting
}

export function getTimelineItems(programVariant: string): TimelineItem[] {
  const isFrenectomy = isFrenectomyVariant(programVariant);
  const items: TimelineItem[] = [];

  if (isFrenectomy) {
    // Modules 1-4: Weeks 1-8 (Pre-Frenectomy)
    for (let moduleNum = 1; moduleNum <= 4; moduleNum++) {
      const weekStart = (moduleNum - 1) * 2 + 1;
      items.push({
        id: `module-${moduleNum}`,
        weekNumbers: [weekStart, weekStart + 1],
        label: `Module ${moduleNum}`,
        shortLabel: `M${moduleNum}`,
        isPostOp: false,
        order: weekStart,
      });
    }

    // Add Frenectomy Protocol Item
    items.push({
      id: "frenectomy-procedure",
      weekNumbers: [],
      label: "Frenectomy",
      shortLabel: "OR", // Operating Room / Surgery
      isPostOp: false,
      isProtocol: true,
      protocolSlug: "frenectomy",
      order: 8.5,
    });

    // Post-Op Weeks 9-10 (individual) re-labeled as Module 5 and 6
    items.push({
      id: 'postop-module-5',
      weekNumbers: [9],
      label: 'Module 5',
      shortLabel: 'M5',
      isPostOp: true,
      order: 9,
    });

    items.push({
      id: 'postop-module-6',
      weekNumbers: [10],
      label: 'Module 6',
      shortLabel: 'M6',
      isPostOp: true,
      order: 10,
    });

    // Modules 7-13: Weeks 11-24 (Post-Recovery)
    let moduleNum = 7;
    for (let weekStart = 11; weekStart <= 23; weekStart += 2) {
      items.push({
        id: `module-${moduleNum}`,
        weekNumbers: [weekStart, weekStart + 1],
        label: `Module ${moduleNum}`,
        shortLabel: `M${moduleNum}`,
        isPostOp: false,
        order: weekStart,
      });
      moduleNum++;
    }
  } else {
    // Non-frenectomy: all biweekly modules (Module 1-12)
    for (let moduleNum = 1; moduleNum <= 12; moduleNum++) {
      const weekStart = (moduleNum - 1) * 2 + 1;
      items.push({
        id: `module-${moduleNum}`,
        weekNumbers: [weekStart, weekStart + 1],
        label: `Module ${moduleNum}`,
        shortLabel: `M${moduleNum}`,
        isPostOp: false,
        order: weekStart,
      });
    }
  }

  return items.sort((a, b) => a.order - b.order);
}

/**
 * Get the display label for a week header
 */
export function getWeekDisplayLabel(weekNumber: number, weekTitle: string | null, programVariant: string): {
  primary: string;
  secondary: string;
} {
  const moduleInfo = getModuleInfo(weekNumber, programVariant);

  if (moduleInfo.isWeekly) {
    // Post-op day/week - show with optional title
    return {
      primary: moduleInfo.displayLabel,
      secondary: weekTitle || '',
    };
  }

  // Biweekly module - hide Week 1 / Week 2 secondary label
  return {
    primary: moduleInfo.moduleLabel,
    secondary: '',
  };
}

/**
 * Get navigation item index from week number
 */
export function getTimelineItemIndex(weekNumber: number, programVariant: string): number {
  const items = getTimelineItems(programVariant);
  const index = items.findIndex(item => item.weekNumbers.includes(weekNumber));
  return index >= 0 ? index : 0;
}

/**
 * Get week number(s) from timeline item index
 */
export function getWeeksFromTimelineIndex(index: number, programVariant: string): number[] {
  const items = getTimelineItems(programVariant);
  return items[index]?.weekNumbers || [1];
}

/**
 * Clean up a week title by removing redundant "Module X - Weeks Y-Z:" prefix
 */
export function cleanWeekTitle(title: string | null): string {
  if (!title) return "";
  // Removes pattern like "Module 1 - Weeks 1-2: ", "Module 1 - Week 1: ", "Part One: ", "Part Two: "
  return title
    .replace(/^Module \d+ - Weeks? \d+(-?\d+)?:?\s*/i, "")
    .replace(/^(Part (One|Two|Three|Four)|Phase \d+):?\s*/i, "")
    .trim();
}

/**
 * Check if this week is the final week in its current module
 */
export function isLastWeekOfModule(weekNumber: number, programVariant: string): boolean {
  const info = getModuleInfo(weekNumber, programVariant);
  return weekNumber === info.weekRange[1];
}

// ─── OPTION B: SINGLE-PAGE MODULE ANCHORING ────────────────────────
//
// Under Option B, patients only ever visit the "anchor" week of a module.
// For biweekly modules that's the odd week. For single-week modules
// (frenectomy post-op 9/10, week 25) it's the week itself.
//
// Uses direct variant string comparison rather than isFrenectomyVariant()
// because the latter incorrectly groups 'standard' with frenectomy — for
// our purposes only the actual frenectomy variants have single-week
// post-op modules.

function isFrenectomyOnly(programVariant: string | null | undefined): boolean {
  return programVariant === "frenectomy" || programVariant === "frenectomy_video";
}

/**
 * Returns the anchor (odd) week number for a given week. Single-week
 * modules return themselves.
 */
export function getModuleAnchorWeek(weekNumber: number, programVariant: string): number {
  if (weekNumber === 25) return 25;
  if (isFrenectomyOnly(programVariant) && (weekNumber === 9 || weekNumber === 10)) {
    return weekNumber;
  }
  return weekNumber % 2 === 1 ? weekNumber : weekNumber - 1;
}

/**
 * Returns true when the given week is a patient-visible "anchor" page.
 * Biweekly modules: anchor = odd week.
 * Single-week modules (frenectomy post-op, week 25): anchor = the week itself.
 */
export function isModuleAnchorWeek(weekNumber: number, programVariant: string): boolean {
  if (weekNumber === 25) return true;
  if (isFrenectomyOnly(programVariant) && (weekNumber === 9 || weekNumber === 10)) {
    return true;
  }
  return weekNumber % 2 === 1;
}

/**
 * Returns true when a patient on this week should be redirected to the
 * anchor week. Therapists/admins see every week (read-only preview), so
 * callers must check role before applying the redirect.
 */
export function isCollapsedEvenWeek(weekNumber: number, programVariant: string): boolean {
  if (weekNumber === 25) return false;
  if (isFrenectomyOnly(programVariant) && (weekNumber === 9 || weekNumber === 10)) {
    return false;
  }
  return weekNumber % 2 === 0;
}

/**
 * Returns the partner week number (even week) for an odd biweekly anchor,
 * or null for single-week modules.
 */
export function getPartnerWeekNumber(weekNumber: number, programVariant: string): number | null {
  if (weekNumber === 25) return null;
  if (isFrenectomyOnly(programVariant) && (weekNumber === 9 || weekNumber === 10)) {
    return null;
  }
  if (weekNumber % 2 === 1) return weekNumber + 1;
  return weekNumber - 1;
}

/**
 * Look up the UUID(s) of both partner weeks for a module so callers can
 * scope an `uploads`/`messages` query with `.in("week_id", ids)`.
 *
 * - For biweekly modules: returns [oddWeekId, evenWeekId] (both rows).
 * - For single-week modules: returns [weekId] only.
 *
 * If the supabase lookup fails or returns no rows, returns an empty array
 * so callers fall back to their own defensive handling.
 *
 * Option B note: this is the read-side glue that lets uploads written
 * under the legacy even-week id remain visible on the new collapsed
 * anchor page. Without this, any patient mid-program with last-attempt
 * uploads under their even-week id would silently lose visibility of
 * those rows after Option B ships.
 */
export async function getModulePartnerWeekIds(
  weekNumber: number,
  programVariant: string,
  programTitle: string
): Promise<string[]> {
  const anchor = getModuleAnchorWeek(weekNumber, programVariant);
  const partner = getPartnerWeekNumber(anchor, programVariant);
  const weekNumbers = partner == null ? [anchor] : [anchor, partner];

  const { data, error } = await supabase
    .from("weeks")
    .select("id, programs!inner(title)")
    .in("number", weekNumbers)
    .eq("programs.title", programTitle);

  if (error || !data) return [];
  return data.map((w: any) => w.id);
}
