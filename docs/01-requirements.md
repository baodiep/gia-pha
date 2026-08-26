# 01 — Yêu cầu nghiệp vụ MVP 1

## Mục tiêu

Xây dựng web gia phả cho phép toàn bộ thành viên xem cây dòng họ, nhưng chỉ người được Admin giao quản lý nhánh mới được chỉnh sửa dữ liệu từ nút gốc được giao trở xuống.

## Vai trò

### Admin
- Quản lý toàn bộ cây.
- Tạo tài khoản, kích hoạt, khóa tài khoản.
- Liên kết tài khoản với Person.
- Cấp/thu hồi quyền quản lý nhánh.
- Thay đổi cấu trúc cây nhạy cảm.
- Quản trị sự kiện, audit, thùng rác.

### Member
- Xem toàn bộ cây theo chính sách hệ thống.
- Xem hồ sơ thành viên.
- Nếu có branch grant: sửa nút gốc, descendants và spouse/partner trong vùng được quản lý.
- Không sửa nhánh khác.

## Luồng cấp quyền Admin — đúng 3 bước

1. Tạo/tìm tài khoản bằng số điện thoại.
2. Chọn đúng thành viên trên cây.
3. Bấm `Cấp quyền quản lý từ nút này`.

## Tài khoản MVP 1

- Self-register hoặc Admin create -> `PENDING`.
- Admin activate -> `ACTIVE`.
- Visible username = số điện thoại chuẩn hóa (ví dụ: `0912345678`, không còn hậu tố `@`).
- Login bằng username + password.
- SMS activation/OTP để Phase 2.

## Thành viên đã mất / ngày giỗ

Person có `life_status`, `death_date`, `death_lunar_date` (nếu biết), `death_anniversary_note`.
MVP phải có danh sách thành viên đã mất và màn hình ngày giỗ sắp tới.

Lưu cả ngày dương và trường ngày âm dạng dữ liệu có cấu trúc để sau này xử lý lịch âm chính xác. Không tự suy diễn ngày âm từ ngày dương nếu chưa có thư viện/đặc tả được duyệt.

## Sự kiện dòng họ

MVP hỗ trợ:
- Tên sự kiện.
- Mô tả.
- Thời gian bắt đầu/kết thúc.
- Địa điểm.
- Người tạo.
- Trạng thái DRAFT/PUBLISHED/CANCELLED.
- Phạm vi ALL_MEMBERS hoặc BRANCH.
- Nếu BRANCH phải có root_person_id.

Ví dụ: họp họ, lễ giỗ tổ, khuyến học, lễ mừng thọ, ngày hội gia đình.
