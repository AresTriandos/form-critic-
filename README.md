# FormCritic - AI-Powered Exercise Form Analysis

A minimalist React Native/Expo app that records your exercise movements and provides instant AI-powered form feedback using Claude Vision API and AWS Lambda.

## Features

- 📱 **Mobile-First Design**: Clean, minimalist UI with dark mode support
- 🎥 **Video Recording**: Record exercises directly from your phone's camera
- 🤖 **AI Analysis**: Claude Vision automatically detects exercises and analyzes form
- ⭐ **Form Scoring**: Get a score (0-100) for your exercise form
- 💡 **Actionable Feedback**: Detailed critiques and key improvement cues
- 📊 **History Tracking**: Save and review all your workout analyses
- 🔒 **Secure Storage**: Results stored securely on device

## Tech Stack

### Mobile App
- **Framework**: React Native + Expo 50+
- **Language**: TypeScript
- **Routing**: Expo Router
- **Storage**: Expo SecureStore (encrypted local storage)
- **UI Components**: Ionicons, React Native built-ins
- **Styling**: StyleSheet with theme support

### Backend
- **Compute**: AWS Lambda (Node.js 18.x)
- **Video Processing**: FFmpeg for frame extraction
- **AI Model**: Anthropic Claude 3.5 Sonnet (Vision API)
- **API**: Function URL for HTTPS endpoint

## Architecture

```
┌─────────────────┐
│  React Native   │
│  Mobile App     │
└────────┬────────┘
         │ (base64 video)
         │
    ┌────▼──────────────┐
    │  AWS Lambda       │
    │  - Extract frames │
    │  - Send to Claude │
    │  - Return JSON    │
    └────┬──────────────┘
         │
    ┌────▼──────────────┐
    │ Claude Vision API │
    │ (3.5 Sonnet)      │
    └───────────────────┘
```

## Project Structure

```
form-critic-app/
├── src/
│   ├── app/
│   │   ├── (tabs)/               # Tab-based navigation
│   │   │   ├── index.tsx         # Home screen
│   │   │   ├── record/
│   │   │   │   ├── index.tsx     # Record home
│   │   │   │   ├── camera.tsx    # Video recording
│   │   │   │   ├── processing.tsx # Loading state
│   │   │   │   └── results.tsx   # Results display
│   │   │   └── history.tsx       # Workout history
│   │   └── _layout.tsx           # Root layout
│   ├── components/               # Reusable components
│   ├── hooks/                    # Custom hooks
│   ├── constants/                # App constants
│   ├── utils/
│   │   └── aws.ts               # AWS Lambda client
│   └── global.css               # Global styles
├── lambda/                       # AWS Lambda function
│   ├── index.ts                 # Handler code
│   ├── package.json
│   ├── tsconfig.json
│   └── DEPLOYMENT.md            # Deployment guide
├── app.json                      # Expo configuration
├── package.json
├── tsconfig.json
└── README.md

```

## Quick Start

### 1. Clone & Install

```bash
cd form-critic-app
npm install
```

### 2. Configure AWS Lambda Endpoint

Get your Lambda Function URL from AWS, then update `src/utils/aws.ts`:

```typescript
const LAMBDA_ENDPOINT = 'https://your-lambda-url.lambda-url.region.on.aws/';
```

### 3. Run the App

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web (development)
npm run web

