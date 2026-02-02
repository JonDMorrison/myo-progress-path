

# Terminology Audit: "Week" → "Part One/Part Two" Migration

## Executive Summary

The audit identified **50+ files** containing references to "Week" terminology that may need updating. These references fall into several categories:
- **Patient-facing UI** (highest priority) 
- **Therapist/admin interfaces** (medium priority)
- **Internal logic & database** (lower priority - may need to keep for data integrity)
- **Email templates & notifications** (high priority)
- **Content JSON files** (high priority)

---

## Category 1: Patient-Facing UI Components (Highest Priority)

These are the components patients see during their therapy journey.

### 1.1 Week Card Component
**File:** `src/components/week/WeekCard.tsx` (lines 80-81)
```typescript
const weekPosition = week.weekNumber === moduleInfo.weekRange[0] ? 'Week 1' : 'Week 2';
return weekTitle ? `${weekPosition} • ${weekTitle}` : `${weekPosition} of 2`;
```
**Change:** Replace `'Week 1'` → `'Part One'` and `'Week 2'` → `'Part Two'`

### 1.2 Clinician Review Banner
**File:** `src/components/week/ClinicianReviewBanner.tsx` (line 13)
```typescript
Week {weekNumber}: Awaiting clinician confirmation.
```
**Change:** This needs context-aware replacement (e.g., "Part One: Awaiting clinician confirmation" or module-based labeling)

### 1.3 Week Header Fallback
**File:** `src/components/week/WeekHeader.tsx` (line 65)
```typescript
{displayLabels?.primary || `Week ${week?.number}`}
```
**Change:** Update fallback to module/part-based label

### 1.4 Module Utils - Week Display Labels
**File:** `src/lib/moduleUtils.ts` (lines 288-292)
```typescript
const weekPosition = weekNumber === moduleInfo.weekRange[0] ? 'Preparation' : 'Completion';
```
**Note:** Currently shows "Preparation" / "Completion", consider changing to "Part One" / "Part Two"

### 1.5 Week Introduction Modal (Already Updated)
**File:** `src/components/WeekIntroductionModal.tsx`
**Status:** ✅ Already changed from "Week X" to "Part [Word]"

---

## Category 2: Email Templates & Notifications (High Priority)

### 2.1 Patient Email Templates
**File:** `src/lib/emailTemplates.ts`

| Line | Current Text | Proposed Change |
|------|-------------|-----------------|
| 12 | `Week ${weekNumber} Submitted - ${patientName}` | Use module/part label |
| 15-17 | `Week ${weekNumber} Ready for Review` | Use module/part label |
| 20 | `Review Week ${weekNumber}` | Update button text |
| 39 | `Week ${weekNumber} Approved! 🎉` | Use module/part label |
| 44 | `has approved Week ${weekNumber}` | Use module/part label |
| 45 | `Week ${weekNumber + 1} is now unlocked` | Update logic |
| 68 | `Week ${weekNumber} - Additional Practice Needed` | Use module/part label |
| 71-73 | `Week ${weekNumber} Update` | Update labels |
| 140-145 | `What to expect in Week 1` / `Watch the Week 1 Intro Video` | Change to "Part One" |
| 187 | `Watch your Week 1 intro video` | Change to "Part One" |

### 2.2 Send Reminders Edge Function
**File:** `supabase/functions/send-reminders/index.ts`

| Line | Current Text | Change |
|------|-------------|--------|
| 64 | `exercises for <strong>Week ${week.number}</strong>` | Use module/part label |
| 85 | `complete your Week ${week.number} exercises today!` | Use module/part label |

### 2.3 Send Onboarding Email Edge Function
**File:** `supabase/functions/send-onboarding-email/index.ts`

| Line | Current Text | Change |
|------|-------------|--------|
| 94 | `What to expect in Week 1` | "What to expect in Module 1" |
| 99 | `Watch the Week 1 Intro Video` | "Watch the Module 1 Intro Video" |

---

## Category 3: Therapist/Admin Interfaces (Medium Priority)

### 3.1 Therapist Review Panel
**File:** `src/components/therapist/ReviewPanel.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 254 | `Week ${weekNumber} approved for ${patientName}` | Use module/part label |
| 378 | `Week ${weekNumber} has been unlocked` | Use module/part label |
| 410 | `{patientName} · Week {weekNumber}` | Use module/part label |
| 413 | `Final Week` badge | Consider "Final Module" |
| 545-568 | References to "Week 24" | Update to module terminology |

### 3.2 Therapist Dashboard
**File:** `src/pages/TherapistDashboard.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 354 | `Week ${review.week.number} approved for ${review.patient.user.name}` | Module/part label |
| 380 | `Note sent to patient for Week ${noteDialog.weekNumber}` | Module/part label |

### 3.3 Review Actions
**File:** `src/lib/reviewActions.ts`

| Line | Current Text | Change |
|------|-------------|--------|
| 256-257 | `Week ${weekNumber} has been reassigned` | Use module/part label |
| 263 | `Week ${weekNumber} has been unlocked` | Use module/part label |

### 3.4 Therapist Feedback Dialog
**File:** `src/components/therapist/TherapistFeedbackDialog.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 206 | `for Week ${weekNumber}` | Use module/part label |
| 242 | `for Week ${weekNumber}` | Use module/part label |

### 3.5 Maintenance Assignment Dialog
**File:** `src/components/therapist/MaintenanceAssignmentDialog.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 81 | `title: w.title \|\| \`Week ${w.number}\`` | Use module/part label |
| 121-127 | `assigned Week ${selectedWeek?.number}` | Use module/part label |

