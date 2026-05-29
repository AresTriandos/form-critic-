# FormCritic Development Guide

Complete setup guide for local development.

## Prerequisites

- Node.js 18+ (recommend using nvm)
- npm 9+ or yarn
- Expo CLI: `npm install -g expo-cli`
- Watchman (macOS): `brew install watchman`
- For iOS: Xcode 15+, macOS 12+
- For Android: Android Studio, JDK 11+

## Project Setup

### 1. Clone Repository

```bash
git clone https://github.com/AresTriandos/form-critic-app.git
cd form-critic-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

```bash
# Copy example env file
cp .env.example .env.local

# Edit with your Lambda endpoint
nano .env.local
```

Add your AWS Lambda Function URL:
```
EXPO_PUBLIC_LAMBDA_ENDPOINT=https://your-lambda-url.lambda-url.region.on.aws/
```

## Running the App

### Development Server

```bash
# Start Expo development server
npm start

# Or use expo directly
expo start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Press `w` for web browser
- Press `j` for DevTools

### iOS Development

**Prerequisites:**
- macOS with Xcode
- Simulator or real device connected

```bash
npm run ios

# Or manual
expo start --ios

# Using real device:
# 1. Run npm start
# 2. Scan QR code with Expo app
# 3. Opens on device
```

### Android Development

**Prerequisites:**
- Android Studio installed
- Android SDK 35+ installed
- Emulator running or device connected

```bash
npm run android

# Or manual
expo start --android

# Using real device:
# 1. Enable developer mode (tap Build Number 7x in Settings)
# 2. Enable USB Debugging
# 3. Connect via USB
# 4. Run npm start
# 5. Press 'a' to build and run
```

### Web Development

```bash
npm run web

# Opens http://localhost:3000
# Live reload enabled
```

## Code Structure

```
src/
├── app/                 # Expo Router pages
│   ├── (tabs)/         # Main navigation tabs
│   │   ├── index.tsx   # Home
│   │   ├── record/     # Recording flow
│   │   └── history.tsx # Workout history
│   └── _layout.tsx     # Root layout
├── components/         # Reusable components
├── hooks/              # Custom hooks
├── constants/          # App constants
├── utils/              # Helper functions
│   ├── aws.ts          # Lambda client
│   └── ...
├── types/              # TypeScript types (create as needed)
└── global.css          # Global styles
```

## Development Workflow

### Creating a New Component

```typescript
// src/components/MyComponent.tsx
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      padding: 16,
    },
    title: {
      color: isDark ? '#ffffff' : '#000000',
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}
```

### Creating a New Screen

```typescript
// src/app/(tabs)/new-screen.tsx
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NewScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text>New Screen</Text>
    </SafeAreaView>
  );
}
```

### Using Custom Hooks

```typescript
// src/hooks/useFormAnalysis.ts
import { useState } from 'react';
import { uploadVideoAndAnalyze } from '@/utils/aws';

interface AnalysisState {
  loading: boolean;
  error: string | null;
  result: any;
}

export function useFormAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    loading: false,
    error: null,
    result: null,
  });

  const analyze = async (videoUri: string) => {
    setState({ loading: true, error: null, result: null });
    try {
      const result = await uploadVideoAndAnalyze(videoUri);
      setState({ loading: false, error: null, result });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        result: null,
      });
    }
  };

  return { ...state, analyze };
}

// Usage in component
const { loading, result, analyze } = useFormAnalysis();
```

## TypeScript

### Type Safety

```typescript
// src/types/index.ts
export interface WorkoutResult {
  id: string;
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
  savedAt: string;
}

export interface AnalysisPayload {
  video: string;
  videoSize: number;
  timestamp: string;
}
```

### Type Checking

```bash
# Check types
npx tsc --noEmit

# Watch mode
npx tsc --noEmit --watch
```

## Testing

### Setting Up Tests (Optional)

