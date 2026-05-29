# FormCritic - Quick Reference Guide

Essential commands and information at a glance.

## Project Structure Quick Map

```
form-critic-app/
├── src/app/                    # React Native screens
│   └── (tabs)/
│       ├── index.tsx           → HOME SCREEN
│       ├── record/
│       │   ├── camera.tsx      → RECORDING SCREEN
│       │   ├── processing.tsx  → LOADING SCREEN
│       │   └── results.tsx     → RESULTS SCREEN
│       └── history.tsx         → HISTORY SCREEN
├── src/utils/aws.ts           # Lambda API client
├── lambda/index.ts            # AWS Lambda handler
└── [docs]/                    # All guides
```

## Quick Commands

### Local Development
```bash
npm start              # Start Expo dev server
npm run ios            # Run on iOS simulator
npm run android         # Run on Android emulator
npm run web            # Run on web browser
npm run lint           # Check code quality
```

### Environment Setup
```bash
cp .env.example .env.local
# Edit .env.local with your Lambda URL
```

### AWS Lambda Deployment
```bash
cd lambda
npm install            # Install Lambda dependencies
npm run build          # Build for deployment
npm run deploy         # Deploy to AWS (requires AWS CLI)
```

### Building for App Stores
```bash
eas build --platform ios --profile preview          # TestFlight build
eas build --platform android --profile preview      # Google Play build
eas submit --platform ios --latest                  # Submit to TestFlight
eas submit --platform android --latest              # Submit to Google Play
```

### Version Management
```bash
npm version patch      # 1.0.0 → 1.0.1 (fixes)
npm version minor      # 1.0.0 → 1.1.0 (features)
npm version major      # 1.0.0 → 2.0.0 (breaking)
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## File Locations

| What | Location |
|------|----------|
| Home Screen | `src/app/(tabs)/index.tsx` |
| Record Screen | `src/app/(tabs)/record/` |
| History Screen | `src/app/(tabs)/history.tsx` |
| Lambda Handler | `lambda/index.ts` |
| AWS Client | `src/utils/aws.ts` |
| Types/Interfaces | `src/types/index.ts` |
| Environment Vars | `.env.local` (create from `.env.example`) |
| App Config | `app.json` |
| Dependencies | `package.json` |

## Key Technologies

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo |
| Routing | Expo Router |
| Backend | AWS Lambda |
| AI Model | Claude 3.5 Sonnet (Vision) |
| Storage | Expo SecureStore |
| Language | TypeScript |
| UI Framework | React Native Primitives |
| Icons | Ionicons |

## Feature Checklist

- ✅ Video recording (expo-camera)
- ✅ Video upload to Lambda
- ✅ AI form analysis (Claude Vision)
- ✅ Results display
- ✅ History tracking (SecureStore)
- ✅ Dark mode support
- ✅ Error handling
- ✅ Loading states

## Important Endpoints

```bash
# Lambda Function URL (update in .env.local)
https://your-lambda-url.lambda-url.region.on.aws/

# Expected request format (from app):
POST / HTTP/1.1
Content-Type: application/json

{
  "video": "base64_encoded_video",
  "videoSize": 1024000,
  "timestamp": "2024-05-29T12:00:00Z"
}

# Expected response format (from Lambda):
{
  "exercise": "Squats",
  "score": 78,
  "critique": "Good form...",
  "keyCues": ["Cue 1", "Cue 2"],
  "processingTime": 8234
}
```

## Performance Targets

| Metric | Target |
|--------|--------|
| App Startup | < 2s |
| Video Recording | Real-time |
| Lambda Processing | 10-15s |
| Result Display | Instant |
| History Load | < 1s |
| Crash Rate | < 0.1% |

## Permissions Required

### iOS (app.json)
```
NSCameraUsageDescription
NSPhotoLibraryUsageDescription
NSMicrophoneUsageDescription
```

### Android (app.json)
```
android.permission.CAMERA
android.permission.RECORD_AUDIO
android.permission.READ_EXTERNAL_STORAGE
android.permission.WRITE_EXTERNAL_STORAGE
```

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_LAMBDA_ENDPOINT=https://your-lambda-url/

# Lambda (AWS Console)
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

## GitHub Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .
git commit -m "feat: description"

# Push and create PR
git push origin feature/feature-name
# Then create PR on GitHub

# After review and merge
git checkout main
git pull
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Lambda endpoint 404" | Check .env.local, verify URL is correct |
| "Camera permission denied" | Check device settings, re-grant permission |
| "Video upload timeout" | Reduce video size, increase Lambda timeout |
| "Module not found" | Run `npm install`, clear cache: `expo start --clear` |
| "Build fails" | Clear EAS cache: `eas build --clear-cache` |

## Navigation Map

```
App
├── Home (index.tsx)
│   └── [Record Button]
│       └── Record Home (record/index.tsx)
│           └── [Camera Button]
│               └── Camera (record/camera.tsx)
│                   └── [Video Recording]
│                       └── Processing (record/processing.tsx)
│                           └── [Lambda Analysis]
│                               └── Results (record/results.tsx)
│                                   ├── [Save Button]
│                                   │   └── History (history.tsx)
│                                   └── [New Recording]
│                                       └── Record Home
└── History (history.tsx)
    └── [Shows saved workouts]
```

## Testing Checklist

Before each release:
- [ ] Install fresh on device
- [ ] Record 5+ videos
- [ ] Test various exercises
- [ ] Verify scores are reasonable
- [ ] Check dark mode
- [ ] Test offline then online
- [ ] No crashes observed
- [ ] Feedback makes sense

## Deployment Timeline

| Stage | Time | Notes |
|-------|------|-------|
| Lambda Setup | 15 min | One-time AWS config |
| App Testing | 30 min | Local testing |
| Build | 15 min | EAS builds in cloud |
| TestFlight | 5 min | Upload and submit |
| App Store Review | 1-3 days | Apple review |
| Launch | Instant | Once approved |

## Cost Estimates

| Service | Cost | Notes |
|---------|------|-------|
| Lambda | ~$0.0001/req | Free tier covers 1M requests |
| Claude API | ~$0.001/req | Vision models ~300K input tokens/request |
| AWS Data | Minimal | Typical: $0-1/month |
| Expo | Free | EAS free tier available |
| App Store | $99/year | Annual developer account fee |
| Google Play | $25 | One-time account registration |

## Resources

| Resource | Link |
|----------|------|
| Expo Docs | https://docs.expo.dev |
| React Native | https://reactnative.dev |
| AWS Lambda | https://docs.aws.amazon.com/lambda |
| Claude API | https://docs.anthropic.com |
| GitHub | https://github.com/AresTriandos/form-critic-app |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-05-29 | Initial MVP release |
| — | — | Future versions TBD |

## Contact

- **Developer:** Ares Triandos
- **Email:** annapolischiro@hotmail.com
- **GitHub:** AresTriandos/form-critic-app
- **Issues:** GitHub Issues tab

## Status Badge

```
Project: FormCritic
Status: ✅ MVP Complete
Version: 1.0.0
Ready for: TestFlight & Production
```

---

**Keep this handy while developing!** 📱⚡
