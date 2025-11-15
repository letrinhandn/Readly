import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Modal, Dimensions, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BadgeDefinition, BADGE_RARITY_COLORS } from '@/types/badge';
import Badge from './Badge';

interface BadgeEarnedPopupProps {
  badge: BadgeDefinition | null;
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COUNT = 50;

interface ConfettiPiece {
  x: Animated.Value;
  y: Animated.Value;
  rotate: Animated.Value;
  color: string;
  size: number;
}

export default function BadgeEarnedPopup({ badge, visible, onClose }: BadgeEarnedPopupProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!confettiPieces.current.length) {
      confettiPieces.current = Array.from({ length: CONFETTI_COUNT }, () => ({
        x: new Animated.Value(SCREEN_WIDTH / 2),
        y: new Animated.Value(-50),
        rotate: new Animated.Value(0),
        color: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][Math.floor(Math.random() * 6)],
        size: Math.random() * 8 + 4,
      }));
    }
  }, []);

  useEffect(() => {
    if (visible && badge) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      scaleAnim.setValue(0);
      fadeAnim.setValue(0);

      confettiPieces.current.forEach((piece) => {
        piece.x.setValue(SCREEN_WIDTH / 2);
        piece.y.setValue(-50);
        piece.rotate.setValue(0);
      });

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        ...confettiPieces.current.map((piece, index) => {
          const randomX = (Math.random() - 0.5) * SCREEN_WIDTH * 1.5;
          const randomY = SCREEN_HEIGHT * (0.5 + Math.random() * 0.5);
          const delay = Math.random() * 200;

          return Animated.parallel([
            Animated.timing(piece.x, {
              toValue: SCREEN_WIDTH / 2 + randomX,
              duration: 2000 + Math.random() * 1000,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(piece.y, {
              toValue: randomY,
              duration: 2000 + Math.random() * 1000,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(piece.rotate, {
              toValue: (Math.random() - 0.5) * 720,
              duration: 2000 + Math.random() * 1000,
              delay,
              useNativeDriver: true,
            }),
          ]);
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onClose();
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible, badge]);

  if (!badge) return null;

  const rarityColors = BADGE_RARITY_COLORS[badge.rarity];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {confettiPieces.current.map((piece, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confettiPiece,
              {
                left: piece.x,
                top: piece.y,
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                opacity: fadeAnim,
                transform: [
                  {
                    rotate: piece.rotate.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <View style={[styles.card, { borderColor: rarityColors.border }]}>
            <Text style={styles.title}>🎉 Badge Earned! 🎉</Text>
            
            <View style={styles.badgeContainer}>
              <Badge badge={badge} size="large" earned={true} />
            </View>

            <Text style={[styles.badgeName, { color: rarityColors.background }]}>
              {badge.name}
            </Text>

            <Text style={styles.badgeDescription}>
              {badge.description}
            </Text>

            <View style={[styles.rarityBadge, { backgroundColor: rarityColors.background }]}>
              <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badgeName: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  badgeDescription: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },
});
