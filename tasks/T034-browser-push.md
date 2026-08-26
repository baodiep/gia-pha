# T034 — Browser push notifications & preferences

## Goal
Cho người dùng chủ động bật thông báo trình duyệt cho các thông báo quan trọng.

## Work
- Service worker + Web Push subscription.
- Chỉ gọi browser permission sau khi user bấm `Bật thông báo`, không tự popup khi mở app.
- Lưu nhiều `push_subscriptions` cho mỗi user/device; có revoke/cleanup.
- UI cài đặt: bật/tắt browser push, loại thông báo, nút `Gửi thông báo thử`.
- Hướng dẫn từng bước và cách xử lý khi browser đã DENIED.
- Tối thiểu hỗ trợ EVENT_REMINDER, MEMORIAL_REMINDER và PASSWORD_RESET_REQUESTED cho Admin nếu preference bật.
- Không gửi secret/password qua push payload.

## Acceptance
- Subscribe/unsubscribe/test notification hoạt động trên browser hỗ trợ.
- Nếu browser không hỗ trợ/permission denied, UI giải thích rõ và app vẫn dùng in-app notification bình thường.
- User không quản lý subscription của người khác.
- UI tuân thủ chuẩn mobile 40+.
