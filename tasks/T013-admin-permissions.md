# T013 — Admin permission management

## Goal
Hiện thực đúng quy trình cấp quyền 3 bước.

## Work
- Từ tree chọn node.
- Chọn/tìm account ACTIVE đã link person hoặc theo rule được duyệt.
- `Cấp quyền quản lý từ nút này`.
- `/admin/permissions` table + revoke.

## Acceptance
- Grant tạo đúng 1 branch_grant, không materialize descendants.
- Revoke có timestamp, không hard delete record.
- UI hiển thị tên, SĐT, branch, generation, revoke.
