# Hướng Dẫn Tạo Database Reading Journal - Tiếng Việt

## Tổng Quan
Tôi đã tạo một hệ thống reading journal (nhật ký đọc sách) hoàn chỉnh lưu trữ tất cả các phiên đọc (reading sessions) trong Supabase. Mỗi session sau khi đọc xong sẽ được lưu lại và dùng cho:
- **Thống kê streaks** - Theo dõi chuỗi đọc sách hàng ngày
- **Thống kê reading** - Tổng số trang đã đọc, thời gian, số sách hoàn thành
- **Reading journal** - Hiển thị các entries trong chi tiết sách dạng threads (luồng)

## Những Gì Đã Tạo

### 1. Database Schema
File `SUPABASE_SCHEMA.md` chứa SQL code để tạo 3 bảng chính:
- `user_profiles` - Thông tin người dùng
- `books` - Thư viện sách
- `reading_sessions` - Các phiên đọc sách (journal entries)

### 2. Backend API
Folder `backend/trpc/routes/journal/` chứa 4 API endpoints:
- `get-sessions.ts` - Lấy danh sách sessions
- `create-session.ts` - Tạo/cập nhật sessions
- `get-stats.ts` - Tính toán thống kê
- `delete-session.ts` - Xóa sessions

### 3. Components
- `ReadingJournal.tsx` - Component hiển thị journal
- Book detail screen đã có sẵn phần hiển thị journal dạng threads

### 4. Context Updates
File `contexts/reading-context.tsx` đã được cập nhật để:
- Kết nối với bảng `reading_sessions` trong Supabase
- Map dữ liệu từ snake_case (database) sang camelCase (app)
- Tự động fallback về AsyncStorage nếu Supabase lỗi

## Hướng Dẫn Cài Đặt (3 Bước)

### Bước 1: Tạo Tables trong Supabase ⚡

1. Truy cập Supabase dashboard: **https://xvnhanwektoejkgpzybt.supabase.co**
2. Click vào **SQL Editor** (thanh bên trái)
3. Click **New Query** (Tạo query mới)
4. Mở file `SUPABASE_SCHEMA.md` trong project
5. Copy **TẤT CẢ** code SQL trong file đó
6. Paste vào SQL Editor
7. Click **Run** để chạy

Sau khi chạy xong, bạn sẽ có:
- ✅ 3 tables: `user_profiles`, `books`, `reading_sessions`
- ✅ Indexes để query nhanh hơn
- ✅ Row Level Security policies
- ✅ Auto-update timestamp triggers

### Bước 2: Kiểm Tra Tables Đã Tạo ✓

1. Trong Supabase dashboard, click **Table Editor**
2. Bạn sẽ thấy 3 tables mới:
   - `user_profiles`
   - `books`
   - `reading_sessions` 👈 **Quan trọng nhất**

3. Click vào `reading_sessions` để xem cấu trúc:
   - `id` - ID của session
   - `book_id` - ID cuốn sách
   - `user_id` - ID người dùng (optional)
   - `start_time` - Thời gian bắt đầu
   - `end_time` - Thời gian kết thúc
   - `pages_read` - Số trang đã đọc
   - `duration` - Thời gian đọc (phút)
   - `reflection` - Ghi chú cảm nhận
   - `mood` - Tâm trạng khi đọc
   - `location` - Địa điểm đọc
   - `created_at`, `updated_at` - Timestamps

### Bước 3: Test Hệ Thống 🚀

1. Mở app trên thiết bị hoặc browser
2. **Thêm một cuốn sách** vào thư viện
3. **Bắt đầu focus session** từ trang chi tiết sách
4. **Hoàn thành session** và nhập:
   - Số trang đã đọc
   - Reflection (tùy chọn)
5. **Kiểm tra journal** trong trang chi tiết sách

## Cách Hoạt Động

### Luồng Đọc Sách

```
1. User bắt đầu đọc
   ↓
2. App tạo session mới (startReadingSession)
   ↓
3. Timer chạy, đếm thời gian
   ↓
4. User kết thúc session
   ↓
5. Popup hiện ra yêu cầu nhập:
   - Số trang đã đọc (hoặc trang cuối cùng)
   - Reflection (tùy chọn)
   ↓
6. App lưu session vào Supabase
   ↓
7. Book progress cập nhật (currentPage tăng)
   ↓
8. Stats tự động tính lại (streaks, total pages, total time)
   ↓
9. Journal hiển thị trong book details
```

### Tính Streak

Streak được tính như sau:
- Lấy tất cả sessions có `end_time`
- Group theo ngày
- Tìm các ngày liên tiếp tính từ hôm nay về trước
- **Current streak**: Số ngày liên tiếp tính từ hôm nay hoặc hôm qua
- **Longest streak**: Chuỗi dài nhất trong lịch sử

