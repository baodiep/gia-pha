# T030 — Member dashboard & family calendar

## Goal
Tạo trang chủ hữu ích hằng ngày cho thành viên, ưu tiên mobile và người dùng 40+.

## Work
- Dashboard hiển thị lời chào, ngày giỗ sắp tới, sự kiện sắp tới, thông báo chưa đọc, lối tắt cây gia phả/tư liệu/đóng góp.
- Family calendar gộp memorial recurrence và family events, có view danh sách ưu tiên mobile.
- Không nhồi quá nhiều card/action trên một màn hình; ưu tiên 3–5 thông tin quan trọng.
- Empty/loading/error state rõ ràng.
- Action chính dùng text dễ hiểu, icon chỉ bổ trợ.

## Acceptance
- Mobile 360/390px không overflow ngoài vùng có chủ ý.
- Body text/member UI đáp ứng chuẩn UX 40+.
- Các mục sắp tới sắp theo thời gian đúng timezone.
- Dashboard không gây query N+1 rõ rệt và có chiến lược cache/revalidate phù hợp.
