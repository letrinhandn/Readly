import { protectedProcedure } from "@/backend/trpc/create-context";
import { createClient } from "@supabase/supabase-js";
import { BadgeDefinitionDB, dbToBadgeDefinition } from "@/types/badge";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xvnhanwektoejkgpzybt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmhhbndla3RvZWprZ3B6eWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE2MjgsImV4cCI6MjA3ODQ0NzYyOH0.o-jQ3kmMtRNO_CMj0oHqhe5CSlMJv4CyrzDIRmFBGZs';

export const getAllBadgesRoute = protectedProcedure.query(async ({ ctx }) => {
  console.log('Getting all badge definitions for user:', ctx.userId);
  
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
