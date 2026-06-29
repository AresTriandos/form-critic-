import { TouchableOpacity, Text, StyleSheet, useColorScheme, ViewStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;

  const paddingMap = {
    sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg },
    md: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
    lg: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing['2xl'] },
  };

  const fontSizeMap = {
    sm: Typography.bodySmall,
    md: Typography.bodyMedium,
    lg: Typography.bodyLarge,
  };

  const buttonStyles: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    opacity: disabled ? 0.5 : 1,
    ...paddingMap[size],
  };

  const textStyles = {
    ...fontSizeMap[size],
    fontWeight: '600' as const,
  };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[
          buttonStyles,
          {
            backgroundColor: colors.primary,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={{ ...textStyles, color: '#FFFFFF' }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        style={[
          buttonStyles,
          {
            backgroundColor: colors.surfaceAlt,
            borderWidth: 1.5,
            borderColor: colors.primary,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {icon}
        <Text style={{ ...textStyles, color: colors.primary }}>{label}</Text>
      </TouchableOpacity>
    );
  }

  // Tertiary variant
  return (
    <TouchableOpacity
      style={[buttonStyles, { backgroundColor: 'transparent' }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
    >
      {icon}
      <Text style={{ ...textStyles, color: colors.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}
