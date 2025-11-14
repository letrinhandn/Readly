import createContextHook from '@nkzw/create-context-hook';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { UserBadge } from '@/types/badge';
import { trpc } from '@/lib/trpc';

export const [BadgeProvider, useBadges] = createContextHook(() => {
  const queryClient = useQueryClient();

  const userBadgesQuery = trpc.badges.getUserBadges.useQuery();
  
  const allBadgesQuery = trpc.badges.getAllBadges.useQuery();

  const awardBadgeMutation = trpc.badges.awardBadge.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges', 'getUserBadges'] });
    },
  });

  const awardBadge = useCallback((badgeId: string) => {
    console.log('Awarding badge:', badgeId);
    awardBadgeMutation.mutate({ badgeId });
  }, [awardBadgeMutation]);

  const hasBadge = useCallback((badgeId: string): boolean => {
    if (!userBadgesQuery.data) return false;
    return userBadgesQuery.data.some((ub) => ub.badgeId === badgeId);
  }, [userBadgesQuery.data]);

  const earnedBadges = useMemo(() => {
    return userBadgesQuery.data || [];
  }, [userBadgesQuery.data]);

  const availableBadges = useMemo(() => {
    return allBadgesQuery.data || [];
  }, [allBadgesQuery.data]);

  const badgesByRarity = useMemo(() => {
    const badges = userBadgesQuery.data || [];
    const grouped: Record<string, UserBadge[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
      mythic: [],
      godtier: [],
    };

    badges.forEach((userBadge) => {
      if (userBadge.badge) {
        grouped[userBadge.badge.rarity].push(userBadge);
      }
    });

    return grouped;
  }, [userBadgesQuery.data]);

  const topBadges = useMemo(() => {
    const badges = userBadgesQuery.data || [];
    const rarityOrder = ['godtier', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];
    
    return badges
      .slice()
      .sort((a, b) => {
        if (!a.badge || !b.badge) return 0;
        const aIndex = rarityOrder.indexOf(a.badge.rarity);
        const bIndex = rarityOrder.indexOf(b.badge.rarity);
        return aIndex - bIndex;
      })
      .slice(0, 5);
  }, [userBadgesQuery.data]);

  const refetch = useCallback(() => {
    userBadgesQuery.refetch();
    allBadgesQuery.refetch();
  }, [userBadgesQuery, allBadgesQuery]);

  return useMemo(() => ({
    earnedBadges,
    availableBadges,
    badgesByRarity,
    topBadges,
    isLoading: userBadgesQuery.isLoading || allBadgesQuery.isLoading,
    isAwarding: awardBadgeMutation.isPending,
    awardBadge,
    hasBadge,
    refetch,
  }), [
    earnedBadges,
    availableBadges,
    badgesByRarity,
    topBadges,
    userBadgesQuery.isLoading,
    allBadgesQuery.isLoading,
    awardBadgeMutation.isPending,
    awardBadge,
    hasBadge,
    refetch,
  ]);
});
