import { uploadVideoAndAnalyze } from '@/utils/aws';

/**
 * Analyze form from video
 * @param videoPath - Path to video file (angle 1)
 * @param exerciseName - Optional exercise name. If undefined, auto-detects from video
 * @param videoPath2 - Optional path to second video (angle 2) for dual-angle analysis
 */
export async function analyzeForm(videoPath: string, exerciseName?: string, videoPath2?: string) {
  console.log('[Analysis] ===== FORM ANALYSIS START =====');
  console.log('[Analysis] Video path 1:', videoPath);
  if (videoPath2) console.log('[Analysis] Video path 2:', videoPath2);
  console.log('[Analysis] Mode:', exerciseName ? 'manual' : 'auto-detect');
  console.log('[Analysis] Exercise:', exerciseName);
  console.log('[Analysis] Dual-angle:', !!videoPath2);

  try {
    console.log('[Analysis] Calling uploadVideoAndAnalyze...');
    const result = await uploadVideoAndAnalyze(videoPath, exerciseName, videoPath2);
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
