# Clinical Content Changes Summary

**Prepared for:** Sam (Myofunctional Therapist)  
**Date:** January 13, 2026  
**Status:** All changes implemented and verified

---

## Overview

This document summarizes all clinical content and workflow changes implemented in the Montrose Myo platform based on Sam's recommendations and the clinical audit findings.

---

## 1. Learn Hub Access Control

### Changes Made
- Updated `public/content/learn/index.json` to control article visibility
- Restricted the following articles to **authenticated patients only**:
  - `therapy-kit` - Therapy Kit information
  - `compensations` - Compensations guide
  - `frenectomy-pathway` - Frenectomy Pathway details
  - `program-specifics` - Program Specifics

### Rationale
These articles contain program-specific clinical content that should only be accessible to enrolled patients, not public visitors.

---

## 2. Stock Image Removal

### Changes Made
Removed stock/placeholder images from the following Learn Hub articles:
- `intro-to-myofunctional-therapy.md`
- `four-goals.md`
- `health-effects.md`
- `sleep-apnea.md`
- `structural-changes.md`
- `children-signs.md`
- `causes-in-infancy.md`

### Rationale
Stock images detract from the clinical credibility of educational content. Articles now rely on text content and any clinically-relevant images that were specifically created for the program.

---

## 3. Exercise Deletions

### Self Study Exercises — DELETED
All exercises with titles starting with "Self Study" have been removed from the database.

**Affected Weeks:** Multiple weeks throughout the 24-week program

### Meal Practice Exercises — DELETED
All "Meal Practice" exercises have been removed from the database.

**Affected Weeks:** Multiple weeks throughout the program

### Rationale
These exercise types were determined to be unnecessary for the clinical workflow and created confusion in the patient experience.

---

## 4. Terminology Updates

### "Charts" → "Check-ins"
Updated terminology throughout the application:
- Dashboard labels
- Navigation elements
- User-facing descriptions

### "Weekly" → "Biweekly/Daily"
Updated 12+ instances across the application to correctly reflect the program cadence:

| File | Original | Updated |
|------|----------|---------|
| `Home.tsx` (hero) | "weekly exercises" | "daily exercises" |
| `Home.tsx` (FAQ) | "weekly submissions" | "biweekly submissions" |
| `Hero.tsx` | "weekly exercises" | "daily exercises, biweekly video reviews" |
| `FAQ.tsx` | "Your weekly view" | "Your biweekly view" |
| `HowItWorks.tsx` | "Weekly Exercise Plans" | "Biweekly Exercise Plans" |
| `About.tsx` | "Weekly plans" | "Biweekly plans" |
| `WelcomeStep.tsx` | "weekly check-ins" | "biweekly check-ins" |
| `WeekProgressForm.tsx` | "Weekly Progress" | "Biweekly Progress" |
| `MaintenanceDashboard.tsx` | "weekly check-ins" | "regular check-ins" |
| `MaintenanceCheckinCard.tsx` | "Weekly Maintenance Check-in" | "Maintenance Check-in" |
| `maintenanceActions.ts` | "weekly check-ins" | "regular check-ins" |

### Rationale
The program uses a **biweekly submission cadence** (every two weeks) with **daily exercises**. The previous "weekly" terminology was confusing and clinically inaccurate.

---

## 5. BOLT Test Placement

### Changes Made
- **Removed** BOLT exercises from Weeks 1, 12, 13, and 17
- **Retained** only the Week 24 "BOLT Test (Final Check In)"

### Current BOLT Configuration
| Week | BOLT Exercise | Status |
|------|--------------|--------|
| 1-23 | None | ✓ Correct |
| 24 | BOLT Test (Final Check In) | ✓ Retained |

### Rationale
Sam's clinical intent is for the BOLT test to serve as a **final assessment** at program completion, not as an ongoing metric throughout the program.

---

## 6. Mouth Taping Instructions

### Changes Made
Updated Weeks 9 and 10 to include the **exact verbatim** overnight mouth taping instructions used in Weeks 11-24.

### Instructions Added to Weeks 9-10
```
Overnight Mouth Taping Instructions

Purpose: Encourage nasal breathing during sleep by gently keeping the lips together.

Steps:
1. Before bed, ensure your lips and the skin around your mouth are clean and dry.
2. Using the provided surgical tape (or a product like 3M Micropore), apply a small strip horizontally across your lips.
3. The tape should be comfortable—not too tight. You should still be able to open your mouth slightly if needed.
4. In the morning, gently remove the tape and note how you feel.

Tips:
• Start with a small piece if you're nervous. You can work up to fuller coverage.
• If you wake up and the tape is off, that's okay—it means your body needed to breathe through your mouth. Keep trying nightly.
• Never tape if you have nasal congestion or difficulty breathing through your nose.

Consistency is key. Most patients adapt within a few nights and notice improved sleep quality.
```

### Rationale
This ensures consistent patient experience and instruction quality across Weeks 9-24 for overnight mouth taping.

---

## 7. Frenectomy Pathway Content

### Verified Present
- **Weeks 7-8** contain pre-operative preparation content for frenectomy patients
- `PreOpPreparationCard.tsx` component renders correctly for frenectomy pathway patients
- Post-operative protocol content available in `PostOpProtocolCard.tsx`

### No Changes Required
The frenectomy pathway content was already correctly implemented.

---

## Verification Checklist

| Item | Status | Notes |
|------|--------|-------|
| Learn Hub access control | ✅ Complete | 4 articles restricted to patients |
| Stock images removed | ✅ Complete | 7 articles cleaned |
| Self Study exercises deleted | ✅ Complete | 0 remaining in database |
| Meal Practice exercises deleted | ✅ Complete | 0 remaining in database |
| Charts → Check-ins | ✅ Complete | All instances updated |
| Weekly → Biweekly/Daily | ✅ Complete | 12 instances updated |
| BOLT only in Week 24 | ✅ Complete | Only final check-in remains |
| Weeks 9/10 Mouth Tape | ✅ Complete | Verbatim overnight instructions |
| Frenectomy pre-op content | ✅ Verified | Already present |

---

## Database Queries for Verification

### Verify No Self Study Exercises
```sql
SELECT title, week_id FROM exercises 
WHERE title ILIKE '%self study%';
-- Expected: 0 rows
```

### Verify No Meal Practice Exercises
```sql
SELECT title, week_id FROM exercises 
WHERE title ILIKE '%meal practice%';
-- Expected: 0 rows
```

### Verify BOLT Exercises
```sql
SELECT e.title, w.number as week_number 
FROM exercises e 
JOIN weeks w ON e.week_id = w.id 
WHERE e.title ILIKE '%bolt%';
-- Expected: 1 row (Week 24 only)
```

### Verify Mouth Taping in Weeks 9-10
```sql
SELECT e.title, e.instructions, w.number 
FROM exercises e 
JOIN weeks w ON e.week_id = w.id 
WHERE e.title ILIKE '%mouth tap%' 
AND w.number IN (9, 10);
-- Expected: Shows overnight instructions
```

---

## Sign-Off

- [ ] Sam (Myofunctional Therapist) - Clinical content accuracy
- [ ] Development Team - Technical implementation
- [ ] QA Team - Verification complete

---

*Document generated: January 13, 2026*
