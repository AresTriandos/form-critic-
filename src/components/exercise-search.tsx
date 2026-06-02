import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Exercise, exerciseDB } from '@/services/exercisedb';

interface ExerciseSearchProps {
  onSelect: (exercise: Exercise) => void;
  placeholder?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },
  exerciseItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  exerciseName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseMeta: {
    fontSize: 12,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
});

export function ExerciseSearch({
  onSelect,
  placeholder = 'Search exercises...',
}: ExerciseSearchProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(
    async (text: string) => {
      setQuery(text);
      
      if (text.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const exercises = await exerciseDB.searchByName(text);
        setResults(exercises.slice(0, 20)); // Limit to 20 results
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectExercise = (exercise: Exercise) => {
    onSelect(exercise);
    setQuery('');
    setResults([]);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.searchInput,
          {
            backgroundColor: colors.input,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={handleSearch}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          style={styles.listContainer}
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelectExercise(item)}
              style={[
                styles.exerciseItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[styles.exerciseName, { color: colors.text }]}
              >
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Text>
              <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]}>
                Target: {item.target} | Equipment: {item.equipment}
              </Text>
              <Text style={[styles.exerciseMeta, { color: colors.textSecondary }]}>
                Body Part: {item.bodyPart}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : query.length >= 2 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No exercises found
        </Text>
      ) : null}
    </View>
  );
}
