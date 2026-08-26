# T039 — MVP2 production release

## Goal
Đóng gói MVP2 thành release production-ready.

## Work
- Chạy full quality gates và E2E từ T038.
- Cập nhật README, docs MVP2, production deployment guide và release notes.
- Kiểm tra migration order, environment variables mới (push/CAPTCHA secret nếu có) và rollback notes.
- Cập nhật hướng dẫn Admin: import gia phả, reset password, quản lý resource, contribution, notification.
- Cập nhật hướng dẫn Member: claim person, tra cứu quan hệ, bật browser notification, đóng góp/read-only search.
- Xác nhận UX mobile 40+ cho các journey quan trọng.
- Chuẩn bị tag/release `v2.0.0-mvp2` khi acceptance đạt.

## Acceptance
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` PASS.
- Không còn critical/high bug đã biết.
- Migration/runbook có thể áp dụng trên production mà không phá dữ liệu MVP1.
- README và TASK_INDEX phản ánh MVP2 hoàn thành.
- Release notes liệt kê rõ phạm vi và các mục ngoài scope.