# Start development server
npm start
```

### 4. Deploy Lambda Function

See `lambda/DEPLOYMENT.md` for detailed AWS setup.

Quick summary:
```bash
cd lambda
npm install
npm run build
# Then use AWS console or CLI to create and deploy
```

## App Screens

### 1. Home Screen
- Welcome message
- Quick stats about the app
- Button to start recording

### 2. Record Screen
- Simple UI with large record button
- Shows recording timer
- Guides for recording length (5-30 seconds)

### 3. Camera Screen
- Full-screen camera view
- Record/stop buttons
- Cancel option

### 4. Processing Screen
- Loading indicator
- Shows processing status
- Handles errors gracefully

### 5. Results Screen
- Exercise name and score
- Color-coded score badge
- Detailed feedback text
- List of improvement cues
- Save and new recording options

### 6. History Screen
- Grouped by date
- Shows exercise and score
- Tap for details
- Sorted newest first

## API Integration

### Lambda Request Format

```json
{
  "video": "base64_encoded_video_data",
  "videoSize": 1024000,
  "timestamp": "2024-05-29T12:00:00Z"
}
```

### Lambda Response Format

```json
{
  "exercise": "Squats",
  "score": 78,
  "critique": "Good depth and alignment. Work on maintaining a more consistent pace...",
  "keyCues": [
    "Keep chest upright throughout the movement",
    "Ensure knees track over your toes",
    "Try slower, more controlled reps"
  ],
  "processingTime": 8234
}
```

## Development

### Adding New Screens

Use Expo Router's file-based routing:

```typescript
// Create: src/app/(tabs)/new-screen.tsx
export default function NewScreen() {
  // Component code
}
```

### Styling

Use React Native's `StyleSheet` with theme support:

```typescript
const isDark = colorScheme === 'dark';
const styles = StyleSheet.create({
  container: {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  },
});
```

### Testing Lambda Locally

```typescript
// lambda/index.ts
import { handler } from './index';

// Test locally
handler({
  body: {
    video: 'base64_data...',
    videoSize: 1000,
    timestamp: new Date().toISOString(),
  },
}).then(console.log);
```

## Environment Variables

### App (`.env.local`)
```
EXPO_PUBLIC_LAMBDA_ENDPOINT=https://your-lambda-url.lambda-url.region.on.aws/
```

### Lambda
```
ANTHROPIC_API_KEY=sk-ant-...
```

## Error Handling

- Network errors: Retry prompts with fallback messaging
- Video errors: Camera permission checks with guidance
- API errors: Graceful degradation with error messages
- Storage errors: In-app notifications

## Performance

- **Video Upload**: ~1-5 seconds (depends on video size)
- **Frame Extraction**: ~2-3 seconds
- **Claude API**: ~5-8 seconds per analysis
- **Total**: 10-15 seconds typical

## Security

- Videos stored as base64 in request body (consider S3 for large files)
- Results encrypted in SecureStore (device storage)
- No personal data logged
- HTTPS only for Lambda communication

## Deployment

### TestFlight (iOS)

```bash
eas build --platform ios --profile preview
eas submit --platform ios --latest
```

### Google Play (Android)

```bash
eas build --platform android --profile production
eas submit --platform android --latest
```

### Web

```bash
npm run web
# Deploy static files from .next/ directory
```

## Troubleshooting

### App crashes on camera access
- Check permissions in app.json
- Grant camera permissions in device settings

### Lambda returns 500 error
- Check Claude API key is set in Lambda environment
- Verify FFmpeg is available
- Check Lambda logs: `aws logs tail /aws/lambda/form-critic-analyzer`

### Results not saving
- Check device storage permissions
- Verify SecureStore is working

### Slow processing
- Check video file size
- Monitor Lambda duration
- Consider increasing Lambda memory

## Future Enhancements

- [ ] Support for multiple video uploads (batch analysis)
- [ ] Comparison mode (compare two workouts)
- [ ] Exercise library with reference videos
- [ ] Real-time feedback during recording
- [ ] Social sharing of results
- [ ] Wearable integration (heart rate, etc.)
- [ ] Advanced metrics (rep counting, ROM analysis)
- [ ] Cloud backup of workout history
- [ ] Export to PDF reports

## License

MIT

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Lambda logs
3. Test with sample videos
4. Check Claude API status

## Related Documentation

- [Expo Documentation](https://docs.expo.dev)
- [AWS Lambda Guide](https://docs.aws.amazon.com/lambda)
- [Anthropic Claude API](https://docs.anthropic.com)
- [React Native](https://reactnative.dev)
