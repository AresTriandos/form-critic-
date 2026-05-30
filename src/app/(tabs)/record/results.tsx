import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';

interface AnalysisResult {
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
}

export default function ResultsScreen() {
  const { analysis: analysisStr } = useLocalSearchParams<{ analysis: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [savedMessage, setSavedMessage] = useState(false);

  const analysis: AnalysisResult = analysisStr
    ? JSON.parse(analysisStr)
    : {
        exercise: 'Unknown',
        score: 0,
        critique: 'No analysis available',
        keyCues: [],
        timestamp: new Date().toISOString(),
      };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
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
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 20,
    },
    exerciseCard: {
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      borderColor: isDark ? '#333' : '#e5e5e5',
      borderWidth: 1,
    },
    exerciseName: {
      fontSize: 28,
      fontWeight: '700',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 8,
    },
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    scoreLabel: {
      fontSize: 14,
      color: isDark ? '#aaaaaa' : '#888888',
    },
    score: {
      fontSize: 48,
      fontWeight: '700',
      color: analysis.score >= 80 ? '#4CAF50' : analysis.score >= 60 ? '#FF9800' : '#f44336',
    },
    scoreMax: {
      fontSize: 24,
      color: isDark ? '#aaaaaa' : '#888888',
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
    },
    critiqueText: {
      fontSize: 14,
      lineHeight: 22,
      color: isDark ? '#cccccc' : '#555555',
    },
    cueItem: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'flex-start',
    },
    cueBullet: {
      color: '#0a7ea4',
      marginRight: 12,
      fontSize: 16,
      marginTop: 2,
    },
    cueText: {
      fontSize: 14,
      color: isDark ? '#cccccc' : '#555555',
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    primaryButton: {
      backgroundColor: '#0a7ea4',
    },
    secondaryButton: {
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      borderColor: isDark ? '#555' : '#ddd',
      borderWidth: 1,
    },
    buttonText: {
      fontWeight: '600',
      fontSize: 14,
      marginLeft: 8,
    },
    primaryButtonText: {
      color: '#ffffff',
    },
    secondaryButtonText: {
      color: isDark ? '#ffffff' : '#000000',
    },
    savedMessage: {
      backgroundColor: '#4CAF50',
      color: '#ffffff',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    savedMessageText: {
      color: '#ffffff',
      marginLeft: 8,
      fontWeight: '600',
    },
  });

  const handleSave = async () => {
    try {
      // Get existing history from SecureStore
      const existingHistory = await SecureStore.getItemAsync('workout_history');
      const history = existingHistory ? JSON.parse(existingHistory) : [];

      // Add new result
      history.push({
        id: Date.now().toString(),
        ...analysis,
        savedAt: new Date().toISOString(),
      });

      // Save back to SecureStore
      await SecureStore.setItemAsync('workout_history', JSON.stringify(history));

      setSavedMessage(true);
      setTimeout(() => {
        router.push('/(tabs)');
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleNewRecording = () => {
    router.push('/(tabs)/record');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Form Score</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {savedMessage && (
          <View style={styles.savedMessage}>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.savedMessageText}>Saved to history!</Text>
          </View>
        )}

        <View style={styles.exerciseCard}>
          <Text style={styles.exerciseName}>{analysis.exercise}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{analysis.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feedback</Text>
          <Text style={styles.critiqueText}>{analysis.critique}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Points to Improve</Text>
          {analysis.keyCues.map((cue, idx) => (
            <View key={idx} style={styles.cueItem}>
              <Text style={styles.cueBullet}>•</Text>
              <Text style={styles.cueText}>{cue}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="save" size={18} color="#ffffff" />
          <Text style={[styles.buttonText, styles.primaryButtonText]}>
            Save Result
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleNewRecording}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color={isDark ? '#ffffff' : '#000000'} />
          <Text
            style={[
              styles.buttonText,
              isDark ? styles.primaryButtonText : styles.secondaryButtonText,
            ]}
          >
            New
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
