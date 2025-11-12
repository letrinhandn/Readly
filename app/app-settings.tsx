import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert, Modal, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { ChevronLeft, BookOpen, Target, Eye, Hash, Zap, Languages, Calendar, Clock, Volume2, Vibrate, Shield, Share2, TrendingUp, RefreshCw, Bell, BellRing, Award } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@/contexts/theme-context';
import { useSettings } from '@/contexts/settings-context';

export default function AppSettingsScreen() {
  const { colors } = useTheme();
  const { settings, updateSettings, resetSettings } = useSettings();
  const [showResetModal, setShowResetModal] = useState(false);
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
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
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

  const handleToggle = (category: keyof typeof settings, key: string, value: boolean | string | number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    updateSettings({
      [category]: {
        ...settings[category],
        [key]: value,
      },
    });
  };

  const handleResetSettings = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowResetModal(true);
  };

  const confirmReset = () => {
    resetSettings();
    setShowResetModal(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Success', 'All settings have been reset to defaults.');
  };

  const handleGoalChange = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Coming Soon', 'Custom goal setting will be available in a future update.');
  };

  const handleLanguageChange = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Coming Soon', 'Language selection will be available in a future update.');
  };

  const handleFormatChange = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Coming Soon', 'Format customization will be available in a future update.');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTitleStyle: { color: colors.text, fontWeight: '700' as const, fontSize: 17 },
          headerTitle: 'App Settings',
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Bell size={22} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
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
              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                    <BellRing size={22} color={colors.primary} strokeWidth={2.5} />
                  </View>
                  <View style={styles.settingTextFull}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Reading Reminders</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Get reminded to read daily
                    </Text>
                  </View>
                  <Switch
                    value={settings.notifications.readingReminders}
                    onValueChange={(value) => handleToggle('notifications', 'readingReminders', value)}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={settings.notifications.readingReminders ? colors.primary : colors.textTertiary}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              </View>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                    <Target size={22} color={colors.accent} strokeWidth={2.5} />
                  </View>
                  <View style={styles.settingTextFull}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Goal Reminders</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Stay on track with your reading goals
                    </Text>
                  </View>
                  <Switch
                    value={settings.notifications.goalReminders}
                    onValueChange={(value) => handleToggle('notifications', 'goalReminders', value)}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={settings.notifications.goalReminders ? colors.primary : colors.textTertiary}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              </View>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                    <Clock size={22} color={colors.warning} strokeWidth={2.5} />
                  </View>
                  <View style={styles.settingTextFull}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Streak Reminders</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Don’t break your reading streak
                    </Text>
                  </View>
                  <Switch
                    value={settings.notifications.streakReminders}
                    onValueChange={(value) => handleToggle('notifications', 'streakReminders', value)}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={settings.notifications.streakReminders ? colors.primary : colors.textTertiary}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              </View>

              <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                <View style={styles.settingContent}>
                  <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                    <Award size={22} color={colors.success} strokeWidth={2.5} />
                  </View>
                  <View style={styles.settingTextFull}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>Achievements</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      Celebrate your reading milestones
                    </Text>
                  </View>
                  <Switch
                    value={settings.notifications.achievements}
                    onValueChange={(value) => handleToggle('notifications', 'achievements', value)}
                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                    thumbColor={settings.notifications.achievements ? colors.primary : colors.textTertiary}
                    ios_backgroundColor={colors.border}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Reading Preferences</Text>

          <TouchableOpacity
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
            onPress={handleGoalChange}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Target size={22} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Daily Reading Goal</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {settings.reading.defaultGoal} minutes
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                <Zap size={22} color={colors.accent} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Auto Tracking</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Automatically track reading time
                </Text>
              </View>
              <Switch
                value={settings.reading.autoTracking}
                onValueChange={(value) => handleToggle('reading', 'autoTracking', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.reading.autoTracking ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                <Hash size={22} color={colors.success} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Show Page Count</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Display page numbers in book details
                </Text>
              </View>
              <Switch
                value={settings.reading.showPageCount}
                onValueChange={(value) => handleToggle('reading', 'showPageCount', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.reading.showPageCount ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                <TrendingUp size={22} color={colors.warning} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Show Progress %</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Display reading progress percentage
                </Text>
              </View>
              <Switch
                value={settings.reading.showProgressPercentage}
                onValueChange={(value) => handleToggle('reading', 'showProgressPercentage', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.reading.showProgressPercentage ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Data</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Share2 size={22} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Share Statistics</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Allow sharing reading stats with friends
                </Text>
              </View>
              <Switch
                value={settings.privacy.shareStats}
                onValueChange={(value) => handleToggle('privacy', 'shareStats', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.privacy.shareStats ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                <Eye size={22} color={colors.accent} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Public Profile</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Make your profile visible to others
                </Text>
              </View>
              <Switch
                value={settings.privacy.showProfile}
                onValueChange={(value) => handleToggle('privacy', 'showProfile', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.privacy.showProfile ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                <Shield size={22} color={colors.success} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Analytics</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Help improve app with usage data
                </Text>
              </View>
              <Switch
                value={settings.privacy.allowAnalytics}
                onValueChange={(value) => handleToggle('privacy', 'allowAnalytics', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.privacy.allowAnalytics ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>

          <TouchableOpacity
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
            onPress={handleLanguageChange}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primary + '15' }]}>
                <Languages size={22} color={colors.primary} strokeWidth={2.5} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Language</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  English
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
            onPress={handleFormatChange}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent + '15' }]}>
                <Calendar size={22} color={colors.accent} strokeWidth={2.5} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Date Format</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {settings.general.dateFormat}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingCard, { backgroundColor: colors.surface }]}
            onPress={handleFormatChange}
            activeOpacity={0.7}
          >
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.success + '15' }]}>
                <Clock size={22} color={colors.success} strokeWidth={2.5} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Time Format</Text>
                <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                  {settings.general.timeFormat === '12h' ? '12-hour' : '24-hour'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.warning + '15' }]}>
                <Volume2 size={22} color={colors.warning} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Sound Effects</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Play sounds for actions and events
                </Text>
              </View>
              <Switch
                value={settings.general.soundEffects}
                onValueChange={(value) => handleToggle('general', 'soundEffects', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.general.soundEffects ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>

          <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.settingContent}>
              <View style={[styles.settingIcon, { backgroundColor: colors.error + '15' }]}>
                <Vibrate size={22} color={colors.error} strokeWidth={2.5} />
              </View>
              <View style={styles.settingTextFull}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Haptic Feedback</Text>
                <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                  Vibrate on button presses
                </Text>
              </View>
              <Switch
                value={settings.general.haptics}
                onValueChange={(value) => handleToggle('general', 'haptics', value)}
                trackColor={{ false: colors.border, true: colors.primary + '50' }}
                thumbColor={settings.general.haptics ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.border}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetButton, { backgroundColor: colors.surface, borderColor: colors.error }]}
          onPress={handleResetSettings}
          activeOpacity={0.7}
        >
          <RefreshCw size={20} color={colors.error} strokeWidth={2.5} />
          <Text style={[styles.resetText, { color: colors.error }]}>Reset All Settings</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.infoText, { color: colors.primary }]}>
            💡 Settings are automatically saved and synced across your devices.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showResetModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Settings?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              This will reset all settings to their default values. This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => {
                  setShowResetModal(false);
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger, { backgroundColor: colors.error }]}
                onPress={confirmReset}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.surface }]}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  settingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTextFull: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  settingDescription: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1.5,
    marginBottom: 20,
  },
  resetText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 12,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  modalButtonDanger: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
