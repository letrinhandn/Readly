import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { BadgeDefinition, BADGE_RARITY_COLORS } from '@/types/badge';
import { LinearGradient } from 'expo-linear-gradient';

interface BadgeProps {
  badge: BadgeDefinition;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

const BADGE_SIZES = {
  small: 40,
  medium: 60,
  large: 80,
};

export default function Badge({ badge, size = 'small', showName = false }: BadgeProps) {
  const badgeSize = BADGE_SIZES[size];
  const rarityColors = BADGE_RARITY_COLORS[badge.rarity];
  
  const renderBadgeContent = () => {
    if (badge.rarity === 'mythic') {
      return (
        <LinearGradient
          colors={['#DC2626', '#F59E0B', '#DC2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.badgeCircle,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <View style={[styles.innerCircle, { borderColor: rarityColors.border }]}>
            {badge.iconUrl ? (
              <Image source={{ uri: badge.iconUrl }} style={styles.badgeIcon} resizeMode="cover" />
            ) : (
              <View style={styles.emptyIcon} />
            )}
          </View>
        </LinearGradient>
      );
    }

    if (badge.rarity === 'godtier') {
      return (
        <LinearGradient
          colors={['#000000', '#1F1F1F', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.badgeCircle,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
            },
          ]}
        >
          <View style={[styles.innerCircle, { borderColor: rarityColors.border, borderWidth: 2.5 }]}>
            {badge.iconUrl ? (
              <Image source={{ uri: badge.iconUrl }} style={styles.badgeIcon} resizeMode="cover" />
            ) : (
              <View style={styles.emptyIcon} />
            )}
          </View>
        </LinearGradient>
      );
    }

    return (
      <View
        style={[
          styles.badgeCircle,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: rarityColors.background,
            borderColor: rarityColors.border,
          },
        ]}
      >
        <View style={[styles.innerCircle, { borderColor: rarityColors.border }]}>
          {badge.iconUrl ? (
            <Image source={{ uri: badge.iconUrl }} style={styles.badgeIcon} resizeMode="cover" />
          ) : (
            <View style={styles.emptyIcon} />
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.badgeContainer}>
      <View
        style={[
          styles.glowContainer,
          {
            shadowColor: rarityColors.background,
            shadowOpacity: 0.6,
            shadowRadius: size === 'large' ? 12 : size === 'medium' ? 8 : 6,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {renderBadgeContent()}
      </View>
      {showName && (
        <Text style={[styles.badgeName, { color: rarityColors.background }]} numberOfLines={1}>
          {badge.name}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    ...Platform.select({
      ios: {
        shadowOpacity: 0.6,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowOpacity: 0.6,
      },
    }),
  },
  badgeCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    padding: 3,
  },
  innerCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 1000,
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  badgeIcon: {
    width: '100%',
    height: '100%',
  },
  emptyIcon: {
    width: '60%',
    height: '60%',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeName: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '600' as const,
    textAlign: 'center',
    maxWidth: 70,
  },
});
