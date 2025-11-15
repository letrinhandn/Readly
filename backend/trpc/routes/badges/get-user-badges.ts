import { protectedProcedure } from "@/backend/trpc/create-context";
import { createClient } from "@supabase/supabase-js";
import { UserBadgeDB, dbToUserBadge, BadgeDefinitionDB } from "@/types/badge";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xvnhanwektoejkgpzybt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmhhbndla3RvZWprZ3B6eWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE2MjgsImV4cCI6MjA3ODQ0NzYyOH0.o-jQ3kmMtRNO_CMj0oHqhe5CSlMJv4CyrzDIRmFBGZs';

export const getUserBadgesRoute = protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.userId;
  console.log('Getting user badges for user:', userId);
  
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${ctx.token}`,
      },
    },
  });
  
  const { data, error } = await client
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
