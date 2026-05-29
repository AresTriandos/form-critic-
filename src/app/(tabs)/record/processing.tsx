import { StyleSheet, View, Text, useColorScheme, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { uploadVideoAndAnalyze } from '@/utils/aws';

interface AnalysisResult {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
}

export default function ProcessingScreen() {
  const { videoUri } = useLocalSearchParams<{ videoUri: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [error, setError] = useState<string | null>(null);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
    },
    spinner: {
      marginBottom: 24,
    },
    message: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
      textAlign: 'center',
    },
    subMessage: {
      fontSize: 14,
      color: isDark ? '#aaaaaa' : '#888888',
      textAlign: 'center',
    },
    errorMessage: {
      fontSize: 16,
      color: '#ff4444',
      marginBottom: 16,
      textAlign: 'center',
    },
  });

  useEffect(() => {
    const processVideo = async () => {
      if (!videoUri) {
        setError('No video recorded');
        return;
      }

      try {
        const result: AnalysisResult = await uploadVideoAndAnalyze(videoUri);
        // Navigate to results with the analysis data
        router.push({
          pathname: '/record/results',
          params: {
            analysis: JSON.stringify(result),
          },
        });
      } catch (err) {
        console.error('Processing error:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to process video. Please try again.'
        );
        // Auto-navigate back after delay
        setTimeout(() => {
          router.back();
        }, 3000);
      }
    };

    processVideo();
  }, [videoUri]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {!error ? (
          <>
            <View style={styles.spinner}>
              <ActivityIndicator size="large" color="#0a7ea4" />
            </View>
            <Text style={styles.message}>Analyzing Your Form</Text>
            <Text style={styles.subMessage}>
              This usually takes 10-15 seconds...
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.errorMessage}>{error}</Text>
            <Text style={styles.subMessage}>
              Returning to record screen...
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
