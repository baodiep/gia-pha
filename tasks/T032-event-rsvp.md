# T032 — Event RSVP & attendance

## Goal
Cho thành viên xác nhận tham dự sự kiện và Admin theo dõi danh sách tham dự.

## Work
- `event_attendees`: event_id, user_id, status GOING/MAYBE/NOT_GOING, guest_count, note, timestamps.
- Member chỉ cập nhật RSVP của chính mình cho event được phép xem.
- Admin xem/tìm/filter danh sách tham dự, tổng số người/khách.
- Event detail có CTA RSVP rõ ràng trên mobile.
- Trạng thái phải có text, không chỉ màu.
- Có hook tạo notification/event reminder cho task sau.

## Acceptance
- Member không sửa RSVP người khác.
- Một user/event chỉ có một RSVP active.
- guest_count validate >=0 và giới hạn hợp lý.
- Mobile CTA dễ bấm, label rõ ràng và có phản hồi sau submit.
