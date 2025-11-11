# Reading Journal System Setup Guide

## Overview
I've created a complete reading journal system that stores all reading sessions in Supabase. Each session after a reading focus session will be saved and used for:
- **Streak statistics** - Track daily reading streaks
- **Reading stats** - Total pages read, time spent, books completed
- **Reading journal** - Display journal entries in book details as threads

## What Was Created

### 1. Database Schema (`SUPABASE_SCHEMA.md`)
Complete SQL schema for three main tables:
- `user_profiles` - User information
- `books` - Book library
- `reading_sessions` - Reading journal entries

### 2. Backend API (tRPC Procedures)
Located in `backend/trpc/routes/journal/`:
- `get-sessions.ts` - Fetch reading sessions with filtering
- `create-session.ts` - Create/update reading sessions
- `get-stats.ts` - Calculate reading statistics
- `delete-session.ts` - Delete sessions

### 3. Updated Types (`types/book.ts`)
Extended `ReadingSession` interface with new fields:
- `userId` - Link sessions to users
- `mood` - Track reading mood (excited, calm, thoughtful, inspired, tired)
- `location` - Where the reading happened
- `createdAt`, `updatedAt` - Timestamps

### 4. UI Components
- `ReadingJournal.tsx` - Component to display journal entries
- Updated `book-detail.tsx` - Already displays reading journal as threaded entries

### 5. Context Updates
Updated `contexts/reading-context.tsx` to:
- Fetch sessions from `reading_sessions` table (not `sessions`)
- Map Supabase snake_case fields to camelCase
- Store sessions with proper field mapping
- Fallback to AsyncStorage if Supabase fails

## Setup Instructions

### Step 1: Create Supabase Tables

1. Go to your Supabase project dashboard: https://xvnhanwektoejkgpzybt.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire SQL code from `SUPABASE_SCHEMA.md`
5. Click **Run** to execute the SQL

This will create:
- Three tables: `user_profiles`, `books`, `reading_sessions`
- Indexes for better query performance
- Row Level Security policies (currently open for testing)
- Automatic timestamp triggers

### Step 2: Environment Variables

The Supabase credentials are already configured in the app. The system uses:
- **URL**: https://xvnhanwektoejkgpzybt.supabase.co
- **Anon Key**: (Already configured in `lib/supabase.ts`)

### Step 3: Test the System

1. **Add a book** to your library
2. **Start a focus session** from the book details
3. **Complete the session** and enter pages read + optional reflection
4. **View the journal** in the book details screen

## How It Works

### Reading Session Flow

1. **User starts reading** → `startReadingSession()` creates a new session
2. **User finishes** → Prompt appears asking for:
   - Pages read (or last page number)
   - Reflection (optional)
3. **Session is saved** to Supabase (`reading_sessions` table)
4. **Book progress updates** → `currentPage` increments
5. **Stats recalculate** → Streaks, total pages, total time

### Data Storage

```
reading_sessions table:
- id (unique identifier)
- book_id (references books table)
- user_id (optional, for multi-user support)
- start_time (when session started)
- end_time (when session ended)
- pages_read (number of pages)
- duration (minutes spent reading)
- reflection (optional notes)
- mood (optional: excited, calm, thoughtful, inspired, tired)
- location (optional: where they read)
- created_at, updated_at (automatic timestamps)
```

### Streak Calculation

The system calculates streaks by:
1. Grouping completed sessions by date
2. Finding unique dates with at least one session
3. Checking consecutive days backward from today
4. Current streak = consecutive days including today or yesterday
5. Longest streak = maximum consecutive days ever

### Journal Display

In `app/book-detail.tsx`, sessions are:
- Grouped by date
- Displayed as threaded entries
- Showing time, duration, pages read, and reflection
- Styled like a timeline with dots and connecting lines

## API Usage Examples

### Fetch Sessions for a Book
```typescript
import { trpc } from '@/lib/trpc';

const { data: sessions } = trpc.journal.getSessions.useQuery({
  bookId: 'book-id-here',
  limit: 10
});
```

### Get Reading Stats
```typescript
const { data: stats } = trpc.journal.getStats.useQuery({});
// Returns: { totalBooksRead, totalPagesRead, totalMinutesRead, currentStreak, longestStreak, sessionsThisWeek }
```

### Create/Update Session
```typescript
const createSession = trpc.journal.createSession.useMutation();

createSession.mutate({
  id: 'session-id',
  bookId: 'book-id',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  pagesRead: 25,
  duration: 30,
  reflection: 'Great chapter!',
  mood: 'inspired'
});
```

## Features

### ✅ Completed
- [x] Supabase database schema
- [x] tRPC API for journal operations
- [x] Session tracking in focus mode
- [x] Streak calculation
- [x] Journal display in book details
- [x] Fallback to AsyncStorage if Supabase fails
- [x] Automatic progress updates

### 🚀 Future Enhancements
- [ ] Mood selection UI in complete session form
- [ ] Location tracking/input
- [ ] Filter journal by date range
- [ ] Export journal as PDF
- [ ] Journal search functionality
- [ ] Reading insights and analytics
- [ ] Weekly/monthly reading reports

## Troubleshooting

### Sessions Not Saving
- Check Supabase dashboard → Table Editor → reading_sessions
- Verify SQL schema was executed correctly
- Check browser console for errors
- Ensure RLS policies are set correctly

### Streaks Not Updating
- Sessions need `end_time` to count for streaks
- Check if sessions are being saved with proper timestamps
- Verify timezone issues (system uses ISO 8601 format)

### Data Not Syncing
- The app uses React Query caching
- Pull to refresh in the library tab to force reload
- Check network tab for failed API calls

## Database Maintenance

### View All Sessions
```sql
SELECT * FROM reading_sessions
ORDER BY created_at DESC;
```

### Get Sessions for a Book
```sql
SELECT * FROM reading_sessions
WHERE book_id = 'your-book-id'
ORDER BY end_time DESC;
```

### Calculate Total Reading Time
```sql
SELECT 
  book_id,
  COUNT(*) as session_count,
  SUM(pages_read) as total_pages,
  SUM(duration) as total_minutes
FROM reading_sessions
WHERE end_time IS NOT NULL
GROUP BY book_id;
```

### Check User Streak
```sql
SELECT 
  DATE(end_time) as reading_date,
  COUNT(*) as sessions
FROM reading_sessions
WHERE end_time IS NOT NULL
GROUP BY DATE(end_time)
ORDER BY reading_date DESC;
```

## Security Notes

**Current Setup**: The database has open RLS policies for testing.

**For Production**: Update the policies to restrict access:

```sql
-- Only allow authenticated users to access their own data
CREATE POLICY "Users can view own sessions" ON reading_sessions
FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own sessions" ON reading_sessions
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own sessions" ON reading_sessions
FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own sessions" ON reading_sessions
FOR DELETE USING (auth.uid()::text = user_id);
```

## Support

If you encounter any issues:
1. Check the `SUPABASE_SCHEMA.md` file for SQL schema
2. Review browser console logs for errors
3. Verify Supabase dashboard shows tables correctly
4. Test with the Supabase REST API directly
5. Check AsyncStorage fallback is working (sessions should save locally even if Supabase fails)

---

**System Status**: ✅ Ready for use after Supabase table creation

**Last Updated**: 2025-11-11
