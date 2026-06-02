# ExerciseDB Integration Plan for FormCritic

## Overview
Integrate ExerciseDB (11,000+ exercises) to display correct form GIFs and instructions alongside AI analysis.

## Architecture

### 1. ExerciseDB Self-Hosting
- **Option A (Recommended):** Deploy on Railway (free tier: 512MB RAM, 100GB/month)
- **Option B:** Heroku alternative (Render, Fly.io)
- **Repo:** github.com/ExerciseDB/exercisedb-api
- **Data:** MongoDB + Node.js/Express backend
- **Rate Limits:** Unlimited (self-hosted)

### 2. Data Structure
ExerciseDB provides per exercise:
```json
{
  "id": "0001",
  "name": "3/4 sit-up",
  "target": "abs",
  "equipment": "body weight",
  "bodyPart": "chest",
  "gifUrl": "https://d3x8shulf1loz0.cloudfront.net/exercises/0001.gif",
  "instructions": [
    "Lie on the floor with your knees bent and your feet on the floor.",
    "Place your hands across your chest...",
    ...
  ]
}
```

### 3. App Integration

#### Phase 1: Basic Search & Display
1. **ExerciseSearch component** - Search/autocomplete exercise by name
2. **ExerciseDetail screen** - Show:
   - Exercise name + target muscles
   - Correct form GIF (from ExerciseDB)
   - Instructions list
   - AI form critique (from Gemini)
3. **Exercise matching** - Gemini auto-detects exercise name from video, we fetch from ExerciseDB

#### Phase 2: Lambda Enhancement
- Update Lambda to:
  1. Accept exercise name from app OR auto-detect from video
  2. Fetch exercise details from ExerciseDB (instructions, target muscles)
  3. Include instructions in Gemini prompt for better analysis context
  4. Return both AI critique + exercise reference data

#### Phase 3: Results Screen Enhancement
- Display:
  - Exercise correct form GIF (left side)
  - User's form score + critique (right side)
  - Instructions + key improvement areas

## Implementation Steps

### Step 1: Self-Host ExerciseDB
- Deploy to Railway: `railway up` from ExerciseDB repo
- Get API URL: `https://your-railway-app.up.railway.app`
- Endpoints needed:
  - `GET /exercises` - list all
  - `GET /exercises/id/:id` - get by ID
  - `GET /exercises/name/:name` - search by name

### Step 2: Create ExerciseDB Service
File: `src/services/exercisedb.ts`
- Fetch exercises by name (with fuzzy matching)
- Cache results locally (Expo Storage)
- Fallback if API unavailable

### Step 3: Add ExerciseSearch Component
File: `src/components/exercise-search.tsx`
- Searchable list/autocomplete
- Display exercise + target muscles
- Select to set current exercise

### Step 4: Update Results Screen
File: `src/app/(tabs)/record/results.tsx`
- Fetch exercise details from ExerciseDB
- Display GIF + instructions side-by-side with AI critique
- Show muscle groups targeted

### Step 5: Update Lambda
File: `lambda/index.ts`
- Accept `exerciseName` in payload
- Fetch exercise instructions from ExerciseDB
- Include in Gemini prompt: "Here are the correct form instructions: [...]"
- Return exercise details + AI critique

## API Endpoints to Use

```
GET /exercises - Get all exercises
GET /exercises/id/{id} - Get by ID
GET /exercises/name/{name} - Search by name
GET /exercises/equipment/{equipment} - Filter by equipment
GET /exercises/target/{target} - Filter by target muscle
```

## Benefits
✅ 11,000+ exercises covered
✅ GIFs showing correct form
✅ Step-by-step instructions
✅ Target muscle data for insights
✅ Free + self-hosted = no costs
✅ Better Gemini analysis with context

## Timeline
- Phase 1 (ExerciseDB setup + basic search): 1-2 hours
- Phase 2 (Lambda enhancement): 1 hour
- Phase 3 (UI polish): 1-2 hours
- **Total: 3-5 hours**

## Dependencies
```
expo-sqlite (for local caching)
```

## Next Steps
1. Deploy ExerciseDB to Railway
2. Test API endpoints
3. Build exercise search component
4. Update results screen
5. Test E2E
