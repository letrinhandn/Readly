# Badge System Troubleshooting Guide

## Issue: No badges showing up after completing reading sessions

### Step 1: Verify badge_definitions in Supabase

1. Go to Supabase Dashboard → Table Editor → badge_definitions
2. Check if there are any rows in the table
3. If empty, you need to insert badge definitions first

### Step 2: Add Badge Definitions (SQL)

Run this SQL in Supabase SQL Editor:

```sql
-- Insert badge definitions
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
-- TIME BADGES
('focus-5', 'Focus Master', 'Complete a 5-minute reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus5&backgroundColor=3B82F6', 'time', '{"type": "time", "value": 5}'),
('first-minute', 'First Step', 'Complete your first reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=first&backgroundColor=3B82F6', 'time', '{"type": "time", "value": 1}'),
('quick-session', 'Quick Reader', 'Complete a 3-minute session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=quick&backgroundColor=3B82F6', 'time', '{"type": "time", "value": 3}'),

-- STREAK BADGES
('tiny-streak', 'Tiny Streak', 'Read for 2 days in a row', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=tiny&backgroundColor=10B981', 'streak', '{"type": "streak", "value": 2}'),
('warm-up-streak', 'Warming Up', 'Read for 3 days in a row', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=warmup&backgroundColor=10B981', 'streak', '{"type": "streak", "value": 3}'),
('morning-read', 'Morning Bird', 'Read in the morning (5 AM - 10 AM)', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning&backgroundColor=10B981', 'streak', '{"type": "custom"}'),
('night-read', 'Night Owl', 'Read late at night (9 PM - 2 AM)', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=night&backgroundColor=10B981', 'streak', '{"type": "custom"}'),

-- PAGE BADGES
('first-10-pages', 'Page Turner', 'Read 10 pages total', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=pages10&backgroundColor=3B82F6', 'pages', '{"type": "pages", "value": 10}'),
('page-starter', 'Page Starter', 'Read 5 pages in a single session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=pager&backgroundColor=3B82F6', 'pages', '{"type": "pages", "value": 5}'),

-- BOOK BADGES
('book-initiate', 'Book Initiate', 'Start your first book', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=init&backgroundColor=3B82F6', 'books', '{"type": "books", "value": 1}'),
('halfway-hero', 'Halfway Hero', 'Reach 50% progress in a book', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=half&backgroundColor=8B5CF6', 'books', '{"type": "custom"}'),
('first-finish', 'Finisher', 'Complete your first book', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=finish&backgroundColor=8B5CF6', 'books', '{"type": "books", "value": 1}'),

-- REFLECTION BADGES
('first-reflection', 'Reflective Reader', 'Write your first reflection', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=reflect&backgroundColor=10B981', 'reflection', '{"type": "custom"}'),
('triple-notes', 'Note Taker', 'Write 3 reflections', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=notes&backgroundColor=10B981', 'reflection', '{"type": "custom"}'),

-- GENRE & AUTHOR BADGES
('genre-explorer', 'Genre Explorer', 'Read from your first genre', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=genre&backgroundColor=3B82F6', 'genre', '{"type": "custom"}'),
('new-author', 'Author Discoverer', 'Read from your first author', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=author&backgroundColor=3B82F6', 'author', '{"type": "custom"}'),

-- EVENT BADGES
('daily-goal', 'Daily Goal', 'Complete at least one session today', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=daily&backgroundColor=3B82F6', 'events', '{"type": "custom"}'),
('weekly-hello', 'Weekly Warrior', 'Read on 3 different days this week', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=weekly&backgroundColor=10B981', 'events', '{"type": "custom"}')

ON CONFLICT (id) DO NOTHING;
```

### Step 3: Check Console Logs

Open the app and look for these logs:

1. **After loading badges:**
   - `[Badge API] Fetched X badge definitions`
   - Should show 18 badges

2. **After completing a session:**
   - `[FocusSession] Ending session: { sessionId, duration, pagesRead }`
   - `[FocusSession] Triggering badge check`
   - `[Badges] Checking badges with X sessions, Y books`
   - `[Badges] Badge XXX should be awarded!`

