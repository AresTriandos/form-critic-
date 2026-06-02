import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { analyzeForm } from '@/services/analysis';

export default function ExerciseSelect() {
  const router = useRouter();
  const { videoPath } = useLocalSearchParams<{ videoPath: string }>();
  
  const [exerciseName, setExerciseName] = useState('');
  const [autoDetect, setAutoDetect] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  if (!videoPath) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>No video found</Text>
      </View>
    );
  }

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeForm(videoPath, autoDetect ? undefined : exerciseName);
      
      router.push({
        pathname: '/gym/results',
        params: {
          videoPath,
          exerciseName: autoDetect ? undefined : exerciseName,
          analysisResult: JSON.stringify(result),
        },
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>What exercise did you just do?</Text>
        
        {/* Auto-detect toggle */}
        <TouchableOpacity 
          style={[styles.toggleButton, autoDetect && styles.toggleActive]}
          onPress={() => setAutoDetect(!autoDetect)}
        >
          <Text style={[styles.toggleText, autoDetect && styles.toggleTextActive]}>
            {autoDetect ? '✓ Auto-detect' : 'Manual entry'}
          </Text>
        </TouchableOpacity>

        {/* Manual exercise input */}
        {!autoDetect && (
          <TextInput
            style={styles.input}
            placeholder="e.g., lat pulldown, squat, bench press"
            placeholderTextColor="#999"
            value={exerciseName}
            onChangeText={setExerciseName}
            editable={!isLoading}
          />
        )}

        {autoDetect && (
          <Text style={styles.autoDetectNote}>
            AI will detect the exercise from your video
          </Text>
        )}

        {/* Analyze button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={isLoading || (!autoDetect && !exerciseName.trim())}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Analyzing...' : 'Analyze Form'}
          </Text>
        </TouchableOpacity>

        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#6366F1',
  },
  toggleText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
    fontSize: 16,
  },
  autoDetectNote: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#ccc',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    fontSize: 16,
  },
});
