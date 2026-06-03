import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, SafeAreaView, Image, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as VideoThumbnails from 'expo-video-thumbnails';
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
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);

  useEffect(() => {
    const generateThumbnail = async () => {
      if (!videoPath) return;
      try {
        console.log('[VideoPreview] Generating thumbnail from:', videoPath);
        const { uri } = await VideoThumbnails.getThumbnailAsync(videoPath, {
          time: 1000, // 1 second into video
        });
        console.log('[VideoPreview] Thumbnail generated:', uri);
        setThumbnailUri(uri);
      } catch (e) {
        console.error('[VideoPreview] Thumbnail error:', e);
        // Fallback: show placeholder
        setThumbnailUri(null);
      } finally {
        setThumbnailLoading(false);
      }
    };

    generateThumbnail();
  }, [videoPath]);

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 20,
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
    if (!videoPath) {
      Alert.alert('Error', 'Video path not found');
      return;
    }

    setIsAnalyzing(true);
    console.log('[VideoPreview] ===== ANALYSIS START =====');
    console.log('[VideoPreview] Video path:', videoPath);
    try {
      const autoDetect = paramAutoDetect === 'false' ? false : true;
      console.log('[VideoPreview] Exercise:', autoDetect ? 'auto-detect' : paramExerciseName);
      console.log('[VideoPreview] Calling analyzeForm...');
      
      const result = await analyzeForm(
        videoPath, 
        autoDetect ? undefined : paramExerciseName
      );
      
      console.log('[VideoPreview] Analysis result:', result);
      console.log('[VideoPreview] Navigation to /gym/results...');
      router.push({
        pathname: '/gym/results' as any,
        params: {
          videoPath,
          exerciseName: autoDetect ? undefined : paramExerciseName,
          analysis: JSON.stringify(result),  // FIXED: was 'analysisResult'
        },
      });
    } catch (error: any) {
      console.error('[VideoPreview] ===== ANALYSIS ERROR =====');
      console.error('[VideoPreview] Error object:', error);
      console.error('[VideoPreview] Error message:', error?.message);
      console.error('[VideoPreview] Error stack:', error?.stack);
      const errorMsg = error?.message || JSON.stringify(error) || 'Unknown error';
      Alert.alert('Analysis Failed', `${errorMsg}\n\nCheck console logs for details.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    router.back();
  };

  const handlePlayVideo = async () => {
    if (!videoPath) return;
    try {
      console.log('[VideoPreview] Opening video:', videoPath);
      const canOpen = await Linking.canOpenURL(`file://${videoPath}`);
      if (canOpen) {
        await Linking.openURL(`file://${videoPath}`);
      } else {
        Alert.alert('Cannot Open', 'Your device cannot open this video file');
      }
    } catch (error) {
      console.error('[VideoPreview] Error opening video:', error);
      Alert.alert('Error', 'Failed to open video player');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleRetake} style={{ marginRight: 'auto' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : '#000'} />
            <Text style={[styles.headerTitle, { marginLeft: 8, fontSize: 18 }]}>Back</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Video</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Video Thumbnail */}
        <View style={styles.videoContainer}>
          {thumbnailLoading ? (
            <View style={[styles.video, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
          ) : thumbnailUri ? (
            <Image 
              source={{ uri: thumbnailUri }} 
              style={styles.video}
              resizeMode="cover"
              onError={(e) => console.log('[VideoPreview] Image load error:', e)}
            />
          ) : (
            <View style={[styles.video, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a1a' }]}>
              <Ionicons name="videocam" size={60} color="#666" />
              <Text style={[styles.infoLabel, { color: '#aaa', marginTop: 12 }]}>Video Ready</Text>
            </View>
          )}
          <TouchableOpacity onPress={handlePlayVideo} style={styles.playOverlay}>
            <View style={styles.playButton}>
              <Ionicons name="play" size={32} color="#000" />
            </View>
            <Text style={[styles.infoLabel, { color: '#fff', marginTop: 16 }]}>Tap to play video</Text>
          </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
}
