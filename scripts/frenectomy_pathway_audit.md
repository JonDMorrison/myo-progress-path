# Frenectomy Pathway Audit Report

## Executive Summary
The Frenectomy Pathway has a significant content gap after Week 10, with exercises dropping from 5-7 per week to just 1-2 per week. This creates an inconsistent patient experience and potential dead-end states.

## Findings

### Week-by-Week Exercise Count
| Week | Exercise Count | Status |
|------|----------------|--------|
| 1-2  | 5 each | ✅ Well-defined with frequency, duration, targets |
| 3-4  | 5 each | ✅ Well-defined with frequency, duration, targets |
| 5-6  | 5 each | ✅ Well-defined with frequency, duration, targets |
| 7-8  | 7 each | ✅ Well-defined with frequency, duration, targets |
| 9-10 | 3-5 each | ✅ Post-frenectomy recovery content |
| 11   | 1 | ⚠️ DRAMATIC DROP - No frequency/duration |
| 12   | 2 | ⚠️ Placeholder content |
| 13-24| 1-2 each | ⚠️ Minimal placeholder exercises |

### Issues Identified

1. **Content Gap (Weeks 11-24)**
   - Exercises lack `frequency`, `duration`, and `completion_target` metadata
   - Only 1-2 generic exercises per week vs. 5-7 in earlier weeks
   - Instructions are brief and lack clinical detail

2. **Missing Maintenance Phase**
   - Week 24 ends abruptly with "Final Video"
   - No structured maintenance guidance beyond the completion modal
   - Patients have no therapist-directed continuation option

3. **Dead-End State Risk**
   - After Week 24 approval, program shows as "complete"
   - No way for therapists to assign additional practice
   - Patients cannot revisit or continue exercises

## Recommended Solutions

### Phase 1: Enhance Weeks 11-24 Content
- Add 3-5 exercises per week with proper metadata
- Include maintenance-focused exercises:
  - Posture Checks (ongoing habit monitoring)
  - BOLT Score Tracking (breathing capacity)
  - Elastic Holds (tongue strength maintenance)
  - Nasal Breathing Walks (daily activity integration)
  - Correct Swallow Practice (functional integration)

### Phase 2: Add Therapist-Directed Continuation
- Allow therapists to "extend" a patient's program beyond Week 24
- Create optional "Maintenance Weeks" that can be assigned
- Enable reassignment of any previous week for re-practice

### Phase 3: Prevent Dead-End States
- Add "Maintenance Mode" status for completed patients
- Weekly check-in prompts (not exercises)
- Therapist can re-activate specific exercises as needed

## Database Changes Required

1. Update exercises for Weeks 11-24 with proper metadata
2. Add `maintenance_mode` flag to patients table
3. Create maintenance_weeks table for optional continuation

## Next Steps
1. Create detailed exercise content for Weeks 11-24
2. Implement maintenance mode feature
3. Add therapist controls for program extension
