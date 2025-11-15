import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xvnhanwektoejkgpzybt.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2bmhhbndla3RvZWprZ3B6eWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzE2MjgsImV4cCI6MjA3ODQ0NzYyOH0.o-jQ3kmMtRNO_CMj0oHqhe5CSlMJv4CyrzDIRmFBGZs';

export const awardBadgeRoute = protectedProcedure
  .input(
    z.object({
      badgeId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log('Awarding badge:', input.badgeId, 'to user:', userId);
    
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
    
    const badgeId = `${userId}_${input.badgeId}_${Date.now()}`;
    
    const { data, error } = await client
      .from('user_badges')
      .insert({
        id: badgeId,
        user_id: userId,
        badge_id: input.badgeId,
        earned_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Badge already awarded to user');
        throw new Error('Badge already earned');
      }
      console.error('Error awarding badge:', error);
      throw new Error('Failed to award badge');
    }

    console.log('Badge awarded successfully');
    return data;
  });
