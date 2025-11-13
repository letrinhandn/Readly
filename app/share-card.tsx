import React, { useRef, useState } from 'react';
import { Platform , View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

import { router } from 'expo-router';
import { X, Share2, Download, Crown, Check } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import Colors from '@/constants/colors';
import { useReading } from '@/contexts/reading-context';
import ShareDailyCard from '@/components/ShareDailyCard';
import { shareThemes, ShareThemeType, freeThemes, premiumThemes } from '@/constants/share-themes';

export default function ShareCardScreen() {
  const { currentBooks, stats } = useReading();
  const cardRef = useRef<View>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ShareThemeType>('minimal-light');
  const [isPremiumUser] = useState(false);

  const currentBook = currentBooks[0];

  const handleShare = async () => {
    try {
  if ((Platform.OS as any) !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      if (!cardRef.current) return;

      setIsSaving(true);

      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

  if ((Platform.OS as any) === 'web') {
        const a = document.createElement('a');
        a.href = uri;
        a.download = 'reading-progress.png';
        a.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri);
        } else {
          Alert.alert('Sharing not available', 'Unable to share on this device');
        }
      }

  if ((Platform.OS as any) !== 'web') {
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

  if ((Platform.OS as any) === 'web') {
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

  if ((Platform.OS as any) !== 'web') {
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

  if (!currentBook) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No reading session available</Text>
      </View>
    );
  }

  const sessionData = {
    duration: currentBook.totalMinutesRead || 0,
    pagesRead: currentBook.currentPage,
    date: new Date().toISOString(),
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Share Your Progress</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <X size={24} color={Colors.light.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer} collapsable={false} ref={cardRef}>
          <ShareDailyCard
            book={currentBook}
            session={sessionData}
            streak={stats.currentStreak}
            theme={selectedTheme}
          />
        </View>

        <View style={styles.themesSection}>
          <Text style={styles.sectionTitle}>Choose Theme</Text>
          
          <Text style={styles.themeCategory}>Free Themes</Text>
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
                      borderColor: isSelected ? Colors.light.primary : Colors.light.border,
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
                    <View style={styles.selectedBadge}>
                      <Check size={14} color="#FFF" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.themeCategory}>
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
                      borderColor: isSelected ? Colors.light.primary : Colors.light.border,
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
                    <View style={styles.selectedBadge}>
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
            style={styles.actionButton}
            onPress={handleShare}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Share2 size={24} color={Colors.light.surface} strokeWidth={2} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.7}
          >
            <Download size={24} color={Colors.light.primary} strokeWidth={2} />
            <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
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
    backgroundColor: Colors.light.background,
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
    color: Colors.light.text,
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.surfaceSecondary,
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
    transform: [{ scale: 0.85 }],
  },
  card: {
    backgroundColor: Colors.light.primary,
    borderRadius: 24,
    padding: 32,
    shadowColor: Colors.light.shadowMedium,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.light.surface,
    marginBottom: 4,
    letterSpacing: -1,
  },
  cardSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as const,
  },
  currentBookSection: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bookCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bookContent: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  bookAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.light.surface,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.light.surface,
    marginBottom: 4,
    letterSpacing: -1,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600' as const,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardFooter: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600' as const,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.light.surface,
    letterSpacing: -0.2,
  },
  actionButtonTextSecondary: {
    color: Colors.light.primary,
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
    color: Colors.light.text,
  },
  themeCategory: {
    fontSize: 14,
    fontWeight: '700' as const,
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center',
    marginTop: 100,
    color: Colors.light.text,
  },
});