```bash
npm install --save-dev jest @testing-library/react-native
```

Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
};
```

### Example Test

```typescript
// __tests__/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react-native';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeTruthy();
  });
});
```

Run tests:
```bash
npm test
```

## Debugging

### Expo DevTools

```bash
npm start

# Then press 'd' in terminal for DevTools
```

### VS Code Debugging

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Expo",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/expo",
      "args": ["start"],
      "cwd": "${workspaceFolder}",
      "console": "integratedTerminal"
    }
  ]
}
```

### React DevTools

Install: `npm install -g react-devtools`

```bash
# Terminal 1
react-devtools

# Terminal 2
npm start

# In Expo app, press 'd' > "Open debugger in Chrome"
# React DevTools shows component tree
```

### Console Logging

```typescript
// Good for debugging
console.log('Variable:', variable);
console.error('Error:', error);
console.warn('Warning:', warning);

// Group related logs
console.group('Form Analysis');
console.log('Step 1: Extract frames');
console.log('Step 2: Send to API');
console.groupEnd();
```

### Network Tab

In Expo DevTools:
1. Click "Network"
2. Make requests
3. View request/response

Or use:
```bash
# Install react-native-network-logger
npm install react-native-network-logger
```

## Performance Optimization

### Optimize Re-renders

```typescript
import { memo } from 'react';

// Memoize component to prevent unnecessary re-renders
const MyComponent = memo(({ title }: { title: string }) => {
  return <Text>{title}</Text>;
});
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

export default function Screen() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Image Optimization

```typescript
import { Image } from 'expo-image';

// BlurHash for placeholder
<Image
  source={imageUri}
  placeholder={blurhash}
  contentFit="cover"
  style={{ width: 200, height: 200 }}
/>
```

## Build & Release

### Build for Testing

```bash
# iOS (TestFlight)
eas build --platform ios --profile preview

# Android (Google Play Internal Testing)
eas build --platform android --profile preview
```

### Build for Production

```bash
# iOS (App Store)
eas build --platform ios --profile production

# Android (Google Play)
eas build --platform android --profile production
```

### Submit to App Stores

```bash
# TestFlight
eas submit --platform ios --latest

# Google Play (internal testing)
eas submit --platform android --latest
```

## Common Issues

### "Module not found" error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Expo cache
expo start --clear
```

### Camera permission denied

Check:
1. `app.json` has camera permissions
2. Device settings grant app camera access
3. Try on physical device vs emulator

### Lambda connection failed

```bash
# Test endpoint
curl -X POST https://your-endpoint.lambda-url.region.on.aws/ \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check endpoint in .env.local
echo $EXPO_PUBLIC_LAMBDA_ENDPOINT
```

### Video upload timeout

1. Check video file size
2. Increase Lambda timeout to 120s
3. Test with smaller video

### TypeScript errors

```bash
# Check all type errors
npx tsc --noEmit

# Fix TypeScript config
nano tsconfig.json
```

## Code Quality

### Linting

```bash
npm run lint

# Fix issues
npx expo lint --fix
```

### Formatting

```bash
# Using Prettier (optional)
npm install -D prettier
npx prettier --write .
```

## Publishing to GitHub

```bash
# Create .git if not present
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: FormCritic MVP"

# Push to GitHub
git remote add origin https://github.com/AresTriandos/form-critic-app.git
git branch -M main
git push -u origin main
```

## Resource Links

- [Expo Docs](https://docs.expo.dev)
- [React Native Docs](https://reactnative.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [VS Code Extensions](https://marketplace.visualstudio.com)

## Quick Commands Reference

```bash
# Start development
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Build Lambda function
cd lambda && npm run build

# Deploy Lambda (requires AWS CLI)
cd lambda && npm run deploy

# Check types
npx tsc --noEmit

# Lint code
npm run lint

# Reset project
npm run reset-project

# Clear cache
expo start --clear
```
