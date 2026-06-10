import { GoogleGenerativeAI } from '@google/generative-ai';

interface AnalysisPayload {
  video: string; // base64 encoded MP4 (angle 1)
  video2?: string; // Optional: base64 encoded MP4 (angle 2) for dual-angle analysis
  timestamp: string;
  dualMode?: boolean; // If true, analyzing two angles
  exerciseName?: string; // Optional: pre-identified exercise name
  exerciseInstructions?: string[]; // Optional: ExerciseDB instructions for context
  targetMuscle?: string; // Optional: target muscle group
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
 * Analyze exercise form using Google Gemini 2.5 Vision API
 * Gemini natively supports video analysis (updated 2026-06-02)
 * Optionally analyzes dual-angle videos for comprehensive form assessment
 * Optionally uses ExerciseDB context for improved analysis
 */
async function analyzeVideo(
  videoBase64: string,
  videoBase64_2?: string,
  exerciseName?: string,
  exerciseInstructions?: string[],
  targetMuscle?: string
): Promise<Partial<AnalysisResponse>> {
  try {
    console.log('Initializing Gemini model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Create the prompt with optional exercise context
    let prompt = `You are an expert fitness coach analyzing exercise form from video(s).

Analyze the exercise shown in ${videoBase64_2 ? 'these two videos (video1 = front/primary angle, video2 = side/alternative angle)' : 'this video'} and provide:

1. Exercise Name: Identify the specific exercise being performed
2. Form Score: Rate the form quality from 0-100 (100 = perfect form)
3. Detailed Critique: Provide 2-3 sentences of specific feedback on what they're doing well and what needs improvement
4. Key Cues: List 3-4 specific actionable improvements they should focus on`;
    
    if (videoBase64_2) {
      prompt += `\n\nIMPORTANT: You are analyzing TWO angles:\n- Video 1: Front or primary angle\n- Video 2: Side or alternative angle\n\nCompare both angles to identify form issues visible from each perspective and provide comprehensive feedback.`;
    }

    // Add exercise context if provided
    if (exerciseName) {
      prompt += `\n\nEXERCISE CONTEXT:\nThe user is performing: ${exerciseName}`;
    }

    if (targetMuscle) {
      prompt += `\nTarget Muscle Group: ${targetMuscle}\nFocus your critique on how well they're engaging and moving this muscle group.`;
    }

    if (exerciseInstructions && exerciseInstructions.length > 0) {
      prompt += `\n\nCORRECT FORM INSTRUCTIONS:\n`;
      exerciseInstructions.forEach((instruction, index) => {
        prompt += `${index + 1}. ${instruction}\n`;
      });
      prompt += `\nAnalyze their form against these instructions and provide specific feedback on whether they're following each step correctly.`;
    }

    prompt += `\n\nIMPORTANT: You must return a valid JSON response with this exact structure:
{
  "exercise": "Exercise Name",
  "score": 75,
  "critique": "Your detailed feedback here...",
  "keyCues": ["Cue 1", "Cue 2", "Cue 3"]
}

Only return the JSON, no other text.`;

    // Send to Gemini with video(s)
    console.log('Sending video(s) to Gemini for analysis...');
    const contentArray: any[] = [
      {
        inlineData: {
          mimeType: 'video/mp4',
          data: videoBase64,
        },
      },
    ];
    
    // Add second video if provided
    if (videoBase64_2) {
      contentArray.push({
        inlineData: {
          mimeType: 'video/mp4',
          data: videoBase64_2,
        },
      });
    }
    
    contentArray.push(prompt);
    
    const response = await model.generateContent(contentArray);

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
    console.log('Has video:', !!payload.video);

    if (!payload.video) {
      console.error('No video provided in payload');
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No video provided',
          hint: 'Send base64 encoded MP4 in payload.video',
        }),
        headers: { 'Content-Type': 'application/json' },
      };
    }

    console.log('Video 1 size:', payload.video.length, 'bytes');
    if (payload.video2) console.log('Video 2 size:', payload.video2.length, 'bytes');
    console.log('Dual mode:', payload.dualMode);

    // Analyze video(s) with optional exercise context
    const analysis = await analyzeVideo(
      payload.video,
      payload.video2,
      payload.exerciseName,
      payload.exerciseInstructions,
      payload.targetMuscle
    );

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
