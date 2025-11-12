# Supabase Storage Setup

This app requires Supabase Storage buckets to store images (avatars and book covers).

## Setup Instructions

1. Go to your Supabase project dashboard: https://xvnhanwektoejkgpzybt.supabase.co

2. Navigate to **Storage** in the left sidebar

3. Create two public buckets:

### Bucket 1: avatars
- Click "New bucket"
- Bucket name: `avatars`
- **Public bucket**: YES (check this box)
- File size limit: 5MB
- Allowed MIME types: `image/*`
- Click "Create bucket"

### Bucket 2: book-covers
- Click "New bucket"  
- Bucket name: `book-covers`
- **Public bucket**: YES (check this box)
- File size limit: 5MB
- Allowed MIME types: `image/*`
- Click "Create bucket"

## Bucket Policies

Both buckets should have public read access. If you need to set policies manually:

```sql
-- Avatars bucket policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own avatars" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Book covers bucket policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');
CREATE POLICY "Authenticated users can upload book covers" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own book covers" ON storage.objects FOR UPDATE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own book covers" ON storage.objects FOR DELETE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
```

## Verification

To verify the buckets are set up correctly:
1. Check that both buckets appear in the Storage section
2. Both should show "Public" badge
3. Try uploading an image through the app's profile picture or book cover feature
4. If you see the image URL starting with your Supabase URL, it's working!

## Troubleshooting

**Error: "Bucket not found"**
- Make sure bucket names are exactly `avatars` and `book-covers` (lowercase, no spaces)

**Error: "Permission denied"**
- Make sure buckets are set to **public**
- Check that RLS policies allow public SELECT access

**Images not displaying**
- Verify the public URL format: `https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[filepath]`
- Check browser console for CORS errors
