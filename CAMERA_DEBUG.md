# FormCritic Camera Recording - Debug & Alternatives

## Current Issue
`expo-camera` `recordAsync()` is failing with "Camera is not ready" or similar errors on iOS TestFlight builds.

## Root Cause Analysis

### What We've Tried
1. ✅ Simple recording with `recordAsync()`
2. ✅ Added 2-second initialization timeout
3. ✅ Added `onCameraReady` callback
4. ✅ Improved error handling and logging
5. ❌ **Still failing at recordAsync stage**

### Why It's Failing
**Hypothesis:** The `recordAsync()` method on `expo-camera` v56 may:
1. Not be implemented correctly on iOS in TestFlight builds (vs simulator)
2. Require additional configuration (FFmpeg, codecs, permissions)
3. Have a bug in how it interfaces with the native layer
4. Need explicit video codec/quality settings

## Debug Steps

### 1. Test with Camera Test Component
We created `camera-test.tsx` for minimal reproduction:
```bash
# Open this in the app to see detailed console output
# It logs every step and error detail
```

### 2. Check Console Logs
- Device logs in Xcode
- TestFlight device logs
- Console output from the test component

### 3. Verify the exact error message
This will tell us:
- Is `recordAsync` not a function?
- Is the camera object malformed?
- Is it a permissions issue?
- Is it a native linking problem?

## Alternative Solutions

### Option A: Use `react-native-vision-camera` (RECOMMENDED)
**Pros:**
- Industry standard, widely used
- Excellent documentation
- Works great with Expo via `expo-dev-client`
- Can record videos reliably
- Frame extraction for AI analysis (useful for FormCritic)
- Better error messages

**Cons:**
- Requires `expo-dev-client` (not in managed Expo)
- Slightly larger bundle

**Implementation:** 1-2 hours

### Option B: Use built-in `expo-camera` with different API pattern
**Approach:**
- Don't use `recordAsync()`
- Use `takePictureAsync()` to capture frames instead
- Combine frames into video on backend (or skip video, just analyze photos)

**Pros:**
- Stays in managed Expo
- Photo capture is more stable

**Cons:**
- Loss of continuous video
- Backend processing complexity
- Lower quality form analysis (single frames vs video)

### Option C: Switch to `react-native-camera`
**Pros:**
- More mature, been around longer
- Proven video recording

**Cons:**
- Requires eject from Expo managed workflow
- Much more complex setup

### Option D: Record audio only + extract what we can
**Not viable** - We need video for form analysis

## Recommended Path Forward

1. **First:** Run the camera test component to get exact error message
2. **If recordAsync is broken:** Implement Option A (react-native-vision-camera)
3. **If recordAsync works but has edge case:** Debug specific parameters

## Implementation Plan

### If we go with `react-native-vision-camera`:
1. Install `expo-dev-client` (allows native modules in Expo)
2. Install `react-native-vision-camera` v4
3. Rewrite camera screen with new API
4. Add frame extraction (for AI analysis optimization)
5. Test on device
6. Deploy new build

**Timeline:** ~1 day of focused work

## Files to Check

- `/src/app/(tabs)/record/camera-test.tsx` - Minimal reproduction
- `app.json` - Check if any camera config exists
- `.env.local` - Check for camera settings
- GitHub Actions workflow - May need to rebuild with new deps

## Next Steps

**For Nick:**
1. Test the camera-test component when built
2. Send me the **exact error message** from console
3. We'll decide on Option A vs B vs continue debugging

Let me know what the test component shows! 🔍
