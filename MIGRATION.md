# Database Migration Script

Nếu bạn đã có dữ liệu cũ trong database, chạy các lệnh SQL sau trong Supabase SQL Editor:

## 1. Thêm cột user_id vào bảng books

```sql
-- Add user_id column to books table if it doesn't exist
ALTER TABLE books ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
```

## 2. Cập nhật Row Level Security (RLS) Policies

```sql
-- Drop old policies
DROP POLICY IF EXISTS "Allow all operations on user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow all operations on books" ON books;
DROP POLICY IF EXISTS "Allow all operations on reading_sessions" ON reading_sessions;

-- User Profiles Policies (users can only access their own profile)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id);

-- Books Policies (users can only access their own books)
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own books" ON books
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid()::text = user_id);

-- Reading Sessions Policies (users can only access their own sessions)
CREATE POLICY "Users can view own sessions" ON reading_sessions
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own sessions" ON reading_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own sessions" ON reading_sessions
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own sessions" ON reading_sessions
  FOR DELETE USING (auth.uid()::text = user_id);
```

## 3. (Optional) Gán user_id cho dữ liệu cũ

Nếu bạn có dữ liệu cũ và muốn gán cho một user cụ thể:

```sql
-- Replace 'YOUR_USER_ID' with your actual user ID
-- You can find your user ID by running: SELECT id FROM auth.users;

UPDATE books 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id IS NULL;

UPDATE reading_sessions 
SET user_id = 'YOUR_USER_ID' 
WHERE user_id IS NULL;
```

## 4. Verification

Kiểm tra xem migration đã thành công:

```sql
-- Check if user_id column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books' AND column_name = 'user_id';

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('books', 'reading_sessions', 'user_profiles');

-- Count books by user
SELECT user_id, COUNT(*) as book_count 
FROM books 
GROUP BY user_id;
```
