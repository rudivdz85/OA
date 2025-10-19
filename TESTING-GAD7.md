# GAD-7 Assessment Testing Guide

Complete testing guide for the GAD-7 anxiety assessment feature.

## Pre-Testing Setup

### 1. Verify Database Setup

```bash
# Check if GAD-7 exists in database
npx tsx scripts/test-gad7-setup.ts
```

If GAD-7 is not found, you need to seed it. Check if you have a seed script or create the GAD-7 data manually.

### 2. Start Development Server

```bash
npm run dev
```

### 3. Create Test Account

- Go to http://localhost:3000/auth/register
- Create a test account (e.g., test@example.com)
- Or sign in with Google OAuth

---

## Testing Scenarios

### Test 1: AI Detection and Offer

**Goal:** Verify AI detects anxiety and offers GAD-7

**Steps:**
1. Start a new conversation
2. Send a message mentioning anxiety symptoms:
   ```
   "I've been feeling really anxious lately. I can't stop worrying about everything,
   and it's been going on for weeks. I feel restless and on edge all the time."
   ```
3. Wait for AI response

**Expected Result:**
- ✅ AI acknowledges your concerns empathetically
- ✅ AI mentions the GAD-7 assessment
- ✅ A purple **AssessmentOffer** component appears below the message
- ✅ Component shows:
  - "Take the GAD-7 (Generalized Anxiety Disorder)" heading
  - Brief description
  - "2-3 minutes" duration
  - "Clinically validated" badge
  - "Start Assessment" and "Maybe Later" buttons

**Screenshot locations to check:**
- Chat message area
- Assessment offer card appearance

---

### Test 2: Start Assessment

**Goal:** Verify assessment quiz loads correctly

**Steps:**
1. Click **"Start Assessment"** button from Test 1
2. Wait for quiz to load

**Expected Result:**
- ✅ AssessmentOffer component disappears
- ✅ **AssessmentQuiz** component appears
- ✅ Shows assessment name: "GAD-7 (Generalized Anxiety Disorder-7)"
- ✅ Shows instructions
- ✅ Progress bar shows 0/7
- ✅ All 7 questions are displayed
- ✅ Each question has 4 radio button options:
  - "Not at all" (0 points)
  - "Several days" (1 point)
  - "More than half the days" (2 points)
  - "Nearly every day" (3 points)
- ✅ Submit button is disabled (grayed out)
- ✅ "Please answer all questions to submit" message visible

**What to check:**
- Questions are readable and properly formatted
- Radio buttons work correctly
- Can only select one option per question
- Visual feedback when selecting (purple border/background)

---

### Test 3: Answer Progress

**Goal:** Verify progress tracking works

**Steps:**
1. Answer questions one by one
2. Watch the progress bar

**Expected Result:**
- ✅ Progress bar updates after each answer (1/7, 2/7, etc.)
- ✅ Percentage increases (14%, 28%, 42%, etc.)
- ✅ Selected answers stay selected
- ✅ Can change answers before submitting
- ✅ Submit button remains disabled until all 7 answered
- ✅ When all answered, submit button becomes active (not grayed)
- ✅ Warning message disappears

---

### Test 4: Cancel Assessment

**Goal:** Verify cancel functionality

