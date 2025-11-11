# 🚀 Quick Start - Tạo Database Supabase

## Làm Ngay Bây Giờ (3 Phút) ⚡

### Bước 1: Mở Supabase Dashboard
```
URL: https://xvnhanwektoejkgpzybt.supabase.co
```

### Bước 2: Chạy SQL
1. Click **SQL Editor** (bên trái)
2. Click **New Query**
3. Copy code dưới đây và paste vào
4. Click **Run**

### Bước 3: SQL Code (Copy toàn bộ)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  bio TEXT,
  age INTEGER,
  gender TEXT,
  profile_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  thumbnail TEXT,
  isbn TEXT,
  isbn13 TEXT,
  description TEXT,
  published_date TEXT,
  publisher TEXT,
  categories JSONB,
  language TEXT,
  page_count INTEGER,
  total_pages INTEGER NOT NULL,
  current_page INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'reading',
  google_books_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading Sessions Table (Journal Entries)
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  pages_read INTEGER DEFAULT 0,
  duration INTEGER DEFAULT 0,
  reflection TEXT,
  mood TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_end_time ON reading_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_last_read_at ON books(last_read_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations on user_profiles" ON user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on books" ON books FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on reading_sessions" ON reading_sessions FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_sessions_updated_at BEFORE UPDATE ON reading_sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## ✅ Xong! Giờ Có Thể Test

1. Mở app
2. Thêm sách vào library
3. Bắt đầu focus session
4. Kết thúc và nhập pages read
5. Xem journal trong book details

---

## 📁 Các File Đã Tạo

1. ✅ `SUPABASE_SCHEMA.md` - Full schema documentation
2. ✅ `READING_JOURNAL_SETUP.md` - Hướng dẫn đầy đủ (English)
3. ✅ `HUONG_DAN_TIENG_VIET.md` - Hướng dẫn đầy đủ (Tiếng Việt)
4. ✅ `backend/trpc/routes/journal/` - 4 API endpoints
5. ✅ `components/ReadingJournal.tsx` - Journal UI component
6. ✅ `contexts/reading-context.tsx` - Updated với Supabase integration
7. ✅ `types/book.ts` - Updated với mood, location, etc.

---

## 🎯 Tính Năng Hoàn Thành

- ✅ Lưu reading sessions vào Supabase
- ✅ Tính toán streaks tự động
- ✅ Hiển thị journal trong book details (dạng threads)
- ✅ Thống kê: total pages, total time, sessions count
- ✅ Fallback về AsyncStorage nếu Supabase lỗi
- ✅ API endpoints đầy đủ (get, create, delete sessions)

---

## ❓ Cần Giúp?

Xem file `HUONG_DAN_TIENG_VIET.md` hoặc `READING_JOURNAL_SETUP.md` để biết thêm chi tiết.
