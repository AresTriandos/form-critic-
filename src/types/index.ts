/**
 * Type definitions for FormCritic app
 */

/**
 * Exercise form analysis result
 */
export interface AnalysisResult {
  exercise: string;
  score: number; // 0-100
  critique: string;
  keyCues: string[];
  timestamp: string;
  processingTime?: number; // milliseconds
}

/**
 * Workout result saved in history
 */
export interface WorkoutResult extends AnalysisResult {
  id: string;
  savedAt: string;
  videoUri?: string;
}

/**
 * Payload sent to Lambda
 */
export interface VideoAnalysisPayload {
  video: string; // base64 encoded
  videoSize: number; // bytes
  timestamp: string; // ISO string
}

/**
 * Lambda response format
 */
export interface LambdaAnalysisResponse {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  processingTime: number;
}

/**
 * App navigation params
 */
export type RootStackParamList = {
  '(tabs)': undefined;
  'record/index': undefined;
  'record/camera': undefined;
  'record/processing': {
    videoUri: string;
  };
  'record/results': {
    analysis: string; // JSON stringified AnalysisResult
  };
};

/**
 * Screen props type for navigation
 */
export type ScreenProps<T extends keyof RootStackParamList> = {
  route: {
    params: RootStackParamList[T];
  };
  navigation: any;
};

/**
 * App theme configuration
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    fontSize: {
      xs: number;
      sm: number;
      base: number;
      lg: number;
      xl: number;
      '2xl': number;
    };
    fontWeight: {
      light: '300' | 300;
      normal: '400' | 400;
      semibold: '600' | 600;
      bold: '700' | 700;
    };
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
};

/**
 * Camera recording state
 */
export type RecordingState = 'idle' | 'recording' | 'processing' | 'completed' | 'error';

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode: number;
}

/**
 * Firebase or cloud sync types (for future use)
 */
export interface SyncState {
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncError: string | null;
}

/**
 * App settings
 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  soundEnabled: boolean;
  hapticFeedback: boolean;
  autoSave: boolean;
  maxVideoLength: number; // seconds
}

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number; // milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
}
