import { View, Text, useColorScheme, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'accent';
  style?: ViewStyle;
}

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const variantMap = {
    primary: { bg: colors.primary, text: '#FFFFFF' },
    success: { bg: colors.success, text: '#FFFFFF' },
    warning: { bg: colors.warning, text: '#000000' },
    accent: { bg: colors.accent, text: '#FFFFFF' },
  };

  const { bg, text } = variantMap[variant];

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: BorderRadius.full,
          paddingVertical: Spacing.xs,
          paddingHorizontal: Spacing.md,
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
      <Text
        style={{
          ...Typography.labelSmall,
          color: text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
