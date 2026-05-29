import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

interface VideoPayload {
  video: string; // base64 encoded
  videoSize: number;
  timestamp: string;
}

interface AnalysisResponse {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  processingTime: number;
}

const client = new Anthropic();
const FRAMES_TO_EXTRACT = 6; // Extract 6 frames from the video for analysis

/**
 * Extract frames from a video file
 * Returns an array of frame data URIs
 */
async function extractFrames(videoPath: string): Promise<string[]> {
  const frameDir = '/tmp/frames';

  // Create frame directory
  if (!fs.existsSync(frameDir)) {
    fs.mkdirSync(frameDir, { recursive: true });
  }

  try {
    // Use ffmpeg to extract frames
    // This command extracts evenly spaced frames throughout the video
    const command = `ffmpeg -i "${videoPath}" -vf "fps=1/${Math.ceil(30 / FRAMES_TO_EXTRACT)}" -vframes ${FRAMES_TO_EXTRACT} "${frameDir}/frame_%03d.jpg" -y`;

    execSync(command, { stdio: 'ignore' });

    // Read frames and convert to base64
    const frames: string[] = [];
    for (let i = 1; i <= FRAMES_TO_EXTRACT; i++) {
      const framePath = path.join(frameDir, `frame_${String(i).padStart(3, '0')}.jpg`);
      if (fs.existsSync(framePath)) {
        const imageBuffer = fs.readFileSync(framePath);
        const base64 = imageBuffer.toString('base64');
        frames.push(`data:image/jpeg;base64,${base64}`);
      }
    }

    return frames;
  } catch (error) {
    console.error('Frame extraction error:', error);
    throw new Error('Failed to extract frames from video');
  }
}

/**
 * Analyze exercise form using Claude Vision API
 */
async function analyzeForm(frames: string[]): Promise<Partial<AnalysisResponse>> {
  try {
    // Build the message with all frames
    const imageContent = frames.map((frame) => ({
      type: 'image' as const,
      source: {
        type: 'base64' as const,
        media_type: 'image/jpeg' as const,
        data: frame.replace('data:image/jpeg;base64,', ''),
      },
    }));

    // Add text prompt
    imageContent.push({
      type: 'text' as const,
      text: `You are an expert fitness coach analyzing exercise form from video frames.

Analyze the exercise shown in these frames and provide:

1. Exercise Name: Identify the specific exercise being performed
2. Form Score: Rate the form quality from 0-100 (100 = perfect form)
3. Detailed Critique: Provide 2-3 sentences of specific feedback on what they're doing well and what needs improvement
4. Key Cues: List 3-4 specific actionable improvements they should focus on

IMPORTANT: You must return a valid JSON response with this exact structure:
{
  "exercise": "Exercise Name",
  "score": 75,
  "critique": "Your detailed feedback here...",
  "keyCues": ["Cue 1", "Cue 2", "Cue 3"]
}

Only return the JSON, no other text.`,
    });

    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: imageContent as any,
        },
      ],
    });

    // Extract text content
    const textContent = response.content.find((c) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse the JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      let jsonStr = textContent.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', textContent.text);
      throw new Error('Failed to parse Claude response as JSON');
    }

    return {
      exercise: analysisData.exercise || 'Unknown Exercise',
      score: Math.min(100, Math.max(0, analysisData.score || 50)),
      critique: analysisData.critique || 'Unable to provide feedback',
      keyCues: Array.isArray(analysisData.keyCues)
        ? analysisData.keyCues.slice(0, 5)
        : [],
    };
  } catch (error) {
    console.error('Analysis error:', error);
    throw new Error('Failed to analyze exercise form');
  }
}

/**
 * Main Lambda handler
 */
export async function handler(event: any): Promise<any> {
  const startTime = Date.now();

  try {
    // Parse request body
    let payload: VideoPayload;

    if (typeof event.body === 'string') {
      payload = JSON.parse(event.body);
    } else {
      payload = event.body || event;
    }

    if (!payload.video) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No video provided' }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    // Save video to temp file
    const videoPath = `/tmp/workout_${Date.now()}.mp4`;
    const videoBuffer = Buffer.from(payload.video, 'base64');
    fs.writeFileSync(videoPath, videoBuffer);

    console.log(`Received video: ${payload.videoSize} bytes`);

    // Extract frames from video
    console.log('Extracting frames...');
    const frames = await extractFrames(videoPath);

    if (frames.length === 0) {
      throw new Error('No frames extracted from video');
    }

    console.log(`Extracted ${frames.length} frames`);

    // Analyze form
    console.log('Analyzing form with Claude...');
    const analysis = await analyzeForm(frames);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    const response: AnalysisResponse = {
      exercise: analysis.exercise || 'Unknown',
      score: analysis.score || 50,
      critique: analysis.critique || 'Unable to analyze',
      keyCues: analysis.keyCues || [],
      processingTime,
    };

    // Clean up temp files
    try {
      fs.unlinkSync(videoPath);
      const frameDir = '/tmp/frames';
      if (fs.existsSync(frameDir)) {
        fs.rmSync(frameDir, { recursive: true, force: true });
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: { 'Content-Type': 'application/json' },
    };
  } catch (error) {
    console.error('Lambda error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to process video',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
