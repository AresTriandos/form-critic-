import { StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const recordingRef = useRef(false);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const params = useLocalSearchParams<{ autoDetect?: string; exerciseName?: string }>();
  const isDark = colorScheme === 'dark';

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted]);

  // Timer for recording
  useEffect(() => {
    if (recordingRef.current) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 100);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdownActive && countdownSeconds > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    } else if (countdownActive && countdownSeconds === 0) {
      // Countdown finished, start recording
      setCountdownActive(false);
      setShowDelayOptions(false);
      handleStartRecord();
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdownActive, countdownSeconds]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    camera: {
      flex: 1,
    },
    header: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    flipButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingBottom: 24,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    recordButton: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: recordingRef.current ? '#ff4444' : '#0a7ea4',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: recordingRef.current ? '#ff4444' : '#0a7ea4',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    timerContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    timer: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ff4444',
    },
    timerLabel: {
      fontSize: 12,
      color: '#ffffff',
      marginTop: 4,
    },
    countdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    countdownDisplay: {
      alignItems: 'center',
    },
    countdownNumber: {
      fontSize: 120,
      fontWeight: '800',
      color: '#ff4444',
      lineHeight: 120,
    },
    countdownLabel: {
      fontSize: 18,
      color: '#ffffff',
      marginTop: 16,
      fontWeight: '600',
    },
    delayOptionsOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    delayOptionsContainer: {
      backgroundColor: '#1a1a1a',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      gap: 16,
    },
    delayTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 16,
    },
    delayButton: {
      width: '100%',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#0a7ea4',
      borderRadius: 8,
      alignItems: 'center',
    },
    delayButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cancelText: {
      color: '#ffffff',
      marginLeft: 6,
      fontSize: 14,
      fontWeight: '500',
    },
    permissionContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    permissionIcon: {
      marginBottom: 24,
    },
    permissionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
      marginBottom: 12,
      textAlign: 'center',
    },
    permissionText: {
      color: isDark ? '#ccc' : '#666',
      fontSize: 16,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 24,
    },
    buttonGroup: {
      width: '100%',
      gap: 12,
    },
    primaryButton: {
      backgroundColor: '#0a7ea4',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
    },
    secondaryButton: {
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#333' : '#ddd',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    secondaryButtonText: {
      color: isDark ? '#fff' : '#000',
      fontWeight: '600',
      fontSize: 16,
    },
  });

  const openSettings = () => {
    Linking.openSettings();
  };

  const handleStartRecord = async () => {
    try {
      if (!cameraRef.current) {
        console.error('Camera ref is null');
        Alert.alert('Error', 'Camera not initialized');
        return;
      }

      console.log('[RECORD] Starting video recording...');
      recordingRef.current = true;
      setIsRecording(true);
      setRecordingTime(0);

      const video = await cameraRef.current.recordAsync();
      
      if (!video) {
        console.error('[RECORD] No video object returned');
        throw new Error('recordAsync returned null');
      }

      if (!video.uri) {
        console.error('[RECORD] Video object has no URI');
        throw new Error('recordAsync returned video with no URI');
      }

      console.log('[RECORD] Recording stopped successfully');
      recordingRef.current = false;
      setIsRecording(false);
      await saveVideoLocally(video.uri);
    } catch (error: any) {
      console.error('[RECORD] Recording error:', error);
      recordingRef.current = false;
      setIsRecording(false);
      Alert.alert('Recording Error', error?.message || 'Failed to record video');
    }
  };

  const handleStopRecord = async () => {
    try {
      if (!cameraRef.current) {
        console.error('[STOP] Camera ref is null');
        return;
      }

      console.log('[STOP] Stopping recording...');
      recordingRef.current = false;
      setIsRecording(false);
      
      await cameraRef.current.stopRecording();
      console.log('[STOP] Recording stopped');
    } catch (error: any) {
      console.error('[STOP] Error:', error);
      recordingRef.current = false;
      setIsRecording(false);
    }
  };

  const startDelayedRecord = (delaySeconds: number) => {
    setCountdownSeconds(delaySeconds);
    setCountdownActive(true);
  };

  const saveVideoLocally = async (videoPath: string) => {
    try {
      console.log('[SAVE] Saving video from:', videoPath);
      
      const appDir = FileSystemLegacy.documentDirectory + 'FormCritic/';
      console.log('[SAVE] Target directory:', appDir);
      
      const dirInfo = await FileSystemLegacy.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        console.log('[SAVE] Creating directory...');
        await FileSystemLegacy.makeDirectoryAsync(appDir, { intermediates: true });
      }

      const timestamp = Date.now();
      const filename = `workout_${timestamp}.mp4`;
      const newPath = appDir + filename;

      console.log('[SAVE] Copying to:', newPath);
      await FileSystemLegacy.copyAsync({
        from: videoPath,
        to: newPath,
      });

      console.log('[SAVE] Video saved successfully');

      router.push({
        pathname: '/gym/video-preview' as any,
        params: {
          autoDetect: params.autoDetect || 'true',
          exerciseName: params.exerciseName || '',
          videoPath: newPath,
          timestamp: timestamp.toString(),
        },
      });
    } catch (error: any) {
      console.error('[SAVE] Error:', error);
      Alert.alert('Error', 'Failed to save video: ' + (error?.message || 'Unknown error'));
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="alert-circle" size={56} color="#ff6b6b" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>
            FormCritic needs camera access to record your exercise form.
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openSettings}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        mode="video"
        videoQuality="720p"
      >
        {/* Header with Camera Flip Button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            activeOpacity={0.8}
            disabled={isRecording || countdownActive}
          >
            <Ionicons name="camera-reverse-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>
            {facing === 'back' ? 'Back' : 'Front'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Countdown Overlay */}
        {countdownActive && (
          <View style={styles.countdownOverlay}>
            <View style={styles.countdownDisplay}>
              <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
              <Text style={styles.countdownLabel}>
                {countdownSeconds === 0 ? 'Recording...' : 'Get ready!'}
              </Text>
            </View>
          </View>
        )}

        {/* Delay Options Modal */}
        {showDelayOptions && !countdownActive && !isRecording && (
          <View style={styles.delayOptionsOverlay}>
            <View style={styles.delayOptionsContainer}>
              <Text style={styles.delayTitle}>Start Recording In:</Text>
              
              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => startDelayedRecord(5)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>5 Seconds</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => startDelayedRecord(10)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>10 Seconds</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => startDelayedRecord(15)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>15 Seconds</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => handleStartRecord()}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>Record Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.delayButton, { backgroundColor: '#666' }]}
                onPress={() => setShowDelayOptions(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Controls Overlay */}
        <View style={styles.overlay}>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.85}
              disabled={isRecording || countdownActive}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recordButton}
              onPress={
                recordingRef.current 
                  ? handleStopRecord 
                  : () => setShowDelayOptions(true)
              }
              activeOpacity={0.8}
              disabled={countdownActive}
            >
              {recordingRef.current ? (
                <Ionicons name="stop" size={40} color="#ffffff" />
              ) : (
                <Ionicons name="radio-button-on" size={40} color="#ffffff" />
              )}
            </TouchableOpacity>

            <View style={{ width: 80 }} />
          </View>

          {/* Recording Timer Display */}
          {recordingRef.current && (
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>
                {String(Math.floor((recordingTime / 1000) / 60)).padStart(2, '0')}:
                {String(Math.floor((recordingTime / 1000) % 60)).padStart(2, '0')}
              </Text>
              <Text style={styles.timerLabel}>Recording</Text>
            </View>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