**Steps:**
1. Start assessment (repeat Test 2)
2. Answer a few questions (don't finish)
3. Click **"Cancel"** button

**Expected Result:**
- ✅ AssessmentQuiz component disappears
- ✅ Chat returns to normal state
- ✅ Can still send messages
- ✅ AssessmentOffer is still visible (can restart)

---

### Test 5: Complete Assessment - Minimal Anxiety

**Goal:** Test low score scenario (0-4 points)

**Steps:**
1. Start fresh assessment
2. Answer all questions with **"Not at all"** or mostly low scores
3. Click **"Submit Assessment"**
4. Wait for results

**Expected Result:**
- ✅ Submit button shows "Submitting..." with spinner
- ✅ Quiz disappears
- ✅ **AssessmentResult** component appears showing:
  - Score: 0-4 / 21
  - Green progress bar
  - Severity: **"Minimal"** in green
  - Interpretation from database
  - Recommendation text
  - Completion date/time
  - Disclaimer at bottom
- ✅ AI receives score and responds with supportive feedback
- ✅ AI message appears acknowledging the minimal anxiety level

**Check API calls:**
- Open browser DevTools → Network tab
- Should see: PATCH /api/assessments/[id] → Status 200

---

### Test 6: Complete Assessment - Mild Anxiety

**Goal:** Test mild score scenario (5-9 points)

**Steps:**
1. Start new conversation
2. Trigger assessment offer again
3. Answer with mix of "Several days" and "Not at all" (total 5-9 points)
4. Submit

**Expected Result:**
- ✅ Score: 5-9 / 21
- ✅ Yellow progress bar
- ✅ Severity: **"Mild"** in yellow/amber
- ✅ Appropriate interpretation for mild anxiety
- ✅ AI provides supportive feedback

---

### Test 7: Complete Assessment - Moderate Anxiety

**Goal:** Test moderate score scenario (10-14 points)

**Steps:**
1. New conversation → trigger assessment
2. Answer with mix of "More than half the days" and "Several days" (10-14 points)
3. Submit

**Expected Result:**
- ✅ Score: 10-14 / 21
- ✅ Orange progress bar
- ✅ Severity: **"Moderate"** in orange
- ✅ More serious interpretation and recommendations
- ✅ AI provides empathetic, supportive feedback

---

### Test 8: Complete Assessment - Severe Anxiety

**Goal:** Test high score scenario (15-21 points)

**Steps:**
1. New conversation → trigger assessment
2. Answer mostly "Nearly every day" (15+ points)
3. Submit

**Expected Result:**
- ✅ Score: 15-21 / 21
- ✅ Red progress bar
- ✅ Severity: **"Severe"** in red
- ✅ Serious interpretation
- ✅ Strong recommendation to seek professional help
- ✅ AI provides compassionate, supportive response
- ✅ AI may provide crisis resources (988 hotline)

---

### Test 9: Multiple Assessments

**Goal:** Verify user can take multiple assessments

**Steps:**
1. Complete one assessment (any score)
2. Continue conversation
3. Mention anxiety symptoms again later
4. AI should offer assessment again
5. Take second assessment

**Expected Result:**
- ✅ Can take multiple GAD-7 assessments
- ✅ Both stored in database
- ✅ Results don't interfere with each other

---

### Test 10: Assessment Persistence

**Goal:** Verify assessments are saved

**Steps:**
1. Complete an assessment
2. Refresh the page
3. Scroll to where assessment was taken

**Expected Result:**
- ✅ Chat history loads correctly
- ✅ AssessmentResult still visible
- ✅ Shows same score and severity
- ✅ Can see previous AI feedback

---

### Test 11: Decline Assessment

**Goal:** Test "Maybe Later" functionality

**Steps:**
1. Trigger assessment offer
2. Click **"Maybe Later"** button

**Expected Result:**
- ✅ AssessmentOffer disappears
- ✅ Chat continues normally
- ✅ Can still have conversation with AI

---

### Test 12: API Endpoint Testing

**Goal:** Test API routes directly

**Using Browser DevTools or Postman:**

```bash
# Get assessment types
GET /api/assessments/types
# Should return array with GAD7

# Get GAD7 specifically
GET /api/assessments/types/GAD7
# Should return full GAD7 object with questions

# Get user's assessments
GET /api/assessments
# Should return array of completed assessments

# Get specific assessment
GET /api/assessments/[assessment-id]
# Should return assessment with type info
```

---

### Test 13: Error Handling

**Goal:** Test error scenarios

**Scenarios to test:**

1. **Network error during submission:**
   - Open DevTools → Network → Set to "Offline"
   - Try to submit assessment
   - ✅ Should show error message
   - ✅ Quiz should remain (answers not lost)

2. **Incomplete submission:**
   - Modify frontend to allow submission with missing answers
   - ✅ Backend should reject with validation error

3. **Unauthorized access:**
   - Sign out
   - Try to access `/api/assessments` directly
   - ✅ Should return 401 Unauthorized

---

### Test 14: Mobile Responsiveness

**Goal:** Verify mobile experience

**Steps:**
1. Open DevTools → Toggle device toolbar
2. Select mobile device (iPhone, Android)
3. Go through full assessment flow

**Expected Result:**
- ✅ Assessment offer fits screen
- ✅ Quiz questions are readable
- ✅ Radio buttons are tap-friendly
- ✅ Progress bar visible
- ✅ Buttons are accessible
- ✅ Results display properly

---

### Test 15: Accessibility

**Goal:** Test keyboard navigation and screen readers

**Steps:**
1. Use Tab key to navigate
2. Use Enter/Space to select options
3. Use screen reader (if available)

**Expected Result:**
- ✅ Can tab through all questions
- ✅ Radio buttons have proper labels
- ✅ Screen reader announces questions and options
- ✅ ARIA labels are present
- ✅ Focus indicators visible

---

## Database Verification

### Check Assessments Table

```sql
-- View all assessments
SELECT id, user_id, score, severity_level, status, completed_at
FROM assessments
ORDER BY created_at DESC;

-- View specific assessment with answers
SELECT id, score, severity_level, answers
FROM assessments
WHERE id = 'your-assessment-id';
```

### Check Assessment-Conversation Link

```sql
-- See which assessments are linked to conversations
SELECT
  a.id,
  a.score,
  a.severity_level,
  c.title as conversation_title
FROM assessments a
LEFT JOIN conversations c ON a.conversation_id = c.id
ORDER BY a.created_at DESC;
```

---

## Common Issues & Solutions

### Issue 1: Assessment Offer Doesn't Appear

**Possible causes:**
- AI didn't detect anxiety keywords
- `[ASSESSMENT_OFFER:GAD7]` marker not in response

**Debug:**
- Check browser console for errors
- Check message metadata: `message.metadata?.assessmentOffer`
- Try more explicit anxiety language: "I have severe anxiety and panic attacks"

**Fix:**
- Verify Gemini prompt includes assessment trigger instructions
- Check `parseAssessmentOffer()` function works

---

### Issue 2: Quiz Won't Submit

**Possible causes:**
- Not all questions answered
- JavaScript error

**Debug:**
- Check browser console
- Verify all radio buttons have selection
- Check network tab for failed request

**Fix:**
- Ensure validation logic works
- Check all questions are rendered

---

### Issue 3: Score Calculation Wrong

**Possible causes:**
- Answer values incorrect
- Scoring logic bug

**Debug:**
- Check answer values sent to backend
- Verify `calculateScore()` function
- Check database answer format

**Fix:**
- Ensure radio button values are numbers (0, 1, 2, 3)
- Verify scoring algorithm

---

### Issue 4: AI Doesn't Respond After Assessment

**Possible causes:**
- Score message not sent
- API error

**Debug:**
- Check network tab for message POST
- Check console for errors
- Verify `sendMessage()` called after completion

**Fix:**
- Ensure `handleCompleteAssessment()` sends score to AI
- Check message format

---

## Success Criteria

All tests should pass with these results:

- ✅ AI detects anxiety and offers GAD-7
- ✅ Quiz loads with all 7 questions
- ✅ Progress tracking works accurately
- ✅ Can complete assessment with any score
- ✅ Score calculated correctly on backend
- ✅ Severity levels match score ranges:
  - 0-4: Minimal (green)
  - 5-9: Mild (yellow)
  - 10-14: Moderate (orange)
  - 15-21: Severe (red)
- ✅ Results display properly
- ✅ AI receives score and provides feedback
- ✅ Assessment saved to database
- ✅ Can take multiple assessments
- ✅ No TypeScript errors
- ✅ Mobile responsive
- ✅ Accessible

---

## Performance Checks

- API response time < 1 second
- Quiz loads instantly
- No memory leaks
- Smooth scrolling
- No layout shifts

---

## Next Steps After Testing

Once all tests pass:

1. **Test with real users** (beta testing)
2. **Monitor error logs** in production
3. **Collect feedback** on UX
4. **Track completion rates**
5. **Consider adding**:
   - PHQ-9 (depression assessment)
   - Assessment history dashboard
   - Progress tracking over time
   - PDF export of results
   - Email notifications

---

## Quick Test Commands

```bash
# Check setup
npx tsx scripts/test-gad7-setup.ts

# Start dev server
npm run dev

# Type check
npm run type-check

# Database queries (if you have drizzle studio)
npm run db:studio
```

---

## Test Checklist

Print this and check off as you test:

- [ ] GAD-7 exists in database
- [ ] AI offers assessment when anxiety mentioned
- [ ] Assessment offer UI appears correctly
- [ ] Quiz loads with 7 questions
- [ ] Progress bar updates correctly
- [ ] Can select answers with radio buttons
- [ ] Submit disabled until all answered
- [ ] Can cancel assessment
- [ ] Submit shows loading state
- [ ] Results display with correct score
- [ ] Severity color matches level
- [ ] AI receives and responds to score
- [ ] Assessment saved to database
- [ ] Can take multiple assessments
- [ ] Works on mobile
- [ ] Keyboard accessible
- [ ] No console errors
- [ ] API endpoints work
- [ ] Error handling works
- [ ] Page refresh preserves results

---

**Happy Testing! 🧪**

If you find any issues, check the console errors first, then review the relevant component or API route.
