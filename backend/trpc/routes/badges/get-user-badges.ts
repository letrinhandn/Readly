import { protectedProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import { UserBadgeDB, dbToUserBadge, BadgeDefinitionDB } from "@/types/badge";

export const getUserBadgesRoute = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId;
  console.log('Getting user badges for user:', userId);
  
  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      *,
      badge:badge_definitions(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    throw new Error('Failed to fetch user badges');
  }

  const userBadges = (data || []).map((userBadge: any) => {
    const badge = userBadge.badge ? {
      ...userBadge.badge,
      icon_url: userBadge.badge.icon_url,
    } as BadgeDefinitionDB : undefined;
    
    return dbToUserBadge({
      id: userBadge.id,
      user_id: userBadge.user_id,
      badge_id: userBadge.badge_id,
      earned_at: userBadge.earned_at,
      badge,
    } as UserBadgeDB);
  });
  
  console.log(`Fetched ${userBadges.length} user badges`);
  
  return userBadges;
});
