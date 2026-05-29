# FormCritic - Deployment Checklist

Complete this checklist to deploy FormCritic to TestFlight and App Stores.

## Pre-Deployment Setup

### 1. AWS Lambda Configuration

- [ ] **Create AWS Account**
  - Go to https://aws.amazon.com
  - Create account if needed
  - Set up billing

- [ ] **Create IAM User (Optional but Recommended)**
  - Go to IAM > Users > Create User
  - Attach "AWSLambdaFullAccess" policy
  - Create access keys for CLI
  - ```bash
    aws configure
    # Enter Access Key ID
    # Enter Secret Access Key
    # Region: us-east-1 (or your preferred region)
    ```

- [ ] **Create Lambda Function**
  ```bash
  # Using AWS Console or CLI:
  aws lambda create-function \
    --function-name form-critic-analyzer \
    --runtime nodejs18.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
    --handler index.handler \
    --timeout 120 \
    --memory-size 3008
  ```

- [ ] **Set Environment Variables**
  ```bash
  aws lambda update-function-configuration \
    --function-name form-critic-analyzer \
    --environment Variables="{ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE}"
  ```

- [ ] **Get Anthropic API Key**
  - Go to https://console.anthropic.com
  - Click "API Keys" in sidebar
  - Create new API key
  - Keep it secure (don't commit to git)

- [ ] **Deploy Lambda Code**
  ```bash
  cd lambda
  npm install
  npm run build
  
  # Create deployment package
  zip -r function.zip dist/ node_modules/
  
  # Upload to Lambda
  aws lambda update-function-code \
    --function-name form-critic-analyzer \
    --zip-file fileb://function.zip
  ```

- [ ] **Create Function URL**
  ```bash
  aws lambda create-function-url-config \
    --function-name form-critic-analyzer \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["POST"],"AllowHeaders":["Content-Type"]}'
  ```
  - Copy the returned function URL
  - Should look like: `https://xxxxx.lambda-url.region.on.aws/`

- [ ] **Test Lambda Function**
  ```bash
  # Create test video (or use sample)
  # Call the endpoint:
  curl -X POST https://your-lambda-url.lambda-url.region.on.aws/ \
    -H "Content-Type: application/json" \
    -d '{
      "video": "base64_video_data_here",
      "videoSize": 1000,
      "timestamp": "2024-05-29T12:00:00Z"
    }'
  # Should return analysis JSON
  ```

### 2. Configure React Native App

- [ ] **Update Environment Variables**
  ```bash
  cp .env.example .env.local
  
  # Edit .env.local:
  EXPO_PUBLIC_LAMBDA_ENDPOINT=https://your-lambda-url.lambda-url.region.on.aws/
  ```

- [ ] **Verify App Configuration**
  - Check `app.json`:
    - [ ] App name: "FormCritic"
    - [ ] App icon configured
    - [ ] Splash screen configured
    - [ ] Permissions set (camera, microphone)
    - [ ] Version updated (currently 1.0.0)

- [ ] **Install Dependencies**
  ```bash
  npm install
  ```

- [ ] **Test App Locally**
  ```bash
  # iOS (macOS only)
  npm run ios
  
  # Or Android
  npm run android
  
  # Or Web
  npm run web
  
  # Full checklist:
  # - [ ] Home screen loads
  # - [ ] Record button works
  # - [ ] Camera opens and records
  # - [ ] Video uploads to Lambda
  # - [ ] Results display correctly
  # - [ ] History saves workouts
  # - [ ] Dark mode works
  ```

## iOS Deployment (TestFlight)

### 3. Prepare for iOS Build

- [ ] **Install EAS CLI**
  ```bash
  npm install -g eas-cli
  ```

- [ ] **Login to Expo**
  ```bash
  eas login
  # Or create account at https://expo.dev
  ```

- [ ] **Configure EAS**
  ```bash
  eas build:configure
  # Choose iOS
  ```

- [ ] **Update app.json Version**
  ```json
  {
    "expo": {
      "version": "1.0.0",
      ...
    }
  }
  ```

- [ ] **Create Build Profile** (Edit `eas.json`)
  ```json
  {
    "build": {
      "preview": {
        "ios": {
          "buildType": "simulator",
          "simulator": true
        }
      },
      "preview-device": {
        "ios": {
          "buildType": "archive"
        }
      },
      "production": {
        "ios": {
          "buildType": "archive"
        }
      }
    },
    "submit": {
      "preview": {
        "ios": {
          "testflight": true
        }
      },
      "production": {
        "ios": {
          "testflight": true
        }
      }
    }
  }
  ```

### 4. Build for TestFlight

- [ ] **Create Adhoc Build (Simulator)**
  ```bash
  eas build --platform ios --profile preview
  # Downloads to device/simulator automatically
  ```

- [ ] **Or Create Archive Build (Device)**
  ```bash
  eas build --platform ios --profile preview-device
  # Builds archive for TestFlight submission
  ```

- [ ] **Wait for Build Completion**
  - EAS builds in the cloud
  - Typically 10-15 minutes
  - You'll receive email when done

### 5. Submit to TestFlight

- [ ] **Automatic Submission**
  ```bash
  eas submit --platform ios --latest
  # Automatically uploads latest build to TestFlight
  # Requires Apple Developer account ($99/year)
  ```

- [ ] **Or Manual Submission**
  - Download build from EAS
  - Use Xcode or Transporter to upload
  - Go to TestFlight in App Store Connect

- [ ] **Verify in App Store Connect**
  - Go to https://appstoreconnect.apple.com
  - Your App > TestFlight > iOS Builds
  - You should see your build

- [ ] **Add Testers**
  - In App Store Connect
  - Invite testers via email
  - Share TestFlight link
  - Testers can install via TestFlight app

## Android Deployment (Google Play)

### 6. Prepare for Android Build

- [ ] **Create Google Play Project**
  - Go to https://play.google.com/console
  - Create new app
  - Fill in app details
  - Create service account for EAS

- [ ] **Configure EAS for Android**
  ```bash
  # Update eas.json for Android builds
  ```

- [ ] **Build for Android**
  ```bash
  eas build --platform android --profile preview
  ```

- [ ] **Wait for Build**
  - Typically 10-20 minutes
  - Email notification when done

### 7. Submit to Google Play

- [ ] **Internal Testing Track**
  ```bash
  eas submit --platform android --latest
  ```

- [ ] **Or Manual Upload**
  - Download APK/AAB from EAS
  - Upload to Google Play Console
  - Go to Internal Testing track

- [ ] **Add Testers**
  - In Google Play Console
  - Create testing link
  - Share with testers
  - No app installation needed (direct link)

## Pre-Release Testing

### 8. Thorough Testing Checklist

**On TestFlight/Internal Testing:**

- [ ] **Install on real device**
  - [ ] iPhone (if iOS)
  - [ ] Android phone (if Android)

- [ ] **Basic Functionality**
  - [ ] App starts without crashes
  - [ ] Home screen displays correctly
  - [ ] Navigation between tabs works
  - [ ] Dark mode toggles properly

- [ ] **Recording Flow**
  - [ ] Camera permission prompt appears
  - [ ] Camera opens and shows preview
  - [ ] Can record 5-30 second video
  - [ ] Stop button saves video
  - [ ] Processing screen shows
  - [ ] Lambda is called successfully

- [ ] **Results Display**
  - [ ] Exercise name displays
  - [ ] Form score shows (0-100)
  - [ ] Score badge color correct
  - [ ] Feedback text displays fully
  - [ ] Key cues list shows 3-4 items
  - [ ] Save and New buttons work

- [ ] **History**
  - [ ] Results save to history
  - [ ] History screen shows all workouts
  - [ ] Results grouped by date
  - [ ] Newest first
  - [ ] Can record 10+ workouts

- [ ] **Edge Cases**
  - [ ] Record short video (< 3 sec)
  - [ ] Record long video (> 30 sec)
  - [ ] Network error during upload
  - [ ] Close app during processing
  - [ ] Low phone storage
  - [ ] Grant/deny camera permission

- [ ] **Performance**
  - [ ] App doesn't crash
  - [ ] No memory leaks
  - [ ] Videos upload within timeout
  - [ ] Smooth animations

- [ ] **UI/UX**
  - [ ] Text is readable
  - [ ] Buttons are tappable
  - [ ] Icons display correctly
  - [ ] Colors are appealing
  - [ ] Dark mode looks good

**Bug Reporting:**
- Document any issues found
- Create GitHub issues
- Fix critical bugs before release

## Production Release

### 9. Production Build & Submission

- [ ] **Update Version Number**
  ```json
  "version": "1.0.0"
  ```

- [ ] **Update Build Number** (in eas.json)
  - iOS: Increment buildNumber
  - Android: Increment versionCode

- [ ] **Create Production Build**
  ```bash
  # iOS
  eas build --platform ios --profile production
  
  # Android
  eas build --platform android --profile production
  ```

- [ ] **Submit to App Store/Play Store**
  ```bash
  # iOS (requires Apple account)
  eas submit --platform ios --latest
  
  # Android (requires Google account)
  eas submit --platform android --latest
  ```

- [ ] **Fill App Store Details**
  - [ ] Screenshots (6+ per platform)
  - [ ] App description
  - [ ] Keywords
  - [ ] Support URL
  - [ ] Privacy policy
  - [ ] Category/Rating
  - [ ] Demo video (optional)

- [ ] **Submit for Review**
  - [ ] All required fields filled
  - [ ] Screenshots meet guidelines
  - [ ] Content appropriate for rating
  - [ ] No test accounts in screenshots
  - [ ] Submit for review

- [ ] **Wait for Approval**
  - [ ] Apple: 1-3 days typically
  - [ ] Google: 2-4 hours typically
  - [ ] May be rejected - be ready to fix

### 10. Post-Release

- [ ] **Monitor Launch**
  - [ ] Check app store for approvals
  - [ ] Monitor crash reports
  - [ ] Check user reviews
  - [ ] Monitor Lambda logs

- [ ] **Gather Feedback**
  - [ ] Read reviews
  - [ ] Monitor support channels
  - [ ] Track performance metrics

- [ ] **Plan Next Release**
  - [ ] Log issues for next sprint
  - [ ] Plan feature enhancements
  - [ ] Budget for iteration

## Troubleshooting During Deployment

### Common Issues

**Lambda Function URL not working:**
```bash
# Test the endpoint
curl -X POST your-lambda-url \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Check Lambda logs
aws logs tail /aws/lambda/form-critic-analyzer --follow
```

**Build Fails:**
```bash
# Clear Expo cache
expo start --clear

# Rebuild
eas build --platform ios --profile preview --clear-cache
```

**Submission Rejected:**
- Read rejection reason carefully
- Fix issues
- Resubmit
- Apple/Google usually provide detailed feedback

**Crashes on Device:**
- Use device logs to debug
- Test more edge cases
- Consider updating libraries

## Success Criteria

Your deployment is successful when:

- ✅ App launches without crashes
- ✅ Video records and uploads
- ✅ Lambda returns analysis
- ✅ Results display correctly
- ✅ History saves workouts
- ✅ No critical bugs
- ✅ Good user reviews
- ✅ Low crash rate

## Post-Launch Monitoring

### Monitor These Metrics:

- **Crash Rate:** Should be < 0.1%
- **Session Length:** Average session duration
- **Retention:** Day 1, 7, 30 retention
- **Lambda Duration:** Average processing time
- **User Reviews:** Monitor star ratings

### Tools to Monitor:

- **iOS:** App Store Connect Analytics
- **Android:** Google Play Console Analytics
- **Lambda:** CloudWatch Logs & Metrics
- **API Monitoring:** Custom logging in Lambda

## Rollback Plan

If critical issues after launch:

```bash
# Build previous version
eas build --platform ios --profile production

# Submit previous version
eas submit --platform ios --latest

# Mark current as broken in app store
# Notify users of issue
```

## Success! 🎉

Once you reach this point:
- ✅ App is live on App Store/Play Store
- ✅ Users can download FormCritic
- ✅ Users can record exercises
- ✅ AI provides instant feedback
- ✅ Your MVP is shipped!

## Next Sprint Planning

**Ideas for Version 1.1:**
- Exercise library with videos
- Progress tracking dashboard
- Sharing results
- Multiple language support
- More exercise types

**Ideas for Version 2.0:**
- Cloud backup
- User accounts
- Advanced analytics
- Coach collaboration
- Wearable integration

---

**Questions?**
- Refer to guides: README.md, DEVELOPMENT.md, lambda/DEPLOYMENT.md
- Check GitHub Issues
- Contact support
