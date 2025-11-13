import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";

export default publicProcedure
  .input(z.object({ 
    sessionId: z.string(),
  }))
  .query(async ({ input }) => {
    try {
      const { data, error } = await supabase
        .from('session_comments')
        .select('*')
        .eq('session_id', input.sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        id: c.id,
        sessionId: c.session_id,
        userId: c.user_id,
        text: c.text,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    } catch (e) {
      console.error('Error fetching comments:', e);
      return [];
    }
  });
