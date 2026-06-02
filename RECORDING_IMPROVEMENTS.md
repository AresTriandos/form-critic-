# Form Critic - Recording UX Improvements

**Priority:** HIGH (core recording experience)  
**Effort:** 2-3 hours  
**Status:** Ready to implement

---

## 1. Camera Flip Button

### What
Add button to switch between front/back camera during preview.

### Implementation
**File:** `src/app/(tabs)/record/camera.tsx`

```tsx
// Add to camera options
const [facing, setFacing] = useState<'front' | 'back'>('back');

// Add flip button in UI (top-right corner)
<TouchableOpacity 
  style={styles.flipButton}
  onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
>
  <MaterialIcons name="flip-camera-android" size={32} color="white" />
</TouchableOpacity>

// Pass to camera
<CameraView facing={facing} ... />
```

### Details
- Position: Top-right of camera preview
- Icon: Flip/rotate icon (Material Icons)
- State: Persist across recording session
- Default: Back (for form tracking)
- Effort: **30 minutes**

---

## 2. Delayed Start Timer (15-30 seconds)

### What
Before recording starts, show countdown timer. User can position themselves.
- Select 15 or 30 seconds
- Countdown appears on screen
- Actual recording starts when countdown reaches 0

### Implementation
**File:** `src/app/(tabs)/record/camera.tsx`

```tsx
const [isCountingDown, setIsCountingDown] = useState(false);
const [countdownSeconds, setCountdownSeconds] = useState(0);
const [selectedDelay, setSelectedDelay] = useState(15); // or 30

// When user presses "Start Recording"
const handleStartRecordWithDelay = async () => {
  // Show delay selector
  // User taps 15 or 30
  // Countdown begins
  
  setIsCountingDown(true);
  setCountdownSeconds(selectedDelay);
  
  const interval = setInterval(() => {
    setCountdownSeconds(s => {
      if (s <= 1) {
        clearInterval(interval);
        setIsCountingDown(false);
        // Start actual recording
        handleStartRecord();
        return 0;
      }
      return s - 1;
    });
  }, 1000);
};

// Show countdown overlay if active
{isCountingDown && (
  <View style={styles.countdownOverlay}>
    <Text style={styles.countdownText}>{countdownSeconds}</Text>
  </View>
)}
```

### Details
- Options: 15 or 30 seconds (user selectable)
- Countdown displays large on screen
- User can see themselves positioning
- Cannot cancel once started
- Effort: **1.5 hours**

---

## 3. Record Button Elapsed Time Display

### What
Record button shows elapsed time while recording (e.g., "0:32", "1:05")
- Counts up from 0:00
- Updates every second
- Shows minutes:seconds format
- Helps user know how long recording has been going

### Implementation
**File:** `src/app/(tabs)/record/camera.tsx`

The timer is **already implemented**! Just update button text:

```tsx
// Timer already exists in state
// Just display it in the button

<TouchableOpacity 
  style={[styles.recordButton, recordingRef.current && styles.recordingActive]}
  onPress={recordingRef.current ? handleStopRecord : handleStartRecord}
>
  {recordingRef.current ? (
    <Text style={styles.recordButtonText}>
      {String(Math.floor((recordingTime / 1000) / 60)).padStart(2, '0')}:
      {String(Math.floor((recordingTime / 1000) % 60)).padStart(2, '0')}
    </Text>
  ) : (
    <Ionicons name="radio-button-on" size={40} color="#ffffff" />
  )}
</TouchableOpacity>
```

### Styling
- White text on red background
- Monospace font (numbers align properly)
- Large enough to see from distance
- Effort: **15 minutes** (already implemented, just update UI)

---

## Timeline

| Feature | Time | Status |
|---------|------|--------|
| 1. Camera flip button | 30 min | Ready |
| 2. Delayed start timer | 1.5 hours | Ready |
| 3. Elapsed time display | 15 min | Ready (mostly done) |
| **Total** | **2 hours** | Ready to build |

---

## Testing Checklist

- [ ] Flip camera works smoothly
- [ ] Countdown starts immediately after selection
- [ ] Recording begins when timer hits 0
- [ ] Elapsed time updates correctly every second
- [ ] Button text visible from arm's length
- [ ] Can record the full 90 seconds
- [ ] Works in both portrait and landscape

---

**Ready to implement!**
