import { View, Text, ScrollView, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Badge } from '@/components/badge';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';

const FEATURES = [
  {
    icon: 'flash',
    title: 'Instant Analysis',
    description: 'AI powered form feedback in seconds',
    color: 'success' as const,
  },
  {
    icon: 'stats-chart',
    title: 'Track Progress',
    description: 'Monitor your form improvements over time',
    color: 'accent' as const,
  },
  {
    icon: 'bulb',
    title: 'Smart Cues',
    description: 'Personalized coaching tips and hints',
    color: 'warning' as const,
  },
  {
    icon: 'shield-checkmark',
    title: 'Private Training',
    description: 'Your videos stay secure and local',
    color: 'primary' as const,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.xl,
          paddingBottom: Spacing['3xl'],
        }}
      >
        {/* Hero Section */}
        <View
          style={{
            marginBottom: Spacing['3xl'],
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: BorderRadius.xl,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: Spacing.xl,
            }}
          >
            <Ionicons name="eye" size={40} color="#FFFFFF" />
          </View>

          <Text
            style={{
              ...Typography.displaySmall,
              color: colors.text,
              marginBottom: Spacing.md,
              textAlign: 'center',
            }}
          >
            FormCritic
          </Text>

          <Text
            style={{
              ...Typography.bodyLarge,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: Spacing.xl,
              lineHeight: 24,
            }}
          >
            AI-powered form analysis for perfect workouts
          </Text>

          <Badge label="✨ Smart Analysis" variant="primary" />
        </View>

        {/* CTA Button */}
        <Button
          label="Start Recording"
          onPress={() => router.push('/record')}
          variant="primary"
          size="lg"
          icon={<Ionicons name="camera" size={20} color="#FFFFFF" />}
          style={{
            marginBottom: Spacing['2xl'],
          }}
        />

        {/* Features Grid */}
        <View
          style={{
            gap: Spacing.md,
            marginBottom: Spacing.xl,
          }}
        >
          <Text
            style={{
              ...Typography.headingSmall,
              color: colors.text,
              marginBottom: Spacing.md,
            }}
          >
            Why FormCritic?
          </Text>

          {FEATURES.map((feature, index) => (
            <Card
              key={index}
              variant="outlined"
              padding="md"
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: Spacing.lg,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.md,
                  backgroundColor:
                    feature.color === 'success'
                      ? colors.success
                      : feature.color === 'accent'
                        ? colors.accent
                        : feature.color === 'warning'
                          ? colors.warning
                          : colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color="#FFFFFF"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    ...Typography.labelLarge,
                    color: colors.text,
                    marginBottom: Spacing.xs,
                  }}
                >
                  {feature.title}
                </Text>
                <Text
                  style={{
                    ...Typography.bodySmall,
                    color: colors.textSecondary,
                    lineHeight: 18,
                  }}
                >
                  {feature.description}
                </Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Secondary CTA */}
        <Button
          label="View History"
          onPress={() => router.push('/history')}
          variant="secondary"
          size="md"
          icon={<Ionicons name="time" size={18} color={colors.primary} />}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
