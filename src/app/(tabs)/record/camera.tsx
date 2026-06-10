import { StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystemLegacy from 'expo-file-system/legacy';

export default function CameraScreen() {
  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const [dualRecordingMode, setDualRecordingMode] = useState(false);
  const [recordingAngle, setRecordingAngle] = useState<1 | 2>(1);
  const [video1Path, setVideo1Path] = useState<string | null>(null);
  
  // Refs
  const cameraRef = useRef<CameraView>(null);
  const timerRef = useRef<any>(null);
  const countdownRef = useRef<any>(null);
  const recordingRef = useRef(false);
  
  // Router & Params
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const params = useLocalSearchParams<{ autoDetect?: string; exerciseName?: string }>();
  const isDark = colorScheme === 'dark';


  // Function declarations
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
      if (!video?.uri) throw new Error('Failed to record video');
      recordingRef.current = false;
      setIsRecording(false);
      const angleToUse = dualRecordingMode ? recordingAngle : undefined;
      await saveVideoLocally(video.uri, angleToUse);
    } catch (error: any) {
      recordingRef.current = false;
      setIsRecording(false);
      Alert.alert('Recording Error', error?.message || 'Failed to record');
    }
  };

  const handleStopRecord = async () => {
    try {
      if (cameraRef.current) {
        recordingRef.current = false;
        setIsRecording(false);
        await cameraRef.current.stopRecording();
      }
    } catch (error: any) {
      recordingRef.current = false;
      setIsRecording(false);
    }
  };

  const startDelayedRecord = (delaySeconds: number) => {
    setCountdownSeconds(delaySeconds);
    setCountdownActive(true);
  };

  const saveVideoLocally = async (videoPath: string, angleNum?: 1 | 2) => {
    try {
      console.log('[Camera] ===== SAVE VIDEO START =====');
      console.log('[Camera] Original video path:', videoPath);
      
      const docDir = FileSystemLegacy.documentDirectory;
      console.log('[Camera] Document directory:', docDir);
      
      if (!docDir) {
        throw new Error('Document directory is not available');
      }
      
      const appDir = docDir + 'FormCritic/';
      console.log('[Camera] App directory:', appDir);
      
      const dirInfo = await FileSystemLegacy.getInfoAsync(appDir);
      console.log('[Camera] Directory info:', dirInfo);
      
      if (!dirInfo.exists) {
        console.log('[Camera] Creating directory...');
        await FileSystemLegacy.makeDirectoryAsync(appDir, { intermediates: true });
      }
      
      const timestamp = Date.now();
      const angleStr = angleNum && dualRecordingMode ? `_angle${angleNum}` : '';
      const newPath = appDir + `workout_${timestamp}${angleStr}.mp4`;
      console.log('[Camera] New path:', newPath);
      console.log('[Camera] Dual mode:', dualRecordingMode, 'Angle:', angleNum);
      
      console.log('[Camera] Copying video from', videoPath, 'to', newPath);
      await FileSystemLegacy.copyAsync({ from: videoPath, to: newPath });
      console.log('[Camera] Copy complete');
      
      // Verify file exists
      const fileInfo = await FileSystemLegacy.getInfoAsync(newPath);
      console.log('[Camera] File saved - exists:', fileInfo.exists, 'size:', fileInfo.size);
      
      if (!fileInfo.exists) {
        throw new Error('File was not saved successfully');
      }
      
      console.log('[Camera] ===== SAVE SUCCESS =====');
      
      // Handle dual-recording mode
      if (dualRecordingMode && angleNum === 1) {
        // Saved angle 1, now store it and show prompt for angle 2
        console.log('[Camera] Angle 1 saved, prompting for angle 2...');
        setVideo1Path(newPath);
        setRecordingAngle(2);
        setShowDelayOptions(false); // Reset delay options for angle 2
        Alert.alert('Angle 1 Recorded', 'Now record angle 2 (side view or alternative angle)', [
          { text: 'Record Angle 2', onPress: () => console.log('Ready for angle 2') },
        ]);
      } else if (dualRecordingMode && angleNum === 2 && video1Path) {
        // Both videos recorded, navigate to preview with both
        console.log('[Camera] Both angles saved, navigating to preview...');
        router.push({
          pathname: '/gym/video-preview' as any,
          params: {
            autoDetect: params.autoDetect || 'true',
            exerciseName: params.exerciseName || '',
            videoPath1: video1Path,
            videoPath2: newPath,
            timestamp: timestamp.toString(),
            dualMode: 'true',
          },
        });
      } else {
        // Single recording mode
        console.log('[Camera] Single angle, navigating to preview...');
        router.push({
          pathname: '/gym/video-preview' as any,
          params: {
            autoDetect: params.autoDetect || 'true',
            exerciseName: params.exerciseName || '',
            videoPath: newPath,
            timestamp: timestamp.toString(),
          },
        });
      }
    } catch (error: any) {
      console.error('[Camera] ===== SAVE ERROR =====');
      console.error('[Camera] Error:', error);
      Alert.alert('Error', 'Failed to save video: ' + (error?.message || ''));
    }
  };

    // Request permission on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Countdown timer
  useEffect(() => {
    if (countdownActive && countdownSeconds > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdownSeconds((prev) => prev - 1);
      }, 1000);
    } else if (countdownActive && countdownSeconds === 0) {
      // @ts-ignore - function defined later in component
      setCountdownActive(false);
      setShowDelayOptions(false);
      handleStartRecord();
      // eslint-disable-next-line react-hooks/set-state-in-effect
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdownActive, countdownSeconds]);

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: isDark ? '#000' : '#fff' },
    camera: { flex: 1 },
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
    timerContainer: { alignItems: 'center', marginTop: 16 },
    timer: { fontSize: 18, fontWeight: '700', color: '#ff4444' },
    timerLabel: { fontSize: 12, color: '#ffffff', marginTop: 4 },
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
    countdownNumber: { fontSize: 120, fontWeight: '800', color: '#ff4444', lineHeight: 120 },
    countdownLabel: { fontSize: 18, color: '#ffffff', marginTop: 16, fontWeight: '600' },
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
    delayTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 16 },
    delayButton: {
      width: '100%',
      paddingVertical: 12,
      paddingHorizontal: 20,
      backgroundColor: '#0a7ea4',
      borderRadius: 8,
      alignItems: 'center',
    },
    delayButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    cancelButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8 },
    cancelText: { color: '#ffffff', marginLeft: 6, fontSize: 14, fontWeight: '500' },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    permissionIcon: { marginBottom: 24 },
    permissionTitle: { fontSize: 22, fontWeight: '700', color: isDark ? '#fff' : '#000', marginBottom: 12, textAlign: 'center' },
    permissionText: { color: isDark ? '#ccc' : '#666', fontSize: 16, marginBottom: 24, textAlign: 'center', lineHeight: 24 },
    buttonGroup: { width: '100%', gap: 12 },
    primaryButton: { backgroundColor: '#0a7ea4', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, alignItems: 'center' },
    secondaryButton: { backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: isDark ? '#333' : '#ddd' },
    buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    secondaryButtonText: { color: isDark ? '#fff' : '#000', fontWeight: '600', fontSize: 16 },
  });

    if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="alert-circle" size={56} color="#ff6b6b" style={styles.permissionIcon} />
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>FormCritic needs camera access to record your exercise form.</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openSettings()} activeOpacity={0.85}>
              <Text style={styles.buttonText}>Open Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing} mode="video" videoQuality="720p">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.flipButton} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')} disabled={false} activeOpacity={0.8}>
            <Ionicons name="camera-reverse-outline" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={{ color: '#ffffff', fontSize: 14, fontWeight: '600' }}>{facing === 'back' ? 'Back' : 'Front'}</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Countdown - only show if counting down, NOT recording */}
        {countdownActive && !isRecording && (
          <View style={styles.countdownOverlay}>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.countdownNumber}>{countdownSeconds}</Text>
              <Text style={styles.countdownLabel}>{countdownSeconds === 0 ? 'Starting...' : 'Get ready!'}</Text>
            </View>
          </View>
        )}

        {/* Delay Options */}
        {showDelayOptions && !countdownActive && !isRecording && (
          <View style={styles.delayOptionsOverlay}>
            <View style={styles.delayOptionsContainer}>
              <Text style={styles.delayTitle}>Start Recording In:</Text>
              <TouchableOpacity style={styles.delayButton} onPress={() => startDelayedRecord(5)} activeOpacity={0.8}>
                <Text style={styles.delayButtonText}>5 Seconds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.delayButton} onPress={() => startDelayedRecord(10)} activeOpacity={0.8}>
                <Text style={styles.delayButtonText}>10 Seconds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.delayButton} onPress={() => startDelayedRecord(15)} activeOpacity={0.8}>
                <Text style={styles.delayButtonText}>15 Seconds</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.delayButton} onPress={() => handleStartRecord()} activeOpacity={0.8}>
                <Text style={styles.delayButtonText}>Record Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.delayButton, { backgroundColor: '#666' }]} onPress={() => setShowDelayOptions(false)} activeOpacity={0.8}>
                <Text style={styles.delayButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Controls */}
        <View style={styles.overlay}>
          {/* Dual mode indicator */}
          {dualRecordingMode && (
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.4)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}>
                Angle {recordingAngle} of 2
              </Text>
            </View>
          )}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={false} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={24} color="#ffffff" />
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.recordButton} onPress={recordingRef.current ? handleStopRecord : () => setShowDelayOptions(true)} disabled={countdownActive} activeOpacity={0.8}>
              {recordingRef.current ? <Ionicons name="stop" size={40} color="#ffffff" /> : <Ionicons name="radio-button-on" size={40} color="#ffffff" />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: dualRecordingMode ? '#0a7ea4' : 'rgba(255, 255, 255, 0.2)' }]} 
              onPress={() => {
                setDualRecordingMode(!dualRecordingMode);
                setRecordingAngle(1);
                setVideo1Path(null);
              }}
              disabled={isRecording || countdownActive}
              activeOpacity={0.85}
            >
              <Ionicons name="duplicate" size={24} color="#ffffff" />
            </TouchableOpacity>
          </View>
          {isRecording && (
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
