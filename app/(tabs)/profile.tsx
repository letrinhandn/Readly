import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image, Alert, TextInput, Modal } from 'react-native';
import { Stack, router } from 'expo-router';
import { User, BookOpen, Award, Target, Settings, Bell, HelpCircle, LogOut, Sun, Moon, Smartphone, Camera, Edit, Share2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useReading } from '@/contexts/reading-context';
import { useTheme } from '@/contexts/theme-context';
import { useUser } from '@/contexts/user-context';
import supabase from '@/lib/supabase';

export default function ProfileScreen() {
  const { stats, books } = useReading();
  const { colors, scheme, setTheme, isDark } = useTheme();
  const { profile, updateProfile } = useUser();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editGender, setEditGender] = useState<'male' | 'female' | 'other' | 'prefer-not-to-say'>('prefer-not-to-say');

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
      updateProfile({ profileImage: result.assets[0].uri });
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleOpenEdit = () => {
    setEditName(profile?.name || '');
    setEditBio(profile?.bio || '');
    setEditAge(profile?.age?.toString() || '');
    setEditGender(profile?.gender || 'prefer-not-to-say');
    setShowEditModal(true);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleSaveProfile = () => {
    const ageNum = editAge ? parseInt(editAge, 10) : undefined;
    updateProfile({
      name: editName.trim() || 'Reading Enthusiast',
      bio: editBio.trim() || 'Keep up the great reading habit!',
      age: isNaN(ageNum || 0) ? undefined : ageNum,
      gender: editGender,
    });
    setShowEditModal(false);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
                {profile?.profileImage && profile.profileImage.length > 0 ? (
                  <Image source={{ uri: profile.profileImage }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <User size={48} color={colors.surface} strokeWidth={2} />
                )}
              </View>
              <View style={[styles.cameraBadge, { backgroundColor: colors.accent }]}>
                <Camera size={16} color={colors.surface} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.nameRow}>
            <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || 'Reading Enthusiast'}</Text>
            <TouchableOpacity onPress={handleOpenEdit} activeOpacity={0.7}>
              <Edit size={20} color={colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{profile?.bio || 'Keep up the great reading habit!'}</Text>
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
              { 
                text: 'Sign Out', 
                style: 'destructive', 
                onPress: async () => {
                  await supabase.auth.signOut();
                  router.replace('/login');
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                }
              }
            ]);
          }}
          activeOpacity={0.7}
        >
          <LogOut size={20} color={colors.error} strokeWidth={2.5} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareProfileButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            router.push('/share-profile');
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }}
          activeOpacity={0.7}
        >
          <Share2 size={20} color={colors.surface} strokeWidth={2.5} />
          <Text style={[styles.shareProfileText, { color: colors.surface }]}>Share Profile Card</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textTertiary }]}>Readly Version 1.0.0</Text>
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.editModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.editModalHeader}>
              <Text style={[styles.editModalTitle, { color: colors.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} activeOpacity={0.7}>
                <X size={24} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.editForm} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Name</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your name"
                  placeholderTextColor={colors.textTertiary}
                  maxLength={50}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
                <TextInput
                  style={[styles.textInput, styles.bioInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                  value={editBio}
                  onChangeText={setEditBio}
                  placeholder="A short bio about yourself"
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  maxLength={150}
                  numberOfLines={3}
                />
                <Text style={[styles.charCount, { color: colors.textTertiary }]}>{editBio.length}/150</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Age (optional)</Text>
                <TextInput
                  style={[styles.textInput, { backgroundColor: colors.surfaceSecondary, color: colors.text, borderColor: colors.border }]}
                  value={editAge}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    setEditAge(num);
                  }}
                  placeholder="Your age"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Gender (optional)</Text>
                <View style={styles.genderOptions}>
                  {[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }, { value: 'prefer-not-to-say', label: 'Prefer not to say' }].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.genderOption,
                        { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
                        editGender === option.value && [styles.genderOptionSelected, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]
                      ]}
                      onPress={() => setEditGender(option.value as typeof editGender)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.genderOptionText, { color: editGender === option.value ? colors.primary : colors.text }]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.editModalActions}>
              <TouchableOpacity
                style={[styles.editModalButton, { backgroundColor: colors.surfaceSecondary }]}
                onPress={() => setShowEditModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.editModalButtonText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.editModalButton, styles.editModalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleSaveProfile}
                activeOpacity={0.7}
              >
                <Text style={[styles.editModalButtonText, { color: colors.surface }]}>Save</Text>
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  shareProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    marginBottom: 24,
  },
  shareProfileText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  editModalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  editModalTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  editForm: {
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  genderOptions: {
    gap: 10,
  },
  genderOption: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
  },
  genderOptionSelected: {
    borderWidth: 2,
  },
  genderOptionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  editModalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editModalButton: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  editModalButtonPrimary: {
  },
  editModalButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
