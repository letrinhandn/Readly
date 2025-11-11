import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = 'reading_ritual_sessions';

export default publicProcedure
  .input(z.object({ 
    sessionId: z.string(),
  }))
  .mutation(async ({ input }) => {
    try {
      const { error } = await supabase
        .from('reading_sessions')
        .delete()
        .eq('id', input.sessionId);

      if (error) throw error;

      return { success: true };
    } catch (e) {
      console.error('Error deleting session from Supabase:', e);
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions = stored ? JSON.parse(stored) : [];
      
      const filtered = sessions.filter((s: any) => s.id !== input.sessionId);
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(filtered));
      
      return { success: true };
    }
  });
