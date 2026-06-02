# ExerciseDB Integration Setup Guide

## ✅ What's Been Implemented

### 1. **ExerciseDB Service** (`src/services/exercisedb.ts`)
- Complete API service for fetching exercise data
- Supports searching by name, target, equipment, body part
- Built-in caching for performance
- Fuzzy matching for AI-detected exercise names
- Works with both self-hosted and RapidAPI public endpoint

### 2. **Exercise Search Component** (`src/components/exercise-search.tsx`)
- Searchable exercise list with autocomplete
- Shows target muscles and equipment
- Integration-ready for record flow

### 3. **Exercise Detail Card** (`src/components/exercise-detail-card.tsx`)
- Displays correct form GIF from ExerciseDB
- Shows step-by-step instructions
- Displays AI analysis (score, critique, cues) side-by-side
- Auto-fetches exercise when given AI-detected name

### 4. **Lambda Enhancement** (updated `lambda/index.ts`)
- Accepts optional exercise context in payload
- Can receive pre-identified exercise name, instructions, target muscle
- Incorporates instructions into Gemini prompt for better analysis
- Returns same JSON + enhanced feedback

## 🚀 Setup Steps

### Step 1: Deploy ExerciseDB (Choose One)

#### Option A: Railway (Recommended - 5 minutes)
1. Go to https://railway.app
2. Sign up / log in
3. Create new project → select "Deploy from GitHub"
4. Search for: `ExerciseDB/exercisedb-api`
5. Deploy
6. Get your Railway URL: `https://your-app.up.railway.app`
7. That's it! Ready to use

#### Option B: Use RapidAPI (Free Tier)
1. Go to https://rapidapi.com/shetyjs/api/exercisedb
2. Sign up → subscribe to free tier
3. Get your API key from dashboard
4. Set environment variable: `EXPO_PUBLIC_EXERCISEDB_KEY=your_key`

### Step 2: Configure App Environment

Create/update `.env.local`:
```bash
# If using Railway self-hosted:
EXPO_PUBLIC_EXERCISEDB_URL=https://your-app.up.railway.app

# If using RapidAPI:
# (no URL needed, defaults to RapidAPI)
EXPO_PUBLIC_EXERCISEDB_KEY=your_rapidapi_key
```

### Step 3: Update Lambda Deployment

Deploy the enhanced Lambda function:
```bash
aws lambda update-function-code \
  --function-name form-critic-analyzer \
  --zip-file fileb:///data/.openclaw/workspace/form-critic-app/lambda/form-critic-lambda.zip \
  --region us-east-1
```

### Step 4: Integration Points

#### In Results Screen
```typescript
import { ExerciseDetailCard } from '@/components/exercise-detail-card';

// In your results component:
<ExerciseDetailCard
  exerciseName={analysisResult.exercise}
  aiScore={analysisResult.score}
  aiCritique={analysisResult.critique}
  keyCues={analysisResult.keyCues}
/>
```

#### In Record Flow (Optional Pre-Selection)
```typescript
import { ExerciseSearch } from '@/components/exercise-search';

// Show search modal before/after recording
<ExerciseSearch
  onSelect={(exercise) => {
    // Send exercise data with video to Lambda
    sendAnalysisRequest({
      video: videoBase64,
      exerciseName: exercise.name,
      exerciseInstructions: exercise.instructions,
      targetMuscle: exercise.target,
    });
  }}
/>
```

## 📋 Usage Flow

### Current Flow (Auto-Detection)
```
User records video
    ↓
Send to Lambda
    ↓
Gemini identifies exercise
    ↓
Return analysis
    ↓
ExerciseDetailCard fetches exercise from ExerciseDB
    ↓
Display GIF + AI analysis side-by-side
```

### Enhanced Flow (Pre-Selection)
```
User selects exercise (optional)
    ↓
User records video
    ↓
Send video + exercise context to Lambda
    ↓
Gemini analyzes with exercise context for better accuracy
    ↓
ExerciseDetailCard displays with pre-loaded exercise
    ↓
Display GIF + AI analysis side-by-side
```

## 🔌 Lambda Payload Examples

### Basic (Current)
```json
{
  "video": "base64_encoded_mp4",
  "timestamp": "2026-06-02T01:25:00Z"
}
```

### Enhanced (With ExerciseDB Context)
```json
{
  "video": "base64_encoded_mp4",
  "timestamp": "2026-06-02T01:25:00Z",
  "exerciseName": "Barbell Squat",
  "targetMuscle": "quads",
  "exerciseInstructions": [
    "Stand with feet shoulder-width apart",
    "Place barbell across shoulders",
    "Lower hips back and down",
    "Reverse movement to return to start"
  ]
}
```

## 📊 Performance

- **ExerciseDB Search:** <100ms (cached)
- **GIF Loading:** Native (already optimized)
- **Lambda Analysis:** 15-30s with Gemini
- **ExerciseDetailCard Render:** <1s

## 🐛 Testing

### Test ExerciseDB Connection
```typescript
import { exerciseDB } from '@/services/exercisedb';

// In your test:
const result = await exerciseDB.searchByName('squat');
console.log(result); // Should return exercises
```

### Test Exercise Match
```typescript
const exercise = await exerciseDB.matchExerciseName('barbell squat');
console.log(exercise.gifUrl); // Should have valid URL
```

## 🎯 Next Steps

1. **Deploy ExerciseDB** (Railway or RapidAPI)
2. **Configure `.env.local`** with endpoint/key
3. **Test service** in app
4. **Integrate components** into results flow
5. **Optional:** Add exercise pre-selection to record flow
6. **Deploy Lambda** with new zip file
7. **Test E2E** recording → analysis → results

## 💡 Features to Consider

- **Caching:** ExerciseDB caches locally using `Map` in service
- **Fallback:** If ExerciseDB unavailable, Gemini still works (just no GIFs)
- **Matching:** Fuzzy matching finds correct exercise even with typos
- **Muscle Groups:** Can filter exercises by target muscle for personalized workouts

## 📞 Troubleshooting

**ExerciseDB not found:**
- Check `.env.local` for correct URL/key
- Verify Railway deployment is active
- Try using RapidAPI as fallback

**GIFs not loading:**
- Check network permission in app
- Verify gif URLs are valid (many are from Cloudfront)
- Test URL in browser

**Slow performance:**
- First search caches results
- Subsequent searches should be instant
- Consider limiting search results to 20

## 🎬 Demo

Once integrated, the flow will look like:
1. User records a squat
2. Gemini identifies it as "barbell squat"
3. ExerciseDetailCard fetches barbell squat from ExerciseDB
4. Screen shows:
   - Correct form GIF (left)
   - User's score + critique + cues (right)
   - Step-by-step instructions below

Result: User sees both correct form AND AI feedback in one place! 🎯
