import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { Book, ReadingSession, ReadingStats } from '@/types/book';

const BOOKS_KEY = 'reading_ritual_books';
const SESSIONS_KEY = 'reading_ritual_sessions';

interface BookDB {
  id: string;
  user_id: string;
  title: string;
  author: string;
  cover_url?: string;
  thumbnail?: string;
  isbn?: string;
  isbn13?: string;
  description?: string;
  published_date?: string;
  publisher?: string;
  categories?: string[];
  language?: string;
  page_count?: number;
  total_pages: number;
  current_page: number;
  started_at: string;
  last_read_at?: string;
  status: string;
  google_books_id?: string;
  created_at?: string;
  updated_at?: string;
}

function dbToBook(db: BookDB): Book {
  return {
    id: db.id,
    userId: db.user_id,
    title: db.title,
    author: db.author,
    coverUrl: db.cover_url,
    thumbnail: db.thumbnail,
    isbn: db.isbn,
    isbn13: db.isbn13,
    description: db.description,
    publishedDate: db.published_date,
    publisher: db.publisher,
    categories: db.categories,
    language: db.language,
    pageCount: db.page_count,
    totalPages: db.total_pages,
    currentPage: db.current_page,
    startedAt: db.started_at,
    lastReadAt: db.last_read_at,
    status: db.status as 'reading' | 'completed' | 'paused',
    googleBooksId: db.google_books_id,
  };
}

function bookToDb(book: Book): BookDB {
  return {
    id: book.id,
    user_id: book.userId,
    title: book.title,
    author: book.author,
    cover_url: book.coverUrl,
    thumbnail: book.thumbnail,
    isbn: book.isbn,
    isbn13: book.isbn13,
    description: book.description,
    published_date: book.publishedDate,
    publisher: book.publisher,
    categories: book.categories,
    language: book.language,
    page_count: book.pageCount,
    total_pages: book.totalPages,
    current_page: book.currentPage,
    started_at: book.startedAt,
    last_read_at: book.lastReadAt,
    status: book.status,
    google_books_id: book.googleBooksId,
  };
}

