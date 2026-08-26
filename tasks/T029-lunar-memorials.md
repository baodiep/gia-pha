# T029 — Lunar calendar & memorial recurrence

## Goal
Tính ngày giỗ theo từng năm từ dữ liệu ngày âm đã lưu và hiển thị chính xác theo timezone Việt Nam.

## Work
- Chọn thư viện/thuật toán lịch âm đáng tin cậy, có test; không tự suy diễn thiếu kiểm chứng.
- Convert `death_lunar_day/month/is_leap_month` sang ngày dương của năm được chọn.
- Xử lý tháng nhuận, năm biên, timezone Asia/Ho_Chi_Minh.
- Nếu dữ liệu âm không đủ/không hợp lệ thì hiển thị rõ “chưa xác định”, không đoán.
- Cung cấp service dùng lại cho memorial list, dashboard, calendar, notification.

## Acceptance
- Có test các case tháng nhuận, đầu/cuối năm và nhiều năm mẫu.
- Ngày giỗ hiển thị cả âm lịch nguồn và dương lịch tương ứng của năm đang xem.
- Không thay đổi dữ liệu ngày âm gốc ngoài ý muốn.
- UI memorial mobile dễ đọc theo card/list.
