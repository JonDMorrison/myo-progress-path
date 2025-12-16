# Clinical Testing Protocol
## MyoCoach Application — Pre-Launch Validation

**For:** Dr. Matt Francisco & Samantha  
**Date:** December 16, 2024  
**Version:** 1.0

---

## Section 1: Purpose

### What We Are Testing

This testing phase validates that the MyoCoach application works correctly for real clinical use. We need to confirm:

- Patients can register, complete onboarding, and progress through weekly exercises
- Therapists can review patient submissions and provide feedback
- The two treatment pathways (Frenectomy vs Non-Frenectomy) display the correct content
- Videos upload and play correctly
- Exercise instructions are clear and clinically accurate

### What Feedback Is Helpful

✅ **Please report:**
- Steps that don't work as expected
- Confusing instructions or unclear language
- Missing information patients would need
- Exercises that appear in the wrong order or wrong week
- Anything that feels clinically incorrect or potentially harmful
- Error messages that appear

❌ **Out of scope for this round:**
- Visual design preferences (colors, fonts, spacing)
- New feature ideas
- Suggestions for future improvements

---

## Section 2: Patient Test Scenario

### Getting Started

**Registration URL:** [Your app URL]/register

You will need the registration passcode to create an account. If you don't have it, please request it from the development team.

### Step 1: Create Your Account

1. Go to the registration page
2. Enter your email address and create a password
3. Enter your name
4. Enter the registration passcode
5. Click "Create Account"

**What good looks like:** You see a welcome screen and begin the onboarding process.

**Flag if:** You see an error message or the page doesn't load.

---

### Step 2: Complete Onboarding

The onboarding has 8 steps. Work through each one:

1. **Welcome** — Introduction to the program
2. **How It Works** — Overview of the weekly structure
3. **Program Overview** — What to expect over 24 weeks
4. **Pathway Selection** — Choose Frenectomy or Non-Frenectomy pathway
5. **Goals** — Select your personal goals
6. **Video Guide** — Instructions for recording progress videos
7. **BOLT Instructions** — How to measure your baseline breathing score
8. **Ready** — Final confirmation

**What good looks like:** 
- Each step is clear and easy to understand
- The pathway selection clearly explains the difference between options
- You can move forward and backward between steps
- After completing all steps, you're taken to Week 0

**Flag if:**
- Any step is confusing or unclear
- You can't proceed to the next step
- Instructions contradict what you know clinically

---

### Step 3: Complete Week 0

Week 0 is an introduction before the main program begins.

1. Watch the introductory video (if present)
2. Complete the short quiz
3. After passing the quiz, you should see a message about unlocking Week 1

**What good looks like:** After completing Week 0, you can access Week 1 from your dashboard.

**Flag if:** Week 1 remains locked after completing Week 0.

---

### Step 4: Complete Week 1

1. From your dashboard, click on Week 1
2. Read the week introduction
3. Review each exercise — there should be 5 exercises:
   - BOLT Test
   - Brushing
   - Tongue Trace
   - Clicks and Tick-Tocks
   - Tongue Tip – One Elastic Hold

4. For each exercise, click "Mark Complete" after reviewing
5. Enter your weekly metrics:
   - BOLT Score (number)
   - Nasal Breathing % (slider)
   - Tongue on Spot % (slider)

**What good looks like:**
- Each exercise has clear instructions
- Videos play correctly (where available)
- You can track your progress
- The completion checklist updates as you complete items

**Flag if:**
- Exercise instructions are missing or unclear
- Videos don't play
- You see exercises that shouldn't be in Week 1
- The "Mark Complete" button doesn't work

---

### Step 5: Upload Progress Videos

Week 1 requires two video uploads:

1. **First Attempt Video** — Record at the beginning of the week
2. **Last Attempt Video** — Record at the end of the week

**To upload:**
1. Click "Choose file" or "Upload" in the video upload section
2. Select a video from your device (MP4 or MOV, under 100MB)
3. Wait for the upload to complete
4. You should see a thumbnail of your video

**What good looks like:**
- Upload completes without errors
- You can see your uploaded video
- The checklist shows videos as complete

**Flag if:**
- Upload fails with an error
- Video doesn't appear after uploading
- The system accepts files that are too large or wrong format without warning

---

### Step 6: Submit Week for Review

Once all requirements are complete:

1. The "Submit for Review" button should become active (not grayed out)
2. Click "Submit for Review"
3. You should see confirmation that your week was submitted
4. Your week status should change to "Submitted"

**What good looks like:**
- The submit button clearly shows what's still missing (if anything)
- After submitting, you see your week is "Awaiting Review"
- You cannot make changes to a submitted week

**Flag if:**
- The submit button stays disabled even when everything is complete
- You don't see what requirements are missing
- You can submit without completing all requirements

---

### Step 7: Check for Therapist Feedback

After a therapist reviews your submission:

1. You may receive a notification
2. Check your dashboard for status updates
3. If approved, Week 2 should unlock
4. If more practice is requested, you'll see feedback about what to improve

**What good looks like:**
- You can clearly see whether your week was approved or needs more work
- Feedback from the therapist is easy to find and understand
- The next week unlocks after approval

**Flag if:**
- You don't know if your submission was reviewed
- Feedback is missing or unclear
- Week 2 doesn't unlock after approval

---

### Frenectomy Pathway Only

If you selected the **Frenectomy pathway**, Week 1 includes an additional task:

> "Contact Vedder Dental to book a frenectomy consultation"

You need to mark this task as complete before submitting Week 1.

**Flag if:** You see this task when you selected the Non-Frenectomy pathway.

---

