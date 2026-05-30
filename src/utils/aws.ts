import * as FileSystem from 'expo-file-system/legacy';
import { getThumbnail } from 'expo-video-thumbnails';

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
 * Extract a single frame from the video at the midpoint
 * Returns base64 encoded JPEG (much cheaper than full video)
 */
async function extractFrameFromVideo(videoUri: string): Promise<string> {
  try {
    console.log('[FRAME] Extracting thumbnail from video...');

    // Get file info to estimate duration
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log('[FRAME] Video size:', fileInfo.size, 'bytes');

    // Extract thumbnail at 0.5 second mark (early in the video)
    // This avoids the blank initial frame and gets good form data
    const thumbnail = await getThumbnail(videoUri, 500); // time in milliseconds

    console.log('[FRAME] Thumbnail extracted:', thumbnail.uri);

    // Read thumbnail as base64
    const base64Frame = await FileSystem.readAsStringAsync(thumbnail.uri, {
      encoding: 'base64',
    });

    console.log('[FRAME] Frame size:', base64Frame.length, 'bytes (', Math.round(base64Frame.length / 1024), 'KB)');

    return base64Frame;
  } catch (error: any) {
    console.error('[FRAME] Error extracting frame:', error);
    throw new Error(`Failed to extract frame: ${error?.message || error}`);
  }
}

/**
 * Upload video to Lambda for analysis
 * Extracts a single frame and sends that instead of full video
 * Much cheaper: ~500 tokens per frame vs ~2M tokens per video
 */
export async function uploadVideoAndAnalyze(videoUri: string): Promise<AnalysisResult> {
  try {
    console.log('[AWS] Starting analysis for video:', videoUri);

    // Extract a single frame from the video
    console.log('[AWS] Extracting frame from video...');
    const frameBase64 = await extractFrameFromVideo(videoUri);

    console.log('[AWS] Frame ready for analysis');

    // Prepare payload - send frame, not full video
    const payload = {
      frame: frameBase64, // Single JPEG frame
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
      timeout: 60000, // 60 seconds for analysis
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
        : 'Failed to analyze form. Please check your connection and try again.'
    );
  }
}

/**
 * Test Lambda connectivity
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
        frame: null,
        timestamp: new Date().toISOString(),
      }),
    } as any);

    console.log('[AWS] Lambda test response:', response.status);
    return response.status === 400; // 400 expected for null frame
  } catch (error) {
    console.error('[AWS] Lambda connection test failed:', error);
    return false;
  }
}
