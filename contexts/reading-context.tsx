import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      const stored = await AsyncStorage.getItem(BOOKS_KEY);
      return stored ? (JSON.parse(stored) as Book[]) : [];
    },
  });

  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(SESSIONS_KEY);
      return stored ? (JSON.parse(stored) as ReadingSession[]) : [];
    },
  });

  const saveBooksM = useMutation({
    mutationFn: async (books: Book[]) => {
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      return books;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
  const { mutate: saveBooks } = saveBooksM;

  const saveSessionsM = useMutation({
    mutationFn: async (sessions: ReadingSession[]) => {
      await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
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
    saveSessions([...sessions, newSession]);
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [sessionsQuery.data, saveSessions]);

  const endReadingSession = useCallback((sessionId: string, pagesRead: number) => {
    const sessions = sessionsQuery.data ?? [];
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);

    const updatedSessions = sessions.map((s) =>
      s.id === sessionId
        ? { ...s, endTime: endTime.toISOString(), pagesRead, duration }
        : s
    );
    saveSessions(updatedSessions);

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
  }, [sessionsQuery.data, booksQuery.data, saveSessions, updateBook]);

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
