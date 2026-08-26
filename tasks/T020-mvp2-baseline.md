# T020 — MVP2 baseline & specification

## Goal
Đóng băng trạng thái MVP1 và chuẩn bị repository cho MVP2 mà không làm thay đổi hành vi hiện có.

## Work
- Đọc `docs/mvp2/01-scope.md` và `docs/mvp2/02-mobile-ux-40plus.md`.
- Đồng bộ README/docs/AGENTS với login hiện tại không còn hậu tố `@`.
- Kiểm tra toàn bộ migration hiện hữu và ghi nhận baseline schema.
- Xác nhận T001–T019 vẫn DONE.
- Kiểm tra route, permission, audit, storage hiện hữu trước khi thêm schema MVP2.
- Không thêm feature mới trong task này.

## Acceptance
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` PASS.
- Không có regression MVP1.
- Tài liệu không còn mâu thuẫn về login name.
- `TASK_INDEX.md` trỏ đúng task kế tiếp sau khi hoàn thành.
