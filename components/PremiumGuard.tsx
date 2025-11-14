import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Crown } from 'lucide-react-native';
import { usePremium } from '@/contexts/revenuecat-context';
import { useTheme } from '@/contexts/theme-context';

type PremiumGuardProps = {
  children: ReactNode;
  fallbackMessage?: string;
  showUpgradeButton?: boolean;
};

export function PremiumGuard({
  children,
  fallbackMessage = 'This feature is only available for Premium members.',
  showUpgradeButton = true,
}: PremiumGuardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium, isLoading } = usePremium();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (!isPremium) {
    return (
      <View style={[styles.lockedContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={['#FFD700', '#FFA500', '#FF6B6B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.lockIcon}
        >
          <Lock size={40} color="#FFF" strokeWidth={2} />
        </LinearGradient>

        <Text style={[styles.lockedTitle, { color: colors.text }]}>
          Premium Feature
        </Text>

        <Text style={[styles.lockedMessage, { color: colors.textSecondary }]}>
          {fallbackMessage}
        </Text>

        {showUpgradeButton && (
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/paywall')}
            activeOpacity={0.8}
          >
            <Crown size={18} color="#FFF" strokeWidth={2} />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <>{children}</>;
}

export function PremiumBadge({ size = 'small' }: { size?: 'small' | 'medium' | 'large' }) {
  const iconSize = size === 'large' ? 20 : size === 'medium' ? 16 : 12;
  const fontSize = size === 'large' ? 13 : size === 'medium' ? 11 : 9;
  const padding = size === 'large' ? 8 : size === 'medium' ? 6 : 4;

  return (
    <LinearGradient
      colors={['#FFD700', '#FFA500']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.premiumBadge, { paddingHorizontal: padding * 1.5, paddingVertical: padding }]}
    >
      <Crown size={iconSize} color="#FFF" strokeWidth={2.5} />
      <Text style={[styles.premiumBadgeText, { fontSize }]}>PREMIUM</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  lockedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  lockedMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
});
