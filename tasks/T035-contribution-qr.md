# T035 — Contribution QR & display configuration

## Goal
Hiển thị thông tin hướng dẫn đóng góp dòng họ và hình QR do Admin cấu hình. Đây chỉ là thông tin tham khảo/hiển thị; ứng dụng không xử lý giao dịch.

## Work
- Tạo màn hình cấu hình hiển thị cho Admin dựa trên `contribution_settings`.
- Dữ liệu gồm: tiêu đề, mô tả, tên ngân hàng/đơn vị nhận, thông tin tài khoản nhận, tên chủ tài khoản, URL hình QR, nội dung hướng dẫn, trạng thái active.
- QR chỉ dùng URL ảnh ngoài hoặc URL tĩnh phù hợp; không cần upload mới trong MVP2.
- Member page hiển thị QR và hướng dẫn rõ ràng, có nút copy các chuỗi thông tin nếu phù hợp.
- Không tích hợp cổng thanh toán, API ngân hàng, webhook hoặc tự động đối soát.

## Acceptance
- Admin chỉnh cấu hình; Member chỉ xem cấu hình active.
- QR và nội dung hiển thị tốt trên mobile, chữ/nút lớn, không cần zoom.
- URL ảnh lỗi có fallback và thông báo dễ hiểu.
- Audit cấu hình hoạt động.
