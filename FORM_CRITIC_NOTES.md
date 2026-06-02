# Form Critic - Friction & Ideas

**Purpose:** Capture friction points, UX issues, and improvement ideas. Not fixes yet — just observations and ideas for future optimization.

---

## Quick Notes Section
_Add friction observations and improvement ideas as they come up_

### Current Areas

#### Recording & Video Capture
- [x] **FIXED:** Exercise identification accuracy improved
  - **Solution:** Added exercise selection BEFORE recording (manual + auto-detect)
  - **Flow:** Select exercise mode → Record → Confirm exercise → Analyze
  - **Why it matters:** User specifies exercise upfront, Lambda has context from the start
  - **Status:** ✅ LIVE - Commit 88037df
  - **Implementation:**
    - Record screen now shows "Auto-Detect" vs "Specify Exercise" toggle
    - If manual: User types exercise name before filming
    - Exercise-select screen pre-fills and shows "Confirm & Analyze"
    - If auto-detect: Exercise-select shows toggle (unchanged)

- [x] **FIXED:** User didn't know what they were analyzing before recording
  - **Solution:** Exercise selection moved to BEFORE recording
  - **Why it matters:** Clear intent, reduces confusion, improves accuracy
  - **Status:** ✅ LIVE - Same commit as above

- [ ] **TODO:** No way to switch between front/back camera
  - **Idea:** Add camera flip button (top-right corner of viewfinder)
  - **Effort:** 30 minutes
  - **Why it matters:** Users need both views (front for posture, back for form tracking)

- [ ] **TODO:** No delayed start timer before recording begins
  - **Idea:** Add 15-30 second countdown option before recording starts
  - **Effort:** 1.5 hours
  - **Why it matters:** Users need time to get into position after hitting record

- [ ] **TODO:** Record button doesn't show time feedback
  - **Idea:** Record button shows countdown during delay, then displays elapsed time while recording
  - **Effort:** 1 hour
  - **Why it matters:** Users know exactly when recording starts and how long they've been recording
  - **Total for all 3 features:** ~5 hours

#### Analysis & Results Display
- [x] **FIXED:** Exercise auto-detection unreliable (esp. from side/back angles)
  - **Solution:** User can now specify exercise name OR auto-detect
  - **Workflow:** Record → Select exercise (manual/auto) → Gemini analyzes with context
  - **Status:** ✅ LIVE - Full prompt context passed to Lambda

#### Exercise Database Integration
- [ ] Issue: 
- [ ] Idea:
- [ ] Why it matters:

#### Performance & Loading
- [ ] Issue: 
- [ ] Idea:
- [ ] Why it matters:

#### UI/UX Flow
- [ ] Issue: 
- [ ] Idea:
- [ ] Why it matters:

#### Mobile Experience
- [ ] Issue: 
- [ ] Idea:
- [ ] Why it matters:

---

## Feature Ideas
_New features or capabilities that could add value_

- Multi-angle recording (front + side for complete form analysis)
- Video playback with slow-motion (0.5x - 1.5x speed)
- Form comparison (before/after recordings)
- Exercise progression tracking over time
- Share results with coaches/trainers

---

## User Feedback Patterns
_Things users might struggle with or ask for_

- Camera angle confusion (which direction to record from)
- Video quality issues (motion blur, poor lighting)
- Long processing time expectations
- Want immediate feedback during recording

---

## Technical Debt
_Known workarounds or limitations to address later_

- Lambda timeout increased to 90 seconds (was 60) - supports longer videos
- Exercise input is text-based (could integrate ExerciseDB dropdown for accuracy)
- No offline recording support yet
- Video compression could reduce upload size/time

---

**Last Updated:** 2026-06-02 21:30 GMT+1  
**Status:** Exercise identification FIXED, recording improvements ready for implementation

## Recent Fixes

### Exercise Selection Moved to BEFORE Recording (COMPLETE - 2026-06-02)
- **Issue:** User didn't know what they were analyzing before recording
- **Previous Flow:** Record → Select Exercise → Analyze → Results
- **New Flow:** Select Exercise → Record → Confirm → Analyze → Results
- **Solution:** 
  1. Record screen now shows toggle: "Auto-Detect" vs "Specify Exercise"
  2. If manual: User types exercise name BEFORE filming
  3. Camera screen receives exercise info as parameter
  4. Exercise-select screen pre-fills exercise (confirmation only)
- **Implementation:**
  - Updated `src/app/(tabs)/record/index.tsx` - added exercise mode selection UI
  - Updated `src/app/(tabs)/record/camera.tsx` - passes exercise params to next screen
  - Updated `src/app/gym/exercise-select.tsx` - pre-fills exercise, shows "Confirm & Analyze"
- **Benefits:**
  - Clear intent before recording
  - Reduces confusion
  - Better user mental model
  - Exercise context available from the start
- **Status:** ✅ LIVE (Commit 88037df)
- **Testing:** Ready to record with new flow

### Exercise Identification Accuracy (SUPPORTING FIX)
- **Related to above:** Manual exercise specification fixes lat pulldown misidentification
- **Gemini now has exercise context** from user input before analysis
- **Both modes work:**
  - Manual: User specifies → Gemini analyzes with context
  - Auto-Detect: Gemini detects from video (original behavior)
- **Status:** ✅ LIVE
