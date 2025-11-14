# Integrating Premium Checks into Share Cards

## Overview

Your app already has share themes with `isPremium` flags in `constants/share-themes.ts`. Now you need to integrate RevenueCat premium checks to lock those themes.

## Files to Update

### 1. Update Share Card Screen (app/share-card.tsx)

Add premium checks when selecting themes:

```typescript
import { usePremium } from '@/contexts/revenuecat-context';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

// Inside your component
const { isPremium } = usePremium();
const router = useRouter();

const handleThemeSelect = (theme: ShareTheme) => {
  if (theme.isPremium && !isPremium) {
    Alert.alert(
      'Premium Theme',
      `"${theme.name}" is a premium theme. Upgrade to unlock all 10 premium themes!`,
      [
        {
          text: 'Upgrade',
          onPress: () => router.push('/paywall'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  } else {
    setSelectedTheme(theme.id);
  }
};
```

### 2. Add Premium Badge to Theme Selector

Show lock icon and premium badge on premium themes:

```typescript
import { PremiumBadge } from '@/components/PremiumGuard';
import { Crown } from 'lucide-react-native';

// In your theme card render
{theme.isPremium && !isPremium && (
  <View style={styles.lockOverlay}>
    <Crown size={20} color="#FFD700" strokeWidth={2} />
  </View>
)}

{theme.isPremium && (
  <View style={styles.premiumBadge}>
    <PremiumBadge size="small" />
  </View>
)}
```

### 3. Update Share Profile Screen (app/share-profile.tsx)

Same pattern for profile share themes:

```typescript
import { usePremium } from '@/contexts/revenuecat-context';

const { isPremium } = usePremium();

// Filter or mark themes based on premium status
const availableThemes = shareThemes.filter(theme => 
  !theme.isPremium || isPremium
);
```

### 4. Update Share Book Screen (app/share-book.tsx)

Similar to share card:

```typescript
import { usePremium } from '@/contexts/revenuecat-context';

const { isPremium } = usePremium();

// When theme is selected
if (theme.isPremium && !isPremium) {
  // Show upgrade prompt
  showUpgradeAlert();
}
```

## Complete Example Component

Here's a complete theme selector with premium checks:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { usePremium } from '@/contexts/revenuecat-context';
import { PremiumBadge } from '@/components/PremiumGuard';
import { useTheme } from '@/contexts/theme-context';
import { shareThemes, freeThemes, premiumThemes } from '@/constants/share-themes';
import type { ShareThemeType } from '@/constants/share-themes';

type ThemeSelectorProps = {
  selectedTheme: ShareThemeType;
  onThemeChange: (theme: ShareThemeType) => void;
};

