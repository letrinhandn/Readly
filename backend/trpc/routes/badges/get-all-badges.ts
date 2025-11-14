import { protectedProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import { BadgeDefinitionDB, dbToBadgeDefinition } from "@/types/badge";

export const getAllBadgesRoute = protectedProcedure.query(async () => {
  console.log('Getting all badge definitions');
  
  const { data, error } = await supabase
    .from('badge_definitions')
    .select('*')
    .order('rarity', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching badge definitions:', error);
    throw new Error('Failed to fetch badge definitions');
  }

  const badges = (data || []).map((badge) => dbToBadgeDefinition(badge as BadgeDefinitionDB));
  console.log(`Fetched ${badges.length} badge definitions`);
  
  return badges;
});
