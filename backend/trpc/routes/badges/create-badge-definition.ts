import { z } from "zod";
import { protectedProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";

export const createBadgeDefinitionRoute = protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string(),
      rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'godtier']),
      iconUrl: z.string(),
      category: z.string(),
      criteria: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('Creating badge definition:', input.name);
    
    const badgeId = `badge_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const { data, error } = await supabase
      .from('badge_definitions')
      .insert({
        id: badgeId,
        name: input.name,
        description: input.description,
        rarity: input.rarity,
        icon_url: input.iconUrl,
        category: input.category,
        criteria: input.criteria || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating badge definition:', error);
      throw new Error('Failed to create badge definition');
    }

    console.log('Badge definition created successfully');
    return data;
  });
