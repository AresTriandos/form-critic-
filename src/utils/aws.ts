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
 * Upload video(s) to Lambda for analysis
 * Sends full video(s) to Gemini 2.0 for native video analysis
 * @param videoUri - Path to video file (angle 1)
 * @param exerciseName - Optional exercise name (if provided, uses manual mode; if undefined, uses auto-detect)
 * @param videoUri2 - Optional path to second video (angle 2) for dual-angle analysis
 */
export async function uploadVideoAndAnalyze(videoUri: string, exerciseName?: string, videoUri2?: string): Promise<AnalysisResult> {
  try {
    console.log('[AWS] Starting video analysis:', videoUri);
    if (videoUri2) console.log('[AWS] Secondary video:', videoUri2);

    // Verify file exists
    console.log('[AWS] Checking if video file exists...');
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    console.log('[AWS] File info:', fileInfo);
    
    if (!fileInfo.exists) {
      throw new Error(`Video file not found at: ${videoUri}`);
    }

    // Read video as base64
    console.log('[AWS] Reading video file...');
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64',
    });

    console.log('[AWS] Video 1 size:', base64Video.length, 'bytes');
    
    // Read second video if provided
    let base64Video2: string | undefined;
    if (videoUri2) {
      console.log('[AWS] Checking if second video file exists...');
      const fileInfo2 = await FileSystem.getInfoAsync(videoUri2);
      if (!fileInfo2.exists) {
        throw new Error(`Second video file not found at: ${videoUri2}`);
      }
      console.log('[AWS] Reading second video file...');
      base64Video2 = await FileSystem.readAsStringAsync(videoUri2, {
        encoding: 'base64',
      });
      console.log('[AWS] Video 2 size:', base64Video2.length, 'bytes');
    }

    // Prepare payload
    const payload: any = {
      video: base64Video,
      timestamp: new Date().toISOString(),
    };
    
    // Add second video if provided (dual-angle mode)
    if (base64Video2) {
      payload.video2 = base64Video2;
      payload.dualMode = true;
      console.log('[AWS] Using dual-angle mode');
    }
    
    // Add exercise name if manual mode
    if (exerciseName) {
      payload.exerciseName = exerciseName;
      console.log('[AWS] Using manual exercise mode:', exerciseName);
    } else {
      console.log('[AWS] Using auto-detect mode');
    }

    console.log('[AWS] Sending to Lambda at:', LAMBDA_ENDPOINT);
    console.log('[AWS] Payload size:', JSON.stringify(payload).length, 'chars');

    // Call Lambda function
    console.log('[AWS] Fetching...');
    const response = await fetch(LAMBDA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 180000, // 3 minutes for video processing
    } as any);

    console.log('[AWS] Lambda response status:', response.status);
    console.log('[AWS] Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AWS] Lambda error response:', response.status, errorText);
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
      score: Math.min(100, Math.max(0, result.score)),
      critique: result.critique || 'No feedback available',
      keyCues: Array.isArray(result.keyCues) ? result.keyCues : [],
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[AWS] Analysis error:', error);
    const msg = error?.message || String(error) || 'Unknown error';
    console.error('[AWS] Error details:', msg);
    throw new Error(
      error instanceof Error
        ? `${error.message}`
        : `Failed to analyze video: ${msg}`
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
        video: null,
        timestamp: new Date().toISOString(),
      }),
    } as any);

    console.log('[AWS] Lambda test response:', response.status);
    return response.status === 400; // 400 expected for null video
  } catch (error) {
    console.error('[AWS] Lambda connection test failed:', error);
    return false;
  }
}
