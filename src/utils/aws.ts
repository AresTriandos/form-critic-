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
 * Returns base64 encoded data + type indicator
 * Falls back to full video if thumbnail extraction not available
 */
async function extractFrameFromVideo(
  videoUri: string
): Promise<{ data: string; type: 'frame' | 'video' }> {
  try {
    console.log('[FRAME] Attempting to extract thumbnail from video...');

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log('[FRAME] Video size:', fileInfo.size, 'bytes');

    try {
      // Try to extract thumbnail at 0.5 second mark
      console.log('[FRAME] Using getThumbnail...');
      const thumbnail = await getThumbnail(videoUri, 500);
      console.log('[FRAME] Thumbnail extracted:', thumbnail.uri);

      // Read thumbnail as base64
      const base64Frame = await FileSystem.readAsStringAsync(thumbnail.uri, {
        encoding: 'base64',
      });

      console.log('[FRAME] Frame size:', base64Frame.length, 'bytes');
      return { data: base64Frame, type: 'frame' };
    } catch (thumbnailError) {
      console.warn('[FRAME] Thumbnail extraction failed, falling back to full video:', thumbnailError);

      // Fallback: Send full video if thumbnail extraction not available
      console.log('[FRAME] Sending full video as fallback...');
      const base64Video = await FileSystem.readAsStringAsync(videoUri, {
        encoding: 'base64',
      });
      console.log('[FRAME] Fallback video size:', base64Video.length, 'bytes');
      return { data: base64Video, type: 'video' };
    }
  } catch (error: any) {
    console.error('[FRAME] Critical error:', error);
    throw new Error(`Failed to extract frame: ${error?.message || error}`);
  }
}

/**
 * Upload video to Lambda for analysis
 * Extracts a single frame when possible, falls back to full video
 * Frame: ~500 tokens (~$0.0001)
 * Video: ~2M tokens (~$0.40)
 */
export async function uploadVideoAndAnalyze(videoUri: string): Promise<AnalysisResult> {
  try {
    console.log('[AWS] Starting analysis for video:', videoUri);

    // Extract frame (or fallback to video)
    console.log('[AWS] Extracting data from video...');
    const { data: base64Data, type } = await extractFrameFromVideo(videoUri);

    console.log('[AWS] Data type:', type, 'size:', base64Data.length, 'bytes');

    // Prepare payload with correct field name
    const payload: any = {
      timestamp: new Date().toISOString(),
    };

    if (type === 'frame') {
      payload.frame = base64Data;
    } else {
      payload.video = base64Data;
    }

    console.log('[AWS] Sending to Lambda as', type, '...');

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
