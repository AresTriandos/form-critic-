# FormCritic Lambda Deployment Guide

This Lambda function analyzes exercise form using Claude Vision API.

## Prerequisites

- AWS Account with Lambda access
- Node.js 18+ installed locally
- AWS CLI configured
- Anthropic API key

## Setup

### 1. Install Dependencies

```bash
cd lambda
npm install
```

### 2. Build the Function

```bash
npm run build
```

This creates a `dist/index.js` file that Lambda can execute.

### 3. Create Lambda Function

#### Option A: Using AWS Console

1. Go to AWS Lambda console
2. Click "Create Function"
3. Choose "Author from scratch"
4. Configure:
   - Function name: `form-critic-analyzer`
   - Runtime: Node.js 18.x
   - Architecture: x86_64
5. Create a new role with basic Lambda execution permissions
6. Click Create

#### Option B: Using AWS CLI

```bash
aws lambda create-function \
  --function-name form-critic-analyzer \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 120 \
  --memory-size 3008
```

### 4. Configure Environment Variables

Set these Lambda environment variables:

- `ANTHROPIC_API_KEY`: Your Anthropic API key

```bash
aws lambda update-function-configuration \
  --function-name form-critic-analyzer \
  --environment Variables="{ANTHROPIC_API_KEY=sk-ant-...}"
```

### 5. Create Function URL

Enable a public HTTPS endpoint:

```bash
aws lambda create-function-url-config \
  --function-name form-critic-analyzer \
  --auth-type NONE \
  --cors '{"AllowOrigins":["*"],"AllowMethods":["POST"],"AllowHeaders":["Content-Type"]}'
```

This returns a URL like: `https://xxxxx.lambda-url.region.on.aws/`

### 6. Update React Native App

In `src/utils/aws.ts`, update:

```typescript
const LAMBDA_ENDPOINT = 'https://your-lambda-url.lambda-url.region.on.aws/';
```

## IAM Permissions

The Lambda execution role needs:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## Dependencies in Lambda

The Lambda function includes:
- `@anthropic-ai/sdk` - Claude API client
- `ffmpeg` (must be included in the deployment package or Lambda layer)

### FFmpeg Layer (Required)

The Lambda environment has ffmpeg, but if you need to add it as a layer:

1. Download ffmpeg binary for Lambda (x86_64)
2. Create a layer with structure: `opt/ffmpeg/bin/ffmpeg`
3. Attach the layer to your function

Or use a Lambda layer with ffmpeg pre-installed.

## Deployment

### Quick Deploy

```bash
npm run deploy
```

This requires AWS credentials configured and the function to already exist.

### Manual Deploy

```bash
# Build
npm run build

# Create deployment package
zip -r function.zip dist/ node_modules/

# Upload to Lambda
aws s3 cp function.zip s3://your-bucket/
aws lambda update-function-code \
  --function-name form-critic-analyzer \
  --s3-bucket your-bucket \
  --s3-key function.zip
```

## Testing

### Test with Sample Video

The Lambda function expects:

```json
{
  "video": "base64_encoded_video_data",
  "videoSize": 1024000,
  "timestamp": "2024-05-29T12:00:00Z"
}
```

### Local Testing

```bash
npm run build
node -e "const handler = require('./dist/index.js').handler; handler({body: {video: '...', videoSize: 1000, timestamp: new Date().toISOString()}}).then(console.log)"
```

## Monitoring

Monitor Lambda execution:

```bash
# View logs
aws logs tail /aws/lambda/form-critic-analyzer --follow

# Get metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=form-critic-analyzer \
  --start-time 2024-05-29T00:00:00Z \
  --end-time 2024-05-29T23:59:59Z \
  --period 3600 \
  --statistics Average,Maximum
```

## Costs

- Lambda invocations: $0.20 per 1M requests
- Lambda duration: $0.0000166667 per GB-second
- Anthropic Claude API: Based on input/output tokens

Typical analysis (6 frames, ~200KB):
- Lambda: ~$0.0001 per request
- Claude: ~$0.001-0.002 per request

## Troubleshooting

### FFmpeg not found

Add ffmpeg binary to deployment package or use a Lambda layer.

### Timeout

Increase Lambda timeout (currently 120 seconds):

```bash
aws lambda update-function-configuration \
  --function-name form-critic-analyzer \
  --timeout 300
```

### Memory issues

Increase memory (affects CPU allocation):

```bash
aws lambda update-function-configuration \
  --function-name form-critic-analyzer \
  --memory-size 3008
```

### API Key issues

Verify `ANTHROPIC_API_KEY` is set in environment variables, not hardcoded.

## Production Considerations

1. **API Key Management**: Use AWS Secrets Manager instead of environment variables
2. **Video Storage**: Store videos in S3 instead of base64 in request body
3. **Concurrency Limits**: Set reserved concurrency to limit costs
4. **Caching**: Consider caching frequent exercise analyses
5. **Error Handling**: Implement retry logic for API failures
6. **Logging**: Enhanced logging for debugging and monitoring

## Next Steps

1. Test with sample videos
2. Monitor performance and costs
3. Optimize frame extraction if needed
4. Consider batch processing for multiple videos
