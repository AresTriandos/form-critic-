# ExerciseDB - Results Screen Integration

This guide shows how to add ExerciseDB to your results screen in 5 minutes.

## Current Results Screen

**File:** `src/app/(tabs)/record/results.tsx`

Your current structure probably looks like:
```typescript
export default function ResultsScreen() {
  const [analysis, setAnalysis] = useState<AnalysisResponse>();
  const route = useRoute();

  useEffect(() => {
    // Fetch analysis...
    const result = route.params?.analysis;
    setAnalysis(result);
  }, []);

  return (
    <View>
      {/* Display analysis results */}
      <Text>{analysis?.exercise}</Text>
      <Text>{analysis?.score}/100</Text>
      <Text>{analysis?.critique}</Text>
      {/* List key cues */}
    </View>
  );
}
```

## Integration (3 Simple Changes)

### Step 1: Import the Component

Add to the top of `results.tsx`:
```typescript
import { ExerciseDetailCard } from '@/components/exercise-detail-card';
```

### Step 2: Replace Your Manual Display

**Before:**
```typescript
<View>
  <Text>{analysis?.exercise}</Text>
  <Text>{analysis?.score}/100</Text>
  <Text>{analysis?.critique}</Text>
  {/* List key cues manually */}
</View>
```

**After:**
```typescript
{analysis && (
  <ExerciseDetailCard
    exerciseName={analysis.exercise}
    aiScore={analysis.score}
    aiCritique={analysis.critique}
    keyCues={analysis.keyCues}
  />
)}
```

### Step 3: That's It!

The component will:
- ✅ Auto-fetch exercise from ExerciseDB by name
- ✅ Display GIF
- ✅ Show instructions
- ✅ Display your AI analysis

## Complete Example

```typescript
import React, { useEffect, useState } from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@/hooks/use-theme';
import { ExerciseDetailCard } from '@/components/exercise-detail-card';

interface AnalysisResponse {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  processingTime: number;
}

export default function ResultsScreen() {
  const { colors } = useTheme();
  const [analysis, setAnalysis] = useState<AnalysisResponse>();
  const [loading, setLoading] = useState(true);
  const route = useRoute();

  useEffect(() => {
    // Simulate fetching (or get from route params)
    const result = route.params?.analysis;
    if (result) {
      setAnalysis(result);
    }
    setLoading(false);
  }, [route]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {analysis && (
        <ExerciseDetailCard
          exerciseName={analysis.exercise}
          aiScore={analysis.score}
          aiCritique={analysis.critique}
          keyCues={analysis.keyCues}
        />
      )}
    </ScrollView>
  );
}
```

## Optional: Add Exercise Pre-Selection

If you want users to select exercise before recording:

### 1. Add State to Record Screen

```typescript
const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
```

### 2. Show Exercise Search Modal

```typescript
<ExerciseSearch
  onSelect={(exercise) => {
    setSelectedExercise(exercise);
    // Close modal...
  }}
/>
```

### 3. Pass to Lambda

When sending video:
```typescript
const payload = {
  video: base64Video,
  timestamp: new Date().toISOString(),
  exerciseName: selectedExercise?.name,  // NEW
  exerciseInstructions: selectedExercise?.instructions,  // NEW
  targetMuscle: selectedExercise?.target,  // NEW
};

const response = await fetch(lambdaUrl, {
  method: 'POST',
  body: JSON.stringify(payload),
});
```

This gives Gemini context for better analysis! 🎯

## Customization Options

### Option A: Show Exercise Search Above Results

```typescript
export default function ResultsScreen() {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse>();

  return (
    <ScrollView>
      {/* Show search initially */}
      {!analysis && (
        <ExerciseSearch
          onSelect={(ex) => {
            setExercise(ex);
            // Record video with this exercise context...
          }}
        />
      )}

      {/* After analysis, show results */}
      {analysis && (
        <ExerciseDetailCard
          exerciseName={analysis.exercise}
          aiScore={analysis.score}
          aiCritique={analysis.critique}
          keyCues={analysis.keyCues}
        />
      )}
    </ScrollView>
  );
}
```

### Option B: Minimal - Just Add Card

```typescript
return (
  <ScrollView>
    {analysis && (
      <ExerciseDetailCard
        exerciseName={analysis.exercise}
        aiScore={analysis.score}
        aiCritique={analysis.critique}
        keyCues={analysis.keyCues}
      />
    )}
  </ScrollView>
);
```

### Option C: Add Loading State

```typescript
return (
  <ScrollView>
    {analysis ? (
      <ExerciseDetailCard
        exerciseName={analysis.exercise}
        aiScore={analysis.score}
        aiCritique={analysis.critique}
        keyCues={analysis.keyCues}
      />
    ) : (
      <ActivityIndicator />
    )}
  </ScrollView>
);
```

## Props Reference

### ExerciseDetailCard

```typescript
interface Props {
  exerciseName: string;        // Required: exercise to look up
  aiScore?: number;            // Optional: form score 0-100
  aiCritique?: string;         // Optional: feedback text
  keyCues?: string[];          // Optional: list of improvements
}
```

The component will:
- Look up `exerciseName` in ExerciseDB
- Fetch exercise GIF, instructions, target muscles
- Display everything with your AI analysis
- Handle loading & error states

## Testing Checklist

- [ ] Results screen renders
- [ ] ExerciseDetailCard appears
- [ ] GIF loads (can see it)
- [ ] Instructions display
- [ ] AI analysis shows
- [ ] Score is highlighted correctly
- [ ] Light/dark mode works
- [ ] Responsive on different screen sizes

## Troubleshooting

**GIF not showing?**
- Check network permission in app
- Verify exerciseDB is responding
- Check browser console for errors

**Component not rendering?**
- Check `exerciseName` prop is passed correctly
- Verify exercise exists in ExerciseDB
- Check imports are correct

**Styling looks wrong?**
- Component uses `useTheme()` automatically
- Should match your app theme
- Check `colors` object is available

## That's It! 🚀

You now have:
- ✅ Correct form GIFs from ExerciseDB
- ✅ Step-by-step instructions
- ✅ AI analysis side-by-side
- ✅ Automatic exercise lookup
- ✅ Theme support

All in one component!
