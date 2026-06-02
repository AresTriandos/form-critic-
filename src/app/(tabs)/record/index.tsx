import { StyleSheet, View, Text, TouchableOpacity, useColorScheme, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function RecordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [useAutoDetect, setUseAutoDetect] = useState(true);
  const [exerciseName, setExerciseName] = useState('');

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
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingVertical: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    section: {
      marginBottom: 32,
      width: '100%',
      maxWidth: 350,
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 12,
    },
    toggleButton: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isDark ? '#333' : '#f0f0f0',
      borderWidth: 2,
      borderColor: isDark ? '#555' : '#ddd',
      alignItems: 'center',
      marginBottom: 8,
    },
    toggleActive: {
      backgroundColor: '#0a7ea4',
      borderColor: '#0a8ec0',
    },
    toggleText: {
      color: isDark ? '#ccc' : '#666',
      fontSize: 14,
      fontWeight: '500',
    },
    toggleTextActive: {
      color: '#ffffff',
    },
    input: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderWidth: 1,
      borderColor: isDark ? '#444' : '#ddd',
      color: isDark ? '#fff' : '#000',
      fontSize: 16,
    },
    inputDisabled: {
      opacity: 0.5,
    },
    largeButton: {
      backgroundColor: '#0a7ea4',
      width: 160,
      height: 160,
      borderRadius: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    hint: {
      fontSize: 14,
      color: isDark ? '#aaaaaa' : '#888888',
      textAlign: 'center',
      marginTop: 16,
      maxWidth: 280,
    },
  });

  const canStartRecording = useAutoDetect || exerciseName.trim().length > 0;

  const handleStartRecording = () => {
    router.push({
      pathname: '/(tabs)/record/camera',
      params: {
        autoDetect: useAutoDetect.toString(),
        exerciseName: useAutoDetect ? '' : exerciseName,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Record Exercise</Text>
      </View>
      <View style={styles.content}>
        {/* Exercise Detection Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Exercise Detection</Text>
          <TouchableOpacity
            style={[styles.toggleButton, useAutoDetect && styles.toggleActive]}
            onPress={() => setUseAutoDetect(true)}
          >
            <Text style={[styles.toggleText, useAutoDetect && styles.toggleTextActive]}>
              ✓ Auto-Detect
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !useAutoDetect && styles.toggleActive]}
            onPress={() => setUseAutoDetect(false)}
          >
            <Text style={[styles.toggleText, !useAutoDetect && styles.toggleTextActive]}>
              {!useAutoDetect ? '✓' : ''} Specify Exercise
            </Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Name Input (if not auto-detect) */}
        {!useAutoDetect && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Exercise Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., lat pulldown, squat, bench press"
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={exerciseName}
              onChangeText={setExerciseName}
            />
          </View>
        )}

        {/* Record Button */}
        <TouchableOpacity
          style={[styles.largeButton, !canStartRecording && styles.buttonDisabled]}
          onPress={handleStartRecording}
          activeOpacity={0.8}
          disabled={!canStartRecording}
        >
          <Ionicons name="videocam" size={60} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.hint}>
          {useAutoDetect ? 'AI will detect your exercise from the video' : `Recording as: ${exerciseName}`}
        </Text>
      </View>
    </SafeAreaView>
  );
}
