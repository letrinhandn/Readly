// Example: Using RevenueCat in your share card themes

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Crown } from 'lucide-react-native';
import { usePremiumFeature } from '@/hooks/usePremiumCheck';
import { PremiumBadge } from '@/components/PremiumGuard';
import { useTheme } from '@/contexts/theme-context';

type ShareTheme = {
  id: string;
  name: string;
  description: string;
  premium: boolean;
  preview: string;
};

const SHARE_THEMES: ShareTheme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean and simple light theme',
    premium: false,
    preview: 'https://example.com/preview-light.png',
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Sleek dark theme',
    premium: false,
    preview: 'https://example.com/preview-dark.png',
  },
  {
    id: 'fancy-gradient',
    name: 'Fancy Gradient',
    description: 'Colorful gradient theme',
    premium: false,
    preview: 'https://example.com/preview-gradient.png',
  },
  {
    id: 'tech-green',
    name: 'Tech Green',
    description: 'Hacker-style green theme',
    premium: true,
    preview: 'https://example.com/preview-tech.png',
  },
  {
    id: 'vintage',
    name: 'Vintage Paper',
    description: 'Classic vintage look',
    premium: true,
    preview: 'https://example.com/preview-vintage.png',
  },
  {
    id: 'golden',
    name: 'Golden Prestige',
    description: 'Luxurious gold theme',
    premium: true,
    preview: 'https://example.com/preview-golden.png',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Futuristic neon theme',
    premium: true,
    preview: 'https://example.com/preview-cyber.png',
  },
  {
    id: 'nature',
    name: 'Nature Calm',
    description: 'Peaceful green theme',
    premium: true,
    preview: 'https://example.com/preview-nature.png',
  },
  {
    id: 'watercolor',
    name: 'Watercolor Pastel',
    description: 'Soft watercolor theme',
    premium: true,
    preview: 'https://example.com/preview-water.png',
  },
  {
    id: 'space',
    name: 'Space Galaxy',
    description: 'Cosmic space theme',
    premium: true,
    preview: 'https://example.com/preview-space.png',
  },
  {
    id: 'retro',
    name: 'Retro Pixel',
    description: '8-bit pixel art theme',
    premium: true,
    preview: 'https://example.com/preview-retro.png',
  },
  {
    id: 'anime',
    name: 'Anime Manga',
    description: 'Anime-style theme',
    premium: true,
    preview: 'https://example.com/preview-anime.png',
  },
  {
    id: 'sunset',
    name: 'Sunset Mood',
    description: 'Warm sunset colors',
    premium: true,
    preview: 'https://example.com/preview-sunset.png',
  },
];

type ShareThemeSelectorProps = {
  selectedTheme: string;
  onSelectTheme: (themeId: string) => void;
};

export function ShareThemeSelector({ selectedTheme, onSelectTheme }: ShareThemeSelectorProps) {
  const { colors } = useTheme();
  const { isPremium, requirePremium } = usePremiumFeature('Premium Share Themes');

  const handleThemeSelect = (theme: ShareTheme) => {
    if (theme.premium && !isPremium) {
      Alert.alert(
        'Premium Theme',
        `"${theme.name}" is a premium theme. Upgrade to unlock all 10 premium themes!`,
        [
          {
            text: 'Upgrade',
            onPress: () => requirePremium(() => {}),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else {
      onSelectTheme(theme.id);
    }
  };

  const freeThemes = SHARE_THEMES.filter(t => !t.premium);
  const premiumThemes = SHARE_THEMES.filter(t => t.premium);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Free Themes
        </Text>
        <View style={styles.themesGrid}>
          {freeThemes.map(theme => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: selectedTheme === theme.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => handleThemeSelect(theme)}
              activeOpacity={0.7}
            >
              <View style={[styles.themePreview, { backgroundColor: colors.border }]}>
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  {theme.name[0]}
                </Text>
              </View>
              <Text style={[styles.themeName, { color: colors.text }]}>
                {theme.name}
              </Text>
              {selectedTheme === theme.id && (
                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.premiumHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Premium Themes
          </Text>
          <PremiumBadge size="medium" />
        </View>
        <View style={styles.themesGrid}>
          {premiumThemes.map(theme => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.themeCard,
                { 
                  backgroundColor: colors.surface,
                  borderColor: selectedTheme === theme.id ? colors.primary : colors.border,
                },
                !isPremium && styles.lockedCard,
              ]}
              onPress={() => handleThemeSelect(theme)}
              activeOpacity={0.7}
            >
              <View style={[styles.themePreview, { backgroundColor: colors.border }]}>
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  {theme.name[0]}
                </Text>
                {!isPremium && (
                  <View style={styles.lockOverlay}>
                    <Crown size={20} color="#FFD700" strokeWidth={2} />
                  </View>
                )}
              </View>
              <Text style={[styles.themeName, { color: colors.text }]}>
                {theme.name}
              </Text>
              {selectedTheme === theme.id && isPremium && (
                <View style={[styles.selectedBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '31%',
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.7,
  },
  themePreview: {
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  previewText: {
    fontSize: 32,
    fontWeight: '700',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
