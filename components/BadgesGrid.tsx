import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { BadgeDefinition } from '@/types/badge';
import Badge from './Badge';
import { useTheme } from '@/contexts/theme-context';

interface BadgesGridProps {
  badges: Array<{
    badge: BadgeDefinition;
    earned: boolean;
    earnedAt?: string;
  }>;
}

export default function BadgesGrid({ badges }: BadgesGridProps) {
  const { colors } = useTheme();
  const [selectedBadge, setSelectedBadge] = React.useState<{ badge: BadgeDefinition; earned: boolean; earnedAt?: string } | null>(null);

  const sortedBadges = React.useMemo(() => {
    const rarityOrder = ['godtier', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    return [...badges].sort((a, b) => {
      if (a.earned !== b.earned) return a.earned ? -1 : 1;
      const rarityDiff = rarityOrder.indexOf(a.badge.rarity) - rarityOrder.indexOf(b.badge.rarity);
      if (rarityDiff !== 0) return rarityDiff;
      return a.badge.name.localeCompare(b.badge.name);
    });
  }, [badges]);

  return (
    <>
      <View style={styles.grid}>
        {sortedBadges.map((item) => (
          <TouchableOpacity
            key={item.badge.id}
            style={styles.gridItem}
            onPress={() => setSelectedBadge(item)}
            activeOpacity={0.7}
          >
            <Badge badge={item.badge} size="medium" earned={item.earned} />
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={!!selectedBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedBadge(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedBadge(null)}>
          <Pressable style={[styles.modalContent, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedBadge(null)}
              activeOpacity={0.7}
            >
              <X size={24} color={colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>

            {selectedBadge && (
              <>
                <View style={styles.badgePreview}>
                  <Badge badge={selectedBadge.badge} size="large" earned={selectedBadge.earned} />
                </View>

                <Text style={[styles.badgeName, { color: colors.text }]}>
                  {selectedBadge.badge.name}
                </Text>

                <Text style={[styles.badgeRarity, { color: colors.textSecondary }]}>
                  {selectedBadge.badge.rarity.toUpperCase()}
                </Text>

                <Text style={[styles.badgeDescription, { color: colors.textSecondary }]}>
                  {selectedBadge.badge.description}
                </Text>

                {selectedBadge.earned && selectedBadge.earnedAt && (
                  <Text style={[styles.earnedDate, { color: colors.success }]}>
                    Earned on {new Date(selectedBadge.earnedAt).toLocaleDateString()}
                  </Text>
                )}

                {!selectedBadge.earned && (
                  <View style={[styles.lockedBadge, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.lockedText, { color: colors.textTertiary }]}>
                      🔒 Not yet earned
                    </Text>
                  </View>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  gridItem: {
    width: 80,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  badgePreview: {
    marginBottom: 24,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '800' as const,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  badgeRarity: {
    fontSize: 12,
    fontWeight: '700' as const,
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1,
  },
  badgeDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  earnedDate: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginTop: 8,
  },
  lockedBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
