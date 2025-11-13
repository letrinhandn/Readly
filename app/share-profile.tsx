import React, { useRef, useState } from 'react';
import { Platform , View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { router } from 'expo-router';
import { X, Share2, Download, Crown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { useTheme } from '@/contexts/theme-context';
import { useReading } from '@/contexts/reading-context';
import { useUser } from '@/contexts/user-context';
import ShareProfileCard from '@/components/ShareProfileCard';
import { shareThemes, ShareThemeType, freeThemes, premiumThemes } from '@/constants/share-themes';

export default function ShareProfileScreen() {
  const { colors } = useTheme();
  const { stats, books } = useReading();
  const { profile } = useUser();
  const cardRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ShareThemeType>('minimal-light');
  const [isPremiumUser] = useState(false);

  const completedBooks = books.filter((b) => b.status === 'completed');

  const handleShare = async () => {
    try {
      if ((Platform.OS as string) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (!cardRef.current) return;

      setIsSaving(true);

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

  if ((Platform.OS as string) === 'web') {
        const a = document.createElement('a');
        a.href = uri;
        a.download = `readly-profile-${Date.now()}.png`;
        a.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Sharing not available', 'Unable to share on this device');
        }
      }

      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (!cardRef.current) return;

      if ((Platform.OS as string) === 'web') {
        await handleShare();
        return;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need permission to save to your photos');
        return;
      }

      setIsSaving(true);

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(uri);

      if ((Platform.OS as string) !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert('Saved!', 'Card saved to your photos');
    } catch (error) {
      console.error('Error saving:', error);
      Alert.alert('Error', 'Failed to save card');
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeSelect = (themeId: ShareThemeType) => {
    const theme = shareThemes[themeId];
    if (theme.isPremium && !isPremiumUser) {
      Alert.alert('Premium Theme', 'Please upgrade to premium to unlock all themes!');
      return;
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTheme(themeId);
  };

  if (!profile) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Share Your Profile</Text>
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color={colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer} collapsable={false} ref={cardRef}>
          <ShareProfileCard
            profile={profile}
            stats={stats}
            completedBooks={completedBooks}
            theme={selectedTheme}
          />
        </View>

        <View style={styles.themesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Choose Theme</Text>
          
          <Text style={[styles.themeCategory, { color: colors.textSecondary }]}>Free Themes</Text>
          <View style={styles.themeGrid}>
            {freeThemes.map((themeId) => {
              const theme = shareThemes[themeId];
              const isSelected = selectedTheme === themeId;
              return (
                <TouchableOpacity
                  key={themeId}
                  style={[
                    styles.themeItem,
                    { 
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 3 : 1,
                    },
                  ]}
                  onPress={() => handleThemeSelect(themeId)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  <Text style={[styles.themeName, { color: theme.colors.text }]} numberOfLines={1}>
                    {theme.name}
                  </Text>
                  {isSelected && (
                    <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                      <Check size={14} color="#FFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.themeCategory, { color: colors.textSecondary }]}>
            Premium Themes {!isPremiumUser && '(Upgrade to Unlock)'}
          </Text>
          <View style={styles.themeGrid}>
            {premiumThemes.map((themeId) => {
              const theme = shareThemes[themeId];
              const isSelected = selectedTheme === themeId;
              const isLocked = !isPremiumUser;
              return (
                <TouchableOpacity
                  key={themeId}
                  style={[
                    styles.themeItem,
                    { 
                      backgroundColor: theme.colors.cardBackground,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 3 : 1,
                      opacity: isLocked ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => handleThemeSelect(themeId)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.themePreview,
                      { backgroundColor: theme.colors.primary },
                    ]}
                  />
                  <Text style={[styles.themeName, { color: theme.colors.text }]} numberOfLines={1}>
                    {theme.name}
                  </Text>
                  {isLocked && (
                    <View style={styles.lockBadge}>
                      <Crown size={14} color="#FFD700" strokeWidth={2.5} fill="#FFD700" />
                    </View>
                  )}
                  {isSelected && !isLocked && (
                    <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                      <Check size={14} color="#FFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleShare}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Share2 size={24} color={colors.surface} strokeWidth={2} />
            <Text style={[styles.actionButtonText, { color: colors.surface }]}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.actionButtonSecondary,
              { backgroundColor: colors.surface, borderColor: colors.primary },
            ]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Download size={24} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Save to Photos
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  cardContainer: {
    marginBottom: 32,
    transform: [{ scale: 0.9 }],
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 400,
  },
  actionButton: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonSecondary: {
    borderWidth: 2,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  themesSection: {
    width: '100%',
    maxWidth: 600,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800' as const,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  themeCategory: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeItem: {
    width: 110,
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  themePreview: {
    width: '100%',
    height: 60,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '700' as const,
    padding: 8,
    textAlign: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 12,
    padding: 4,
  },
});
