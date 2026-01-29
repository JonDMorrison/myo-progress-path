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

// Calculate total navigation items based on pathway
export function getTotalModules(programVariant: string): number {
  if (programVariant === 'frenectomy' || programVariant === 'standard') {
    // Frenectomy per source document:
    // Modules 1-4: Weeks 1-8 (4 biweekly modules)
    // Post-Op: Weeks 9-10 (2 individual weeks with day subdivisions)
    // Modules 5-11: Weeks 11-24 (7 biweekly modules)
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
  const isFrenectomy = programVariant === 'frenectomy' || programVariant === 'standard';
  
  // Frenectomy pathway: weeks 9-10 are post-op recovery (individual weeks)
  if (isFrenectomy && FRENECTOMY_POST_OP_WEEKS.includes(weekNumber)) {
    // Week 9 = Days 1-7 (subdivided into Days 1-3, Days 4-7)
    // Week 10 = Days 8-14
    const dayLabels: Record<number, string> = {
      9: 'Days 1–7',
      10: 'Days 8–14',
    };
    const shortLabels: Record<number, string> = {
      9: 'D1-7',
      10: 'D8-14',
    };
    const dayLabel = dayLabels[weekNumber] || `Post-Op Week ${weekNumber - 8}`;
    
    return {
      moduleNumber: weekNumber, // Use week number for uniqueness
      moduleLabel: `Post-Op ${dayLabel}`,
      isWeekly: true,
      weekRange: [weekNumber, weekNumber],
      displayLabel: `Post-Op ${dayLabel}`,
      shortLabel: shortLabels[weekNumber] || `PO${weekNumber - 8}`,
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
      // Modules 5-11: Weeks 11-24 (post-recovery)
      // Week 11-12 = Module 5, Week 13-14 = Module 6, etc.
      moduleNum = Math.floor((weekNumber - 11) / 2) + 5;
      weekStart = ((moduleNum - 5) * 2) + 11;
      weekEnd = weekStart + 1;
    } else {
      // Weeks 9-10 are handled above as post-op
      moduleNum = weekNumber;
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
    displayLabel: `${moduleLabel} (Weeks ${weekStart}–${weekEnd})`,
    shortLabel: `M${moduleNum}`,
  };
}

/**
 * Get all navigation items for the program timeline
 * Returns a list of items (modules or weekly weeks) for display
 */
export interface TimelineItem {
  id: string;
  weekNumbers: number[]; // Which weeks this item represents
  label: string;
  shortLabel: string;
  isPostOp: boolean;
  order: number; // For sorting
}

export function getTimelineItems(programVariant: string): TimelineItem[] {
  const isFrenectomy = programVariant === 'frenectomy' || programVariant === 'standard';
  const items: TimelineItem[] = [];
  
  if (isFrenectomy) {
    // Modules 1-4: Weeks 1-8 (Pre-Frenectomy)
    for (let moduleNum = 1; moduleNum <= 4; moduleNum++) {
      const weekStart = (moduleNum - 1) * 2 + 1;
      items.push({
        id: `module-${moduleNum}`,
        weekNumbers: [weekStart, weekStart + 1],
        label: `Module ${moduleNum} (Weeks ${weekStart}–${weekStart + 1})`,
        shortLabel: `M${moduleNum}`,
        isPostOp: false,
        order: weekStart,
      });
    }
    
    // Post-Op Weeks 9-10 (individual) with day-based labels
    items.push({
      id: 'postop-week-9',
      weekNumbers: [9],
      label: 'Post-Op Days 1–7',
      shortLabel: 'D1-7',
      isPostOp: true,
      order: 9,
    });
    
    items.push({
      id: 'postop-week-10',
      weekNumbers: [10],
      label: 'Post-Op Days 8–14',
      shortLabel: 'D8-14',
      isPostOp: true,
      order: 10,
    });
    
    // Modules 5-11: Weeks 11-24 (Post-Recovery)
    let moduleNum = 5;
    for (let weekStart = 11; weekStart <= 23; weekStart += 2) {
      items.push({
        id: `module-${moduleNum}`,
        weekNumbers: [weekStart, weekStart + 1],
        label: `Module ${moduleNum} (Weeks ${weekStart}–${weekStart + 1})`,
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
        label: `Module ${moduleNum} (Weeks ${weekStart}–${weekStart + 1})`,
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
  
  // Biweekly module
  const weekPosition = weekNumber === moduleInfo.weekRange[0] ? 'Week 1' : 'Week 2';
  return {
    primary: moduleInfo.moduleLabel,
    secondary: weekTitle ? `${weekPosition} • ${weekTitle}` : `${weekPosition} of 2`,
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
