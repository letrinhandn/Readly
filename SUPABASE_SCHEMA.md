# Supabase Database Schema

This document describes the database schema for the Reading Ritual app.

## Setup Instructions

1. Go to your Supabase project: https://xvnhanwektoejkgpzybt.supabase.co
2. Navigate to the SQL Editor
3. Run the following SQL commands to create the tables

## SQL Schema

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
  user_id TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_end_time ON reading_sessions(end_time);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_last_read_at ON books(last_read_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're using anon key)
-- In production, you'd want proper authentication-based policies

-- RLS Policies for user-specific data
-- User profiles: users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid()::TEXT = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid()::TEXT = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid()::TEXT = id);
CREATE POLICY "Users can delete own profile" ON user_profiles FOR DELETE USING (auth.uid()::TEXT = id);

-- Books: users can only see/edit their own books
CREATE POLICY "Users can view own books" ON books FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can insert own books" ON books FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own books" ON books FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own books" ON books FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Reading sessions: users can only see/edit their own sessions
CREATE POLICY "Users can view own sessions" ON reading_sessions FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can insert own sessions" ON reading_sessions FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own sessions" ON reading_sessions FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own sessions" ON reading_sessions FOR DELETE USING (auth.uid()::TEXT = user_id);

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

## Table Descriptions

### user_profiles
Stores user profile information including name, bio, age, gender, and profile image.

### books
Stores all books in the user's library with reading progress tracking.

### reading_sessions
Stores individual reading sessions/journal entries. Each session is linked to a book and contains:
- Duration of reading session
- Pages read
- Reflection/notes
- Mood (optional)
- Location (optional)
- Timestamps for streak calculations

## Usage in App

The app uses these tables to:
1. Track reading progress per book
2. Store journal entries for each reading session
3. Calculate reading streaks based on session dates
4. Display reading history and statistics
5. Show journal threads in book details
