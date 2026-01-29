/**
 * Module-based grouping utilities
 * 
 * Program structure:
 * Non-Frenectomy: 12 modules (Module 1-12, each covering 2 weeks)
 * Frenectomy: Module 1 (Weeks 1-2), Post-Op Days (Weeks 3-6), Module 2-10 (Weeks 7-24)
 * 
 * Post-frenectomy content may reference days (Days 1-3, Days 4-7) as per clinical documents.
 */

// Post-frenectomy weekly weeks (these stay as individual weeks for recovery tracking)
export const FRENECTOMY_WEEKLY_WEEKS = [3, 4, 5, 6];

// Total weeks in program
export const TOTAL_PROGRAM_WEEKS = 24;

// Calculate total navigation items based on pathway
export function getTotalModules(programVariant: string): number {
  if (programVariant === 'frenectomy' || programVariant === 'standard') {
    // Frenectomy: Module 1 (weeks 1-2), then 4 weekly weeks (3-6), then Modules 2-10 for weeks 7-24
    // Module 1: weeks 1-2
    // Post-Op: weeks 3, 4, 5, 6 (4 individual items)
    // Modules 2-10: weeks 7-8, 9-10, 11-12, 13-14, 15-16, 17-18, 19-20, 21-22, 23-24 (9 modules)
    return 1 + 4 + 9; // = 14 total navigation items
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
  
  // Frenectomy pathway: weeks 3-6 are weekly (post-op recovery)
  if (isFrenectomy && FRENECTOMY_WEEKLY_WEEKS.includes(weekNumber)) {
    // Map week 3 = Days 1-3, week 4 = Days 4-7, week 5 = Days 8-14, week 6 = Days 15-21
    const dayLabels: Record<number, string> = {
      3: 'Days 1–3',
      4: 'Days 4–7',
      5: 'Week 2',
      6: 'Week 3',
    };
    const dayLabel = dayLabels[weekNumber] || `Post-Op ${weekNumber - 2}`;
    
    return {
      moduleNumber: weekNumber, // Use week number for uniqueness
      moduleLabel: `Post-Op ${dayLabel}`,
      isWeekly: true,
      weekRange: [weekNumber, weekNumber],
      displayLabel: `Post-Op ${dayLabel}`,
      shortLabel: weekNumber === 3 ? 'D1-3' : weekNumber === 4 ? 'D4-7' : `W${weekNumber - 4}`,
    };
  }
  
  // Calculate module number
  let moduleNum: number;
  let weekStart: number;
  let weekEnd: number;
  
  if (isFrenectomy) {
    if (weekNumber <= 2) {
      // Module 1: weeks 1-2
      moduleNum = 1;
      weekStart = 1;
      weekEnd = 2;
    } else if (weekNumber >= 7) {
      // Weeks 7+ map to modules 2-10
      // Week 7-8 = Module 2, Week 9-10 = Module 3, etc.
      moduleNum = Math.floor((weekNumber - 7) / 2) + 2;
      weekStart = ((moduleNum - 2) * 2) + 7;
      weekEnd = weekStart + 1;
    } else {
      // This shouldn't happen (weeks 3-6 are weekly)
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
    // Module 1 (Weeks 1-2)
    items.push({
      id: 'module-1',
      weekNumbers: [1, 2],
      label: 'Module 1 (Weeks 1–2)',
      shortLabel: 'M1',
      isPostOp: false,
      order: 1,
    });
    
    // Post-Op Weeks 3-6 (individual) with day-based labels
    const postOpLabels: { label: string; short: string }[] = [
      { label: 'Post-Op Days 1–3', short: 'D1-3' },
      { label: 'Post-Op Days 4–7', short: 'D4-7' },
      { label: 'Post-Op Week 2', short: 'W2' },
      { label: 'Post-Op Week 3', short: 'W3' },
    ];
    
    for (let i = 0; i < 4; i++) {
      const week = 3 + i;
      items.push({
        id: `postop-week-${week}`,
        weekNumbers: [week],
        label: postOpLabels[i].label,
        shortLabel: postOpLabels[i].short,
        isPostOp: true,
        order: week,
      });
    }
    
    // Modules 2-10 (Weeks 7-24)
    let moduleNum = 2;
    for (let weekStart = 7; weekStart <= 23; weekStart += 2) {
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
