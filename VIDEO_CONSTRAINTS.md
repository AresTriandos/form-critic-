# Form Critic - Video Constraints & Limits

**Date:** 2026-06-02  
**Status:** CONFIRMED with Nick

---

## Recommended Video Length

**Optimal range:** 30-90 seconds per recording

### Why This Works

| Duration | Lambda Timeout | Cost | Use Case | Status |
|----------|----------------|------|----------|--------|
| 30 sec | ✅ Safe | ~$0.01 | Single rep | **IDEAL** |
| 60 sec | ✅ Safe | ~$0.03 | Full set | **GOOD** |
| 90 sec | ✅ Safe | ~$0.05 | Extended set | **ACCEPTABLE** |
| 2-3 min | ⚠️ Risk | ~$0.10 | Full workout | **RISKY** |
| 5+ min | ❌ Fails | ~$0.25 | Multiple sets | **WON'T WORK** |

### Constraints

1. **Lambda timeout:** 60 seconds hard limit
   - Video upload: ~5-10 sec
   - Gemini processing: ~20-40 sec
   - Response: ~5 sec
   - **Safe margin:** Stop at 90 sec max

2. **Cost:** Gemini charges per input token
   - Video token rate: ~0.25 tokens/frame @ 25fps
   - Negligible for short videos (<$0.05)
   - Compounds quickly for longer videos

3. **User experience:** 30-90 seconds is one exercise/set
   - Matches typical gym workflow
   - Can quickly review and adjust
   - No waiting for long uploads

---

## Implementation Notes

### Recording Limits
- **Max record length:** 90 seconds
- **Recommend stopping at:** 60 seconds
- **Show warning at:** 75 seconds
- **Auto-stop at:** 90 seconds (hard stop)

### UI Feedback
- Show elapsed time clearly (already planned)
- Warn at 75 sec: "Getting close to limit"
- Stop at 90 sec: "Maximum video length reached"

### User Guidance
In help/tips section:
- ✅ Record one exercise at a time
- ✅ Record one set per video
- ✅ Keep under 90 seconds
- ❌ Don't record full workouts in one video

---

## Future Options (if user wants longer)

If Nick needs full workout analysis:
- **Option 1:** Record multiple 60-sec clips, analyze each separately
- **Option 2:** Increase Lambda timeout to 120+ seconds (costs more, slower)
- **Option 3:** Async processing (upload video, get results via notification later)

For now: 30-90 seconds is the constraint.

---

**Confirmed:** Yes, Nick typically needs single exercise/set analysis (matches 30-90 sec range)
