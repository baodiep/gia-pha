# T036 — Contribution CRUD, search & statistics

## Goal
Quản lý minh bạch danh sách đóng góp: Admin CRUD, Member chỉ xem/tìm kiếm.

## Work
- Admin list/create/edit/soft-delete contribution.
- Fields: contributed_at, contributor_name, phone, amount, purpose, user_id nullable, note và audit metadata.
- Gợi ý map `user_id` theo phone; Admin phải xác nhận, không auto-map mù quáng.
- Search/filter kết hợp: phone, họ tên, từ/đến ngày, amount min/max, purpose text contains case-insensitive.
- Thống kê trên kết quả lọc: tổng số tiền, số lượt, số người đóng góp phù hợp.
- Member chỉ read/search/filter; không thấy nút mutation và server/RLS cũng chặn mutation.
- Desktop có table; mobile ưu tiên card/list với nhãn rõ, filter dạng panel dễ mở/đóng.
- STT tính theo pagination, không lưu như dữ liệu nghiệp vụ.

## Acceptance
- Các filter kết hợp đúng và có index/query plan hợp lý cho quy mô dự kiến.
- Purpose/name contains hoạt động không phân biệt hoa thường.
- Phone được normalize trước search/map.
- Member không thể create/update/delete qua API trực tiếp.
- Mobile không bắt người dùng cuộn ngang bảng để đọc dữ liệu chính.
