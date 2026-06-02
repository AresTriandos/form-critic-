# Form Critic - Recording UX Improvements

**Priority:** HIGH (core recording experience)  
**Effort:** 4-6 hours  
**Status:** Ready to implement

---

## 1. Camera Flip Button

### What
Add button to switch between front/back camera during preview.

### Implementation
**File:** `src/app/(tabs)/record/index.tsx`

```tsx
// Add to camera options
const [facing, setFacing] = useState<'front' | 'back'>('front');

// Add flip button in UI
<TouchableOpacity onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}>
  <MaterialIcons name="flip-camera-android" size={32} color="white" />
</TouchableOpacity>

// Pass to camera
<CameraView facing={facing} ... />
```

### Details
- Position: Top-right of camera preview
- Icon: Flip/rotate icon (Material Icons)
- State: Persist across recording session
- Default: Front (selfie view for posture)

---

## 2. Delayed Start Timer (15-30 seconds)

### What
Before recording starts, show countdown timer. User can position themselves.

### Implementation
**File:** `src/app/(tabs)/record/index.tsx`

```tsx
// States
const [isCountingDown, setIsCountingDown] = useState(false);
const [countdownSeconds, setCountdownSeconds] = useState(0);
const [selectedDelay, setSelectedDelay] = useState(15); // or 30

// When user presses "Start Recording"
const startRecordingWithDelay = async () => {
  setIsCountingDown(true);
  setCountdownSeconds(selectedDelay);
  
  // Countdown loop
  const interval = setInterval(() => {
    setCountdownSeconds(s => {
      if (s <= 1) {
        clearInterval(interval);
        setIsCountingDown(false);
        // Actually start recording
        startRecording();
        return 0;
      }
      return s - 1;
    });
  }, 1000);
};

// Show delay selector before countdown starts
if (!isCountingDown && !isRecording) {
  return (
    <View>
      <TouchableOpacity onPress={() => setSelectedDelay(15)}>
        <Text>15 sec</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setSelectedDelay(30)}>
        <Text>30 sec</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Details
- Options: 15 or 30 seconds (user selectable)
- Once selected, countdown begins immediately
- Cannot cancel once started (or add cancel button)
- Sound cue on each second (optional: beep on last 3 seconds)

---

## 3. Record Button Countdown Display

### What
Record button itself shows:
1. Countdown timer during delay (e.g., "15...")
2. Elapsed time while recording (e.g., "0:32")

### Implementation
**File:** `src/app/(tabs)/record/index.tsx`

```tsx
const [elapsedSeconds, setElapsedSeconds] = useState(0);

// During countdown
<TouchableOpacity disabled style={styles.recordButton}>
  <Text style={styles.buttonText}>
    {isCountingDown ? `${countdownSeconds}...` : 'Start'}
  </Text>
</TouchableOpacity>

// During recording
useEffect(() => {
  if (!isRecording) return;
  
  const interval = setInterval(() => {
    setElapsedSeconds(s => s + 1);
  }, 1000);
  
  return () => clearInterval(interval);
}, [isRecording]);

// Button shows elapsed time
<TouchableOpacity 
  onPress={stopRecording} 
  style={[styles.recordButton, styles.recordingActive]}
>
  <Text style={styles.buttonText}>
    {formatTime(elapsedSeconds)}
  </Text>
</TouchableOpacity>

// Helper
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
```

### Styling
- **Countdown:** Red background, large font, pulsing animation
- **Recording:** Red background with white circle (active state)
- **Elapsed:** White text, monospace font for clarity

---

## Timeline

| Step | Time | Notes |
|------|------|-------|
| 1. Camera flip button | 30 min | Simple state toggle |
| 2. Delay timer logic | 1.5 hours | Countdown loop, state management |
| 3. UI for delay selector | 1 hour | Radio buttons or segmented control |
| 4. Record button display | 1 hour | Dynamic text, formatting |
| 5. Styling & polish | 1.5 hours | Colors, animations, feedback |
| **Total** | **5 hours** | Ready to deploy |

---

## Testing Checklist

- [ ] Flip camera works in preview
- [ ] Countdown starts immediately after selection
- [ ] Recording begins when timer reaches 0
- [ ] Elapsed time displays correctly
- [ ] Button text updates in real-time
- [ ] Countdown can't be interrupted
- [ ] Screen rotation doesn't break timer
- [ ] Works on both iOS and Android

---

**Ready to build?** Let's start with camera flip (easiest win).
