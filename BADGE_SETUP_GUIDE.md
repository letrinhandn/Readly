# Badge System Setup Guide

## Database Setup

The badge system requires two tables in Supabase:
1. `badge_definitions` - Stores all available badges
2. `user_badges` - Tracks which badges users have earned

### SQL Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- -------------------------------------------------------
-- Function: update_updated_at_column (used by triggers)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- Badge Definitions Table (supports events)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS badge_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (
    rarity IN (
      'common',
      'uncommon',
      'rare',
      'epic',
      'legendary',
      'mythic',
      'godtier'
    )
  ),
  icon_url TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN (
      'time',
      'books',
      'genre',
      'author',
      'streak',
      'pages',
      'special',
      'events'
    )
  ),
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -------------------------------------------------------
-- Trigger: update updated_at on change
-- -------------------------------------------------------
CREATE TRIGGER update_badge_definitions_updated_at
BEFORE UPDATE ON badge_definitions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------------------
-- User Badges Table (earned badges)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_badges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  badge_id TEXT NOT NULL REFERENCES badge_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- -------------------------------------------------------
-- Indexes for performance
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_rarity ON badge_definitions(rarity);
CREATE INDEX IF NOT EXISTS idx_badge_definitions_category ON badge_definitions(category);

-- -------------------------------------------------------
-- Enable Row Level Security
-- -------------------------------------------------------
ALTER TABLE badge_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- Badge Definitions Policies
-- -------------------------------------------------------

-- Anyone can view badge definitions
CREATE POLICY "public read badge_definitions"
ON badge_definitions
FOR SELECT
USING (true);

-- No direct CRUD from client: only admin via service_role
CREATE POLICY "no direct modify badge_definitions"
ON badge_definitions
FOR ALL
USING (false)
WITH CHECK (false);

-- -------------------------------------------------------
-- User Badges Policies
-- -------------------------------------------------------

-- Users can see only their badges
CREATE POLICY "users read own badges"
ON user_badges
FOR SELECT
USING (auth.uid()::TEXT = user_id);

-- Users can earn badges for themselves
CREATE POLICY "users insert own badges"
ON user_badges
FOR INSERT
WITH CHECK (auth.uid()::TEXT = user_id);

-- Users can delete their own earned badges (optional)
CREATE POLICY "users delete own badges"
ON user_badges
FOR DELETE
USING (auth.uid()::TEXT = user_id);
```

### Insert Sample Badges

Run this SQL to insert sample badges:

```sql
-- TIME BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('focus-5', 'Focus Master', 'Complete a 5-minute reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus-5', 'time', '{"type": "time", "value": 5}'),
('first-minute', 'First Step', 'Complete your very first reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=first-minute', 'time', '{"type": "time", "value": 1}'),
('quick-session', 'Quick Reader', 'Complete a 3-minute reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=quick-session', 'time', '{"type": "time", "value": 3}');

-- STREAK BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('tiny-streak', 'Getting Started', 'Reach a 2-day reading streak', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=tiny-streak', 'streak', '{"type": "streak", "value": 2}'),
('warm-up-streak', 'Warming Up', 'Reach a 3-day reading streak', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=warm-up-streak', 'streak', '{"type": "streak", "value": 3}'),
('morning-read', 'Early Bird', 'Read between 5am and 10am', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning-read', 'special', '{"type": "custom", "condition": "morning"}'),
('night-read', 'Night Owl', 'Read after 9pm or before 2am', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=night-read', 'special', '{"type": "custom", "condition": "night"}');

-- PAGE BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('first-10-pages', 'Page Turner', 'Read your first 10 pages', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=first-10-pages', 'pages', '{"type": "pages", "value": 10}'),
('page-starter', 'Good Start', 'Read 5 pages in a single session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=page-starter', 'pages', '{"type": "pages", "value": 5}');

-- BOOK BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('book-initiate', 'Reader', 'Start reading your first book', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=book-initiate', 'books', '{"type": "books_read", "value": 1}'),
('halfway-hero', 'Halfway There', 'Reach 50% progress in a book', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=halfway-hero', 'books', '{"type": "custom", "condition": "halfway"}'),
('first-finish', 'Completionist', 'Finish your first book', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=first-finish', 'books', '{"type": "books_read", "value": 1}');

-- REFLECTION BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('first-reflection', 'Thoughtful', 'Write your first reflection', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=first-reflection', 'special', '{"type": "custom", "condition": "reflection"}'),
('triple-notes', 'Note Taker', 'Write 3 reflections', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=triple-notes', 'special', '{"type": "custom", "condition": "reflection"}');

-- GENRE & AUTHOR BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('genre-explorer', 'Genre Explorer', 'Try your first genre', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=genre-explorer', 'genre', '{"type": "genre", "value": 1}'),
('new-author', 'Author Fan', 'Read from your first author', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=new-author', 'author', '{"type": "author", "value": 1}');

-- EVENT BADGES
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category, criteria) VALUES
('daily-goal', 'Daily Achiever', 'Complete a reading session today', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=daily-goal', 'events', '{"type": "custom", "condition": "daily"}'),
('weekly-hello', 'Weekly Warrior', 'Read on 3 different days this week', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=weekly-hello', 'events', '{"type": "custom", "condition": "weekly"}');
```

## Real-time Setup

Enable real-time for the `user_badges` table:

1. Go to Supabase Dashboard → Database → Replication
2. Enable replication for `user_badges` table
3. Enable all events (INSERT, UPDATE, DELETE)

## Badge Icon URLs

The sample badges use DiceBear avatars for icons. You can replace these with your own custom 500x500 badge icons by:

1. Uploading badge icons to Supabase Storage
2. Updating the `icon_url` column in `badge_definitions` table

Example:
```sql
UPDATE badge_definitions 
SET icon_url = 'https://your-storage-url/badges/focus-5.png' 
WHERE id = 'focus-5';
```

## How Badges Work

The app automatically checks and awards badges based on user activity:

### Time Badges
- `focus-5`: Complete a reading session of 5+ minutes
- `first-minute`: Complete your first reading session (1+ minute)
- `quick-session`: Complete a 3+ minute session

### Streak Badges
- `tiny-streak`: Maintain a 2-day streak
- `warm-up-streak`: Maintain a 3-day streak
- `morning-read`: Read between 5am-10am
- `night-read`: Read after 9pm or before 2am

### Page Badges
- `first-10-pages`: Read a total of 10+ pages
- `page-starter`: Read 5+ pages in a single session

### Book Badges
- `book-initiate`: Start reading a book
- `halfway-hero`: Reach 50% progress in any book
- `first-finish`: Complete your first book

### Reflection Badges
- `first-reflection`: Write your first reflection
- `triple-notes`: Write 3 reflections

### Genre & Author Badges
- `genre-explorer`: Read from any genre
- `new-author`: Read from any author

### Event Badges
- `daily-goal`: Complete a session today
- `weekly-hello`: Read on 3 different days in the past week

## Troubleshooting

### Badges not appearing?
- Check console logs for `[Badges]` messages
- Verify badge_definitions table has data
- Ensure real-time is enabled for user_badges table
- Check that badge IDs in database match the IDs in the code

### Badges not being awarded?
- Check console logs to see if conditions are met
- Verify sessions are being saved correctly with duration and pagesRead
- Try manually calling `checkAndAwardBadges()` from profile screen
- Check that user has permission to insert into user_badges table
