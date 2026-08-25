# T004 — Person CRUD + deceased fields

## Goal
CRUD hồ sơ Person, bao gồm trạng thái đã mất/ngày giỗ.

## Work
- Person list/detail/form.
- life_status LIVING/DECEASED/UNKNOWN.
- death_date + lunar memorial fields.
- Soft delete only.
- Validation nhất quán ngày sinh/ngày mất.

## Acceptance
- Tạo/sửa/xem person hoạt động.
- DECEASED hiển thị rõ trên profile.
- Không hard delete từ UI/API.
