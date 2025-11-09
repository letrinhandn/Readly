import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { User, BookOpen, Award, Target, Settings, Bell, HelpCircle, LogOut, Sun, Moon, Smartphone, Camera } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';

export default function ProfileScreen() {
  const { stats, books } = useReading();
  const { colors, scheme, setTheme, isDark } = useTheme();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handlePress = (action: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    console.log(`Action: ${action}`);
  };

  const handleChangeProfilePicture = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: '', headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleChangeProfilePicture} activeOpacity={0.8}>
              <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                ) : (
                  <User size={48} color={colors.surface} strokeWidth={2} />
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
                <Camera size={16} color={colors.surface} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>Reading Enthusiast</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>Keep up the great reading habit!</Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <BookOpen size={20} color={colors.primary} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{books.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Books</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.success + '15' }]}>
                <Award size={20} color={colors.success} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalBooksRead}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '15' }]}>
                <Target size={20} color={colors.accent} strokeWidth={2.5} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{stats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Day Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          
          <View style={[styles.themeCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.themeLabel, { color: colors.text }]}>Theme</Text>
            <View style={styles.themeOptions}>
              <TouchableOpacity
                style={[styles.themeOption, { backgroundColor: scheme === 'light' && !isDark ? colors.primary : colors.surfaceSecondary }]}
                onPress={() => handleThemeChange('light')}
                activeOpacity={0.7}
              >
                <Sun size={20} color={scheme === 'light' && !isDark ? colors.surface : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.themeOptionText, { color: scheme === 'light' && !isDark ? colors.surface : colors.textSecondary }]}>Light</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.themeOption, { backgroundColor: isDark ? colors.primary : colors.surfaceSecondary }]}
                onPress={() => handleThemeChange('dark')}
                activeOpacity={0.7}
              >
                <Moon size={20} color={isDark ? colors.surface : colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.themeOptionText, { color: isDark ? colors.surface : colors.textSecondary }]}>Dark</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.themeOption, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => handleThemeChange('auto')}
                activeOpacity={0.7}
              >
                <Smartphone size={20} color={colors.textSecondary} strokeWidth={2.5} />
                <Text style={[styles.themeOptionText, { color: colors.textSecondary }]}>Auto</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => handlePress('notifications')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primary + '15' }]}>
              <Bell size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => handlePress('settings')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.success + '15' }]}>
              <Settings size={20} color={colors.success} strokeWidth={2.5} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>App Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.surface }]}
            onPress={() => handlePress('help')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.accent + '15' }]}>
              <HelpCircle size={20} color={colors.accent} strokeWidth={2.5} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.error }]}
          onPress={() => {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => handlePress('logout') }
            ]);
          }}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} strokeWidth={2.5} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textTertiary }]}>Readly Version 1.0.0</Text>
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
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FBF8F4',
  },
  userName: {
    fontSize: 26,
    fontWeight: '800' as const,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  statsCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800' as const,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
    height: 50,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  themeCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 16,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1.5,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  version: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
});
