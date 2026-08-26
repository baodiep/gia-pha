# Release Notes — Gia Phả Dòng Họ v2.0.0 (MVP2)

## 📌 Tổng Quan Bản Phát Hành MVP2
Bản phát hành `v2.0.0-mvp2` mở rộng toàn diện trải nghiệm kết nối dòng họ, tập trung tối ưu hóa cho **người dùng lớn tuổi (40+)**, hỗ trợ nhập dữ liệu hàng loạt từ Excel an toàn, lịch âm thiên văn Hồ Ngọc Đức chính xác, tra cứu quan hệ họ hàng thông minh, quản lý sổ công đức minh bạch và trung tâm thông báo đa kênh.

---

## 🚀 Các Tính Năng Mới Chính (MVP2)

### 1. Nhập Dữ Liệu Gia Phả & Sổ Công Đức Hàng Loạt Từ Excel (T023, T024, T025, T037)
- **Tải file mẫu Excel chuẩn**: Cung cấp template `.xlsx` rõ ràng cho dữ liệu thành viên, quan hệ huyết thống, hôn nhân và sổ công đức.
- **Xử lý giao dịch & Preview an toàn**:
  - Phân loại rõ ràng 3 trạng thái dòng: `VALID`, `WARNING`, `ERROR`.
  - Tự động phát hiện trùng lặp khả nghi (Họ tên + Ngày sinh/Ngày mất hoặc Họ tên + Số tiền + Ngày đóng góp).
  - Tự động gợi ý map tài khoản qua số điện thoại chuẩn hóa.
  - Giao dịch database toàn vẹn (ACID), đảm bảo không tạo rác khi có lỗi giữa chừng.

### 2. Định Danh & Tự Quản Hồ Sơ Thành Viên (T026, T027)
- **Yêu cầu nhận diện "Đây là tôi" (`Person Claim`)**: Thành viên gửi yêu cầu nhận hồ sơ trên cây, Admin xét duyệt trước khi liên kết.
- **Yêu cầu cập nhật thông tin cá nhân (`Profile Change`)**: Cho phép thành viên đề xuất sửa thông tin (ngày sinh, tiểu sử, số điện thoại) có phê duyệt của Ban Quản trị.
- **Quên & Đặt lại mật khẩu an toàn (`Password Reset`)**:
  - Bảo vệ chống brute-force và spam qua **HMAC Math CAPTCHA**.
  - Không gửi mật khẩu thô; tạo mã **PIN 8 số ngẫu nhiên cryptographically secure** để đăng nhập lần đầu và bắt buộc đổi mật khẩu ngay lập tức.

### 3. Công Cụ Tra Cứu Xưng Hô Họ Hàng Thông Minh (T028)
- Thuật toán BFS tìm đường đi ngắn nhất giữa 2 người bất kỳ trên cây gia phả.
- Tự động tính toán vai vế và xưng hô thuần Việt chuẩn mực: *Ông/Bà, Bác/Chú/Cô/Dì, Anh/Chị/Em họ, Cháu, Chắt*.

### 4. Lịch Âm Thiên Văn Hồ Ngọc Đức & Kỵ Nhật Tự Động (T029, T030)
- Tích hợp trọn vẹn thuật toán âm lịch thiên văn chuẩn múi giờ UTC+7 (Asia/Ho_Chi_Minh).
- Tự động chuyển đổi ngày mất âm lịch sang ngày dương lịch tương ứng của từng năm xem (hỗ trợ chính xác tháng nhuận).
- **Dashboard thành viên 90 ngày**: Hợp nhất ngày giỗ sắp tới và sự kiện dòng họ trên giao diện trực quan.

### 5. Quản Lý Sự Kiện & Xác Nhận Tham Dự RSVP (T031, T032)
- Thành viên xác nhận tham gia sự kiện (`GOING`, `MAYBE`, `NOT_GOING`), số lượng khách đi kèm và ghi chú.
- Admin theo dõi danh sách điểm danh, thống kê tổng số người và khách tham dự.
- Liên kết tài liệu, album ảnh kỷ niệm ngoài an toàn (`family_resources`).

### 6. Trung Tâm Thông Báo Đa Kênh & Web Push (T033, T034)
- Thông báo trong ứng dụng (`In-app Notification`) với chuông thông báo và số lượng chưa đọc.
- Hỗ trợ thông báo đẩy trình duyệt (`Browser Push Notifications`) cho điện thoại/máy tính khi có ngày giỗ hoặc thông báo họ mới.
- Cài đặt tùy chọn nhận tin linh hoạt theo từng nhóm sự kiện.

### 7. Cấu Hình QR Đóng Góp & Sổ Ghi Nhận Công Đức (T035, T036)
- Hiển thị thông tin quỹ dòng họ, quét mã QR chuyển khoản nhanh và sao chép số tài khoản 1-chạm.
- Quản lý sổ công đức minh bạch: lọc theo thời gian, số tiền, mục đích, người đóng góp và thống kê tổng tiền tức thì.

---

## 🛡️ Thiết Kế Trải Nghiệm Chuẩn Mobile 40+
- **Kích thước chạm chuẩn**: Mọi nút bấm, ô nhập liệu có chiều cao tối thiểu 48px - 50px.
- **Chữ to rõ ràng**: Font chữ tối thiểu 16px - 18px trên màn hình nhỏ, tương phản cao.
- **Bố cục dạng thẻ (Card-based)**: Không yêu cầu người dùng cuộn ngang bảng tính phức tạp trên điện thoại.
- **Hướng dẫn từng bước**: Có giải thích rõ ràng tại từng màn hình thao tác quan trọng.

---

## 🔒 Kiểm Thử & Quality Gates
- **Typecheck**: `tsc --noEmit` — 0 errors.
- **Lint**: ESLint flat config — 0 errors.
- **Test Suite**: Vitest 4 — **35/35 test suites pass, 122/122 tests pass**.
- **Production Build**: Next.js 16.3.2 Turbopack — Build thành công 23 routes tĩnh và động.

---

## 📦 Tag Phát Hành
- Version: `v2.0.0-mvp2`
- Branch: `feat/MVP2`
