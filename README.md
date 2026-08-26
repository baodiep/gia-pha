# Ứng Dụng Quản Lý Gia Phả Dòng Họ (Gia Phả v2.0.0 - MVP2)

> Web app quản lý gia phả dòng họ phân tầng tối ưu hóa cho di động và máy tính để bàn (chuẩn Mobile UX 40+), xây dựng trên nền tảng **Next.js 16 (React 19)**, **TypeScript**, **Supabase** và **React Flow + ELK layout**.

---

## 🌟 Trạng Thái Dự Án
- **Phiên bản hiện tại**: `v2.0.0-mvp2` (MVP2 Hoàn Tất 100% — 39/39 Tasks)
- **Tech Stack**: Next.js 16.3.2 (Turbopack, React 19), TypeScript, Tailwind CSS, Supabase (PostgreSQL + RLS), React Flow 12 (`@xyflow/react`), `@elkjs/elkjs`, Vitest 4, Zod 4, XLSX.

---

## 🚀 Các Tính Năng Đã Triển Khai

### 1. Cây Gia Phả & Quản Trị Thành Viên (MVP1)
- **Sơ đồ cây gia phả tương tác**: Thuật toán phân tầng tự động (Layered Layout với `@elkjs/elkjs`) sắp xếp chính xác theo Đời và Chi.
- **Tìm kiếm & Định vị thông minh**: Dựng chuỗi Ancestor Path và auto-focus mượt mà đến node mục tiêu.
- **Phân quyền động theo nhánh**: `PermissionService` tính toán tập quyền trực hệ con cháu + vợ/chồng.
- **Quản trị toàn diện**: Tài khoản Admin, phân quyền nhánh, nhật ký Audit (JSON snapshot diff), thùng rác (Recycle Bin) khôi phục xóa mềm.

### 2. Mở Rộng Trải Nghiệm & Tương Tác Dòng Họ (MVP2)
- **Nhập dữ liệu Excel giao dịch**: Nhập cây gia phả và sổ công đức từ file Excel, preview phân loại Valid/Warning/Error, kiểm soát trùng lặp và map tài khoản tự động.
- **Tự quản hồ sơ & Đặt lại mật khẩu**: Xác nhận "Đây là tôi" (Claim person), đề xuất sửa hồ sơ, quên mật khẩu an toàn với HMAC CAPTCHA và mã PIN 8 số ngẫu nhiên.
- **Tra cứu quan hệ họ hàng**: Thuật toán BFS tìm mối quan hệ ngắn nhất và hiển thị xưng hô thuần Việt chuẩn xác.
- **Lịch âm thiên văn Hồ Ngọc Đức**: Tự động chuyển đổi kỵ nhật âm lịch sang dương lịch theo từng năm (hỗ trợ tháng nhuận), dashboard thành viên hợp nhất 90 ngày.
- **Sự kiện & Điểm danh (RSVP)**: Thành viên xác nhận tham dự giỗ chạp, họp họ; Admin quản lý danh sách và số lượng khách.
- **Sổ công đức & Cấu hình QR**: Xem mã QR chuyển khoản nhanh, sao chép số tài khoản 1-chạm, tra cứu và lọc sổ công đức minh bạch.
- **Trung tâm thông báo & Web Push**: Nhận thông báo trong ứng dụng và thông báo đẩy màn hình điện thoại/máy tính.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 16.3.2 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons, `@xyflow/react` (React Flow 12), `elkjs`.
- **Backend & Database**: Supabase (PostgreSQL 15+), Server Actions, Row-Level Security (RLS), Supabase Storage.
- **Validation & Formats**: Zod 4, Vietnamese phone normalization, XLSX parser.
- **Testing**: Vitest 4 (35 test suites, 122 unit/integration/E2E tests).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Cài Đặt Dependencies
```bash
npm install
```

### 2. Cấu Hình Biến Môi Trường
Tạo file `.env.local` tại thư mục gốc:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Áp Dụng Database Migrations
Chạy tuần tự các script trong thư mục `supabase/migrations/`:
- `001_initial_schema.sql`
- `002_seed_3_generations.sql`
- `003_cte_branch_editable.sql`
- `004_rls_security_policies.sql`
- `005_storage_avatars.sql`
- `006_mvp2_foundations.sql`
- `007_mvp2_rls_policies.sql`
- `008_family_import_transaction.sql`

### 4. Khởi Chạy Server Phát Triển
```bash
npm run dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

---

## 🧪 Kiểm Thử & Quality Gates
```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Chạy toàn bộ 35 test suites (122 tests)
npm test

# Build production
npm run build
```
