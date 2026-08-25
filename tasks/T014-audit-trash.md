# T014 — Audit log & recycle bin

## Goal
Truy vết và phục hồi dữ liệu.

## Work
- Audit CREATE/UPDATE/DELETE/RELATION/GRANT/REVOKE/ACCOUNT_STATE/EVENT.
- `/admin/audit` filter actor/action/date/entity.
- `/admin/trash` restore person.

## Acceptance
- Mutation quan trọng có old/new snapshot phù hợp.
- Restore không tạo duplicate relation.
