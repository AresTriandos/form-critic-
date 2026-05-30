import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisPayload {
  frame?: string; // base64 encoded JPEG frame (preferred)
  video?: string; // base64 encoded video (fallback)
  timestamp: string;
}

interface AnalysisResponse {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  processingTime: number;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

/**
 * Analyze exercise form using Google Gemini 2.0 Vision API
 * Accepts JPEG frames or MP4 videos for analysis
 */
async function analyzeFrame(dataBase64: string, isVideo: boolean = false): Promise<Partial<AnalysisResponse>> {
  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create the prompt
    const prompt = `You are an expert fitness coach analyzing exercise form from a video or photo.

Analyze the exercise shown and provide:

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

Only return the JSON, no other text.`;

    // Send to Gemini with frame or video
    const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
    console.log('Sending', mimeType, 'to Gemini for analysis...');
    const response = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: dataBase64,
        },
      },
      prompt,
    ]);

    const result = await response.response;
    const textContent = result.text();

    console.log('Gemini response received');

    // Parse the JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      let jsonStr = textContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      analysisData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('JSON parse error:', textContent);
      throw new Error('Failed to parse Gemini response as JSON');
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
    console.log('Has frame:', !!payload.frame);
    console.log('Has video:', !!payload.video);

    // Use frame if provided, otherwise try video
    const dataBase64 = payload.frame || payload.video;
    const dataType = payload.frame ? 'frame' : 'video';

    if (!dataBase64) {
      console.error('No frame or video provided in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No data provided',
          hint: 'Send either payload.frame (JPEG) or payload.video (MP4)',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log('Data type:', dataType, 'size:', dataBase64.length, 'bytes');

    // Analyze form (frame or fallback to video)
    const isVideo = dataType === 'video';
    const analysis = await analyzeFrame(dataBase64, isVideo);

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
      dataType: dataType,
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
