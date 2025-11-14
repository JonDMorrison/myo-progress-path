# Audit Findings - User Feedback Implementation

**Date**: 2025-11-14
**Status**: Investigation Complete

## Issues Identified

| Issue | Location | Current Value | Fix Path |
|-------|----------|---------------|----------|
| Check-in frequency says weekly | Multiple week JSON files, UI text | "weekly check-ins" | Update to "biweekly check-ins" in content and config |
| BOLT test frequency says weekly | Week content, instructions | "weekly BOLT test" | Change to "BOLT at beginning, middle, and end" |
| Video upload guide missing neck framing | `src/components/week/VideoUpload.tsx` | No framing guidance | Add instructional text above upload |
| First/last attempt videos not universal | Week schema varies | Inconsistent `requires_video_first/last` | Standardize all weeks to require both |
| "Your personal journey" phrase | Onboarding steps, marketing copy | Present in multiple locations | Remove all instances |
| Learning Hub broken links | `src/lib/learn.ts`, content files | Some incorrect anchors | Validate and fix all links |
| Structural changes missing photos | `public/content/learn/structural-changes.md` | No images | Already fixed - placeholders removed |
| Blood sugar regulation claim | Health effects content | Mentioned as benefit | Remove claim |
| Eczema association claim | Health effects content | Linked to OMD | Remove association |
| Timeline for results | Various content | Promises specific timelines | Remove all timeline promises |
| Pacifier age incorrect | Infancy causes content | "2-3 years" | Update to "beyond 6 months" |
| Nasal clearing step 3 optional | Compensations content | Marked as optional | Make required |
| Upload area not visible | Week detail pages | Upload UI may be hidden | Ensure visibility on all week pages |

## Files Requiring Updates

### Content Files
- `public/content/learn/health-effects.md` - Remove health claims
- `public/content/learn/causes-in-infancy.md` - Fix pacifier age
- `public/content/learn/compensations.md` - Fix nasal exercise step
- All week JSON files - Update frequency language

### Code Files
- `src/components/week/VideoUpload.tsx` - Add framing guide
- `src/components/week/WeekCard.tsx` - Update frequency display
- `src/components/onboarding/steps/*.tsx` - Remove "your personal journey"
- `src/lib/learn.ts` - Fix broken links
- `src/lib/constants.ts` - Add frequency constants

## Priority
1. High: Remove health claims (compliance)
2. High: Fix video upload visibility and requirements
3. Medium: Update frequency language
4. Medium: Fix broken links
5. Low: Copy refinements

## Notes
- No schema changes required
- All fixes maintain existing RLS policies
- Mobile-responsive designs preserved
- Brand colors/fonts unchanged
