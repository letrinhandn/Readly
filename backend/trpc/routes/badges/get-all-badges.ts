import { publicProcedure } from "@/backend/trpc/create-context";
import { createClient } from "@supabase/supabase-js";
import { BadgeDefinitionDB, dbToBadgeDefinition } from "@/types/badge";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xvnhanwektoejkgpzybt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmhhbndla3RvZWprZ3B6eWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE2MjgsImV4cCI6MjA3ODQ0NzYyOH0.o-jQ3kmMtRNO_CMj0oHqhe5CSlMJv4CyrzDIRmFBGZs';

export const getAllBadgesRoute = publicProcedure.query(async () => {
  console.log('[Badge API] Getting all badge definitions (public)');
  console.log('[Badge API] Supabase URL:', SUPABASE_URL);
  
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
    },
  });
  
  const { data, error } = await client
    .from('badge_definitions')
    .select('*')
    .order('rarity', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('[Badge API] Error fetching badge definitions:', error);
    throw new Error('Failed to fetch badge definitions');
  }

  console.log('[Badge API] Raw data from Supabase:', data?.length || 0, 'rows');
  if (data && data.length > 0) {
    console.log('[Badge API] First badge:', data[0]);
  }

  const badges = (data || []).map((badge) => dbToBadgeDefinition(badge as BadgeDefinitionDB));
  console.log(`[Badge API] Fetched ${badges.length} badge definitions`);
  if (badges.length > 0) {
    console.log('[Badge API] Badge categories:', [...new Set(badges.map(b => b.category))]);
    console.log('[Badge API] Badge rarities:', [...new Set(badges.map(b => b.rarity))]);
  }
  
  return badges;
});