export function ThemeSelector({ selectedTheme, onThemeChange }: ThemeSelectorProps) {
  const { colors } = useTheme();
  const { isPremium } = usePremium();
  const router = useRouter();

  const handleThemeSelect = (themeId: ShareThemeType) => {
    const theme = shareThemes[themeId];

    if (theme.isPremium && !isPremium) {
      Alert.alert(
        '💎 Premium Theme',
        `"${theme.name}" is available for Premium members. Upgrade now to unlock all 10 premium themes!`,
        [
          {
            text: 'Upgrade to Premium',
            onPress: () => router.push('/paywall'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    onThemeChange(themeId);
  };

  const renderThemeCard = (themeId: ShareThemeType) => {
    const theme = shareThemes[themeId];
    const isSelected = selectedTheme === themeId;
    const isLocked = theme.isPremium && !isPremium;

    return (
      <TouchableOpacity
        key={themeId}
        style={[
          styles.themeCard,
          {
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
          isLocked && styles.lockedCard,
        ]}
        onPress={() => handleThemeSelect(themeId)}
        activeOpacity={0.7}
      >
        {/* Theme Preview */}
        <View
          style={[
            styles.themePreview,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Preview Content */}
          <View
            style={[
              styles.previewCard,
              { backgroundColor: theme.colors.cardBackground },
            ]}
          >
            <View style={{ height: 8, width: '80%', backgroundColor: theme.colors.primary, borderRadius: 4 }} />
            <View style={{ height: 6, width: '60%', backgroundColor: theme.colors.secondary, borderRadius: 3, marginTop: 4 }} />
          </View>

          {/* Lock Overlay */}
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Crown size={24} color="#FFD700" strokeWidth={2.5} />
            </View>
          )}
        </View>

        {/* Theme Name */}
        <View style={styles.themeInfo}>
          <Text
            style={[
              styles.themeName,
              { color: colors.text },
              isLocked && { opacity: 0.6 },
            ]}
            numberOfLines={2}
          >
            {theme.name}
          </Text>

          {/* Premium Badge */}
          {theme.isPremium && (
            <View style={styles.premiumBadgeContainer}>
              <PremiumBadge size="small" />
            </View>
          )}
        </View>

        {/* Selected Indicator */}
        {isSelected && !isLocked && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Free Themes Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Free Themes
        </Text>
        <View style={styles.themesGrid}>
          {freeThemes.map(renderThemeCard)}
        </View>
      </View>

      {/* Premium Themes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Premium Themes
          </Text>
          <Crown size={20} color="#FFD700" strokeWidth={2} />
        </View>
        <View style={styles.themesGrid}>
          {premiumThemes.map(renderThemeCard)}
        </View>
      </View>

      {/* Made with Readly */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Made with Readly 📚
        </Text>
      </View>
    </ScrollView>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
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
    overflow: 'hidden',
    position: 'relative',
  },
  lockedCard: {
    opacity: 0.8,
  },
  themePreview: {
    aspectRatio: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewCard: {
    width: '90%',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    padding: 8,
    minHeight: 60,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  premiumBadgeContainer: {
    marginTop: 4,
    alignItems: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
```

## Quick Integration Checklist

- [ ] Install RevenueCat: `npx expo install react-native-purchases`
- [ ] Import `usePremium` hook in share card screens
- [ ] Add theme selection check with `theme.isPremium && !isPremium`
- [ ] Show upgrade alert when locked theme is selected
- [ ] Add lock icon overlay on premium themes
- [ ] Add PremiumBadge to premium themes
- [ ] Update "Made with Readly" footer on all share screens
- [ ] Test theme selection with free and premium accounts
- [ ] Build dev client and test purchases

## Testing Flow

1. **As Free User**:
   - Can select 3 free themes
   - Sees lock icon on 10 premium themes
   - Tapping premium theme shows upgrade alert
   - Can navigate to paywall

2. **As Premium User**:
   - Can select all 13 themes
   - No lock icons visible
   - Premium badge still shows on premium themes
   - Full access to all features

## Where to Add Premium Checks

1. **app/share-card.tsx** - Theme selection for session cards
2. **app/share-book.tsx** - Theme selection for book cards
3. **app/share-profile.tsx** - Theme selection for profile cards
4. **components/ShareBookCard.tsx** - Render with premium themes
5. **components/ShareDailyCard.tsx** - Render with premium themes
6. **components/ShareProfileCard.tsx** - Render with premium themes

## Example Alert Implementation

```typescript
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

const showPremiumAlert = (themeName: string) => {
  const router = useRouter();
  
  Alert.alert(
    '💎 Premium Theme',
    `"${themeName}" is a premium theme. Upgrade to unlock all 10 exclusive themes!`,
    [
      {
        text: 'Upgrade Now',
        onPress: () => router.push('/paywall'),
        style: 'default',
      },
      {
        text: 'Maybe Later',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};
```

## Additional Features

### Show Premium Status in Profile

```typescript
import { usePremium } from '@/contexts/revenuecat-context';
import { PremiumBadge } from '@/components/PremiumGuard';

function ProfileHeader() {
  const { isPremium } = usePremium();

  return (
    <View style={styles.header}>
      <Text style={styles.name}>{userName}</Text>
      {isPremium && <PremiumBadge size="medium" />}
    </View>
  );
}
```

### Add Subscription Button to Settings

```typescript
import { useRouter } from 'expo-router';
import { usePremium } from '@/contexts/revenuecat-context';

function SettingsScreen() {
  const router = useRouter();
  const { isPremium } = usePremium();

  return (
    <TouchableOpacity
      onPress={() => router.push(isPremium ? '/subscription-management' : '/paywall')}
    >
      <Text>{isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}</Text>
    </TouchableOpacity>
  );
}
```

## Resources

- [Main Setup Guide](./REVENUECAT_SETUP.md)
- [Quick Reference](./REVENUECAT_QUICKSTART.md)
- [Share Theme Example](./examples/ShareThemeSelector.example.tsx)

---

Good luck with your premium implementation! 🚀