### 3.6 Maintenance Dashboard
**File:** `src/components/maintenance/MaintenanceDashboard.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 69 | `week_title: a.weeks.title \|\| \`Week ${a.weeks.number}\`` | Use module/part label |

### 3.7 Master Admin Export
**File:** `supabase/functions/export-master-patients/index.ts`

| Line | Current Text | Change |
|------|-------------|--------|
| 100 | `Week ${patient.current_week_number}` | Use module/part label |

---

## Category 4: Content JSON Files (High Priority)

### 4.1 Weeks 1-2 Updated
**File:** `public/weeks-1-2-updated.json`

| Line | Current Text | Change |
|------|-------------|--------|
| 5 | `"title": "Foundation Building - Weeks 1-2 (Part 1)"` | Already has "Part 1" |
| 15-16 | `"video_title": "Week 1-2 Exercise Demonstrations"` | "Module 1 Exercise Demonstrations" |
| 86-87 | Title/intro references to "Week 1" | Change to "Part One" |
| 96 | `"video_title": "Week 1-2 Exercise Demonstrations"` | Update |

### 4.2 Weeks 3-4 Updated
**File:** `public/weeks-3-4-updated.json`

| Line | Current Text | Change |
|------|-------------|--------|
| 5 | `"title": "Week 3"` | "Module 2 - Part One" |
| 77 | `"title": "Week 4"` | "Module 2 - Part Two" |
| 78 | `exercises from Week 3` | "exercises from Part One" |

### 4.3 Weeks 5-6 Updated
**File:** `public/weeks-5-6-updated.json`

| Line | Current Text | Change |
|------|-------------|--------|
| 5 | `"title": "Week 5 - Pre-Frenectomy Preparation"` | "Module 3 Part One - Pre-Frenectomy Preparation" |
| 34 | `the first week...the second week` | "Part One...Part Two" |
| 78-80 | `"title": "Week 6..."` and intro | Update references |
| 107 | `the first week...the second week` | Same |

---

## Category 5: Admin Tools (Lower Priority)

### 5.1 Admin Sidebar Navigation
**File:** `src/components/layout/AdminSidebar.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 51-53 | `"Update Weeks 1-2"`, etc. | Internal admin naming - can keep or update |

### 5.2 Week Settings Editor
**File:** `src/pages/admin/WeekSettingsEditor.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 180-188 | `Enable BOLT for Week 1/2`, etc. | Admin-only - can keep numeric |
| 323 | `placeholder="e.g., Week 1 Introduction"` | Update example |

### 5.3 Exercise Content Editor
**File:** `src/pages/admin/ExerciseContentEditor.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 148-149 | `const weekKey = \`Week ${ex.week_number}\`` | Internal grouping - can keep |
| 241-242 | Sorting logic with "Week" | Internal - can keep |

---

## Category 6: Onboarding & BOLT Instructions

### 6.1 BOLT Instructions Step
**File:** `src/components/onboarding/steps/BOLTInstructionsStep.tsx`

| Line | Current Text | Change |
|------|-------------|--------|
| 53 | `Week 1 (baseline), midpoint (Week 12), and end of program (Week 24)` | "Module 1 (baseline), Module 6 (midpoint), Module 12 (end)" |

---

## Category 7: Internal Logic (Keep as-is for Data Integrity)

These use `weekNumber` as internal identifiers and should NOT change:
- Database column names (`week_number`, `week_id`)
- URL routes (`/week/:weekNumber`)
- Props named `weekNumber` 
- LocalStorage keys (`week_draft_${progressId}`)

---

## Implementation Approach

### Phase 1: Create Utility Function
Create a helper function `getPartLabel(weekNumber: number)` that returns:
- Odd week numbers → "Part One"
- Even week numbers → "Part Two"

### Phase 2: Update Patient-Facing UI
Update components in Category 1 first (highest patient visibility)

### Phase 3: Update Email Templates
Update all email subjects and body text

### Phase 4: Update Content JSON
Update all JSON files with new terminology

### Phase 5: Update Therapist/Admin UI
Update remaining components

---

## Files to Modify (Prioritized List)

**High Priority (Patient-Facing):**
1. `src/components/week/WeekCard.tsx`
2. `src/components/week/ClinicianReviewBanner.tsx`
3. `src/components/week/WeekHeader.tsx`
4. `src/lib/moduleUtils.ts`
5. `src/lib/emailTemplates.ts`
6. `supabase/functions/send-reminders/index.ts`
7. `supabase/functions/send-onboarding-email/index.ts`
8. `public/weeks-1-2-updated.json`
9. `public/weeks-3-4-updated.json`
10. `public/weeks-5-6-updated.json`
11. `src/components/onboarding/steps/BOLTInstructionsStep.tsx`

**Medium Priority (Therapist/Admin):**
12. `src/components/therapist/ReviewPanel.tsx`
13. `src/pages/TherapistDashboard.tsx`
14. `src/lib/reviewActions.ts`
15. `src/components/therapist/TherapistFeedbackDialog.tsx`
16. `src/components/therapist/MaintenanceAssignmentDialog.tsx`
17. `src/components/maintenance/MaintenanceDashboard.tsx`
18. `supabase/functions/export-master-patients/index.ts`

**Lower Priority (Admin-only):**
19. `src/pages/admin/WeekSettingsEditor.tsx`
20. `src/components/layout/AdminSidebar.tsx`

