import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, Bell, Clock, Target, Award, BellRing } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/contexts/theme-context';
import { useSettings } from '@/contexts/settings-context';

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useSettings();
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionGranted(status === 'granted');
    console.log('Notification permission status:', status);
  };

  const requestNotificationPermission = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionGranted(status === 'granted');
    
    if (status === 'granted') {
      updateSettings({
        notifications: {
          ...settings.notifications,
          enabled: true,
        },
      });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Notifications enabled successfully!');
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive reading reminders.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Notifications.openSettingsAsync() },
        ]
      );
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (value && !permissionGranted) {
      await requestNotificationPermission();
      return;
    }

    updateSettings({
      notifications: {
        ...settings.notifications,
        enabled: value,
      },
    });
  };

  const handleToggle = (key: keyof typeof settings.notifications, value: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    updateSettings({
      notifications: {
        ...settings.notifications,
        [key]: value,
      },
    });
  };

  const handleTimeSelect = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Coming Soon', 'Custom reminder time selection will be available in a future update.');
  };

  const notificationOptions = [
    {
      key: 'readingReminders' as const,
      title: 'Reading Reminders',
      description: 'Get reminded to read daily',
      icon: BellRing,
      color: colors.primary,
    },
    {
      key: 'goalReminders' as const,
      title: 'Goal Reminders',
      description: 'Stay on track with your reading goals',
      icon: Target,
      color: colors.accent,
    },
    {
      key: 'streakReminders' as const,
      title: 'Streak Reminders',
      description: 'Don\'t break your reading streak',
      icon: Clock,
      color: colors.warning,
    },
    {
      key: 'achievements' as const,
      title: 'Achievements',
      description: 'Celebrate your reading milestones',
      icon: Award,
      color: colors.success,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: '700' as const, fontSize: 17 },
          headerTitle: 'Notifications',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back();
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={styles.backButton}
            >
              <ChevronLeft size={28} color={colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainCard, { backgroundColor: colors.surface }]}>
          <View style={styles.mainCardHeader}>
            <View style={[styles.mainIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Bell size={28} color={colors.primary} strokeWidth={2.5} />
            </View>
            <View style={styles.mainCardText}>
              <Text style={[styles.mainCardTitle, { color: colors.text }]}>Enable Notifications</Text>
              <Text style={[styles.mainCardDescription, { color: colors.textSecondary }]}>
                {permissionGranted 
                  ? 'Notifications are allowed' 
                  : 'Grant permission to receive reminders'}
              </Text>
            </View>
            <Switch
              value={settings.notifications.enabled}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={settings.notifications.enabled ? colors.primary : colors.textTertiary}
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>

        {settings.notifications.enabled && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
              {notificationOptions.map((option) => (
                <View
                  key={option.key}
                  style={[styles.optionCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                      <option.icon size={22} color={option.color} strokeWidth={2.5} />
                    </View>
                    <View style={styles.optionText}>
                      <Text style={[styles.optionTitle, { color: colors.text }]}>
                        {option.title}
                      </Text>
                      <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                        {option.description}
                      </Text>
                    </View>
                    <Switch
                      value={settings.notifications[option.key]}
                      onValueChange={(value) => handleToggle(option.key, value)}
                      trackColor={{ false: colors.border, true: colors.primary + '50' }}
                      thumbColor={settings.notifications[option.key] ? colors.primary : colors.textTertiary}
                      ios_backgroundColor={colors.border}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reminder Time</Text>
              <TouchableOpacity
                style={[styles.timeCard, { backgroundColor: colors.surface }]}
                onPress={handleTimeSelect}
                activeOpacity={0.7}
              >
                <View style={styles.timeContent}>
                  <View style={[styles.timeIcon, { backgroundColor: colors.accent + '15' }]}>
                    <Clock size={22} color={colors.accent} strokeWidth={2.5} />
                  </View>
                  <View style={styles.timeText}>
                    <Text style={[styles.timeTitle, { color: colors.text }]}>Daily Reminder</Text>
                    <Text style={[styles.timeValue, { color: colors.textSecondary }]}>
                      {settings.notifications.reminderTime}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.infoText, { color: colors.primary }]}>
                💡 Tip: Enable notifications to build a consistent reading habit and never miss your daily goals!
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginLeft: 12,
  },
  mainCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  mainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  mainIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  mainCardDescription: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  optionDescription: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  timeCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    flex: 1,
  },
  timeTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
});
