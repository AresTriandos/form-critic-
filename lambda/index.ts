import Anthropic from '@anthropic-ai/sdk';

interface AnalysisPayload {
  frames?: string[]; // base64 encoded frames OR full video for backward compat
  video?: string; // base64 encoded video (legacy)
  videoSize?: number;
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

/**
 * Analyze exercise form using Claude Vision API
 * Accepts either frames (preferred) or video (legacy)
 */
async function analyzeForm(frames: string[]): Promise<Partial<AnalysisResponse>> {
  try {
    if (frames.length === 0) {
      throw new Error('No frames provided for analysis');
    }

    // Build the message with all frames
    const imageContent = frames.map((frame) => {
      // Remove data URL prefix if present
      const base64Data = frame.includes('base64,')
        ? frame.split('base64,')[1]
        : frame;

      return {
        type: 'image' as const,
        source: {
          type: 'base64' as const,
          media_type: 'image/jpeg' as const,
          data: base64Data,
        },
      };
    });

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
      model: 'claude-sonnet-4-6',
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
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze exercise form'
    );
  }
}

/**
 * Main Lambda handler
 */
export async function handler(event: any): Promise<any> {
  const startTime = Date.now();

  try {
    // Parse request body
    let payload: AnalysisPayload;

    if (typeof event.body === 'string') {
      payload = JSON.parse(event.body);
    } else {
      payload = event.body || event;
    }

    console.log('Received request');
    console.log('Has frames:', !!payload.frames);
    console.log('Has video:', !!payload.video);

    // Use frames if provided, otherwise return error
    const frames = payload.frames || [];
    if (frames.length === 0) {
      console.error('No frames provided in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No frames provided',
          hint: 'Send extracted frames from the app',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log(`Processing ${frames.length} frames for analysis...`);

    // Analyze form
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

    console.log('Analysis complete:', {
      exercise: response.exercise,
      score: response.score,
      processingTimeMs: processingTime,
    });

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
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      headers: { 'Content-Type': 'application/json' },
    };
  }
}
