# Hướng Dẫn: Sửa Lỗi Data Chung & Ảnh Không Hiển Thị

## Vấn Đề
1. **Data chung giữa các tài khoản**: Tất cả người dùng đang thấy cùng sách và sessions
2. **Ảnh không hiển thị**: Book covers, avatars không upload được hoặc không hiển thị

## Nguyên Nhân
- Database thiếu cột `user_id` trong bảng `books`
- RLS policies đang cho phép tất cả users truy cập data của nhau
- Storage buckets chưa được tạo trong Supabase

---

## BƯỚC 1: Cập Nhật Database Schema

### 1.1. Truy cập Supabase SQL Editor
1. Vào https://xvnhanwektoejkgpzybt.supabase.co
2. Chọn **SQL Editor** ở menu bên trái
3. Click **New Query**

### 1.2. Chạy Migration Script
Copy toàn bộ nội dung file `MIGRATION_USER_ID.sql` và paste vào SQL Editor, sau đó click **Run**.

Script này sẽ:
- Thêm cột `user_id` vào bảng `books`
- Cập nhật RLS policies để isolate data theo user
- Tạo indexes cần thiết

### 1.3. Xóa Data Test (Tuỳ chọn - Nên làm)
Nếu bạn muốn bắt đầu với database sạch:

```sql
-- Xóa tất cả data test
DELETE FROM reading_sessions;
DELETE FROM books;
DELETE FROM user_profiles;
```

---

## BƯỚC 2: Tạo Storage Buckets

### 2.1. Truy cập Storage
1. Vào https://xvnhanwektoejkgpzybt.supabase.co
2. Chọn **Storage** ở menu bên trái

### 2.2. Tạo Bucket "avatars"
1. Click **New bucket**
2. Điền:
   - **Name**: `avatars`
   - **Public bucket**: ✅ CHECKED (quan trọng!)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
3. Click **Create bucket**

### 2.3. Tạo Bucket "book-covers"
1. Click **New bucket**
2. Điền:
   - **Name**: `book-covers`
   - **Public bucket**: ✅ CHECKED (quan trọng!)
   - **File size limit**: 5MB
   - **Allowed MIME types**: `image/*`
3. Click **Create bucket**

### 2.4. Kiểm Tra Storage Policies

Cả 2 buckets phải có policies cho phép public read. Nếu không có, vào **Policies** của từng bucket và chạy:

```sql
-- Policies cho avatars bucket
CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own avatars" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own avatars" ON storage.objects 
    FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Policies cho book-covers bucket
CREATE POLICY "Public Access" ON storage.objects 
    FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can upload book covers" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update own book covers" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own book covers" ON storage.objects 
    FOR DELETE USING (bucket_id = 'book-covers' AND auth.role() = 'authenticated');
```

---

## BƯỚC 3: Test Lại App

### 3.1. Đăng xuất và đăng nhập lại
1. Mở app
2. Vào Profile > Sign Out
3. Đăng nhập lại

### 3.2. Test Upload Avatar
1. Vào Profile tab
2. Click vào avatar để đổi ảnh
3. Chọn ảnh từ thư viện
4. Kiểm tra xem ảnh có hiển thị không

### 3.3. Test Thêm Sách với Ảnh
1. Thêm sách mới
2. Search Google Books (book cover sẽ tự động load)
3. Hoặc paste URL ảnh vào Cover URL field

### 3.4. Test Data Isolation
1. Tạo 2 tài khoản khác nhau
2. Thêm sách vào mỗi tài khoản
3. Kiểm tra mỗi tài khoản chỉ thấy sách của mình

---

## Troubleshooting

### Lỗi: "new row violates row-level security policy"
**Nguyên nhân**: User chưa được authenticate hoặc RLS policies chưa đúng

**Giải pháp**:
1. Đăng xuất và đăng nhập lại
2. Kiểm tra lại RLS policies trong Supabase

### Lỗi: "Bucket not found"
**Nguyên nhân**: Storage buckets chưa được tạo hoặc tên sai

**Giải pháp**:
1. Kiểm tra lại Storage section
2. Đảm bảo tên bucket chính xác: `avatars` và `book-covers` (lowercase, không có spaces)

### Ảnh vẫn không hiển thị
**Nguyên nhân**: Buckets không public hoặc policies sai

**Giải pháp**:
1. Vào Storage > Click vào bucket
2. Kiểm tra có "Public" badge không
3. Nếu không có, edit bucket và check "Public bucket"
4. Kiểm tra policies như ở Bước 2.4

### Google Books không search được
**Nguyên nhân**: Có thể do network hoặc API rate limit

**Giải pháp**:
1. Thử lại sau vài giây
2. Kiểm tra console logs
3. Thử search title khác

---

## Xác Nhận Hoàn Thành

✅ Checklist:
- [ ] Migration script đã chạy thành công
- [ ] Bucket `avatars` đã tạo và set public
- [ ] Bucket `book-covers` đã tạo và set public
- [ ] Upload avatar hoạt động
- [ ] Book covers từ Google Books hiển thị
- [ ] Mỗi user chỉ thấy data của mình
- [ ] App không có lỗi trong console

---

## Code Changes Summary

Files đã được cập nhật:
1. `types/book.ts` - Thêm `userId` field vào Book type
2. `contexts/reading-context.tsx` - Filter data theo user_id
3. `SUPABASE_SCHEMA.md` - Updated schema với user_id
4. `MIGRATION_USER_ID.sql` - Migration script
5. `lib/storage.ts` - Storage utilities đã có sẵn

Không cần restart server, chỉ cần refresh app sau khi chạy migration.

---

## Hỗ Trợ

Nếu vẫn gặp vấn đề:
1. Check browser console logs
2. Check Supabase logs
3. Verify RLS policies trong Supabase Dashboard
