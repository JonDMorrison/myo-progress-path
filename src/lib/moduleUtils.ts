/**
 * Module/Biweekly grouping utilities
 * 
 * Program structure:
 * - Most weeks are grouped into biweekly modules (2 weeks each)
 * - Exception: Frenectomy pathway weeks 3-6 remain weekly (post-op recovery)
 */

// Post-frenectomy weekly weeks (these stay as individual weeks, not grouped into modules)
export const FRENECTOMY_WEEKLY_WEEKS = [3, 4, 5, 6];

// Total weeks in program
export const TOTAL_PROGRAM_WEEKS = 24;

// Calculate total modules based on pathway
export function getTotalModules(programVariant: string): number {
  if (programVariant === 'frenectomy' || programVariant === 'standard') {
    // Frenectomy: Module 1 (weeks 1-2), then 4 weekly weeks (3-6), then biweekly modules for 7-24
    // Module 1: weeks 1-2
    // Weekly: weeks 3, 4, 5, 6 (4 individual items)
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
    const postOpWeekNumber = weekNumber - 2; // Week 3 = Post-Op Week 1, etc.
    return {
      moduleNumber: weekNumber, // Use week number for uniqueness
      moduleLabel: `Post-Op Week ${postOpWeekNumber}`,
      isWeekly: true,
      weekRange: [weekNumber, weekNumber],
      displayLabel: `Post-Op Week ${postOpWeekNumber}`,
      shortLabel: `PO${postOpWeekNumber}`,
    };
  }
  
  // Calculate module number
  let moduleNum: number;
  let weekStart: number;
  let weekEnd: number;
  
  if (isFrenectomy) {
    if (weekNumber <= 2) {
      // Module 1: weeks 1-2 (Pre-Op)
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
    // Non-frenectomy: simple biweekly modules
    moduleNum = Math.ceil(weekNumber / 2);
    weekStart = (moduleNum - 1) * 2 + 1;
    weekEnd = weekStart + 1;
  }
  
  // Determine module label
  let moduleLabel: string;
  if (isFrenectomy && weekNumber <= 2) {
    moduleLabel = 'Pre-Op Module';
  } else {
    moduleLabel = `Module ${moduleNum}`;
  }
  
  return {
    moduleNumber: moduleNum,
    moduleLabel,
    isWeekly: false,
    weekRange: [weekStart, weekEnd],
    displayLabel: `${moduleLabel} (Weeks ${weekStart}-${weekEnd})`,
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
    // Pre-Op Module (Weeks 1-2)
    items.push({
      id: 'module-1',
      weekNumbers: [1, 2],
      label: 'Pre-Op Module',
      shortLabel: 'Pre',
      isPostOp: false,
      order: 1,
    });
    
    // Post-Op Weeks 3-6 (individual)
    for (let week = 3; week <= 6; week++) {
      items.push({
        id: `postop-week-${week}`,
        weekNumbers: [week],
        label: `Post-Op Week ${week - 2}`,
        shortLabel: `PO${week - 2}`,
        isPostOp: true,
        order: week,
      });
    }
    
    // Maintenance Modules (Weeks 7-24)
    let moduleNum = 2;
    for (let weekStart = 7; weekStart <= 23; weekStart += 2) {
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
    // Non-frenectomy: all biweekly modules
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
    // Post-op week - show "Post-Op Week X" with optional title
    return {
      primary: moduleInfo.displayLabel,
      secondary: weekTitle || '',
    };
  }
  
  // Biweekly module
  const weekLabel = `Week ${weekNumber} of ${moduleInfo.weekRange[0]}-${moduleInfo.weekRange[1]}`;
  return {
    primary: moduleInfo.moduleLabel,
    secondary: weekTitle ? `${weekLabel} • ${weekTitle}` : weekLabel,
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
