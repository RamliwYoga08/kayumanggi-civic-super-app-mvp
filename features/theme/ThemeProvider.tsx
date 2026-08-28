import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { AppTheme, darkTheme, lightTheme, ThemeMode } from '@/constants/theme';

const STORAGE_KEY = 'kayumanggi-theme';

type ThemeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ThemeMode>(() => Appearance.getColorScheme() === 'light' ? 'light' : 'dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setMode(saved);
    }).catch(() => undefined);
  }, []);

  const toggleTheme = () => {
    setMode((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
      return next;
    });
  };

  const value = useMemo(() => ({ mode, theme: mode === 'dark' ? darkTheme : lightTheme, toggleTheme }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
