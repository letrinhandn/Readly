import createContextHook from '@nkzw/create-context-hook';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback, useEffect } from 'react';
import { BadgeDefinition, UserBadge } from '@/types/badge';
import { trpc } from '@/lib/trpc';
import { useReading } from './reading-context';
import supabase from '@/lib/supabase';

type MergedBadge = {
  badge: BadgeDefinition;
  earned: boolean;
  earnedAt?: string;
};

export const [BadgeProvider, useBadges] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { stats, books, sessions } = useReading();

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

  const checkAndAwardBadges = useCallback(() => {
    if (!allBadgesQuery.data) return;
    
    const badgesToAward: string[] = [];
    
    const completedSessions = sessions.filter(s => s.endTime);
    const totalReflections = completedSessions.filter(s => s.reflection && s.reflection.length > 0).length;
    const distinctGenres = [...new Set(books.flatMap(b => b.categories || []))];
    const distinctAuthors = [...new Set(books.map(b => b.author))];
    const totalBooksFinished = books.filter(b => b.status === 'completed').length;

    allBadgesQuery.data.forEach(badge => {
      if (hasBadge(badge.id)) return;

      let shouldAward = false;

      switch (badge.id) {
        case 'focus-5':
          shouldAward = completedSessions.some(s => s.duration >= 5);
          break;
        
        case 'first-minute':
          shouldAward = completedSessions.some(s => s.duration >= 1) && completedSessions.length === 1;
          break;
        
        case 'quick-session':
          shouldAward = completedSessions.some(s => s.duration >= 3);
          break;
        
        case 'tiny-streak':
          shouldAward = stats.currentStreak >= 2;
          break;
        
        case 'warm-up-streak':
          shouldAward = stats.currentStreak >= 3;
          break;
        
        case 'morning-read': {
          shouldAward = completedSessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 5 && hour <= 10;
          });
          break;
        }
        
        case 'night-read': {
          shouldAward = completedSessions.some(s => {
            const hour = new Date(s.startTime).getHours();
            return hour >= 21 || hour <= 2;
          });
          break;
        }
        
        case 'first-10-pages':
          shouldAward = stats.totalPagesRead >= 10;
          break;
        
        case 'page-starter':
          shouldAward = completedSessions.some(s => s.pagesRead >= 5);
          break;
        
        case 'book-initiate':
          shouldAward = books.some(b => b.status === 'reading');
          break;
        
        case 'halfway-hero': {
          shouldAward = books.some(b => {
            const progress = b.totalPages > 0 ? b.currentPage / b.totalPages : 0;
            return progress >= 0.5;
          });
          break;
        }
        
        case 'first-finish':
          shouldAward = totalBooksFinished >= 1;
          break;
        
        case 'first-reflection':
          shouldAward = totalReflections >= 1;
          break;
        
        case 'triple-notes':
          shouldAward = totalReflections >= 3;
          break;
        
        case 'genre-explorer':
          shouldAward = distinctGenres.length >= 1;
          break;
        
        case 'new-author':
          shouldAward = distinctAuthors.length >= 1;
          break;
        
        case 'daily-goal': {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todaySessions = completedSessions.filter(s => {
            const sessionDate = new Date(s.endTime!);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === today.getTime();
          });
          shouldAward = todaySessions.length >= 1;
          break;
        }
        
        case 'weekly-hello': {
          const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
          const weekSessions = completedSessions.filter(s => {
            return new Date(s.endTime!).getTime() >= weekAgo;
          });
          const weekDates = [...new Set(weekSessions.map(s => {
            const date = new Date(s.endTime!);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          }))];
          shouldAward = weekDates.length >= 3;
          break;
        }
      }

      if (shouldAward) {
        badgesToAward.push(badge.id);
      }
    });

    badgesToAward.forEach(badgeId => {
      awardBadge(badgeId);
    });
  }, [allBadgesQuery.data, hasBadge, sessions, books, stats, awardBadge]);

  useEffect(() => {
    if (allBadgesQuery.data && userBadgesQuery.data && !allBadgesQuery.isLoading && !userBadgesQuery.isLoading) {
      checkAndAwardBadges();
    }
  }, [sessions.length, books.length, stats.currentStreak, stats.totalPagesRead, allBadgesQuery.isLoading, userBadgesQuery.isLoading, checkAndAwardBadges]);

  useEffect(() => {
    let subscription: any;
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      subscription = supabase
        .channel('user_badges_realtime')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          console.log('Badge realtime update received');
          queryClient.invalidateQueries({ queryKey: ['badges', 'getUserBadges'] });
        })
        .subscribe();
    };
    setupRealtime();
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, [queryClient]);

  const mergedBadges = useMemo<MergedBadge[]>(() => {
    const allBadges = allBadgesQuery.data || [];
    const userBadges = userBadgesQuery.data || [];

    return allBadges.map(badge => {
      const earned = userBadges.find(ub => ub.badgeId === badge.id);
      return {
        badge,
        earned: !!earned,
        earnedAt: earned?.earnedAt,
      };
    });
  }, [allBadgesQuery.data, userBadgesQuery.data]);

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
    mergedBadges,
    badgesByRarity,
    topBadges,
    totalEarned: earnedBadges.length,
    isLoading: userBadgesQuery.isLoading || allBadgesQuery.isLoading,
    isAwarding: awardBadgeMutation.isPending,
    awardBadge,
    hasBadge,
    refetch,
    checkAndAwardBadges,
  }), [
    earnedBadges,
    availableBadges,
    mergedBadges,
    badgesByRarity,
    topBadges,
    userBadgesQuery.isLoading,
    allBadgesQuery.isLoading,
    awardBadgeMutation.isPending,
    awardBadge,
    hasBadge,
    refetch,
    checkAndAwardBadges,
  ]);
});