3. **If no badges are awarded:**
   - Check: `[Badges] Stats:` - verify totalReflections, totalPages, currentStreak
   - Check: `[Badges] Completed sessions: X` - should be > 0
   - Check: `[Badges] Session: XXX duration: Y min, pages: Z`

### Step 4: Common Issues

#### Issue: "No badge definitions available yet"
- **Cause:** Badge definitions table is empty
- **Fix:** Run the SQL INSERT above

#### Issue: "Reading data not ready yet"
- **Cause:** Sessions or books not loaded
- **Fix:** Wait 2-3 seconds after ending session, badge check happens automatically

#### Issue: Completed > 1 minute but no badge
- **Cause:** Duration is in minutes, check logic requires >= 1 minute
- **Debug:** Check console log `Session: XXX duration: Y min`
- **Fix:** Ensure session duration >= 1 minute (60 seconds)

#### Issue: Read 20 pages but no badge
- **Cause:** Badge check looks at `stats.totalPagesRead` not session pages
- **Debug:** Check console log `[Badges] Stats: { totalPages: X }`
- **Fix:** Ensure total pages >= 10 for 'first-10-pages' badge

### Step 5: Manual Trigger (Debug)

In Profile screen, there's a debug button (only in __DEV__ mode):
1. Go to Profile tab
2. Tap "🔄 Check Badges (Debug)" button
3. Watch console logs

### Step 6: Verify Supabase RLS Policies

Check if these policies exist:

```sql
-- Check badge_definitions policies
SELECT * FROM pg_policies WHERE tablename = 'badge_definitions';

-- Check user_badges policies  
SELECT * FROM pg_policies WHERE tablename = 'user_badges';
```

Should see:
- `public read badge_definitions` (SELECT USING true)
- `users read own badges` (SELECT USING auth.uid()::TEXT = user_id)
- `users insert own badges` (INSERT WITH CHECK auth.uid()::TEXT = user_id)

### Step 7: Test Badge Award Manually

```sql
-- Check current user's session stats
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  SUM(pages_read) as total_pages,
  SUM(duration) as total_minutes
FROM reading_sessions
WHERE user_id = 'YOUR_USER_ID'
GROUP BY user_id;

-- Manually award a badge for testing
INSERT INTO user_badges (id, user_id, badge_id, earned_at)
VALUES (
  'YOUR_USER_ID_first-minute_' || FLOOR(EXTRACT(EPOCH FROM NOW())),
  'YOUR_USER_ID',
  'first-minute',
  NOW()
);
```

### Expected Behavior After Fix

1. Complete a reading session (>60 seconds, 5+ pages)
2. Tap "Complete Session" → Confirm
3. Share modal appears
4. After 2 seconds: Badge popup shows with confetti 🎉
5. Badge "First Step" or "Page Starter" appears
6. Popup auto-dismisses after 3 seconds
7. Check Profile → Badges section shows the earned badge

---

## Quick Debug Checklist

- [ ] badge_definitions table has 18+ rows
- [ ] Completed at least one session (>60 seconds)
- [ ] Session has endTime (not null)
- [ ] Console shows `[Badges] Checking badges`
- [ ] Console shows session duration in minutes
- [ ] User is authenticated (check auth.uid())
- [ ] RLS policies allow INSERT into user_badges

## Still Not Working?

Check these final items:

1. **Clear cache and reload:** 
   - On web: Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
   - On mobile: Close and reopen app

2. **Check network tab:**
   - Look for `/api/trpc/badges.getUserBadges` - should return 200
   - Look for `/api/trpc/badges.getAllBadges` - should return badge list
   - Look for `/api/trpc/badges.awardBadge` - should be called after session ends

3. **Verify session was saved:**
   ```sql
   SELECT * FROM reading_sessions 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

4. **Check if badge already earned:**
   ```sql
   SELECT * FROM user_badges 
   WHERE user_id = 'YOUR_USER_ID';
   ```
   - If badge already exists, it won't award again (by design)
   - Delete test badges to retry: `DELETE FROM user_badges WHERE user_id = 'YOUR_USER_ID';`

---

If everything above is correct and badges still don't appear, share the console logs for further debugging.
