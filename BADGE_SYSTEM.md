# Badge System Implementation

The badge system is now fully integrated into your Readly app! Here's what has been implemented:

## Features Implemented

### 1. **Badge Context** (`contexts/badge-context.tsx`)
- Fetches all badge definitions and user badges from Supabase
- Merges them to show earned/locked status
- Implements client-side unlock logic for all badge types
- Automatic badge checking after sessions complete
- Real-time synchronization with Supabase

### 2. **Badge Components**
- **`Badge.tsx`**: Displays individual badges with rarity-based styling
  - Earned badges: Full color with glow effects
  - Locked badges: Grayscale with 40% opacity
  - Perfect 500x500 circle rendering
  - Rarity-based frames (mythic with red/gold gradient, godtier with black/gold)

- **`BadgesGrid.tsx`**: Grid layout for all badges
  - Sortable by rarity and earned status
  - Tap to view badge details in modal
  - Shows unlock dates for earned badges

### 3. **Badge Screens**
- **`/badges`**: Full badge collection screen
  - Shows "X of Y earned" summary
  - Complete grid of all badges
  - Badge detail modals with descriptions

- **Profile Integration**: Profile shows top 5 badges with link to full collection

### 4. **Unlock Logic**
The system automatically checks and awards badges based on these criteria:

#### Time Badges
- `focus-5`: Complete a 5-minute session
- `first-minute`: Complete your first 1-minute session
- `quick-session`: Complete a 3-minute session

#### Streak Badges
- `tiny-streak`: Maintain a 2-day streak
- `warm-up-streak`: Maintain a 3-day streak
- `morning-read`: Read between 5 AM and 10 AM
- `night-read`: Read after 9 PM or before 2 AM

#### Page Badges
- `first-10-pages`: Read 10 total pages
- `page-starter`: Read 5 pages in a single session

#### Book Badges
- `book-initiate`: Start reading a book
- `halfway-hero`: Reach 50% progress in any book
- `first-finish`: Complete your first book

#### Reflection Badges
- `first-reflection`: Write your first reflection
- `triple-notes`: Write 3 reflections

#### Genre & Author Badges
- `genre-explorer`: Read a book from any genre
- `new-author`: Read a book by any author

#### Event Badges
- `daily-goal`: Complete a session today
- `weekly-hello`: Read on 3 different days in a week

## Adding Badge Definitions to Supabase

You need to insert badge definitions into your `badge_definitions` table. Here's an example SQL script:

\`\`\`sql
-- Insert badge definitions
INSERT INTO badge_definitions (id, name, description, rarity, icon_url, category) VALUES
  ('focus-5', 'Focus Master', 'Complete a 5-minute reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=focus5', 'time'),
  ('first-minute', 'First Step', 'Complete your first reading session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=firststep', 'time'),
  ('quick-session', 'Quick Reader', 'Complete a 3-minute session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=quick', 'time'),
  
  ('tiny-streak', 'Streak Starter', 'Maintain a 2-day reading streak', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak2', 'streak'),
  ('warm-up-streak', 'Consistency Builder', 'Maintain a 3-day reading streak', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=streak3', 'streak'),
  ('morning-read', 'Morning Bird', 'Read in the morning (5 AM - 10 AM)', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=morning', 'streak'),
  ('night-read', 'Night Owl', 'Read late at night (after 9 PM)', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=night', 'streak'),
  
  ('first-10-pages', 'Page Turner', 'Read 10 total pages', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=pages10', 'pages'),
  ('page-starter', 'Session Champion', 'Read 5 pages in one session', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=pages5', 'pages'),
  
  ('book-initiate', 'Book Lover', 'Start reading your first book', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=booklover', 'books'),
  ('halfway-hero', 'Halfway There', 'Reach 50% progress in a book', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=halfway', 'books'),
  ('first-finish', 'Book Finisher', 'Complete your first book', 'rare', 'https://api.dicebear.com/7.x/shapes/svg?seed=finish', 'books'),
  
  ('first-reflection', 'Thoughtful Reader', 'Write your first reflection', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=reflect1', 'special'),
  ('triple-notes', 'Reflection Master', 'Write 3 reflections', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=reflect3', 'special'),
  
  ('genre-explorer', 'Genre Explorer', 'Read from any genre', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=genre', 'genre'),
  ('new-author', 'Author Discoverer', 'Read a book by any author', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=author', 'author'),
  
  ('daily-goal', 'Daily Achiever', 'Complete a reading session today', 'common', 'https://api.dicebear.com/7.x/shapes/svg?seed=daily', 'special'),
  ('weekly-hello', 'Weekly Warrior', 'Read on 3 different days this week', 'uncommon', 'https://api.dicebear.com/7.x/shapes/svg?seed=weekly', 'special');
\`\`\`

**Note**: The `icon_url` field uses placeholder icons from dicebear.com. You should replace these with your own 500x500px circular badge icons.

### Creating Custom Badge Icons

1. Design 500x500px circular images for each badge
2. Upload them to Supabase Storage in a `badge-icons` bucket
3. Update the `icon_url` in `badge_definitions` table

Example storage structure:
\`\`\`
badge-icons/
  ├── common/
  │   ├── focus-5.png
  │   ├── first-minute.png
  │   └── ...
  ├── uncommon/
  │   └── ...
  └── rare/
      └── ...
\`\`\`

## Testing the Badge System

1. **Start the app** and login
2. **Add a book** to your library
3. **Start a reading session** - You should earn `book-initiate` badge
4. **Complete the session** with some pages read
5. **Go to Profile** - You'll see your earned badges
6. **Tap "X Badges"** to see the full collection
7. **Tap any badge** to see details and unlock status

## Customizing Badge Logic

To add new badges or modify unlock criteria, edit `contexts/badge-context.tsx` in the `checkAndAwardBadges` function. Add your badge ID to the switch statement with custom logic.

Example:
\`\`\`typescript
case 'my-custom-badge':
  shouldAward = /* your custom condition */;
  break;
\`\`\`

## Notes

- Badges are checked automatically after completing any reading session
- Real-time sync ensures badges appear immediately
- Badge icons should be 500x500px for best quality
- The grayscale filter is applied automatically to locked badges
- Badge rarity affects the visual styling (border colors, glows, gradients)
