export type ThemeMode = 'dark' | 'light';

export const darkTheme = {
  background: '#09090b',
  surface: '#09090b',
  surfaceElevated: '#18181b',
  surfaceHover: '#18181b',
  border: '#27272a',
  muted: '#27272a',
  mutedFg: '#a1a1aa',
  text: '#fafafa',
  textSecondary: '#d4d4d8',
  active: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#2D88FF',
  neutral: '#3A3B3C',
  purple: '#A855F7',
  indigo: '#6366F1',
  overlay: 'rgba(0,0,0,0.65)',
};

export const lightTheme = {
  background: '#f0f2f5',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  surfaceHover: '#f5f6f8',
  border: '#d4d4d8',
  muted: '#e4e4e7',
  mutedFg: '#71717a',
  text: '#18181b',
  textSecondary: '#3f3f46',
  active: '#059669',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#2D88FF',
  neutral: '#71717a',
  purple: '#9333EA',
  indigo: '#4F46E5',
  overlay: 'rgba(0,0,0,0.45)',
};

export type AppTheme = typeof darkTheme;