export const [ReadingProvider, useReading] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  const booksQuery = useQuery({
    queryKey: ['books', authUserId],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log('No authenticated user for books');
          const stored = await AsyncStorage.getItem(BOOKS_KEY);
          return stored ? (JSON.parse(stored) as Book[]) : [];
        }

        // migrate any locally-saved books (added while unauthenticated)
        try {
          const storedRaw = await AsyncStorage.getItem(BOOKS_KEY);
          if (storedRaw) {
            const storedBooks = JSON.parse(storedRaw) as Book[];
            const unsynced = storedBooks.filter(b => !b.userId || b.userId === '');
            const remaining = storedBooks.filter(b => b.userId && b.userId !== '');

            if (unsynced.length > 0) {
              console.log('Migrating', unsynced.length, 'local books to Supabase for user', user.id);
              const dbBooks = unsynced.map(b => ({ ...bookToDb({ ...b, userId: user.id }) }));
              const { error: upsertError } = await supabase.from('books').upsert(dbBooks);
              if (upsertError) {
                console.error('Failed to upsert migrated books:', upsertError);
              } else {
                if (remaining.length > 0) {
                  await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(remaining));
                } else {
                  await AsyncStorage.removeItem(BOOKS_KEY);
                }
              }
            }
          }
        } catch (e) {
          console.log('Failed to migrate local books to Supabase:', e);
        }

        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        if (data && Array.isArray(data)) {
          console.log('Books loaded from Supabase:', data.length);
          return data.map(dbToBook);
        }
      } catch (e) {
        console.log('Falling back to AsyncStorage for books:', e);
        const stored = await AsyncStorage.getItem(BOOKS_KEY);
        return stored ? (JSON.parse(stored) as Book[]) : [];
      }
      return [];
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const sessionsQuery = useQuery({
    queryKey: ['sessions', authUserId],
    queryFn: async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.log('No authenticated user for sessions');
          const stored = await AsyncStorage.getItem(SESSIONS_KEY);
          return stored ? (JSON.parse(stored) as ReadingSession[]) : [];
        }

        const { data, error } = await supabase
          .from('reading_sessions')
          .select('*')
          .eq('user_id', user.id);
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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const saveBooksM = useMutation({
    mutationFn: async (books: Book[]) => {
      try {
        const dbBooks = books.map(bookToDb);
        const { error } = await supabase.from('books').upsert(dbBooks);
        if (error) {
          console.log('Error saving books to Supabase:', error);
          throw error;
        }
        console.log('Books saved to Supabase successfully:', books.length);
      } catch (e) {
        console.log('Falling back to AsyncStorage for saving books:', e);
        await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
      }
      return books;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', authUserId] });
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
      queryClient.invalidateQueries({ queryKey: ['sessions', authUserId] });
    },
  });
  const { mutate: saveSessions } = saveSessionsM;

  const addBook = useCallback(async (book: Omit<Book, 'id' | 'userId'>) => {
    const { data: { user } } = await supabase.auth.getUser();

    const books = booksQuery.data ?? [];
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
      // If user is not authenticated, store empty userId and rely on AsyncStorage fallback in saveBooks
      userId: user?.id ?? '',
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

  const deleteBook = useCallback(async (bookId: string) => {
    const books = booksQuery.data ?? [];
    const filtered = books.filter((b) => b.id !== bookId);

    // Try server-side delete when authenticated
    try {
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr) console.log('Auth getUser error when deleting:', userErr);

      if (user) {
        const { data: deletedData, error: delError } = await supabase
          .from('books')
          .delete()
          .eq('id', bookId)
          .select('id,user_id');

        if (delError) {
          console.error('Supabase delete error for book', bookId, delError);

          // Inspect whether the row exists and who owns it
          try {
            const { data: existing, error: selError } = await supabase
              .from('books')
              .select('id,user_id')
              .eq('id', bookId)
              .maybeSingle();

            if (selError) console.error('Error selecting book after delete failure:', selError);

            if (existing) {
              if (existing.user_id !== user.id) {
                Alert.alert('Không thể xóa', 'Quyển sách này thuộc tài khoản khác và không thể xóa từ thiết bị này.');
                return;
              }
              Alert.alert('Lỗi', 'Xóa thất bại trên server. Vui lòng thử lại.');
              return;
            } else {
              // Row not found on server — remove locally
              await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
              queryClient.setQueryData(['books', authUserId], filtered);
              queryClient.invalidateQueries({ queryKey: ['books', authUserId] });
              return;
            }
          } catch (e) {
            console.error('Unexpected error while handling delete failure:', e);
            Alert.alert('Lỗi', 'Không thể xóa quyển sách (lỗi không xác định).');
            return;
          }
        }

        // If delete succeeded, also delete related reading_sessions (best-effort)
        try {
          await supabase.from('reading_sessions').delete().eq('book_id', bookId);
        } catch (e) {
          console.log('Failed to delete reading sessions for book (non-fatal):', e);
        }

        // Update cache and refetch
        queryClient.setQueryData(['books', authUserId], filtered);
        queryClient.invalidateQueries({ queryKey: ['books', authUserId] });
        queryClient.invalidateQueries({ queryKey: ['sessions', authUserId] });
        return;
      }
    } catch (e) {
      console.log('Error when attempting Supabase delete, will fallback to local:', e);
    }

    // Fallback: unauthenticated or server not reachable — remove locally
    try {
      await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(filtered));
      queryClient.setQueryData(['books', authUserId], filtered);
      queryClient.invalidateQueries({ queryKey: ['books', authUserId] });
    } catch (e) {
      console.log('Failed to persist deleted book to AsyncStorage:', e);
      Alert.alert('Lỗi', 'Không thể xóa quyển sách ở thời điểm này.');
    }
  }, [booksQuery.data, queryClient, authUserId]);

  // Listen for auth state changes and track current user id. Clear/refresh caches on sign-in/out.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      console.log('Auth state changed:', event, !!session?.user, uid);
      setAuthUserId(uid);

      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['books', uid] });
        queryClient.invalidateQueries({ queryKey: ['sessions', uid] });
      }

      if (event === 'SIGNED_OUT') {
        // clear any cached user-scoped data
        queryClient.setQueryData(['books', null], []);
        queryClient.setQueryData(['sessions', null], []);
      }
    });

    return () => {
      try { data.subscription.unsubscribe(); } catch (e) {}
    };
  }, [queryClient]);

  // Subscribe to Supabase realtime changes for books and reading_sessions for the current auth user
  useEffect(() => {
    let bookChannel: any = null;
    let sessionChannel: any = null;
    if (!authUserId) return;

    try {
      bookChannel = supabase
        .channel(`public:books:user:${authUserId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'books', filter: `user_id=eq.${authUserId}` }, (payload) => {
          console.log('Realtime books event:', (payload as any));
          queryClient.invalidateQueries({ queryKey: ['books', authUserId] });
        })
        .subscribe();

      sessionChannel = supabase
        .channel(`public:reading_sessions:user:${authUserId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reading_sessions', filter: `user_id=eq.${authUserId}` }, (payload) => {
          console.log('Realtime sessions event:', (payload as any));
          queryClient.invalidateQueries({ queryKey: ['sessions', authUserId] });
        })
        .subscribe();
    } catch (e) {
      console.log('Failed to subscribe to Supabase realtime:', e);
    }

    return () => {
      try { if (bookChannel) bookChannel.unsubscribe(); } catch (e) {}
      try { if (sessionChannel) sessionChannel.unsubscribe(); } catch (e) {}
    };
  }, [queryClient, authUserId]);

  const startReadingSession = useCallback(async (bookId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('Cannot start session: No authenticated user');
      return '';
    }

    const sessionId = Date.now().toString();
    const newSession: ReadingSession = {
      id: sessionId,
      bookId,
      userId: user.id,
      startTime: new Date().toISOString(),
      pagesRead: 0,
      duration: 0,
    };
    const sessions = sessionsQuery.data ?? [];
    const updated = [...sessions, newSession];
    queryClient.setQueryData(['sessions', authUserId], updated);
    saveSessionsM.mutateAsync(updated).catch((e) => {
      console.error('Failed to save sessions on start:', e);
    });
    setCurrentSessionId(sessionId);
    return sessionId;
  }, [sessionsQuery.data, queryClient, saveSessionsM, authUserId]);

  const endReadingSession = useCallback(async (sessionId: string, pagesRead: number, reflection?: string, fallbackBookId?: string) => {
    const sessions = sessionsQuery.data ?? [];
    const session = sessions.find((s) => s.id === sessionId);

    const endTime = new Date();

    if (!session) {
      if (!fallbackBookId) {
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
      queryClient.invalidateQueries({ queryKey: ['sessions', authUserId] });

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
    await saveSessionsM.mutateAsync(updatedSessions);
    queryClient.invalidateQueries({ queryKey: ['sessions', authUserId] });

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
  }, [sessionsQuery.data, booksQuery.data, saveSessionsM, updateBook, queryClient, authUserId]);

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
