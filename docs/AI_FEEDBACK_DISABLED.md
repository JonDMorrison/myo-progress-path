# AI Feedback Disabled - Developer Notes

**Date**: January 29, 2025

## Summary

All AI-generated and automatic feedback has been **disabled** per clinical requirements. Only therapist-written feedback is now sent to patients.

## Changes Made

### 1. Client-Side Triggers Removed
- **`src/lib/storage.ts`**: Removed `supabase.functions.invoke('analyze-video')` calls from both `uploadVideo` and `uploadVideoForExercise` functions

### 2. UI Components Updated
- **`src/pages/ReviewWeek.tsx`**: 
  - Removed AI feedback display
  - Removed retry analysis button
  - Removed AI summary indicator
  
- **`src/components/therapist/ReviewPanel.tsx`**:
  - Removed AI review summary component
  - Removed AI error retry functionality
  
- **`src/components/therapist/ReviewCard.tsx`**:
  - Removed AI status indicators (pending, error, issues)

### 3. Triage Logic Updated
- **`src/lib/triageUtils.ts`**: Removed AI-based triage conditions. Triage now based only on:
  - Waiting time (hours since submission)
  - Consecutive needs_more status

### 4. Edge Function Disabled
- **`supabase/functions/analyze-video/index.ts`**: Function now returns a "disabled" message instead of performing analysis

## Preserved Functionality

✅ **Manual therapist feedback** is fully preserved:
- Therapists can still send text feedback via `TherapistFeedbackDialog`
- Therapists can still send video/photo feedback
- All feedback in `therapist_feedback` table remains functional
- Patient notification system for therapist messages works as before

## Database Notes

The following fields remain in the `uploads` table but are no longer populated:
- `ai_feedback` (jsonb)
- `ai_feedback_status` (enum: pending, complete, error)

These columns are kept for backward compatibility with any existing data.

## Reverting This Change

To re-enable AI feedback:
1. Restore the original `analyze-video/index.ts` function
2. Uncomment the `supabase.functions.invoke` calls in `storage.ts`
3. Restore the `AIReviewSummary` import in `ReviewPanel.tsx`
4. Restore AI status displays in UI components
5. Restore AI-based triage conditions in `triageUtils.ts`

Git history contains the original implementations.
