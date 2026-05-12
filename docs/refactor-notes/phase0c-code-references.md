# Phase 0c — Code references to Part 1 / Part 2

## Counts by file
- `public/weeks-1-2-updated.json`: 3 references
- `public/weeks-3-4-updated.json`: 3 references
- `public/weeks-5-6-updated.json`: 4 references
- `src/components/maintenance/MaintenanceDashboard.tsx`: 1 references
- `src/components/therapist/MaintenanceAssignmentDialog.tsx`: 3 references
- `src/components/therapist/ReviewPanel.tsx`: 1 references
- `src/components/therapist/TherapistFeedbackDialog.tsx`: 2 references
- `src/components/week/ClinicianReviewBanner.tsx`: 1 references
- `src/components/week/SubmitBar.tsx`: 1 references
- `src/lib/emailTemplates.ts`: 1 references
- `src/lib/moduleUtils.ts`: 1 references
- `src/lib/reviewActions.ts`: 3 references
- `src/pages/PatientOverview.tsx`: 7 references
- `src/pages/ReviewWeek.tsx`: 2 references
- `src/pages/WeekDetail.tsx`: 10 references
- `supabase/functions/export-master-patients/index.ts`: 1 references
- `supabase/functions/send-reminders/index.ts`: 1 references
- `supabase/migrations/20251021185227_02068ef3-5ba5-4b11-8b67-fa48cc99adbb.sql`: 2 references

