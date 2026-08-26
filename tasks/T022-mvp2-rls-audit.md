# T022 — MVP2 RLS, audit & privacy

## Goal
Áp RLS, permission server-side và audit cho toàn bộ bảng MVP2 trước khi phát triển UI mutation.

## Work
- Bật RLS cho mọi bảng mới từ T021.
- Admin có quyền quản trị đầy đủ theo vai trò.
- Member chỉ đọc/tạo dữ liệu được phép và chỉ xem request của chính mình nếu phù hợp.
- `contributions`: Admin CRUD/import; Member chỉ select/search.
- `family_resources`: Admin CRUD; Member select published/active.
- `password_reset_requests`: public submit phải đi qua server action an toàn; không cho client đọc trực tiếp danh sách.
- `push_subscriptions`: user chỉ quản lý subscription của chính mình; server/admin gửi push theo service logic.
- Audit các mutation nhạy cảm: claim/profile approval, password reset, resource mutation, RSVP admin mutation, contribution CRUD/import.
- Không ghi password, temporary password, CAPTCHA answer hoặc push auth secret vào audit value.

## Acceptance
- Có test positive/negative cho Admin, Member, anonymous.
- Member không thể sửa contribution bằng cách gọi trực tiếp Supabase/client API.
- Non-admin không reset password user khác.
- RLS regression MVP1 PASS.
