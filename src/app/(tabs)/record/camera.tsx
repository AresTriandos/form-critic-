import { StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, Linking } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import { Colors } from '@/constants/theme';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const cameraRef = useRef(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  // Request permission on mount
  useEffect(() => {
    requestPermission().then((result) => {
      setPermissionRequested(true);
      if (!result.granted && result.canAskAgain) {
        Alert.alert(
          'Camera Access Required',
          'FormCritic needs access to your camera to record exercises.',
          [
            { text: 'Not now', onPress: () => router.back(), style: 'cancel' },
            { text: 'Allow', onPress: requestPermission, style: 'default' },
          ]
        );
      }
    });
  }, []);

  // Timer for recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 100);
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    camera: {
      flex: 1,
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
      backgroundColor: isRecording ? '#ff4444' : '#0a7ea4',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: isRecording ? '#ff4444' : '#0a7ea4',
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
      fontVariant: ['tabular-nums'],
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
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    permissionText: {
      color: colors.textSecondary,
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
      backgroundColor: colors.backgroundElement,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
    },
    buttonText: {
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 16,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 16,
    },
  });

  const openSettings = () => {
    Linking.openSettings();
  };

  // Loading permissions
  if (!permissionRequested) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionContainer}>
          <Ionicons
            name="camera"
            size={56}
            color="#0a7ea4"
            style={styles.permissionIcon}
          />
          <Text style={styles.permissionTitle}>Enable Camera</Text>
          <Text style={styles.permissionText}>
            FormCritic needs camera access to record and analyze your exercise form.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Permission denied
  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionContainer}>
          <Ionicons
            name="alert-circle"
            size={56}
            color="#ff6b6b"
            style={styles.permissionIcon}
          />
          <Text style={styles.permissionTitle}>Camera Access Denied</Text>
          <Text style={styles.permissionText}>
            To record exercises, please allow camera access in your device settings.
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

  const handleStartRecord = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setRecordingTime(0);
        (cameraRef.current as any).recordAsync({
          quality: '720p',
          maxDuration: 120,
        }).then((video: any) => {
          handleVideoRecorded(video);
        }).catch((error: any) => {
          console.error('Recording error:', error);
          setIsRecording(false);
        });
      } catch (error) {
        console.error('Recording start error:', error);
        setIsRecording(false);
      }
    }
  };

  const handleStopRecord = async () => {
    if (cameraRef.current && isRecording) {
      try {
        setIsRecording(false);
        const video = await (cameraRef.current as any).stopRecording();
        if (video) handleVideoRecorded(video);
      } catch (error) {
        console.error('Stop recording error:', error);
        setIsRecording(false);
      }
    }
  };

  const handleVideoRecorded = (video: any) => {
    setIsRecording(false);
    if (video && video.uri) {
      // Save video to phone storage
      saveVideoLocally(video.uri);
    }
  };

  const saveVideoLocally = async (videoUri: string) => {
    try {
      // Create app documents directory
      const appDir = FileSystem.documentDirectory + 'FormCritic/';
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      // Save with timestamp
      const timestamp = Date.now();
      const filename = `workout_${timestamp}.mp4`;
      const newPath = appDir + filename;

      await FileSystem.copyAsync({
        from: videoUri,
        to: newPath,
      });

      // Navigate to processing with local path
      router.push({
        pathname: '/record/processing',
        params: {
          videoUri: newPath,
          timestamp: timestamp.toString(),
        },
      });
    } catch (error) {
      console.error('Save video error:', error);
      Alert.alert('Error', 'Failed to save video. Please try again.');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      handleStopRecord();
    } else {
      handleStartRecord();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
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

            <TouchableOpacity
              style={styles.recordButton}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <Ionicons name="stop" size={40} color="#ffffff" />
              ) : (
                <Ionicons name="radio-button-on" size={40} color="#ffffff" />
              )}
            </TouchableOpacity>

            <View style={{ width: 80 }} />
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
