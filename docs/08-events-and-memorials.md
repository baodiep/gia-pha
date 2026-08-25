# 08 — Ngày giỗ & Sự kiện dòng họ

## Memorials

Hai khái niệm tách biệt:

1. `Person đã mất`: thuộc hồ sơ person.
2. `Ngày giỗ`: dữ liệu tưởng niệm gắn với person; có thể dựa ngày dương hoặc ngày âm đã nhập.

MVP `/memorials` cung cấp:
- Danh sách thành viên đã mất.
- Lọc theo đời/chi.
- Sắp xếp ngày mất.
- Danh sách ngày giỗ sắp tới theo dữ liệu đã nhập.

Nếu chưa có engine lịch âm được duyệt, không hiển thị ngày dương "quy đổi" từ âm một cách phỏng đoán.

## Family events

Event độc lập với memorial. Giỗ tổ lớn có thể được tạo thành `family_event`, còn ngày giỗ cá nhân vẫn nằm trong person.

Visibility:
- `ALL_MEMBERS`: tất cả ACTIVE member xem.
- `BRANCH`: chỉ branch được chỉ định và Admin.
- `ADMIN_ONLY`: draft/nội bộ.
