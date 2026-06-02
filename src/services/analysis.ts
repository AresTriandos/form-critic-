import { uploadVideoAndAnalyze } from '@/utils/aws';

/**
 * Analyze form from video
 * @param videoPath - Path to video file
 * @param exerciseName - Optional exercise name. If undefined, auto-detects from video
 */
export async function analyzeForm(videoPath: string, exerciseName?: string) {
  console.log('[Analysis] Starting form analysis:', {
    videoPath,
    mode: exerciseName ? 'manual' : 'auto-detect',
    exercise: exerciseName,
  });

  try {
    const result = await uploadVideoAndAnalyze(videoPath, exerciseName);
    console.log('[Analysis] Form analysis complete:', result);
    return result;
  } catch (error) {
    console.error('[Analysis] Form analysis failed:', error);
    throw error;
  }
}