## Full reference list
```
src/components/week/SubmitBar.tsx:46:                : "Complete all exercises in Part Two, then record your biometrics (BOLT score, nasal breathing %, tongue on spot %) to submit this module for review."
src/components/week/ClinicianReviewBanner.tsx:12:  const partLabel = weekNumber === moduleInfo.weekRange[0] ? 'Part One' : 'Part Two';
src/pages/PatientOverview.tsx:89:    const evenWeek = moduleNum * 2; // Part Two week
src/pages/PatientOverview.tsx:90:    const oddWeek = evenWeek - 1; // Part One week
src/pages/PatientOverview.tsx:91:    // Use even week (Part Two) progress as the module status since submission happens there
src/pages/PatientOverview.tsx:93:    const partOneProg = progressByWeek[oddWeek];
src/pages/PatientOverview.tsx:94:    const partTwoProg = progressByWeek[evenWeek];
src/pages/PatientOverview.tsx:99:    } else if (partOneProg) {
src/pages/PatientOverview.tsx:100:      status = "open"; // Part One started but no Part Two yet
src/components/therapist/MaintenanceAssignmentDialog.tsx:81:          title: w.title || `Module ${Math.ceil(w.number / 2)} ${w.number % 2 !== 0 ? 'Part One' : 'Part Two'}`,
src/components/therapist/MaintenanceAssignmentDialog.tsx:120:      const partLabel = selectedWeek ? (selectedWeek.number % 2 !== 0 ? 'Part One' : 'Part Two') : '';
src/components/therapist/MaintenanceAssignmentDialog.tsx:178:                    Module {Math.ceil(week.number / 2)} {week.number % 2 !== 0 ? 'Part One' : 'Part Two'}: {week.title}
src/lib/emailTemplates.ts:6:  const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
src/lib/moduleUtils.ts:294:  // Removes pattern like "Module 1 - Weeks 1-2: ", "Module 1 - Week 1: ", "Part One: ", "Part Two: "
src/components/therapist/TherapistFeedbackDialog.tsx:223:          const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
src/components/therapist/TherapistFeedbackDialog.tsx:269:      ? `for Module ${Math.ceil(weekNumber / 2)} ${weekNumber % 2 !== 0 ? 'Part One' : 'Part Two'}` 
src/components/therapist/ReviewPanel.tsx:146:      // Patients may upload to Part One, Part Two, or both — we don't want
src/pages/ReviewWeek.tsx:110:      // Get uploads from both weeks of the module (Part One + Part Two)
src/pages/ReviewWeek.tsx:454:                      const partLabel = msgWeekNum ? (msgWeekNum % 2 !== 0 ? "Part One" : "Part Two") : null;
src/components/maintenance/MaintenanceDashboard.tsx:67:          const partLabel = a.weeks.number % 2 !== 0 ? 'Part One' : 'Part Two';
src/pages/WeekDetail.tsx:81:          title: "Part One Complete!",
src/pages/WeekDetail.tsx:82:          description: "You've finished Part One. Complete Part Two to submit this module.",
src/pages/WeekDetail.tsx:739:                {/* Part Two orientation banner — shown when patient first arrives at the second week of a module */}
src/pages/WeekDetail.tsx:749:                        <p className="text-sm font-semibold text-blue-800">You've reached Part Two of Module {moduleNum}</p>
src/pages/WeekDetail.tsx:813:                    stale Part One vitals on Part Two. */}
src/pages/WeekDetail.tsx:874:                          {canSubmitState ? "Part One Complete! 🌟" : "Module Progress"}
src/pages/WeekDetail.tsx:878:                            ? "You've finished everything for Part One. Now let's head to Part Two to complete the module."
src/pages/WeekDetail.tsx:890:                            Start Part Two →
src/pages/WeekDetail.tsx:893:                            Complete Part Two exercises to submit this module for your therapist's review
src/pages/WeekDetail.tsx:898:                          Submission available at the end of Part Two
src/lib/reviewActions.ts:50:    const partLabel = currentWeekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
src/lib/reviewActions.ts:209:    const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
src/lib/reviewActions.ts:275:    const partLabel = weekNumber % 2 !== 0 ? 'Part One' : 'Part Two';
supabase/functions/export-master-patients/index.ts:98:        ? `Module ${Math.ceil(weekNum / 2)} ${weekNum % 2 !== 0 ? 'Part One' : 'Part Two'}`
public/weeks-3-4-updated.json:5:      "title": "Module 2 - Part One",
public/weeks-3-4-updated.json:77:      "title": "Module 2 - Part Two",
public/weeks-3-4-updated.json:78:      "introduction": "Continue practicing the same exercises from Part One to build consistency and strength.",
supabase/functions/send-reminders/index.ts:59:      const partLabel = week.number % 2 !== 0 ? 'Part One' : 'Part Two';
public/weeks-1-2-updated.json:5:      "title": "Foundation Building - Module 1 (Part One)",
public/weeks-1-2-updated.json:86:      "title": "Foundation Building - Module 1 (Part Two)",
public/weeks-1-2-updated.json:87:      "introduction": "This is the continuation of your foundation building phase. You'll continue practicing the same exercises from Part One, building consistency and refining your technique. By now, you should be getting more comfortable with the movements and noticing improvements in your form.\n\nContinue to focus on avoiding compensations and maintaining proper nasal breathing throughout all exercises. Your cumulative practice over these two weeks is building the foundation for more advanced exercises ahead.",
public/weeks-5-6-updated.json:5:      "title": "Module 3 Part One - Pre-Frenectomy Preparation",
public/weeks-5-6-updated.json:78:      "title": "Module 3 Part Two - Pre-Frenectomy Preparation",
public/weeks-5-6-updated.json:79:      "introduction": "**Important Note:** Continue your Pre-Frenectomy Exercises and Stretches. Your frenectomy should be scheduled for soon.\n\nThis part continues the same exercise protocol as Part One, allowing you to refine your technique and build greater strength and endurance before your procedure.",
public/weeks-5-6-updated.json:80:      "overview": "Repeat and master the Part One exercises with increased precision and control. Focus on eliminating all compensatory patterns.",
supabase/migrations/20251021185227_02068ef3-5ba5-4b11-8b67-fa48cc99adbb.sql:7:  title = 'Foundation Building - Weeks 1-2 (Part 1)',
supabase/migrations/20251021185227_02068ef3-5ba5-4b11-8b67-fa48cc99adbb.sql:22:  title = 'Foundation Building - Weeks 1-2 (Part 2)',
