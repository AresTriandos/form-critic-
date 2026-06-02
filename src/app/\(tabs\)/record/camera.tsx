import { StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export default function CameraScreen() {
  // Camera & recording state
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingRef = useRef(false);
  
  // Delayed start state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  
  // Navigation & theme
  const router = useRouter();
  const params = useLocalSearchParams<{ autoDetect?: string; exerciseName?: string }>();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Request permission on mount
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted]);

  // Recording timer
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

  // Countdown timer effect
  useEffect(() => {
    if (!isCountingDown) return;
    
    const interval = setInterval(() => {
      setCountdownSeconds((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setIsCountingDown(false);
          setShowDelayOptions(false);
          // Start actual recording
          handleStartRecord();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isCountingDown]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    camera: {
      flex: 1,
    },
    topControls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      paddingHorizontal: 20,
      zIndex: 10,
    },
    flipButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
    recordButtonText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: '700',
      fontFamily: 'Courier',
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
    // Countdown overlay
    countdownOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
    countdownText: {
      fontSize: 120,
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
    },
    // Delay options
    delayOptionsOverlay: {
      position: 'absolute',
      bottom: 140,
      left: 20,
      right: 20,
      backgroundColor: 'rgba(0,0,0,0.9)',
      borderRadius: 12,
      paddingVertical: 16,
      zIndex: 15,
    },
    delayLabel: {
      color: '#fff',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 12,
      fontWeight: '600',
    },
    delayOptionRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      gap: 12,
      paddingHorizontal: 12,
    },
    delayButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: '#0a7ea4',
      borderRadius: 8,
      alignItems: 'center',
    },
    delayButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    // Permissions
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
        Alert.alert('Error', 'Camera not initialized');
        return;
      }

      recordingRef.current = true;
      setIsRecording(true);
      setRecordingTime(0);

      const video = await cameraRef.current.recordAsync();
      
      if (!video?.uri) {
        throw new Error('recordAsync returned video with no URI');
      }

      recordingRef.current = false;
      setIsRecording(false);
      await saveVideoLocally(video.uri);
    } catch (error: any) {
      console.error('[RECORD] Error:', error);
      recordingRef.current = false;
      setIsRecording(false);
      Alert.alert('Recording Error', error?.message || 'Failed to record video');
    }
  };

  const handleStopRecord = async () => {
    try {
      if (!cameraRef.current) return;

      recordingRef.current = false;
      setIsRecording(false);
      await cameraRef.current.stopRecording();
    } catch (error: any) {
      console.error('[STOP] Error:', error);
      recordingRef.current = false;
      setIsRecording(false);
    }
  };

  const saveVideoLocally = async (videoPath: string) => {
    try {
      const appDir = FileSystemLegacy.documentDirectory + 'FormCritic/';
      
      const dirInfo = await FileSystemLegacy.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystemLegacy.makeDirectoryAsync(appDir, { intermediates: true });
      }

      const timestamp = Date.now();
      const filename = `workout_${timestamp}.mp4`;
      const newPath = appDir + filename;

      await FileSystemLegacy.copyAsync({
        from: videoPath,
        to: newPath,
      });

      router.push({
        pathname: '/(tabs)/record/processing',
        params: {
          videoUri: newPath,
          timestamp: timestamp.toString(),
          exerciseName: params.exerciseName || '',
        },
      });
    } catch (error: any) {
      console.error('[SAVE] Error:', error);
      Alert.alert('Error', 'Failed to save video: ' + (error?.message || 'Unknown error'));
    }
  };

  const handleStartWithDelay = (delay: 15 | 30) => {
    setCountdownSeconds(delay);
    setIsCountingDown(true);
    setShowDelayOptions(false);
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
        {/* Camera Flip Button (Feature 1) */}
        <View style={styles.topControls}>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="flip-camera-android" size={28} color="#ffffff" />
          </TouchableOpacity>
          <View />
        </View>

        {/* Countdown Overlay (Feature 2) */}
        {isCountingDown && (
          <View style={styles.countdownOverlay}>
            <Text style={styles.countdownText}>{countdownSeconds}</Text>
          </View>
        )}

        {/* Delay Options Menu (Feature 2) */}
        {showDelayOptions && !isRecording && (
          <View style={styles.delayOptionsOverlay}>
            <Text style={styles.delayLabel}>Choose delay before recording:</Text>
            <View style={styles.delayOptionRow}>
              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => handleStartWithDelay(15)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>15 sec</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.delayButton}
                onPress={() => handleStartWithDelay(30)}
                activeOpacity={0.8}
              >
                <Text style={styles.delayButtonText}>30 sec</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.overlay}>
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>

            {/* Record Button (Feature 3: Elapsed time display) */}
            <TouchableOpacity
              style={styles.recordButton}
              onPress={
                recordingRef.current
                  ? handleStopRecord
                  : () => setShowDelayOptions(true)
              }
              activeOpacity={0.8}
            >
              {recordingRef.current ? (
                <Text style={styles.recordButtonText}>
                  {String(Math.floor((recordingTime / 1000) / 60)).padStart(2, '0')}:
                  {String(Math.floor((recordingTime / 1000) % 60)).padStart(2, '0')}
                </Text>
              ) : (
                <Ionicons name="radio-button-on" size={40} color="#ffffff" />
              )}
            </TouchableOpacity>

            <View style={{ width: 80 }} />
          </View>

          {/* Timer label below button */}
          {recordingRef.current && (
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Recording</Text>
            </View>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
