import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';

const SETTINGS_KEY = 'readly_settings';

export interface AppSettings {
  notifications: {
    enabled: boolean;
    readingReminders: boolean;
    goalReminders: boolean;
    streakReminders: boolean;
    achievements: boolean;
    reminderTime: string;
  };
  reading: {
    defaultGoal: number;
    autoTracking: boolean;
    showPageCount: boolean;
    showProgressPercentage: boolean;
  };
  privacy: {
    shareStats: boolean;
    showProfile: boolean;
    allowAnalytics: boolean;
  };
  general: {
    language: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    soundEffects: boolean;
    haptics: boolean;
  };
}

const defaultSettings: AppSettings = {
  notifications: {
    enabled: true,
    readingReminders: true,
    goalReminders: true,
    streakReminders: true,
    achievements: true,
    reminderTime: '20:00',
  },
  reading: {
    defaultGoal: 30,
    autoTracking: false,
    showPageCount: true,
    showProgressPercentage: true,
  },
  privacy: {
    shareStats: true,
    showProfile: true,
    allowAnalytics: true,
  },
  general: {
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    soundEffects: true,
    haptics: true,
  },
};

export const [SettingsProvider, useSettings] = createContextHook(() => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        console.log('Settings loaded from storage');
        return JSON.parse(stored) as AppSettings;
      }
      console.log('Using default settings');
      return defaultSettings;
    },
  });

  const saveSettingsM = useMutation({
    mutationFn: async (settings: AppSettings) => {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      console.log('Settings saved successfully');
      return settings;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['appSettings'], data);
      console.log('Settings cache updated');
    },
  });
  const { mutate: saveSettings } = saveSettingsM;

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    const currentSettings = settingsQuery.data;
    if (!currentSettings) return;

    const updatedSettings: AppSettings = {
      ...currentSettings,
      ...updates,
      notifications: {
        ...currentSettings.notifications,
        ...(updates.notifications || {}),
      },
      reading: {
        ...currentSettings.reading,
        ...(updates.reading || {}),
      },
      privacy: {
        ...currentSettings.privacy,
        ...(updates.privacy || {}),
      },
      general: {
        ...currentSettings.general,
        ...(updates.general || {}),
      },
    };
    saveSettings(updatedSettings);
  }, [settingsQuery.data, saveSettings]);

  const resetSettings = useCallback(() => {
    saveSettings(defaultSettings);
  }, [saveSettings]);

  return useMemo(() => ({
    settings: settingsQuery.data || defaultSettings,
    isLoading: settingsQuery.isLoading,
    updateSettings,
    resetSettings,
    isSaving: saveSettingsM.isPending,
  }), [settingsQuery.data, settingsQuery.isLoading, updateSettings, resetSettings, saveSettingsM.isPending]);
});
