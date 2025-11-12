import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import supabase from "@/lib/supabase";
import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = 'reading_ritual_sessions';
const BOOKS_KEY = 'reading_ritual_books';

export default publicProcedure
  .input(z.object({ 
    userId: z.string().optional(),
  }))
  .query(async ({ input, ctx }) => {
    try {
      let sessionsQuery = supabase
        .from('reading_sessions')
        .select('*')
        .not('end_time', 'is', null);

      if (ctx.userId) {
        sessionsQuery = sessionsQuery.eq('user_id', ctx.userId);
      }

      const { data: sessions, error: sessionsError } = await sessionsQuery;

      if (sessionsError) throw sessionsError;

      let booksQuery = supabase.from('books').select('*');
      
      if (ctx.userId) {
        booksQuery = booksQuery.eq('user_id', ctx.userId);
      }

      const { data: books, error: booksError } = await booksQuery;

      if (booksError) throw booksError;

      return calculateStats(sessions || [], books || []);
    } catch (e) {
      console.error('Error fetching stats from Supabase:', e);
      const storedSessions = await AsyncStorage.getItem(SESSIONS_KEY);
      const sessions = storedSessions ? JSON.parse(storedSessions) : [];
      
      const storedBooks = await AsyncStorage.getItem(BOOKS_KEY);
      const books = storedBooks ? JSON.parse(storedBooks) : [];
      
      return calculateStats(sessions, books);
    }
  });

function calculateStats(sessions: any[], books: any[]) {
  const totalBooksRead = books.filter((b) => b.status === 'completed').length;
  const totalPagesRead = sessions.reduce((sum, s) => sum + (s.pages_read || s.pagesRead || 0), 0);
  const totalMinutesRead = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);

  const completedSessions = sessions.filter((s) => s.end_time || s.endTime);
  const sessionDates = completedSessions.map((s) => {
    const date = new Date(s.end_time || s.endTime);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  });
  const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);

  const today = new Date();
  let currentStreak = 0;
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  let checkDate = todayStart;

  for (const date of uniqueDates) {
    if (date === checkDate) {
      currentStreak++;
      checkDate -= 24 * 60 * 60 * 1000;
    } else if (date === checkDate - 24 * 60 * 60 * 1000) {
      currentStreak++;
      checkDate -= 24 * 60 * 60 * 1000;
    } else {
      break;
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: number | null = null;

  for (const date of uniqueDates) {
    if (prevDate === null || date === prevDate - 24 * 60 * 60 * 1000) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
    prevDate = date;
  }

  const weekAgo = today.getTime() - 7 * 24 * 60 * 60 * 1000;
  const sessionsThisWeek = completedSessions.filter((s) => {
    const sessionTime = new Date(s.end_time || s.endTime).getTime();
    return sessionTime >= weekAgo;
  }).length;

  return {
    totalBooksRead,
    totalPagesRead,
    totalMinutesRead,
    currentStreak,
    longestStreak,
    sessionsThisWeek,
  };
}
