/**
 * FormCritic Design System
 * Modern, athletic aesthetic with energetic accents
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary brand
    primary: '#0F7EA8',      // Deep athletic blue
    primaryLight: '#1B9BC8', // Bright action blue
    
    // Accents
    accent: '#FF6B35',       // Energy orange
    success: '#00D084',      // Vital green
    warning: '#FFA500',      // Alert amber
    
    // Neutrals
    text: '#1a1a1a',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    
    // Backgrounds
    background: '#FAFAFA',   // Off-white for freshness
    surface: '#FFFFFF',      // Cards, surfaces
    surfaceAlt: '#F3F4F6',   // Secondary surfaces
    overlay: '#00000080',
    
    // Borders
    border: '#E5E7EB',
    borderLight: '#F0F1F3',
  },
  dark: {
    // Primary brand
    primary: '#2EBBDD',      // Bright blue for dark mode
    primaryLight: '#4CC9E8', // Lighter blue
    
    // Accents
    accent: '#FF8C5A',       // Warmer orange
    success: '#10B981',      // Green
    warning: '#FBBF24',      // Amber
    
    // Neutrals
    text: '#F3F4F6',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    
    // Backgrounds
    background: '#0F172A',   // Deep navy
    surface: '#1E293B',      // Slightly lighter navy
    surfaceAlt: '#334155',   // Slate accent
    overlay: '#00000099',
    
    // Borders
    border: '#475569',
    borderLight: '#334155',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
} as const;

export const Typography = {
  displayLarge: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  displaySmall: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
  },
  headingLarge: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
  },
  headingSmall: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  labelSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
