import * as FileSystem from 'expo-file-system/legacy';

interface AnalysisResult {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
}

// Configuration
const LAMBDA_ENDPOINT = 'https://hevgy4dagmgawsrafitpkjahbq0ydunt.lambda-url.us-east-1.on.aws/';

/**
 * Upload video to Lambda for analysis with Gemini 2.0
 * Gemini natively supports video, no frame extraction needed
 */
export async function uploadVideoAndAnalyze(videoUri: string): Promise<AnalysisResult> {
  try {
    console.log('[AWS] Starting analysis for video:', videoUri);

    // Read video as base64
    console.log('[AWS] Reading video file...');
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64',
    });

    console.log('[AWS] Video size:', base64Video.length, 'bytes');

    // Prepare payload - Gemini 2.0 handles video natively
    const payload = {
      video: base64Video, // Send full video to Gemini
      timestamp: new Date().toISOString(),
    };

    console.log('[AWS] Sending to Lambda...');

    // Call Lambda function
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 180000, // 3 minute timeout for video processing
    } as any);

    console.log('[AWS] Lambda response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AWS] Lambda error response:', errorText);
      throw new Error(`Lambda returned status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('[AWS] Analysis result:', result);

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
    console.error('[AWS] Upload/analysis error:', error);
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
    console.log('[AWS] Testing Lambda connection...');
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video: null,
        timestamp: new Date().toISOString(),
      }),
    } as any);

    console.log('[AWS] Lambda test response:', response.status);
    return response.status === 400; // 400 expected for null video (not a 500 error)
  } catch (error) {
    console.error('[AWS] Lambda connection test failed:', error);
    return false;
  }
}
