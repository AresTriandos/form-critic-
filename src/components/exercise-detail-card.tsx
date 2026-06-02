import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Exercise, exerciseDB } from '@/services/exercisedb';

interface ExerciseDetailCardProps {
  exerciseName: string;
  aiCritique?: string;
  aiScore?: number;
  keyCues?: string[];
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    marginBottom: 4,
  },
  gifContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gif: {
    width: '100%',
    height: 200,
  },
  section: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionList: {
    marginLeft: 12,
  },
  instruction: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  aiSection: {
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  critiqueText: {
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 8,
  },
  cuesList: {
    marginTop: 8,
    paddingLeft: 12,
  },
  cue: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export function ExerciseDetailCard({
  exerciseName,
  aiCritique,
  aiScore,
  keyCues,
}: ExerciseDetailCardProps) {
  const { colors, isDark } = useTheme();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        const result = await exerciseDB.matchExerciseName(exerciseName);
        setExercise(result);
      } catch (error) {
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [exerciseName]);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.card },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!exercise) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card },
      ]}
    >
      <ScrollView>
        <View style={styles.content}>
          {/* Exercise Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              {exercise.name.charAt(0).toUpperCase() + exercise.name.slice(1)}
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Target: <Text style={{ fontWeight: '600' }}>{exercise.target}</Text>
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Equipment: <Text style={{ fontWeight: '600' }}>{exercise.equipment}</Text>
            </Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Body Part: <Text style={{ fontWeight: '600' }}>{exercise.bodyPart}</Text>
            </Text>
          </View>

          {/* Correct Form GIF */}
          {exercise.gifUrl && (
            <View style={styles.gifContainer}>
              <Image
                source={{ uri: exercise.gifUrl }}
                style={styles.gif}
                resizeMode="contain"
              />
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text },
                ]}
              >
                How to Perform
              </Text>
              <View style={styles.instructionList}>
                {exercise.instructions.map((instruction, index) => (
                  <Text
                    key={index}
                    style={[
                      styles.instruction,
                      { color: colors.text },
                    ]}
                  >
                    {index + 1}. {instruction}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* AI Analysis */}
          {aiScore !== undefined || aiCritique || keyCues ? (
            <View
              style={[
                styles.aiSection,
                {
                  backgroundColor: isDark ? '#2a2a2a' : '#f0f0f0',
                  borderColor: colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.primary },
                ]}
              >
                Your Form Analysis
              </Text>

              {aiScore !== undefined && (
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreLabel, { color: colors.text }]}>
                    Form Score:
                  </Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      {
                        color:
                          aiScore >= 80
                            ? '#4ade80'
                            : aiScore >= 60
                              ? '#facc15'
                              : '#ef4444',
                      },
                    ]}
                  >
                    {aiScore}/100
                  </Text>
                </View>
              )}

              {aiCritique && (
                <Text
                  style={[
                    styles.critiqueText,
                    { color: colors.text },
                  ]}
                >
                  {aiCritique}
                </Text>
              )}

              {keyCues && keyCues.length > 0 && (
                <View style={styles.cuesList}>
                  <Text
                    style={[
                      { fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 8 },
                    ]}
                  >
                    Key Improvements:
                  </Text>
                  {keyCues.map((cue, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.cue,
                        { color: colors.text },
                      ]}
                    >
                      • {cue}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