## Section 3: Therapist Test Scenario

### Getting Started

Log in with your therapist account at [Your app URL]/auth

### Step 1: Access the Therapist Inbox

1. After logging in, you should see the Therapist Dashboard
2. Look for "Inbox" or "Pending Reviews" section
3. Patient submissions awaiting review appear here

**What good looks like:**
- You can see which patients have submitted weeks for review
- Submissions show patient name, week number, and how long they've been waiting
- Color coding helps identify urgency (green = recent, yellow = waiting, red = overdue)

**Flag if:**
- You don't see any patient submissions
- Patient information is missing or incorrect
- The urgency indicators don't make sense

---

### Step 2: Open a Patient Review

1. Click on a patient submission to review
2. A review panel should open showing:
   - Patient's uploaded videos
   - Their self-reported metrics (BOLT, nasal breathing %, tongue on spot %)
   - AI analysis (if available)
   - Exercise completion status

**What good looks like:**
- Videos play automatically or with one click
- Video controls (play, pause, speed) work correctly
- You can see all the information needed to make a clinical decision

**Flag if:**
- Videos don't play
- Patient data is missing
- The review panel is confusing or cluttered

---

### Step 3: Review the Videos

1. Watch the patient's First Attempt and Last Attempt videos
2. Use video speed controls if needed (0.5x, 1x, 1.5x, 2x)
3. Note any compensations or technique issues

**What good looks like:**
- Video quality is sufficient to assess technique
- You can easily compare first and last attempts
- Playback is smooth without buffering issues

**Flag if:**
- Videos are too small to see clearly
- Videos stop/start or buffer frequently
- You can't tell which video is First vs Last attempt

---

### Step 4: Make a Decision

Choose one of three actions:

**Option A: Approve**
- Click "Approve" if the patient's technique is acceptable
- This unlocks the next week for the patient

**Option B: Approve with Note**
- Click "Approve + Note" to approve AND send feedback
- Select from quick templates or write a custom note
- Patient receives your feedback

**Option C: Request More Practice**
- Click "Needs More Practice" if technique needs improvement
- Write specific feedback about what to improve
- Patient's week returns to "needs more" status

**What good looks like:**
- The three options are clearly labeled
- You can easily send notes without extra steps
- The system confirms your action was saved

**Flag if:**
- You're unsure which button does what
- Sending a note requires too many clicks
- You can't tell if your action was successful

---

### Step 5: Verify Patient Received Feedback

If you sent a note:

1. The patient should see your feedback in their dashboard
2. They should receive a notification

**What good looks like:**
- Your exact message appears for the patient
- The message shows it came from the therapist

**Flag if:**
- Your message doesn't appear for the patient
- The message is formatted incorrectly
- No notification was sent

---

### Step 6: Check Next Week Unlocked (After Approval)

After approving a patient:

1. Log in as that patient (or ask them to check)
2. Verify the next week is now accessible
3. The dashboard should show updated progress

**Flag if:** The next week remains locked after approval.

---

## Section 4: What to Report

### Please Document These Issues

**🐛 Bugs (Something Broken)**
- Buttons that don't work
- Pages that don't load
- Error messages that appear
- Features that behave unexpectedly

**😕 Confusion (Unclear Experience)**
- Instructions that don't make sense
- Steps where you weren't sure what to do
- Terminology that patients wouldn't understand
- Missing guidance at critical moments

**📝 Missing Content**
- Exercises without instructions
- Videos that should exist but don't
- Information patients need but can't find

**⚠️ Clinical Concerns**
- Exercises in the wrong week
- Instructions that could lead to incorrect technique
- Compensations presented as exercises to practice
- Anything that could mislead or harm a patient

### How to Report

For each issue, please note:
1. **Where:** What page/section were you on?
2. **What:** What did you expect vs what happened?
3. **Steps:** What did you do right before the issue?
4. **Severity:** Blocking (can't continue) or Minor (annoying but workable)?

You can report issues via:
- Email to the development team
- Shared document/spreadsheet
- Voice memo describing the issue

---

## Section 5: What NOT to Test Yet

**Please set aside these types of feedback for later:**

❌ **New Feature Ideas**
> "It would be nice if the app could also..."

❌ **Workflow Redesigns**
> "I think the whole process should be reorganized to..."

❌ **Cosmetic Preferences**
> "I don't like the color of this button"
> "The font should be different"

❌ **Content That Doesn't Exist Yet**
> "Week 15 should have..."

**Why?** We need to first confirm the current build works correctly before adding new features or making design changes. Your feedback on these items is valuable — just save it for after we confirm the core functionality is solid.

---

## Quick Reference Checklist

### Patient Testing ✓
- [ ] Account created successfully
- [ ] Completed all 8 onboarding steps
- [ ] Pathway selection worked correctly
- [ ] Completed Week 0 and unlocked Week 1
- [ ] All 5 Week 1 exercises are present and clear
- [ ] Videos uploaded successfully
- [ ] Week submitted for review
- [ ] Received therapist feedback
- [ ] Week 2 unlocked after approval

### Therapist Testing ✓
- [ ] Logged in to therapist dashboard
- [ ] Patient submission visible in inbox
- [ ] Review panel opened correctly
- [ ] Videos played without issues
- [ ] Successfully approved a week
- [ ] Successfully sent feedback note
- [ ] Patient received the feedback
- [ ] Next week unlocked for patient

---

## Contact

If you encounter a blocking issue that prevents testing:

**Development Team Contact:** [Add contact info]

---

*Thank you for your time testing MyoCoach. Your clinical expertise is essential to ensuring this tool is safe and effective for patients.*
