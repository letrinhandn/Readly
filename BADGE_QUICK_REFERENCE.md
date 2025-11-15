# Badge System - Quick Reference

## 🚀 Files Created/Modified

### New Files
- `components/Badge.tsx` - Badge display component
- `components/BadgesGrid.tsx` - Grid layout for badges
- `app/badges.tsx` - Full badges screen
- `BADGE_SYSTEM.md` - Complete documentation
- `BADGE_IMPLEMENTATION_SUMMARY.md` - Implementation summary

### Modified Files
- `contexts/badge-context.tsx` - Added unlock logic + realtime
- `app/(tabs)/profile.tsx` - Added badge display
- `app/focus-session.tsx` - Added badge check trigger
- `app/_layout.tsx` - Added badges route

## 📦 Badge System Architecture

```
User completes action (e.g., reading session)
    ↓
checkAndAwardBadges() runs (badge-context.tsx)
    ↓
Checks all badge unlock criteria
    ↓
Awards earned badges via tRPC
    ↓
Supabase user_badges table updated
    ↓
Realtime sync updates UI
    ↓
Badges appear on Profile + Badges screen
```

## 🎯 Badge IDs & Criteria

| Badge ID | Criteria | Rarity |
|----------|----------|--------|
| `focus-5` | 5-minute session | Common |
| `first-minute` | First 1-minute session | Common |
| `quick-session` | 3-minute session | Common |
| `tiny-streak` | 2-day streak | Uncommon |
| `warm-up-streak` | 3-day streak | Uncommon |
| `morning-read` | Read 5-10 AM | Rare |
| `night-read` | Read after 9 PM | Rare |
| `first-10-pages` | 10 total pages | Common |
| `page-starter` | 5 pages in one session | Common |
| `book-initiate` | Start a book | Common |
| `halfway-hero` | 50% book progress | Uncommon |
| `first-finish` | Complete first book | Rare |
| `first-reflection` | Write first reflection | Common |
| `triple-notes` | Write 3 reflections | Uncommon |
| `genre-explorer` | Read from any genre | Common |
| `new-author` | Read by any author | Common |
| `daily-goal` | Session today | Common |
| `weekly-hello` | 3 days this week | Uncommon |

## 🎨 Rarity Colors

```typescript
common:     #3B82F6 (Blue)
uncommon:   #10B981 (Green)
rare:       #8B5CF6 (Purple)
epic:       #EC4899 (Pink)
legendary:  #F59E0B (Gold)
mythic:     Gradient (Red → Gold)
godtier:    Gradient (Black → Gold)
```

## 🔧 Quick SQL Commands

### Insert All Badge Definitions
See `BADGE_IMPLEMENTATION_SUMMARY.md` for the full SQL script.

### Check Existing Badges
```sql
SELECT * FROM badge_definitions;
```

### Check User Badges
```sql
SELECT ub.*, bd.name, bd.rarity 
FROM user_badges ub
JOIN badge_definitions bd ON ub.badge_id = bd.id
WHERE ub.user_id = 'YOUR_USER_ID';
```

### Manually Award Badge (Testing)
```sql
INSERT INTO user_badges (id, user_id, badge_id, earned_at)
VALUES (
  gen_random_uuid()::text,
  'YOUR_USER_ID',
  'focus-5',
  NOW()
);
```

## 🧪 Testing Checklist

- [ ] Add badge definitions to Supabase
- [ ] Enable realtime on both tables
- [ ] Login to app
- [ ] Add a book (should earn `book-initiate`)
- [ ] Complete 5-min session (should earn `focus-5`)
- [ ] Check Profile (badges should appear)
- [ ] Tap "X Badges" (full screen should open)
- [ ] Tap a badge (modal should show details)
- [ ] Tap locked badge (should show "Not yet earned")

## 🐛 Troubleshooting

### Badges Not Appearing
1. Check badge_definitions exist in Supabase
2. Verify realtime is enabled
3. Check console for tRPC errors
4. Ensure BadgeProvider is in root layout

### Badges Not Unlocking
1. Check unlock logic in `badge-context.tsx`
2. Verify criteria matches badge ID
3. Console log the criteria values
4. Manually test with SQL insert

### UI Issues
1. Check icon URLs are valid
2. Verify rarity values match types
3. Test on both web and mobile
4. Check for console errors

## 💡 Tips

- Badge icons should be 500x500px circular PNG
- Use transparent backgrounds for icons
- Test on mobile for best experience
- Badge checking is automatic after sessions
- Realtime sync keeps everything up-to-date
- You can manually trigger checks with `checkAndAwardBadges()`

## 🔗 Related Files

- Backend routes: `backend/trpc/routes/badges/*.ts`
- Types: `types/badge.ts`
- Badge colors: `types/badge.ts` (BADGE_RARITY_COLORS)

## ✅ Done!

The badge system is fully integrated and ready to use. Just add the badge definitions to Supabase and start earning badges! 🎉
