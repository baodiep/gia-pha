# T002 — Apply database schema & seed

## Goal
Khởi tạo Supabase DEV với schema MVP và seed một cây nhỏ phục vụ phát triển.

## Work
- Review `supabase/migrations/001_initial_schema.sql`.
- Sửa constraint/index nếu migration thực tế báo lỗi.
- Tạo seed: 3 đời, tối thiểu 2 chi, có spouse, 1 người đã mất.
- Seed event mẫu.
- Tạo SQL test cho recursive descendants.

## Acceptance
- Migration chạy clean từ database rỗng.
- Seed chạy lặp lại an toàn hoặc có reset procedure rõ ràng.
- Query descendant cho kết quả đúng.
- Không có RLS policy permissive tạm để production dùng nhầm.
