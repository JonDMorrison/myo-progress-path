
# Remove AI-Generated Messages - Implementation Plan

## Summary

Found **56 messages** in the database with "[AI-generated]" prefix that need to be deleted. These were created by a previous version of the system that auto-generated feedback. Per the clinic's policy, all feedback must come directly from therapists.

---

## What Will Be Done

### 1. Database Cleanup

Delete all messages containing the "[AI-generated]" prefix from the `messages` table:

```sql
DELETE FROM messages 
WHERE body ILIKE '%[AI-generated]%';
```

This will remove 56 AI-generated messages across 9 patients.

### 2. Disable AI Functions That Could Generate Such Messages

The following edge functions currently use AI to generate patient-facing content and should be disabled or deleted:

| Function | Purpose | Action |
|----------|---------|--------|
| `generate-progress-note` | AI drafts therapist notes | Delete - violates therapist-only feedback policy |
| `nudge-patients` | AI generates reminder notifications | Delete - AI should not send messages to patients |
| `therapist-ai-query` | AI answers therapist questions | Keep - internal tool, not patient-facing |

### 3. Remove AI Draft Button from UI

In `ReviewPanel.tsx`, there's a "Draft with AI" button that calls `generate-progress-note`. This will be removed since therapists must write their own feedback.

---

## Files to Modify

1. **Database**: Delete 56 AI-generated messages
2. **Delete**: `supabase/functions/generate-progress-note/index.ts`
3. **Delete**: `supabase/functions/nudge-patients/index.ts`
4. **Edit**: `src/components/therapist/ReviewPanel.tsx` - Remove AI draft functionality

---

## Code Changes

### ReviewPanel.tsx Changes

Remove:
- `handleDraftWithAI` function
- "Draft with AI" button
- `drafting` state variable
- Related imports

### Edge Functions to Delete

```
supabase/functions/generate-progress-note/
supabase/functions/nudge-patients/
```

---

## Summary Table

| Item | Count/Action |
|------|--------------|
| Messages to delete | 56 |
| Patients affected | 9 |
| Edge functions to delete | 2 |
| UI components to update | 1 |

This ensures no AI-generated content can appear in patient communications, aligning with the therapist-feedback-policy memory constraint.
