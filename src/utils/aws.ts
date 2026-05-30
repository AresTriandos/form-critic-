import * as FileSystem from 'expo-file-system/legacy';
import { Video, AVPlaybackStatus } from 'expo-av';

interface AnalysisResult {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
}

// Configuration
const LAMBDA_ENDPOINT = 'https://hevgy4dagmgawsrafitpkjahbq0ydunt.lambda-url.us-east-1.on.aws/';
const FRAMES_TO_EXTRACT = 6; // Extract key frames from video

/**
 * Extract key frames from a video file
 * For now, we'll read the video file and create sample frames
 * In production, you'd use react-native-video-processing or similar
 */
async function extractFramesFromVideo(videoUri: string): Promise<string[]> {
  try {
    console.log('Reading video file for frame extraction...');
    
    // Read the video as base64 (this is the whole video currently)
    // In a real implementation, we'd extract actual frames from the video
    // For now, we'll send the video itself and let Claude analyze it
    const base64Video = await FileSystem.readAsStringAsync(videoUri, {
      encoding: 'base64',
    });

    // For MVP: Return the video as a single "frame" that Claude can analyze
    // Claude can handle video frames or we could split this into chunks
    console.log('Video loaded, size:', base64Video.length, 'bytes');
    
    return [base64Video]; // Return video as single frame for Claude to analyze
  } catch (error) {
    console.error('Frame extraction error:', error);
    throw new Error('Failed to extract frames from video');
  }
}

/**
 * Upload video to Lambda for analysis
 * The Lambda function will:
 * - Receive video frames
 * - Send to Claude Vision API
 * - Return form critique
 */
export async function uploadVideoAndAnalyze(videoUri: string): Promise<AnalysisResult> {
  try {
    console.log('[AWS] Starting analysis for video:', videoUri);

    // Extract frames from video
    console.log('[AWS] Extracting frames...');
    const frames = await extractFramesFromVideo(videoUri);
    console.log('[AWS] Extracted', frames.length, 'frames');

    if (frames.length === 0) {
      throw new Error('No frames extracted from video');
    }

    // Prepare the request payload with frames
    const payload = {
      frames: frames, // Send extracted frames
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
      timeout: 120000, // 2 minute timeout for processing
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
        frames: [],
        timestamp: new Date().toISOString(),
      }),
    } as any);
    
    console.log('[AWS] Lambda test response:', response.status);
    return response.status === 400; // 400 is expected for empty frames (better than 500)
  } catch (error) {
    console.error('[AWS] Lambda connection test failed:', error);
    return false;
  }
}
