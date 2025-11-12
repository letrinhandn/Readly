-- =====================================================
-- Migration: Add user_id to books table and update RLS
-- =====================================================
-- This migration adds user_id column to books table
-- and updates RLS policies for proper data isolation
-- =====================================================

-- Step 1: Add user_id column to books table (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'books' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE books ADD COLUMN user_id TEXT;
        
        -- Set existing books to a default user (if any exist)
        -- You might want to delete all test data instead
        UPDATE books SET user_id = 'default-user' WHERE user_id IS NULL;
        
        -- Now make it NOT NULL
        ALTER TABLE books ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Step 2: Make reading_sessions.user_id NOT NULL (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reading_sessions' AND column_name = 'user_id' AND is_nullable = 'YES'
    ) THEN
        -- Set existing sessions to match their book's user
        UPDATE reading_sessions rs
        SET user_id = b.user_id
        FROM books b
        WHERE rs.book_id = b.id AND rs.user_id IS NULL;
        
        -- Make it NOT NULL
        ALTER TABLE reading_sessions ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;

-- Step 3: Create index for user_id on books (if not exists)
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);

-- Step 4: Drop old RLS policies
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations on books" ON books;
DROP POLICY IF EXISTS "Allow all operations on reading_sessions" ON reading_sessions;

-- Step 5: Create new RLS policies for user-specific data

-- User profiles: users can only see/edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;

CREATE POLICY "Users can view own profile" ON user_profiles 
    FOR SELECT USING (auth.uid()::TEXT = id);
CREATE POLICY "Users can insert own profile" ON user_profiles 
    FOR INSERT WITH CHECK (auth.uid()::TEXT = id);
CREATE POLICY "Users can update own profile" ON user_profiles 
    FOR UPDATE USING (auth.uid()::TEXT = id);
CREATE POLICY "Users can delete own profile" ON user_profiles 
    FOR DELETE USING (auth.uid()::TEXT = id);

-- Books: users can only see/edit their own books
DROP POLICY IF EXISTS "Users can view own books" ON books;
DROP POLICY IF EXISTS "Users can insert own books" ON books;
DROP POLICY IF EXISTS "Users can update own books" ON books;
DROP POLICY IF EXISTS "Users can delete own books" ON books;

CREATE POLICY "Users can view own books" ON books 
    FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can insert own books" ON books 
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own books" ON books 
    FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own books" ON books 
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- Reading sessions: users can only see/edit their own sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON reading_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON reading_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON reading_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON reading_sessions;

CREATE POLICY "Users can view own sessions" ON reading_sessions 
    FOR SELECT USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can insert own sessions" ON reading_sessions 
    FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can update own sessions" ON reading_sessions 
    FOR UPDATE USING (auth.uid()::TEXT = user_id);
CREATE POLICY "Users can delete own sessions" ON reading_sessions 
    FOR DELETE USING (auth.uid()::TEXT = user_id);

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify RLS is enabled on all tables
-- 3. Test with multiple user accounts
-- =====================================================
