# Production & Deployment Checklist — Web Quản Lý Gia Phả

Tài liệu hướng dẫn triển khai hệ thống lên **Vercel** và cấu hình **Supabase Production** an toàn, ổn định.

---

## 1. Biến môi trường (Environment Variables)

Cấu hình trên **Vercel Project Settings -> Environment Variables**:

| Tên biến | Bắt buộc | Phạm vi | Mô tả |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Có | Client + Server | URL dự án Supabase (VD: `https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Có | Client + Server | Khóa công khai Anon Key của Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Có | **Server only** (Tuyệt đối không có tiền tố `NEXT_PUBLIC_`) | Khóa Admin quyền tối cao dùng trong Server Actions |
| `AUTH_INTERNAL_EMAIL_DOMAIN` | Có | Server only | Tên miền email ảo để map số điện thoại (mặc định: `auth.giapha.local`) |
| `NEXT_PUBLIC_APP_URL` | Tùy chọn | Client + Server | Tên miền chính thức của ứng dụng (VD: `https://giapha.vn`) |

> ⚠️ **Bảo mật**: `SUPABASE_SERVICE_ROLE_KEY` chỉ được inject ở môi trường Server/Node.js runtime, tuyệt đối không bundle vào client browser.

---

## 2. Thứ tự Migration trên Supabase Production

Khi khởi tạo database mới trên Supabase Production, thực hiện chạy tuần tự các file SQL trong thư mục `supabase/migrations/`:

1. `supabase/migrations/001_initial_schema.sql`:
   - Bảng `profiles`, `persons`, `parent_child`, `unions`, `branch_grants`, `audit_logs`, `family_events`.
   - Các index tối ưu hóa quan hệ và tìm kiếm `trgm`.
   - Function đệ quy CTE `get_branch_editable_persons`.
2. `supabase/migrations/002_rls_policies.sql`:
   - Bật RLS toàn bộ bảng dữ liệu.
   - Phân quyền SELECT cho tài khoản `ACTIVE`, phân quyền INSERT/UPDATE/DELETE theo `PermissionService` & Admin.
3. `supabase/migrations/003_storage_policies.sql`:
   - Khởi tạo bucket `avatars` (giới hạn 5MB, định dạng ảnh).
   - Thiết lập Storage RLS Policies cho ảnh đại diện.
4. `supabase/seed.sql` *(Tùy chọn cho môi trường Staging/Demo)*:
   - Dữ liệu mẫu 3 đời 2 chi dòng họ Nguyễn.

---

## 3. Cấu hình Authentication & Cookie Domain trên Supabase

1. Vào **Supabase Dashboard -> Authentication -> URL Configuration**:
   - **Site URL**: `https://<ten-mien-cua-ban>.vercel.app` hoặc custom domain `https://giapha.vn`.
   - **Redirect URLs**: Thêm `https://<ten-mien-cua-ban>.vercel.app/**` và `http://localhost:3000/**`.
2. Vào **Authentication -> Providers -> Email**:
   - **Enable Email Provider**: Bật.
   - **Confirm Email**: Tắt nếu muốn tài khoản do Admin kích hoạt có thể đăng nhập ngay mà không cần gửi email thật (do hệ thống sử dụng định danh SĐT dạng `<phone>@auth.giapha.local`).

---

## 4. Kiểm tra Header Bảo mật & HTTPS (Production Hardening)

Đã cấu hình trong `vercel.json`:
- `X-Content-Type-Options: nosniff` (chống MIME confusion attack)
- `X-Frame-Options: DENY` (chống Clickjacking)
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

---

## 5. Quy trình Sao lưu & Phục hồi dữ liệu (Backup & Disaster Recovery)

1. **Daily Auto Backup trên Supabase**:
   - Supabase tự động sao lưu định kỳ hàng ngày (Physical Backup & WAL archiving).
2. **Manual Backup trước mỗi đợt nâng cấp**:
   ```bash
   # Xuất toàn bộ schema và data
   supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -f backup_$(date +%Y%m%d).sql
   ```
3. **Phục hồi (Restore Procedure)**:
   - Khi cần khôi phục sự cố, nạp lại bản sao lưu vào database:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" < backup_YYYYMMDD.sql
   ```
