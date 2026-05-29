import { StyleSheet, View, TouchableOpacity, Text, useColorScheme } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-symbols';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const cameraRef = useRef(null);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
    camera: {
      flex: 1,
    },
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
      paddingBottom: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    recordButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isRecording ? '#ff4444' : '#0a7ea4',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    timer: {
      fontSize: 16,
      fontWeight: '600',
      color: isRecording ? '#ff4444' : isDark ? '#cccccc' : '#666666',
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
    },
    permissionMessage: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    permissionText: {
      color: isDark ? '#cccccc' : '#666666',
      fontSize: 16,
      marginBottom: 16,
      textAlign: 'center',
    },
    permissionButton: {
      backgroundColor: '#0a7ea4',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
    },
    permissionButtonText: {
      color: '#ffffff',
      fontWeight: '600',
    },
  });

  if (!permission) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionMessage}>
          <Text style={styles.permissionText}>
            Camera access is required to record your exercise.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.permissionMessage}>
          <Text style={styles.permissionText}>
            Camera access is required. Please enable it in your device settings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleStartRecord = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        setRecordingTime(0);
        const video = await cameraRef.current.recordAsync();
        // Handle video recording completion
        handleVideoRecorded(video);
      } catch (error) {
        console.error('Recording error:', error);
        setIsRecording(false);
      }
    }
  };

  const handleStopRecord = async () => {
    if (cameraRef.current && isRecording) {
      try {
        cameraRef.current.stopRecording();
      } catch (error) {
        console.error('Stop recording error:', error);
      }
    }
  };

  const handleVideoRecorded = (video: any) => {
    setIsRecording(false);
    if (video && video.uri) {
      // Navigate to processing screen with video URI
      router.push({
        pathname: '/record/processing',
        params: { videoUri: video.uri },
      });
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
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recordButton}
              onPress={toggleRecording}
              activeOpacity={0.8}
            >
              {isRecording ? (
                <Ionicons name="stop" size={32} color="#ffffff" />
              ) : (
                <Ionicons name="record" size={32} color="#ffffff" />
              )}
            </TouchableOpacity>

            <View style={{ width: 80 }} />
          </View>

          {isRecording && (
            <Text style={styles.timer}>
              {Math.floor(recordingTime / 1000)}s
            </Text>
          )}
        </View>
      </CameraView>
    </SafeAreaView>
  );
}
