import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";

export const awardBadgeRoute = protectedProcedure
  .input(
    z.object({
      badgeId: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;
    console.log('Awarding badge:', input.badgeId, 'to user:', userId);
    
    const badgeId = `${userId}_${input.badgeId}_${Date.now()}`;
    
    const { data, error } = await supabase
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