Ví dụ:
- Đọc hôm nay → Streak = 1
- Đọc hôm nay + hôm qua → Streak = 2
- Đọc hôm nay + hôm qua + hôm kia → Streak = 3
- Bỏ 1 ngày → Streak reset về 0

## Kiểm Tra Dữ Liệu

### Xem Tất Cả Sessions
Vào Supabase → Table Editor → `reading_sessions` để xem tất cả sessions đã lưu

### Xem Sessions Của 1 Sách
1. Copy `book_id` từ bảng `books`
2. Vào `reading_sessions`
3. Filter: `book_id` = `your-book-id`

### Xem Stats Trong App
Vào tab **Stats** để xem:
- Total books read (Tổng sách đã đọc)
- Total pages read (Tổng trang đã đọc)
- Total minutes read (Tổng phút đã đọc)
- Current streak (Chuỗi hiện tại)
- Longest streak (Chuỗi dài nhất)
- Sessions this week (Sessions tuần này)

## Tính Năng

### ✅ Đã Hoàn Thành
- [x] Supabase database schema hoàn chỉnh
- [x] API endpoints cho journal (tRPC)
- [x] Tracking sessions trong focus mode
- [x] Tính toán streaks tự động
- [x] Hiển thị journal trong book details
- [x] Fallback về AsyncStorage nếu Supabase lỗi
- [x] Cập nhật progress tự động

### 🔮 Có Thể Thêm Sau
- [ ] UI chọn mood khi kết thúc session
- [ ] Nhập location
- [ ] Filter journal theo khoảng thời gian
- [ ] Export journal ra PDF
- [ ] Tìm kiếm trong journal
- [ ] Insights và analytics chi tiết
- [ ] Báo cáo tuần/tháng

## Xử Lý Lỗi

### ❌ Sessions không lưu được
**Nguyên nhân**: Supabase tables chưa được tạo
**Giải pháp**: 
1. Kiểm tra Table Editor trong Supabase
2. Chạy lại SQL từ `SUPABASE_SCHEMA.md`
3. Check console log trong browser

### ❌ Streaks không cập nhật
**Nguyên nhân**: Sessions thiếu `end_time`
**Giải pháp**: Đảm bảo hoàn thành session đúng cách (không tắt app giữa chừng)

### ❌ Dữ liệu không sync
**Nguyên nhân**: React Query cache
**Giải pháp**: Pull to refresh trong Library tab

## Dữ Liệu Mẫu

Sau khi setup xong, bạn có thể test bằng cách:

1. **Thêm sách test**: "The Hobbit" by J.R.R. Tolkien (300 trang)
2. **Đọc session 1**: 30 phút, 20 trang, reflection "Great intro!"
3. **Đọc session 2**: 45 phút, 35 trang, reflection "Getting interesting"
4. **Check stats**: 
   - Total pages: 55
   - Total time: 75 minutes
   - Sessions: 2
   - Streak: 1 (nếu cùng ngày) hoặc 2 (nếu khác ngày)

## File Quan Trọng

1. **`SUPABASE_SCHEMA.md`** - SQL code tạo database
2. **`READING_JOURNAL_SETUP.md`** - Hướng dẫn chi tiết (English)
3. **`backend/trpc/routes/journal/`** - API endpoints
4. **`contexts/reading-context.tsx`** - Logic chính
5. **`components/ReadingJournal.tsx`** - UI component
6. **`types/book.ts`** - Type definitions

## Lưu Ý Bảo Mật

⚠️ **Hiện tại**: Database đang ở chế độ open (ai cũng có thể truy cập)

🔒 **Cho Production**: Cần thiết lập Row Level Security policies để chỉ cho phép user truy cập dữ liệu của chính họ.

Code RLS policies có trong file `READING_JOURNAL_SETUP.md`.

## Tóm Tắt

### Đã làm gì?
✅ Tạo database schema cho Supabase  
✅ Tạo API endpoints (tRPC)  
✅ Cập nhật contexts để lưu sessions  
✅ Tạo UI components để hiển thị journal  
✅ Viết tài liệu hướng dẫn đầy đủ  

### Cần làm gì tiếp?
1. ⚡ **Chạy SQL trong Supabase** (file `SUPABASE_SCHEMA.md`)
2. ✓ **Kiểm tra tables đã tạo** (Table Editor)
3. 🚀 **Test app** (thêm sách, đọc session, xem journal)

---

**Status**: ✅ Sẵn sàng sử dụng sau khi tạo tables trong Supabase

**Cập nhật**: 2025-11-11
