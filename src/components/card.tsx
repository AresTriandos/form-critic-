import { View, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const paddingMap = {
    sm: Spacing.md,
    md: Spacing.lg,
    lg: Spacing.xl,
  };

  const cardStyles: ViewStyle = {
    borderRadius: BorderRadius.md,
    padding: paddingMap[padding],
    overflow: 'hidden',
  };

  if (variant === 'elevated') {
    return (
      <View
        style={[
          cardStyles,
          {
            backgroundColor: colors.surface,
            ...Shadows.md,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  if (variant === 'outlined') {
    return (
      <View
        style={[
          cardStyles,
          {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  // Default variant
  return (
    <View
      style={[
        cardStyles,
        {
          backgroundColor: colors.surfaceAlt,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
