import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ThemeProvider, useTheme } from '@/features/theme/ThemeProvider';
import { queryClient } from '@/lib/queryClient';

function RootStack() {
  const { mode } = useTheme();
  return <>
    <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false }} />
  </>;
}

export default function RootLayout() {
  return <QueryClientProvider client={queryClient}><ThemeProvider><AuthProvider><RootStack /></AuthProvider></ThemeProvider></QueryClientProvider>;
}
