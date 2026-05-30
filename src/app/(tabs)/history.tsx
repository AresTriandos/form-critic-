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
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutResult | null>(null);

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
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? '#aaa' : '#888',
      textAlign: 'center',
    },
    resultCard: {
      marginHorizontal: 20,
      marginVertical: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
      marginBottom: 4,
    },
    resultMeta: {
      fontSize: 12,
      color: isDark ? '#aaa' : '#888',
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
      color: isDark ? '#aaa' : '#888',
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
    analysisSection: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    analysisSectionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: isDark ? '#fff' : '#000',
      marginBottom: 8,
    },
    critiqueText: {
      fontSize: 14,
      color: isDark ? '#fff' : '#000',
      lineHeight: 22,
      marginBottom: 12,
    },
    cueBadge: {
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: '#0a7ea4',
      marginBottom: 8,
    },
    cueText: {
      fontSize: 13,
      color: isDark ? '#fff' : '#000',
      fontWeight: '500',
    },
    closeButton: {
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
    },
    closeButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#fff' : '#000',
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return { box: 'rgba(76, 175, 80, 0.15)', text: '#4CAF50' };
    if (score >= 60) return { box: 'rgba(255, 152, 0, 0.15)', text: '#FF9800' };
    return { box: 'rgba(244, 67, 54, 0.15)', text: '#f44336' };
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      const history = await SecureStore.getItemAsync('workout_history');
      if (history) {
        const parsed = JSON.parse(history);
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

  const renderItem = ({ item }: { item: WorkoutResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => setSelectedWorkout(item)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.exerciseName}>{item.exercise}</Text>
        <Text style={styles.resultMeta}>
          Score: {item.score}/100 • {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
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
          <Text style={styles.emptyText}>
            No workouts yet. Start by recording an exercise!
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedResults}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ paddingVertical: 8 }}
        />
      )}

      {/* Analysis Modal */}
      <Modal
        visible={selectedWorkout !== null}
        animationType="slide"
        onRequestClose={() => setSelectedWorkout(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.analysisSection}>
              <Text style={styles.analysisSectionTitle}>
                {selectedWorkout?.exercise}
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '700', color: getScoreColor(selectedWorkout?.score || 0).text, marginBottom: 16 }}>
                Score: {selectedWorkout?.score}/100
              </Text>
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
                    {selectedWorkout.keyCues.map((cue, idx) => (
                      <View key={idx} style={styles.cueBadge}>
                        <Text style={styles.cueText}>{cue}</Text>
                      </View>
                    ))}
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
