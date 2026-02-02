

# Video Submission Configuration Plan

## Objective

Configure video uploads so that:
1. **Part One** of each module requires NO video submission
2. **Part Two** of each module requires ONE video submission (Module Completion Video)
3. **Post-Op Recovery phases** (Frenectomy pathway only) require TWO video submissions

---

## Database Updates

### Frenectomy Program

| Module/Phase | Part | Week Number | First Video | Last Video |
|--------------|------|-------------|-------------|------------|
| Module 1 | Part One | 1 | No | No |
| Module 1 | Part Two | 2 | No | Yes |
| Module 2 | Part One | 3 | No | No |
| Module 2 | Part Two | 4 | No | Yes |
| Module 3 | Part One | 5 | No | No |
| Module 3 | Part Two | 6 | No | Yes |
| Module 4 | Part One | 7 | No | No |
| Module 4 | Part Two | 8 | No | Yes |
| Post-Op Days 1-7 | Recovery | 9 | Yes | Yes |
| Post-Op Days 8-14 | Recovery | 10 | Yes | Yes |
| Module 5 | Part One | 11 | No | No |
| Module 5 | Part Two | 12 | No | Yes |
| ... continues through Module 12 Part Two (24) | | | | |

### Non-Frenectomy Program

| Module | Part | Week Number | First Video | Last Video |
|--------|------|-------------|-------------|------------|
| Module 1 | Part One | 1 | No | No |
| Module 1 | Part Two | 2 | No | Yes |
| ... all Part One (odd numbers) | | | No | No |
| ... all Part Two (even numbers) | | | No | Yes |

---

## UI Changes

### WeekDetail.tsx Video Section Logic

**Current behavior:** Shows both "First Attempt" and "Final Result" cards when either flag is true

**New behavior:**
- **Part Two (single video):** Show one card labeled "Module Completion Video"
- **Post-Op Recovery (two videos):** Show both "First Attempt" and "Final Result" cards
- **Part One (no video):** Hide the video upload section entirely

### WeekCompletionChecklist.tsx Updates

Current checklist shows:
- First Video ✓
- Final Video ✓

New checklist for Part Two:
- Module Video ✓

For Post-Op Recovery:
- First Video ✓
- Final Video ✓

---

## Files to Modify

1. **Database migration** - Set `requires_video_first` and `requires_video_last` flags correctly
2. **`src/pages/WeekDetail.tsx`** - Update video section rendering logic
3. **`src/components/week/WeekCompletionChecklist.tsx`** - Update checklist labels

---

## Technical Implementation

### SQL Migration

```sql
-- Reset all to no video requirements first
UPDATE weeks SET requires_video_first = FALSE, requires_video_last = FALSE;

-- Frenectomy Program: Part Two modules (even numbers except 9-10)
UPDATE weeks w
SET requires_video_last = TRUE
FROM programs p
WHERE w.program_id = p.id
  AND p.title = 'Frenectomy Program'
  AND w.number IN (2, 4, 6, 8, 12, 14, 16, 18, 20, 22, 24);

-- Frenectomy Program: Post-Op Recovery phases (both videos required)
UPDATE weeks w
SET requires_video_first = TRUE, requires_video_last = TRUE
FROM programs p
WHERE w.program_id = p.id
  AND p.title = 'Frenectomy Program'
  AND w.number IN (9, 10);

-- Non-Frenectomy Program: Part Two modules (all even numbers)
UPDATE weeks w
SET requires_video_last = TRUE
FROM programs p
WHERE w.program_id = p.id
  AND p.title = 'Non-Frenectomy Program'
  AND w.number IN (2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24);
```

### WeekDetail.tsx Logic Update

```typescript
// Determine video upload display mode
const showBothVideos = week.requires_video_first && week.requires_video_last;
const showSingleVideo = !week.requires_video_first && week.requires_video_last;
const showNoVideo = !week.requires_video_first && !week.requires_video_last;

// Render accordingly:
// - showBothVideos: Two cards (First Attempt + Final Result)
// - showSingleVideo: One card (Module Completion Video)
// - showNoVideo: No video section
```

---

## Summary

| Scenario | Videos Required | UI Display |
|----------|-----------------|------------|
| Part One (all modules) | 0 | No video section |
| Part Two (all modules) | 1 | Single "Module Completion Video" card |
| Post-Op Recovery (Frenectomy only) | 2 | Both "First Attempt" and "Final Result" cards |

