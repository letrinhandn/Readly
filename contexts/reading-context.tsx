import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import { Book, ReadingSession, ReadingStats } from '@/types/book';

const BOOKS_KEY = 'reading_ritual_books';
const SESSIONS_KEY = 'reading_ritual_sessions';

export const [ReadingProvider, useReading] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const booksQuery = useQuery({
    queryKey: ['books'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('books').select('*');
        if (error) throw error;
        if (data && Array.isArray(data)) return (data as Book[]);
      } catch (e) {
        // fallback to AsyncStorage
        const stored = await AsyncStorage.getItem(BOOKS_KEY);
        return stored ? (JSON.parse(stored) as Book[]) : [];
      }
      return [];
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('reading_sessions').select('*');
        if (error) throw error;
        if (data && Array.isArray(data)) {
          return (data as any[]).map(session => ({
            id: session.id,
            bookId: session.book_id,
            userId: session.user_id,
            startTime: session.start_time,
            endTime: session.end_time,
            pagesRead: session.pages_read,
            duration: session.duration,
            reflection: session.reflection,
            mood: session.mood,
            location: session.location,
            createdAt: session.created_at,
            updatedAt: session.updated_at,
          } as ReadingSession));
        }
      } catch (e) {
        console.log('Falling back to AsyncStorage for sessions:', e);
        const stored = await AsyncStorage.getItem(SESSIONS_KEY);
        return stored ? (JSON.parse(stored) as ReadingSession[]) : [];
      }
      return [];
    },
  });

  const saveBooksM = useMutation({
    mutationFn: async (books: Book[]) => {
      try {
        // try upsert to supabase
        const { error } = await supabase.from('books').upsert(books);
        if (error) throw error;
      } catch (e) {
        // fallback to AsyncStorage
        await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      }
      return books;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
  const { mutate: saveBooks } = saveBooksM;

  const saveSessionsM = useMutation({
    mutationFn: async (sessions: ReadingSession[]) => {
      try {
        const sessionsData = sessions.map(s => ({
          id: s.id,
          book_id: s.bookId,
          user_id: s.userId,
          start_time: s.startTime,
          end_time: s.endTime,
          pages_read: s.pagesRead,
          duration: s.duration,
          reflection: s.reflection,
          mood: s.mood,
          location: s.location,
        }));
        const { error } = await supabase.from('reading_sessions').upsert(sessionsData);
        if (error) throw error;
      } catch (e) {
        console.log('Falling back to AsyncStorage for saving sessions:', e);
        await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
      }
      return sessions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
  const { mutate: saveSessions } = saveSessionsM;

  const addBook = useCallback((book: Omit<Book, 'id'>) => {
    const books = booksQuery.data ?? [];
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
    };
    saveBooks([...books, newBook]);
  }, [booksQuery.data, saveBooks]);

  const updateBook = useCallback((bookId: string, updates: Partial<Book>) => {
    const books = booksQuery.data ?? [];
    const updatedBooks = books.map((b) =>
      b.id === bookId ? { ...b, ...updates } : b
    );
    saveBooks(updatedBooks);
  }, [booksQuery.data, saveBooks]);

  const deleteBook = useCallback((bookId: string) => {
    const books = booksQuery.data ?? [];
    const filtered = books.filter((b) => b.id !== bookId);
    saveBooks(filtered);
  }, [booksQuery.data, saveBooks]);

  const startReadingSession = useCallback((bookId: string) => {
    const sessionId = Date.now().toString();
    const newSession: ReadingSession = {
      id: sessionId,
      bookId,
      startTime: new Date().toISOString(),
      pagesRead: 0,
      duration: 0,
    };
    const sessions = sessionsQuery.data ?? [];
    const updated = [...sessions, newSession];
    // update the query cache immediately so other callers (endReadingSession) see the session
    queryClient.setQueryData(['sessions'], updated);
    // persist in Supabase (background) with fallback to AsyncStorage
    saveSessionsM.mutateAsync(updated).catch((e) => {
      console.error('Failed to save sessions on start:', e);
    });
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [sessionsQuery.data, saveSessions]);

  const endReadingSession = useCallback(async (sessionId: string, pagesRead: number, reflection?: string, fallbackBookId?: string) => {
    const sessions = sessionsQuery.data ?? [];
    const session = sessions.find((s) => s.id === sessionId);

    const endTime = new Date();

    if (!session) {
      // fallback: create a minimal session record if we don't have the original (start may not have been persisted)
      if (!fallbackBookId) {
        // nothing we can do without a book id
        return;
      }
      const startTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
      const newSession = {
        id: sessionId,
        bookId: fallbackBookId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        pagesRead,
        duration,
        reflection,
      } as ReadingSession;

    const updatedSessions = [...sessions, newSession];
    await saveSessionsM.mutateAsync(updatedSessions);
    // ensure queries are fresh so UI reflects the newly saved session immediately
    queryClient.invalidateQueries({ queryKey: ['sessions'] });

      const books = booksQuery.data ?? [];
      const book = books.find((b) => b.id === fallbackBookId);
      if (book) {
        updateBook(book.id, {
          currentPage: Math.min(book.currentPage + pagesRead, book.totalPages),
          lastReadAt: endTime.toISOString(),
          status: book.currentPage + pagesRead >= book.totalPages ? 'completed' : 'reading',
        });
      }

      setCurrentSessionId(null);
      return;
    }

    const startTime = new Date(session.startTime);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);

    const updatedSessions = sessions.map((s) =>
      s.id === sessionId
        ? { ...s, endTime: endTime.toISOString(), pagesRead, duration, reflection }
        : s
    );
  // use mutateAsync so callers can await persistence before navigating away
  await saveSessionsM.mutateAsync(updatedSessions);
  // explicitly invalidate to make sure consumers read the latest data
  queryClient.invalidateQueries({ queryKey: ['sessions'] });

    const books = booksQuery.data ?? [];
    const book = books.find((b) => b.id === session.bookId);
    if (book) {
      updateBook(book.id, {
        currentPage: Math.min(book.currentPage + pagesRead, book.totalPages),
        lastReadAt: endTime.toISOString(),
        status: book.currentPage + pagesRead >= book.totalPages ? 'completed' : 'reading',
      });
    }

    setCurrentSessionId(null);
  }, [sessionsQuery.data, booksQuery.data, saveSessionsM, updateBook]);

  const stats: ReadingStats = useMemo(() => {
    const books = booksQuery.data ?? [];
    const sessions = sessionsQuery.data ?? [];

    const totalBooksRead = books.filter((b) => b.status === 'completed').length;
    const totalPagesRead = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
    const totalMinutesRead = sessions.reduce((sum, s) => sum + s.duration, 0);

    const today = new Date();
    const completedSessions = sessions.filter((s) => s.endTime);
    const sessionDates = completedSessions.map((s) => {
      const date = new Date(s.endTime!);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    });
    const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);

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
      const sessionTime = new Date(s.endTime!).getTime();
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
  }, [booksQuery.data, sessionsQuery.data]);

  const currentBooks = useMemo(() => {
    const books = booksQuery.data ?? [];
    return books.filter((b) => b.status === 'reading');
  }, [booksQuery.data]);

  const getBookSessions = useCallback((bookId: string) => {
    const sessions = sessionsQuery.data ?? [];
    return sessions.filter((s) => s.bookId === bookId);
  }, [sessionsQuery.data]);

  return useMemo(() => ({
    books: booksQuery.data ?? [],
    currentBooks,
    sessions: sessionsQuery.data ?? [],
    currentSessionId,
    stats,
    isLoading: booksQuery.isLoading || sessionsQuery.isLoading,
    addBook,
    updateBook,
    deleteBook,
    startReadingSession,
    endReadingSession,
    getBookSessions,
  }), [booksQuery.data, booksQuery.isLoading, currentBooks, sessionsQuery.data, sessionsQuery.isLoading, currentSessionId, stats, addBook, updateBook, deleteBook, startReadingSession, endReadingSession, getBookSessions]);
});
