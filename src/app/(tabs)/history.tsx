import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  FlatList,
  SectionList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-symbols';
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
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [results, setResults] = useState<WorkoutResult[]>([]);
  const [loading, setLoading] = useState(true);

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
      color: isDark ? '#aaaaaa' : '#888888',
      textAlign: 'center',
    },
    listContainer: {
      flex: 1,
    },
    resultCard: {
      marginHorizontal: 20,
      marginVertical: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: isDark ? '#2a2a2a' : '#f9f9f9',
      borderRadius: 12,
      borderColor: isDark ? '#333' : '#e5e5e5',
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    resultInfo: {
      flex: 1,
    },
    exerciseName: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#ffffff' : '#000000',
      marginBottom: 4,
    },
    resultMeta: {
      fontSize: 12,
      color: isDark ? '#aaaaaa' : '#888888',
    },
    scoreBox: {
      minWidth: 50,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor:
        (results[0] as any)?.score >= 80
          ? 'rgba(76, 175, 80, 0.2)'
          : (results[0] as any)?.score >= 60
            ? 'rgba(255, 152, 0, 0.2)'
            : 'rgba(244, 67, 54, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scoreText: {
      fontSize: 14,
      fontWeight: '700',
      color:
        (results[0] as any)?.score >= 80
          ? '#4CAF50'
          : (results[0] as any)?.score >= 60
            ? '#FF9800'
            : '#f44336',
    },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 8,
    },
    sectionHeaderText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#aaaaaa' : '#888888',
      textTransform: 'uppercase',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
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

  const renderItem = ({ item }: { item: WorkoutResult }) => (
    <View style={styles.resultCard}>
      <View style={styles.resultInfo}>
        <Text style={styles.exerciseName}>{item.exercise}</Text>
        <Text style={styles.resultMeta}>
          Score: {item.score}/100 • {new Date(item.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{item.score}</Text>
      </View>
    </View>
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
      <SectionList
        sections={groupedResults}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}
