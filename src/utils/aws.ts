import * as FileSystem from 'expo-file-system';

interface AnalysisResult {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
}

// Configuration - Update these with your actual AWS Lambda endpoint
const LAMBDA_ENDPOINT = 'https://hevgy4dagmgawsrafitpkjahbq0ydunt.lambda-url.us-east-1.on.aws/';

/**
 * Upload video to Lambda for analysis
 * The Lambda function will:
 * - Receive the video file
 * - Extract frames
 * - Send to Claude Vision API
 * - Return form critique
 */
export async function uploadVideoAndAnalyze(videoUri: string): Promise<AnalysisResult> {
  try {
    // Read video file as base64
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    if (!fileInfo.exists) {
      throw new Error('Video file not found');
    }

    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Prepare the request payload
    const payload = {
      video: base64Video,
      videoSize: fileInfo.size,
      timestamp: new Date().toISOString(),
    };

    // Call Lambda function
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 120000, // 2 minute timeout for processing
    });

    if (!response.ok) {
      throw new Error(`Lambda returned status ${response.status}`);
    }

    const result = await response.json();

    // Validate response structure
    if (!result.exercise || result.score === undefined) {
      throw new Error('Invalid response format from Lambda');
    }

    return {
      exercise: result.exercise,
      score: Math.min(100, Math.max(0, result.score)), // Clamp between 0-100
      critique: result.critique || 'No feedback available',
      keyCues: Array.isArray(result.keyCues) ? result.keyCues : [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Upload/analysis error:', error);
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Failed to analyze video. Please check your connection and try again.'
    );
  }
}

/**
 * Test Lambda connectivity
 * Used for debugging configuration issues
 */
export async function testLambdaConnection(): Promise<boolean> {
  try {
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ test: true }),
    });
    return response.ok;
  } catch (error) {
    console.error('Lambda connection test failed:', error);
    return false;
  }
}
