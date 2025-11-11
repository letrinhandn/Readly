import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = 'reading_ritual_sessions';

export default publicProcedure
  .input(z.object({ 
    bookId: z.string().optional(),
    limit: z.number().optional(),
  }))
  .query(async ({ input }) => {
    try {
      let query = supabase
        .from('reading_sessions')
        .select('*')
        .order('end_time', { ascending: false });

      if (input.bookId) {
        query = query.eq('book_id', input.bookId);
      }

      if (input.limit) {
        query = query.limit(input.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      return data || [];
    } catch (e) {
      console.error('Error fetching sessions from Supabase:', e);
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions = stored ? JSON.parse(stored) : [];
      
      let filtered = sessions;
      if (input.bookId) {
        filtered = sessions.filter((s: any) => s.bookId === input.bookId);
      }
      
      filtered.sort((a: any, b: any) => {
        const dateA = new Date(a.endTime || a.startTime).getTime();
        const dateB = new Date(b.endTime || b.startTime).getTime();
        return dateB - dateA;
      });
      
      if (input.limit) {
        filtered = filtered.slice(0, input.limit);
      }
      
      return filtered;
    }
  });
