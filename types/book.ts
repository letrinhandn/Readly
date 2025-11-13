export interface Book {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverUrl?: string;
  thumbnail?: string;
  isbn?: string;
  isbn13?: string;
  description?: string;
  publishedDate?: string;
  publisher?: string;
  categories?: string[];
  language?: string;
  pageCount?: number;
  totalPages: number;
  currentPage: number;
  startedAt: string;
  lastReadAt?: string;
  status: 'reading' | 'completed' | 'paused';
  googleBooksId?: string;
}

export interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
      small?: string;
      medium?: string;
      large?: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

export interface SessionComment {
  id: string;
  sessionId: string;
  userId: string;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  pagesRead: number;
  duration: number;
  reflection?: string;
  mood?: 'excited' | 'calm' | 'thoughtful' | 'inspired' | 'tired';
  location?: string;
  comments?: SessionComment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReadingStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalMinutesRead: number;
  currentStreak: number;
  longestStreak: number;
  sessionsThisWeek: number;
}
