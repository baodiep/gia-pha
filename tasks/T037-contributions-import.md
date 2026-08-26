# T037 — Contribution Excel import

## Goal
Cho Admin import danh sách đóng góp từ Excel an toàn, có preview và kiểm soát trùng.

## Work
- Cung cấp template Excel với cột tối thiểu: thời gian, họ tên, SĐT, số tiền, mục đích, ghi chú optional.
- Parse/validate server-side.
- Preview từng dòng: VALID/WARNING/ERROR.
- Gợi ý map account theo SĐT; không tìm thấy account vẫn cho import với `user_id=null`.
- Cảnh báo duplicate khả nghi theo tổ hợp thời gian/ngày, phone, amount, purpose; không tự xóa vì có thể là hai khoản thật.
- Admin quyết định bỏ qua hoặc vẫn import các warning phù hợp.
- Import transaction + batch id/idempotency + audit summary.
- Kết quả cuối hiển thị: số dòng đọc, thành công, warning, lỗi, số account map/không map.
- UI import bắt buộc có hướng dẫn từng bước và file mẫu; mobile dùng card/step rõ ràng.

## Acceptance
- File sai báo lỗi theo dòng/cột dễ hiểu.
- ERROR không được import; WARNING phải được nhìn thấy trước khi confirm.
- Double submit/retry không tạo duplicate ngoài quyết định của Admin.
- Member không truy cập được import route/action.
- Test parser, duplicate warning, mapping và transaction PASS.
