import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { analyzeForm } from '@/services/analysis';

export default function VideoPreview() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const { 
    videoPath, 
    autoDetect: paramAutoDetect, 
    exerciseName: paramExerciseName,
    timestamp
  } = useLocalSearchParams<{ 
    videoPath: string;
    autoDetect?: string;
    exerciseName?: string;
    timestamp?: string;
  }>();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000' : '#fff',
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: isDark ? '#333' : '#e5e5e5',
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoContainer: {
      width: '100%',
      aspectRatio: 9 / 16,
      backgroundColor: '#000',
      borderRadius: 12,
      overflow: 'hidden',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    video: {
      flex: 1,
    },
    playOverlay: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoSection: {
      width: '100%',
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    infoLabel: {
      fontSize: 14,
      color: isDark ? '#aaa' : '#666',
      marginBottom: 8,
    },
    infoValue: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
      marginBottom: 16,
    },
    buttonGroup: {
      width: '100%',
      paddingHorizontal: 20,
      gap: 12,
    },
    submitButton: {
      backgroundColor: '#EF4444',
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    submitButtonDisabled: {
      backgroundColor: '#999',
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    retakeButton: {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDark ? '#555' : '#ddd',
    },
    retakeButtonText: {
      color: isDark ? '#fff' : '#000',
      fontSize: 14,
      fontWeight: '600',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
    },
  });

  if (!videoPath) {
    return (
      <SafeAreaView style={[styles.container]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: isDark ? '#fff' : '#000' }]}>No video found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const autoDetect = paramAutoDetect === 'false' ? false : true;
      const result = await analyzeForm(
        videoPath, 
        autoDetect ? undefined : paramExerciseName
      );
      
      router.push({
        pathname: '/gym/results' as any,
        params: {
          videoPath,
          exerciseName: autoDetect ? undefined : paramExerciseName,
          analysisResult: JSON.stringify(result),
        },
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze form. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Review Video</Text>
      </View>
      
      <View style={styles.content}>
        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={{ uri: videoPath }}
            style={styles.video}
            resizeMode={ResizeMode.COVER}
            isLooping={false}
            shouldPlay={false}
            useNativeControls={true}
            onPlaybackStatusUpdate={(status: any) => {
              if (status.isLoaded) {
                setIsPlaying(status.isPlaying);
              }
            }}
          />
        </View>

        {/* Exercise Info */}
        <View style={styles.infoSection}>
          {paramExerciseName ? (
            <>
              <Text style={styles.infoLabel}>Exercise</Text>
              <Text style={styles.infoValue}>{paramExerciseName}</Text>
            </>
          ) : (
            <>
              <Text style={styles.infoLabel}>Detection Mode</Text>
              <Text style={styles.infoValue}>Auto-Detect</Text>
            </>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.submitButton, isAnalyzing && styles.submitButtonDisabled]}
            onPress={handleSubmitAnalysis}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isAnalyzing ? 'Analyzing...' : 'Submit to Analyze'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            disabled={isAnalyzing}
            activeOpacity={0.8}
          >
            <Text style={styles.retakeButtonText}>Retake Video</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
