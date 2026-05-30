import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  SectionList,
  ActivityIndicator,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { VideoView } from 'expo-video';
import { Colors } from '@/constants/theme';

interface WorkoutResult {
  id: string;
  exercise: string;
  score: number;
  critique: string;
  keyCues: string[];
  timestamp: string;
  savedAt: string;
  videoUri?: string;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutResult | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomColor: colors.backgroundElement,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyIcon: {
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
    listContainer: {
      flex: 1,
    },
    resultCard: {
      marginHorizontal: 20,
      marginVertical: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      borderColor: colors.backgroundSelected,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    resultInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    resultMeta: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    scoreBox: {
      minWidth: 50,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 12,
    },
    scoreText: {
      fontSize: 16,
      fontWeight: '700',
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionHeaderText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'flex-end',
    },
    videoPlayer: {
      width: '100%',
      height: 280,
      backgroundColor: '#000',
    },
    playerControls: {
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderTopColor: colors.backgroundElement,
      borderTopWidth: 1,
    },
    speedControls: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 8,
    },
    speedButton: {
      flex: 1,
      paddingVertical: 10,
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    speedButtonActive: {
      borderColor: '#0a7ea4',
    },
    speedButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    speedButtonTextActive: {
      color: '#0a7ea4',
    },
    analysisSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    analysisSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    critiqueText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
      marginBottom: 12,
    },
    keysCuesList: {
      gap: 8,
    },
    cueBadge: {
      backgroundColor: colors.backgroundElement,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#0a7ea4',
    },
    cueText: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    closeButton: {
      backgroundColor: colors.backgroundElement,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    deleteButton: {
      padding: 8,
    },
  });

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await SecureStore.getItemAsync('workout_history');
      if (history) {
        const parsed = JSON.parse(history);
        // Sort by savedAt descending (newest first)
        const sorted = parsed.sort(
          (a: WorkoutResult, b: WorkoutResult) =>
            new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
        setResults(sorted);
      }
    } catch (err) {
      console.error('Load history error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(() => {
    loadHistory();
  });

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const groupedResults = results.reduce(
    (acc, result) => {
      const dateStr = formatDate(result.savedAt);
      const existing = acc.find((g) => g.title === dateStr);
      if (existing) {
        existing.data.push(result);
      } else {
        acc.push({ title: dateStr, data: [result] });
      }
      return acc;
    },
    [] as Array<{ title: string; data: WorkoutResult[] }>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </SafeAreaView>
    );
  }

  if (results.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="history" size={48} color={isDark ? '#555' : '#ccc'} />
          </View>
          <Text style={styles.emptyText}>
            No workouts recorded yet. Start by recording an exercise!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return { box: 'rgba(76, 175, 80, 0.15)', text: '#4CAF50' };
    if (score >= 60) return { box: 'rgba(255, 152, 0, 0.15)', text: '#FF9800' };
    return { box: 'rgba(244, 67, 54, 0.15)', text: '#f44336' };
  };

  const handleDeleteWorkout = (id: string) => {
    Alert.alert('Delete Workout', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = results.filter((r) => r.id !== id);
            setResults(updated);
            await SecureStore.setItemAsync('workout_history', JSON.stringify(updated));
          } catch (err) {
            console.error('Delete error:', err);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: WorkoutResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => setSelectedWorkout(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultInfo}>
        <Text style={styles.exerciseName}>{item.exercise}</Text>
        <Text style={styles.resultMeta}>
          Score: {item.score}/100 • {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
        {item.videoUri && (
          <Text style={[styles.resultMeta, { marginTop: 4, color: '#0a7ea4' }]}>
            📹 Video saved
          </Text>
        )}
      </View>
      <View
        style={[
          styles.scoreBox,
          { backgroundColor: getScoreColor(item.score).box },
        ]}
      >
        <Text style={[styles.scoreText, { color: getScoreColor(item.score).text }]}>
          {item.score}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteWorkout(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="history" size={48} color={colors.backgroundElement} />
          </View>
          <Text style={styles.emptyText}>
            No workouts recorded yet.{' '}
            <Text style={{ fontWeight: '700' }}>Start by recording an exercise!</Text>
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedResults}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Video Playback Modal */}
      <Modal
        visible={selectedWorkout !== null}
        animationType="slide"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            {selectedWorkout?.videoUri && (
              <VideoView
                source={{ uri: selectedWorkout.videoUri }}
                style={styles.videoPlayer}
                nativeControls
              />
            )}

            <View style={styles.playerControls}>
              <Text style={styles.analysisSectionTitle}>Playback Speed</Text>
              <View style={styles.speedControls}>
                {[0.5, 0.75, 1, 1.25, 1.5].map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      playbackSpeed === speed && styles.speedButtonActive,
                    ]}
                    onPress={() => setPlaybackSpeed(speed)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.speedButtonText,
                        playbackSpeed === speed &&
                          styles.speedButtonTextActive,
                      ]}
                    >
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedWorkout && (
              <>
                <View style={styles.analysisSection}>
                  <Text style={styles.analysisSectionTitle}>Analysis</Text>
                  <Text style={styles.critiqueText}>{selectedWorkout.critique}</Text>
                </View>

                {selectedWorkout.keyCues && selectedWorkout.keyCues.length > 0 && (
                  <View style={styles.analysisSection}>
                    <Text style={styles.analysisSectionTitle}>Key Improvement Cues</Text>
                    <View style={styles.keysCuesList}>
                      {selectedWorkout.keyCues.map((cue, idx) => (
                        <View key={idx} style={styles.cueBadge}>
                          <Text style={styles.cueText}>{cue}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            <View style={styles.analysisSection}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedWorkout(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
