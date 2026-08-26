# T028 — Kinship relationship engine

## Goal
Cho người dùng chọn hai thành viên và xem đường quan hệ giữa họ theo cây gia phả.

## Work
- Xây graph traversal trên `parent_child` + `unions` theo rule rõ ràng.
- Tìm đường quan hệ ngắn/phù hợp, tránh vòng lặp.
- Trả path gồm person + loại cạnh, không chỉ text kết luận.
- Tạo formatter tiếng Việt cho các quan hệ có thể xác định chắc chắn; nếu quan hệ phức tạp thì hiển thị đường đi thay vì suy diễn sai.
- UI chọn người A/B có search lớn, dễ dùng trên mobile; có nút đổi A/B và hướng dẫn.
- Highlight path trên cây hoặc view path riêng nếu hợp lý.

## Acceptance
- Test parent/child, grandparent, sibling, spouse và path phức tạp.
- Không loop trên graph lỗi/có cycle ngoài ý muốn.
- Không khẳng định tên gọi họ hàng nếu engine không đủ dữ kiện.
- Mobile sử dụng được bằng một tay, text/path dễ đọc.
