# T033 — In-app notifications

## Goal
Cung cấp trung tâm thông báo trong ứng dụng cho các sự kiện quan trọng.

## Work
- Notification bell + unread count + `/notifications`.
- Types tối thiểu: EVENT_PUBLISHED, EVENT_REMINDER, MEMORIAL_REMINDER, CLAIM_APPROVED/REJECTED, PROFILE_CHANGE_APPROVED/REJECTED, PASSWORD_RESET_REQUESTED/COMPLETED.
- mark read/unread, mark all read, link tới màn hình liên quan.
- `notification_preferences` cho phép bật/tắt nhóm thông báo phù hợp.
- Admin nhận PASSWORD_RESET_REQUESTED.
- Không đưa password/secret vào notification.

## Acceptance
- Permission đúng người nhận; unread count chính xác.
- Notification link không tạo IDOR.
- Mobile list/card chữ lớn, action rõ.
- Có empty/loading/error state.
