import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import Colors, { ColorScheme } from '@/constants/colors';

const THEME_KEY = 'readly_theme';

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const queryClient = useQueryClient();
  const systemColorScheme = useColorScheme();

  const themeQuery = useQuery({
    queryKey: ['theme'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      return stored as ColorScheme | null;
    },
  });

  const saveThemeM = useMutation({
    mutationFn: async (theme: ColorScheme | null) => {
      if (theme === null) {
        await AsyncStorage.removeItem(THEME_KEY);
      } else {
        await AsyncStorage.setItem(THEME_KEY, theme);
      }
      return theme;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme'] });
    },
  });
  const { mutate: saveTheme } = saveThemeM;

  const currentScheme: ColorScheme = useMemo(() => {
    if (themeQuery.data === null || themeQuery.data === undefined) {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeQuery.data;
  }, [themeQuery.data, systemColorScheme]);

  const colors = useMemo(() => Colors[currentScheme], [currentScheme]);

  const setTheme = useCallback((theme: ColorScheme | 'auto') => {
    if (theme === 'auto') {
      saveTheme(null);
    } else {
      saveTheme(theme);
    }
  }, [saveTheme]);

  const isDark = currentScheme === 'dark';

  return useMemo(() => ({
    colors,
    scheme: currentScheme,
    setTheme,
    isDark,
    isLoading: themeQuery.isLoading,
  }), [colors, currentScheme, setTheme, isDark, themeQuery.isLoading]);
});
