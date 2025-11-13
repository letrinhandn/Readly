import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";

export default publicProcedure
  .input(z.object({
    id: z.string(),
    sessionId: z.string(),
    userId: z.string(),
    text: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const { data, error } = await supabase
        .from('session_comments')
        .insert({
          id: input.id,
          session_id: input.sessionId,
          user_id: input.userId,
          text: input.text,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error adding comment:', e);
      throw e;
    }
  });
