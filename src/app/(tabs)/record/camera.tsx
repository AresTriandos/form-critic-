import { StyleSheet, View, TouchableOpacity, Text, useColorScheme, Alert, Linking } from 'react-native';
import { Camera, useCameraPermission } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';

export default function CameraScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef<Camera>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Request permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

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
      backgroundColor: isDark ? '#000' : '#fff',
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
        Alert.alert('Error', 'Camera not ready');
        return;
      }

      setIsRecording(true);
      setRecordingTime(0);

      const video = await (cameraRef.current as any).startRecording({
        onRecordingFinished: (video: any) => {
          console.log('Video recorded:', video.path);
          saveVideoLocally(video.path);
        },
        onRecordingError: (error: any) => {
          console.error('Recording error:', error);
          Alert.alert('Error', error?.message || 'Recording failed');
          setIsRecording(false);
        },
      });
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Error', error?.message || 'Failed to start recording');
      setIsRecording(false);
    }
  };

  const handleStopRecord = async () => {
    try {
      if (!cameraRef.current) return;
      await (cameraRef.current as any).stopRecording();
      setIsRecording(false);
    } catch (error: any) {
      console.error('Stop error:', error);
      setIsRecording(false);
    }
  };

  const saveVideoLocally = async (videoPath: string) => {
    try {
      const appDir = FileSystem.documentDirectory + 'FormCritic/';
      const dirInfo = await FileSystem.getInfoAsync(appDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(appDir, { intermediates: true });
      }

      const timestamp = Date.now();
      const filename = `workout_${timestamp}.mp4`;
      const newPath = appDir + filename;

      await FileSystem.copyAsync({
        from: videoPath,
        to: newPath,
      });

      router.push({
        pathname: '/record/processing',
        params: {
          videoUri: newPath,
          timestamp: timestamp.toString(),
        },
      });
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save video');
      setIsRecording(false);
    }
  };

  if (!hasPermission) {
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
      <Camera
        ref={cameraRef}
        style={styles.camera}
        isActive={true}
        video={true}
        audio={true}
      />

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
            onPress={isRecording ? handleStopRecord : handleStartRecord}
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
    </SafeAreaView>
  );
}
