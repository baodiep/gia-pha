# Ứng Dụng Quản Lý Gia Phả Dòng Họ (Gia Phả MVP 1.0)

> Web app quản lý gia phả dòng họ phân tầng tối ưu hóa cho di động và máy tính để bàn, xây dựng trên nền tảng **Next.js 16 (React 19)**, **TypeScript**, **Supabase** và **React Flow + ELK layout**.

---

## 🌟 Tính Năng Nổi Bật

1. **Sơ đồ cây gia phả tương tác (Family Tree Canvas)**:
   - Thuật toán phân tầng tự động (Layered Layout với `@elkjs/elkjs`) sắp xếp chính xác theo Đời và Chi.
   - Hiển thị mối quan hệ cha-con trực hệ (`is_lineage_relation`), quan hệ hôn phối đa phu/thê (`unions`).
   - Huy hiệu trạng thái sống/mất ($\dagger$), nhãn kỵ nhật và phân biệt quyền chỉnh sửa ngay trên node.
2. **Tìm kiếm & Định vị thông minh (Search & Tree Focus)**:
   - Tìm kiếm nhanh theo họ tên, tên thường gọi, quê quán, đời hoặc chi nhánh.
   - Thuật toán dựng Ancestor Path: Khi người dùng tìm thành viên ngoài view hiện tại, hệ thống tự động tải chuỗi tổ tiên từ cụ tổ đến thành viên đích và zoom mượt mà đến node đó.
3. **Phân quyền động theo nhánh (Dynamic Branch Permissions)**:
   - Người quản lý nhánh (Branch Manager) được cấp quyền từ một Nút Gốc (Root Person).
   - Tự động tính toán tập quyền (Editable Set) theo cây trực hệ con cháu + vợ/chồng.
   - Không lưu cứng quyền trên từng node; thu hồi quyền có hiệu lực tức thì (Realtime revocation).
4. **Quản lý danh sách tưởng niệm (Memorials)**:
   - Lọc danh sách tiền nhân đã mất, vị trí an táng, tiểu sử.
   - Định dạng ngày giỗ âm/dương chuẩn xác, không tự quy đổi phỏng đoán.
5. **Sự kiện dòng họ (Family Events)**:
   - Quản lý lịch giỗ tổ, họp họ, khánh thành từ đường.
   - Phân quyền hiển thị linh hoạt: Toàn họ (`ALL_MEMBERS`), Cấp nhánh (`BRANCH`) hoặc Nội bộ (`ADMIN_ONLY`).
6. **Trung tâm quản trị toàn diện (Admin Center)**:
   - Quản lý tài khoản: Đăng ký với SĐT -> `PENDING` -> Admin kích hoạt -> `ACTIVE`.
   - Cấp mật khẩu tạm thời cho thành viên cao tuổi.
   - Phân quyền quản lý nhánh và thu hồi quyền an toàn (Soft revoke).
   - Nhật ký kiểm toán (Audit Log) lưu snapshot JSON trước/sau thay đổi.
   - Thùng rác (Recycle Bin) phục hồi thành viên xóa mềm mà không phá vỡ quan hệ.
   - Quản lý ảnh đại diện với Supabase Storage an toàn.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 16.3.2 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Lucide Icons, `@xyflow/react` (React Flow 12), `elkjs`.
- **Backend & Database**: Supabase (PostgreSQL 15+), Server Actions, Row-Level Security (RLS), Supabase Storage.
- **Validation & Formats**: Zod 4, Vietnamese phone normalization.
- **Testing**: Vitest 4 (17 test suites, 73+ unit/integration tests).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### 1. Clone repository & cài đặt dependencies
```bash
git clone https://github.com/baodiep/gia-pha.git
cd gia-pha
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` từ mẫu `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
AUTH_INTERNAL_EMAIL_DOMAIN="auth.giapha.local"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Nạp database schema & seed data
Chạy lần lượt các file SQL trong thư mục `supabase/migrations/` vào Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_storage_policies.sql`
4. `supabase/seed.sql` (Dữ liệu mẫu 3 đời 2 chi)

### 4. Khởi động môi trường phát triển
```bash
npm run dev
```
Truy cập: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Chạy Kiểm Thử & Kiểm Tra Chất Lượng

```bash
# Kiểm tra TypeScript
npm run typecheck

# Kiểm tra Linter
npm run lint

# Chạy toàn bộ Test Suite (17 files, 73 tests)
npm test

# Build Production
npm run build
```

---

## 📖 Hướng Dẫn Vận Hành (Admin Runbook)

Chi tiết quy trình kích hoạt tài khoản, cấp quyền chi nhánh, sao lưu và khôi phục sự cố:
👉 [Tài liệu hướng dẫn triển khai & vận hành Production (docs/production-deployment-guide.md)](docs/production-deployment-guide.md)

---

## 🏷️ Release Notes: v1.0.0-mvp

- **Version**: 1.0.0-mvp
- **Status**: Production Ready
- **Quality Gates**: Pass 100% Typecheck, Lint, 73 Vitest Tests, Next.js Production Static & Dynamic Build.
