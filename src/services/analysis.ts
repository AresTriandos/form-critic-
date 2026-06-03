import { uploadVideoAndAnalyze } from '@/utils/aws';

/**
 * Analyze form from video
 * @param videoPath - Path to video file
 * @param exerciseName - Optional exercise name. If undefined, auto-detects from video
 */
export async function analyzeForm(videoPath: string, exerciseName?: string) {
  console.log('[Analysis] ===== FORM ANALYSIS START =====');
  console.log('[Analysis] Video path:', videoPath);
  console.log('[Analysis] Mode:', exerciseName ? 'manual' : 'auto-detect');
  console.log('[Analysis] Exercise:', exerciseName);

  try {
    console.log('[Analysis] Calling uploadVideoAndAnalyze...');
    const result = await uploadVideoAndAnalyze(videoPath, exerciseName);
    console.log('[Analysis] ===== ANALYSIS SUCCESS =====');
    console.log('[Analysis] Result:', result);
    return result;
  } catch (error: any) {
    console.error('[Analysis] ===== ANALYSIS FAILED =====');
    console.error('[Analysis] Error:', error);
    console.error('[Analysis] Message:', error?.message);
    console.error('[Analysis] Stack:', error?.stack);
    throw error;
  }
}
