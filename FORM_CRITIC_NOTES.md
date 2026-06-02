# Form Critic - Friction & Ideas

**Purpose:** Capture friction points, UX issues, and improvement ideas. Not fixes yet — just observations and ideas for future optimization.

---

## Quick Notes Section
_Add friction observations and improvement ideas as they come up_

### Current Areas

#### Recording & Video Capture
- [x] **FIXED:** Exercise identification accuracy improved
  - **Solution:** Added exercise name input screen (manual + auto-detect toggle)
  - **Why it matters:** User can specify the exercise, Gemini analyzes form more accurately
  - **Status:** ✅ LIVE - New screen at `/app/gym/exercise-select.tsx`

- [ ] **TODO:** No way to switch between front/back camera
  - **Idea:** Add camera flip button (top-right corner of viewfinder)
  - **Why it matters:** Users need both views (front for posture, back for form tracking)

- [ ] **TODO:** No delayed start timer before recording begins
  - **Idea:** Add 15-30 second countdown option before recording starts
  - **Why it matters:** Users need time to get into position after hitting record

- [ ] **TODO:** Record button doesn't show time feedback
  - **Idea:** Record button shows countdown during delay, then displays elapsed time while recording
  - **Why it matters:** Users know exactly when recording starts and how long they've been recording

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

### Exercise Identification (COMPLETE)
- **Issue:** Lat pulldowns, rows, and other side-angle exercises were misidentified
- **Root Cause:** Free-form video analysis without exercise context
- **Solution:** Added exercise input screen with two modes:
  1. **Manual Mode:** User enters exercise name → Gemini analyzes with context
  2. **Auto-Detect Mode:** Gemini detects exercise from video (original behavior)
- **Implementation:**
  - New component: `src/app/gym/exercise-select.tsx`
  - Updated service: `src/services/analysis.ts`
  - Updated AWS handler: `src/utils/aws.ts` to pass exerciseName to Lambda
  - Lambda already supported exerciseName context
- **Flow:** Record → Exercise Select (with toggle) → Analysis → Results
- **Status:** ✅ Ready to test, pending camera angle testing to confirm manual input improves accuracy
