# Manual Testing Guide

Comprehensive manual testing checklist for OllieAI to ensure all features work correctly before deployment.

---

## Table of Contents

1. [Testing Prerequisites](#testing-prerequisites)
2. [Authentication Testing](#authentication-testing)
3. [Conversation Testing](#conversation-testing)
4. [Assessment Testing](#assessment-testing)
5. [Dashboard Testing](#dashboard-testing)
6. [Streaming & Real-time Features](#streaming--real-time-features)
7. [Milestone Achievements](#milestone-achievements)
8. [Edge Cases & Error Handling](#edge-cases--error-handling)
9. [Mobile Responsiveness](#mobile-responsiveness)
10. [Browser Compatibility](#browser-compatibility)
11. [Performance Testing](#performance-testing)
12. [Accessibility Testing](#accessibility-testing)

---

## Testing Prerequisites

### Setup

- [ ] Application running locally (`npm run dev`)
- [ ] Database seeded with assessment types and questions
- [ ] All environment variables configured
- [ ] Test accounts ready (or ability to create new ones)
- [ ] Multiple browsers available for testing
- [ ] Mobile device or browser dev tools for mobile testing

### Test Data Preparation

Create test accounts with different states:
- **New User**: No conversations or assessments
- **Active User**: 2-3 conversations, 1-2 completed assessments
- **Power User**: Many conversations, 5+ assessments

---

## Authentication Testing

### User Registration (Email/Password)

**Test Case 1: Successful Registration**
- [ ] Navigate to `/auth/signup`
- [ ] Enter valid name, email, and password
- [ ] Click "Sign Up"
- [ ] **Expected**: Redirect to `/dashboard`
- [ ] **Expected**: Welcome message with user's name

**Test Case 2: Duplicate Email**
- [ ] Try to register with existing email
- [ ] **Expected**: Error message "User with this email already exists"
- [ ] **Expected**: Stay on signup page

**Test Case 3: Validation Errors**
- [ ] Submit form with empty fields
- [ ] **Expected**: Validation messages shown
- [ ] Submit with invalid email format
- [ ] **Expected**: Email validation error

**Test Case 4: Password Requirements**
- [ ] Try password that's too short
- [ ] **Expected**: Password requirement message (if implemented)

---

### User Sign In (Email/Password)

**Test Case 1: Successful Sign In**
- [ ] Navigate to `/auth/signin`
- [ ] Enter correct email and password
- [ ] Click "Sign In"
- [ ] **Expected**: Redirect to `/dashboard`
- [ ] **Expected**: User session established

**Test Case 2: Incorrect Password**
- [ ] Enter correct email but wrong password
- [ ] **Expected**: Error message "Invalid credentials"
- [ ] **Expected**: Stay on signin page

**Test Case 3: Non-existent User**
- [ ] Enter email that doesn't exist
- [ ] **Expected**: Error message "Invalid credentials" (don't reveal user doesn't exist)

---

### Google OAuth

**Test Case 1: Successful Google Sign In**
- [ ] Click "Continue with Google" on signin page
- [ ] **Expected**: Redirect to Google OAuth consent screen
- [ ] Select Google account
- [ ] **Expected**: Redirect back to `/dashboard`
- [ ] **Expected**: User session established

**Test Case 2: New User via Google**
- [ ] Sign in with Google account not previously registered
- [ ] **Expected**: User account automatically created
- [ ] **Expected**: Redirect to `/dashboard`
- [ ] **Expected**: Welcome message shown

**Test Case 3: Existing User via Google**
- [ ] Sign in with previously registered Google account
- [ ] **Expected**: Existing account accessed
- [ ] **Expected**: Previous data (conversations, assessments) intact

---

### Session Persistence

**Test Case 1: Refresh Page**
- [ ] Sign in successfully
- [ ] Refresh the page
- [ ] **Expected**: User remains signed in
- [ ] **Expected**: No redirect to signin page

**Test Case 2: New Tab**
- [ ] Sign in successfully
- [ ] Open new tab to same app
- [ ] **Expected**: User already signed in
- [ ] **Expected**: Can access protected pages

**Test Case 3: Session Expiry**
- [ ] Sign in and note the time
- [ ] Wait 30 days (or modify session maxAge for testing)
- [ ] Try to access protected page
- [ ] **Expected**: Redirect to signin (session expired)

---

### Sign Out

**Test Case 1: Sign Out**
- [ ] Click "Sign Out" button
- [ ] **Expected**: Redirect to homepage or signin
- [ ] **Expected**: Cannot access `/dashboard` without re-authenticating
- [ ] Try to access protected API endpoint
- [ ] **Expected**: 401 Unauthorized

---

## Conversation Testing

### Create Conversation

**Test Case 1: Create from Dashboard**
- [ ] Click "Start a Conversation" on dashboard
- [ ] **Expected**: New conversation created
- [ ] **Expected**: Redirect to `/dashboard/chat/[conversationId]`
- [ ] **Expected**: Empty conversation with welcome message

**Test Case 2: Multiple Conversations**
- [ ] Create 3-4 conversations
- [ ] **Expected**: All appear in conversation list on dashboard
- [ ] **Expected**: Each has unique ID
- [ ] Click on each conversation
- [ ] **Expected**: Correct conversation loads

---

### Send Messages

**Test Case 1: Send Text Message**
- [ ] In a conversation, type "Hello!"
- [ ] Press Enter or click Send
- [ ] **Expected**: Message appears immediately (optimistic update)
- [ ] **Expected**: AI response streams in
- [ ] **Expected**: Message saved to database

**Test Case 2: Long Message**
- [ ] Send a message with 500+ characters
- [ ] **Expected**: Message accepts long input
- [ ] **Expected**: Textarea auto-expands
- [ ] **Expected**: AI responds appropriately

**Test Case 3: Empty Message**
- [ ] Try to send empty message (just whitespace)
- [ ] **Expected**: Send button disabled or message rejected

**Test Case 4: Special Characters**
- [ ] Send message with emojis: "I'm feeling 😊"
- [ ] Send message with symbols: "I'm 100% sure!"
- [ ] **Expected**: All characters rendered correctly

---

### Message Display

**Test Case 1: User Messages**
- [ ] User messages appear on the right
- [ ] **Expected**: Purple background
- [ ] **Expected**: White text
- [ ] **Expected**: Timestamp visible

**Test Case 2: AI Messages**
- [ ] AI messages appear on the left
- [ ] **Expected**: White background
- [ ] **Expected**: Dark text
- [ ] **Expected**: AI avatar/icon visible

**Test Case 3: Markdown Rendering**
- [ ] AI responds with bold text (`**bold**`)
- [ ] **Expected**: Text renders as **bold**, not asterisks
- [ ] AI responds with lists
- [ ] **Expected**: Proper bullet points or numbering
- [ ] AI responds with code (`inline code`)
- [ ] **Expected**: Monospace font, highlighted background

---

### Conversation Management

**Test Case 1: Conversation Title**
- [ ] Start new conversation
- [ ] Send first message
- [ ] **Expected**: Title auto-generated after first message
- [ ] Refresh page
- [ ] **Expected**: Title persists

**Test Case 2: Navigate Between Conversations**
- [ ] Create 2+ conversations
- [ ] Send messages in Conversation A
- [ ] Navigate to Conversation B
- [ ] **Expected**: Conversation B messages loaded
- [ ] Navigate back to Conversation A
- [ ] **Expected**: Previous messages still there

---

## Assessment Testing

### Start Assessment

**Test Case 1: AI Offers Assessment**
- [ ] In conversation, mention "anxiety" or "stress"
- [ ] **Expected**: AI response includes assessment offer
- [ ] **Expected**: "Start GAD-7" button appears

**Test Case 2: Start from Dashboard**
- [ ] On dashboard, click "Take an Assessment"
- [ ] Select "GAD-7"
- [ ] **Expected**: New conversation created
- [ ] **Expected**: Assessment offer appears in chat

**Test Case 3: Click Start Assessment**
- [ ] Click "Start GAD-7" button
- [ ] **Expected**: Assessment UI appears
- [ ] **Expected**: First question visible
- [ ] **Expected**: Progress bar shows "Question 1 of 7"

---

### Complete Assessment

**Test Case 1: Answer All Questions**
- [ ] Start GAD-7 assessment
- [ ] Answer question 1 (select any option)
- [ ] **Expected**: Move to question 2
- [ ] **Expected**: Progress bar updates
- [ ] Continue through all 7 questions
- [ ] **Expected**: Each answer is recorded
- [ ] Answer final question
- [ ] **Expected**: Automatic submission

**Test Case 2: Assessment Results**
- [ ] Complete assessment
- [ ] **Expected**: Results displayed immediately
- [ ] **Expected**: Score shown (e.g., "8 out of 21")
- [ ] **Expected**: Severity level shown (e.g., "mild")
- [ ] **Expected**: Interpretation text provided
- [ ] **Expected**: Recommendation provided

**Test Case 3: Different Score Ranges**

Test all severity levels:
- **Minimal (0-4)**: Answer all "Not at all" (0)
  - [ ] **Expected**: "minimal" severity
- **Mild (5-9)**: Answer mix to get 7
  - [ ] **Expected**: "mild" severity
- **Moderate (10-14)**: Answer mostly "More than half the days" (2)
  - [ ] **Expected**: "moderate" severity
- **Severe (15-21)**: Answer all "Nearly every day" (3)
  - [ ] **Expected**: "severe" severity

---

### Assessment Cancel

**Test Case 1: Cancel Mid-Assessment**
- [ ] Start GAD-7 assessment
- [ ] Answer 2-3 questions
- [ ] Click "Cancel" button
- [ ] **Expected**: Assessment UI closes
- [ ] **Expected**: Partial answers not saved (or saved as incomplete)
- [ ] **Expected**: Can restart assessment later

---

### Assessment History

**Test Case 1: View History on Dashboard**
- [ ] Complete 2-3 assessments
- [ ] Go to dashboard
- [ ] **Expected**: "Recent Assessments" section shows completions
- [ ] **Expected**: Each assessment shows: score, date, severity

**Test Case 2: View Assessment Details**
- [ ] Click on a completed assessment in history
- [ ] **Expected**: Navigate to assessment detail page
- [ ] **Expected**: Shows all answers and scoring

---

## Dashboard Testing

### Statistics Display

**Test Case 1: No Assessments**
- [ ] New user with no assessments
- [ ] **Expected**: No stats section shown
- [ ] **Expected**: Helpful message: "Take your first assessment..."

**Test Case 2: One Assessment**
- [ ] Complete first assessment
- [ ] Visit dashboard
- [ ] **Expected**: Stats section appears
- [ ] **Expected**: Shows total assessments: 1
- [ ] **Expected**: Shows latest score
- [ ] **Expected**: No trend (need 2+ for trend)

**Test Case 3: Multiple Assessments**
- [ ] Complete 3+ assessments with varying scores
- [ ] **Expected**: Trend indicator (improving/stable/worsening)
- [ ] **Expected**: Improvement percentage calculated
- [ ] **Expected**: Stats update in real-time

---

### Progress Chart

**Test Case 1: Chart Rendering**
- [ ] Complete 2+ assessments
- [ ] View dashboard
- [ ] **Expected**: Line chart visible
- [ ] **Expected**: X-axis shows dates
- [ ] **Expected**: Y-axis shows scores (0-21 for GAD-7)
- [ ] **Expected**: Data points for each assessment

**Test Case 2: Chart Interactivity**
- [ ] Hover over data points
- [ ] **Expected**: Tooltip shows date and score
- [ ] Resize browser window
- [ ] **Expected**: Chart resizes responsively

**Test Case 3: Multiple Assessment Types**
- [ ] Complete both GAD-7 and PHQ-9 (if available)
- [ ] **Expected**: Different colored lines for each type
- [ ] **Expected**: Legend showing which line is which

---

### Dashboard Refresh

**Test Case 1: Data Updates After Assessment**
- [ ] Note dashboard stats
- [ ] Complete new assessment
- [ ] Navigate back to dashboard
- [ ] **Expected**: Stats updated immediately (no hard refresh needed)
- [ ] **Expected**: Chart includes new data point
- [ ] **Expected**: Latest assessment in "Recent" section

---

## Streaming & Real-time Features

### Text Streaming

**Test Case 1: Streaming Response**
- [ ] Send a message
- [ ] **Expected**: AI response appears word-by-word (streaming)
- [ ] **Expected**: Blinking cursor at end of streaming text
- [ ] **Expected**: Smooth, non-choppy animation
- [ ] **Expected**: Cursor disappears when streaming complete

**Test Case 2: Long Response**
- [ ] Ask AI for a detailed explanation
- [ ] **Expected**: Response streams smoothly
- [ ] **Expected**: Markdown renders as text streams in
- [ ] **Expected**: No visual glitches or jumps

**Test Case 3: Multiple Rapid Messages**
- [ ] Send message A
- [ ] Immediately send message B (before A finishes)
- [ ] **Expected**: Message A completes first
- [ ] **Expected**: Message B starts streaming after A
- [ ] **Expected**: No conflicts or lost messages

---

### Sticky Input Field

**Test Case 1: Input Always Visible**
- [ ] Open conversation with many messages (20+)
- [ ] Scroll to top of conversation
- [ ] **Expected**: Input field stays at bottom of screen
- [ ] **Expected**: Don't need to scroll down to type
- [ ] Type a message
- [ ] **Expected**: Can type while viewing old messages

**Test Case 2: Mobile Keyboard**
- [ ] On mobile device, tap input field
- [ ] **Expected**: Keyboard appears
- [ ] **Expected**: Input field stays visible above keyboard
- [ ] **Expected**: Can see what you're typing

---

## Milestone Achievements

### First Assessment

**Test Case 1: First Assessment Completion**
- [ ] New user with no previous assessments
- [ ] Complete GAD-7 assessment
- [ ] Submit final answer
- [ ] **Expected**: "🎉 First Assessment Complete!" milestone appears
- [ ] **Expected**: Celebration message
- [ ] **Expected**: NO confetti (first assessment)
- [ ] **Expected**: Milestone auto-dismisses after ~8 seconds

---

### Score Improvement

**Test Case 1: Significant Improvement (5+ points)**
- [ ] Complete assessment with score 15
- [ ] Complete another assessment with score 8
- [ ] **Expected**: "🌟 Amazing Progress!" milestone appears
- [ ] **Expected**: Shows score improvement (15 → 8, -7 points)
- [ ] **Expected**: Confetti animation
- [ ] **Expected**: Purple and gold confetti colors

**Test Case 2: Small Improvement (<5 points)**
- [ ] Complete assessment with score 10
- [ ] Complete another with score 8
- [ ] **Expected**: NO milestone (improvement too small)

**Test Case 3: Score Worsening**
- [ ] Complete assessment with score 5
- [ ] Complete another with score 12
- [ ] **Expected**: NO milestone (score got worse)

---

### Category Improvement

**Test Case 1: Severity Level Change**
- [ ] Complete assessment with "moderate" severity (score 12)
- [ ] Complete assessment with "mild" severity (score 7)
- [ ] **Expected**: "🎊 You Leveled Up!" milestone appears
- [ ] **Expected**: Shows category change (moderate → mild)
- [ ] **Expected**: Confetti animation

---

## Edge Cases & Error Handling

### Network Errors

**Test Case 1: Lost Connection During Message**
- [ ] Disable network (browser dev tools: Offline)
- [ ] Try to send a message
- [ ] **Expected**: Error message displayed
- [ ] **Expected**: Message not lost (option to retry)

**Test Case 2: Lost Connection During Assessment**
- [ ] Start assessment
- [ ] Answer a few questions
- [ ] Disable network
- [ ] Try to answer next question
- [ ] **Expected**: Error handling (save progress or show error)

---

### Invalid Data

**Test Case 1: Invalid Conversation ID**
- [ ] Navigate to `/dashboard/chat/invalid-id-123`
- [ ] **Expected**: Error message or redirect
- [ ] **Expected**: Not a blank screen or crash

**Test Case 2: Assessment Without Questions**
- [ ] If database has assessment type without questions
- [ ] Try to start that assessment
- [ ] **Expected**: Graceful error handling

---

### Concurrent Users

**Test Case 1: Same Account, Multiple Tabs**
- [ ] Sign in on Tab A
- [ ] Open Tab B (same browser)
- [ ] Send message on Tab A
- [ ] Switch to Tab B and refresh
- [ ] **Expected**: Message appears on Tab B

---

## Mobile Responsiveness

### Layouts

**Test Case 1: Dashboard on Mobile**
- [ ] View dashboard on mobile (< 640px width)
- [ ] **Expected**: Single column layout
- [ ] **Expected**: Cards stack vertically
- [ ] **Expected**: Charts resize to fit
- [ ] **Expected**: No horizontal scroll

**Test Case 2: Chat on Mobile**
- [ ] View conversation on mobile
- [ ] **Expected**: Messages full width
- [ ] **Expected**: Input field full width
- [ ] **Expected**: Send button accessible
- [ ] **Expected**: Messages don't overflow

**Test Case 3: Assessment on Mobile**
- [ ] Start assessment on mobile
- [ ] **Expected**: Questions readable
- [ ] **Expected**: Answer options tap-friendly (large targets)
- [ ] **Expected**: Progress bar visible
- [ ] **Expected**: Navigation buttons accessible

---

### Touch Interactions

**Test Case 1: Button Taps**
- [ ] Tap all primary buttons
- [ ] **Expected**: Buttons respond to touch
- [ ] **Expected**: No double-tap zoom on buttons

**Test Case 2: Form Inputs**
- [ ] Tap into text input
- [ ] **Expected**: Keyboard appears
- [ ] **Expected**: Input field in view (not hidden by keyboard)
- [ ] **Expected**: Can type and submit

**Test Case 3: Scrolling**
- [ ] Scroll through long conversation
- [ ] **Expected**: Smooth scrolling
- [ ] **Expected**: Input stays sticky at bottom

---

## Browser Compatibility

Test in multiple browsers:

### Chrome/Edge
- [ ] All features work
- [ ] Streaming works smoothly
- [ ] No console errors

### Firefox
- [ ] Authentication works
- [ ] Streaming works
- [ ] Markdown renders correctly

### Safari (macOS/iOS)
- [ ] OAuth works
- [ ] Streaming works
- [ ] Confetti animation works

### Mobile Browsers
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Samsung Internet (if available)

---

## Performance Testing

### Page Load Times

**Test Case 1: Dashboard Load**
- [ ] Clear cache
- [ ] Navigate to `/dashboard`
- [ ] **Expected**: Loads in < 3 seconds
- [ ] **Expected**: No layout shifts

**Test Case 2: Chat Load**
- [ ] Open conversation with 50+ messages
- [ ] **Expected**: Loads in < 3 seconds
- [ ] **Expected**: Smooth scroll to bottom

---

### Lighthouse Audit

**Test Case 1: Run Lighthouse**
- [ ] Open Chrome DevTools
- [ ] Go to Lighthouse tab
- [ ] Run audit (Mobile)
- [ ] **Target Scores**:
  - Performance: 80+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 90+

---

## Accessibility Testing

### Keyboard Navigation

**Test Case 1: Tab Navigation**
- [ ] Use Tab key to navigate site
- [ ] **Expected**: Focus visible on all interactive elements
- [ ] **Expected**: Logical tab order
- [ ] **Expected**: Can activate buttons with Enter/Space

**Test Case 2: Assessment with Keyboard**
- [ ] Start assessment
- [ ] Use Tab and Enter to select options
- [ ] **Expected**: Can complete entire assessment without mouse

---

### Screen Reader

**Test Case 1: ARIA Labels**
- [ ] Use screen reader (NVDA, JAWS, VoiceOver)
- [ ] Navigate through dashboard
- [ ] **Expected**: All elements have proper labels
- [ ] **Expected**: Buttons describe their action
- [ ] **Expected**: Form inputs have labels

---

## Testing Checklist Summary

### Pre-Deployment

- [ ] All authentication methods work
- [ ] Conversations create and load correctly
- [ ] Messages send and receive
- [ ] Streaming works smoothly
- [ ] Assessments complete successfully
- [ ] All severity levels work
- [ ] Milestones trigger appropriately
- [ ] Dashboard updates in real-time
- [ ] Charts render correctly
- [ ] Mobile responsive
- [ ] Works in all major browsers
- [ ] No console errors
- [ ] Lighthouse scores meet targets
- [ ] Accessibility basics covered

---

**Once all tests pass, you're ready to deploy!** 🚀
