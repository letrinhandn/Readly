import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = 'reading_ritual_sessions';

export default publicProcedure
  .input(z.object({
    id: z.string(),
    bookId: z.string(),
    userId: z.string().optional(),
    startTime: z.string(),
    endTime: z.string().optional(),
    pagesRead: z.number(),
    duration: z.number(),
    reflection: z.string().optional(),
    mood: z.enum(['excited', 'calm', 'thoughtful', 'inspired', 'tired']).optional(),
    location: z.string().optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    try {
      const sessionData = {
        id: input.id,
        book_id: input.bookId,
        user_id: input.userId || ctx.userId,
        start_time: input.startTime,
        end_time: input.endTime,
        pages_read: input.pagesRead,
        duration: input.duration,
        reflection: input.reflection,
        mood: input.mood,
        location: input.location,
      };

      const { data, error } = await supabase
        .from('reading_sessions')
        .upsert(sessionData)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (e) {
      console.error('Error saving session to Supabase:', e);
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions = stored ? JSON.parse(stored) : [];
      
      const existingIndex = sessions.findIndex((s: any) => s.id === input.id);
      if (existingIndex >= 0) {
        sessions[existingIndex] = input;
      } else {
        sessions.push(input);
      }
      
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      return input;
    }
  });
