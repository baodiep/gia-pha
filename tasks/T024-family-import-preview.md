# T024 — Family import preview & duplicate detection

## Goal
Cho Admin xem trước và xử lý lỗi/trùng trước khi ghi dữ liệu gia phả.

## Work
- Preview theo dòng với trạng thái VALID/WARNING/ERROR.
- Phát hiện: duplicate person khả nghi, external_id trùng, parent không tồn tại, self-parent, vòng lặp lineage, spouse duplicate, quan hệ lặp, ngày/enum sai.
- Cho phép sửa/bỏ dòng hoặc quay lại file nguồn; không âm thầm bỏ dữ liệu.
- Hiển thị tổng số valid/warning/error và hướng dẫn cách xử lý.
- Mobile dùng card/list thay table nhiều cột; desktop có thể table.

## Acceptance
- Không thể chuyển sang import nếu còn ERROR chưa xử lý.
- WARNING không tự loại dữ liệu; Admin phải thấy và quyết định.
- Có test cycle/duplicate/relationship validation.
- UI mobile rõ, nút >=44px và có hướng dẫn.
