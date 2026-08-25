# Gia phả dòng họ — Vercel Starter

Starter repository cho phần mềm web quản lý gia phả, ưu tiên vận hành đơn giản trên Vercel.

## Công nghệ

- Next.js 16 + React 19 + TypeScript
- Supabase: PostgreSQL, Auth, Storage
- React Flow + ELK.js cho cây gia phả
- Vercel deployment

## Quy tắc tài khoản MVP 1

- Tài khoản có thể do Admin tạo hoặc người dùng tự đăng ký.
- Tài khoản mới luôn ở trạng thái `PENDING`.
- Chỉ Admin được kích hoạt tài khoản thành `ACTIVE`.
- Chưa triển khai SMS/OTP trong MVP 1.
- Tên đăng nhập người dùng nhìn thấy có dạng: `0912345678@`.
- Bên trong hệ thống, tên đăng nhập này được ánh xạ sang email kỹ thuật hợp lệ cho Supabase Auth, ví dụ `0912345678@auth.giapha.local`.
- Người dùng đăng nhập bằng **tên tài khoản + mật khẩu**.
- Tài khoản `PENDING` hoặc `SUSPENDED` không được đọc dữ liệu gia phả, kể cả khi có session Auth.
- SMS activation/OTP là hạng mục Phase 2, không được đưa vào MVP 1.

## MVP 1

1. Đăng ký/tạo tài khoản và Admin kích hoạt.
2. Đăng nhập tài khoản dạng `SĐT@` + mật khẩu.
3. Quản lý thành viên và hồ sơ.
4. Cha/mẹ/con, vợ/chồng, đời, chi/nhánh.
5. Cây gia phả, tìm kiếm, focus node, expand/collapse.
6. Cấp/thu hồi quyền quản lý từ một nút gốc.
7. Read-only ngoài nhánh, editable trong nhánh.
8. Thành viên đã mất và ngày giỗ.
9. Sự kiện dòng họ.
10. Avatar/tài liệu cơ bản.
11. Audit log.
12. Soft delete + khôi phục.
13. Admin dashboard và trang quản lý phân quyền.

## Cách AI bắt đầu làm việc

**Luôn đọc theo thứ tự:**

1. `AGENTS.md`
2. `TASK_INDEX.md`
3. File task được ghi ở mục `CURRENT TASK`
4. Các tài liệu trong `docs/` được task tham chiếu

Lệnh hữu ích:

```bash
npm run task:current
npm run task:list
npm run task:start -- T001
npm run task:done -- T001
npm run task:block -- T001 "lý do"
```

`npm run task:done -- Txxx` tự động chọn task READY kế tiếp dựa trên dependency và cập nhật lại `TASK_INDEX.md`.

## Khởi chạy

```bash
npm install
cp .env.example .env.local
npm run dev
```

Database schema khởi đầu: `supabase/migrations/001_initial_schema.sql`.

## Triển khai

Xem `docs/07-deployment.md`.
