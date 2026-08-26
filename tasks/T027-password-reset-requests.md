# T027 — Password reset requests, CAPTCHA & forced password change

## Goal
Cho người dùng quên mật khẩu gửi yêu cầu an toàn tới Admin; Admin reset bằng mật khẩu random 8 số hoặc nhập tay.

## Work
- `/forgot-password`: nhập tài khoản/SĐT + CAPTCHA phép tính đơn giản.
- CAPTCHA phải được tạo/kiểm tra server-side bằng signed token hoặc cơ chế tương đương; TTL khoảng 5 phút; không gửi answer xuống client.
- CAPTCHA sai phải refresh; có nút `Đổi mã`.
- Chống double submit; một account chỉ có 1 request PENDING; rate limit theo IP/account.
- Public response không tiết lộ account tồn tại hay không.
- Tạo notification cho Admin khi request hợp lệ được tạo.
- `/admin/password-resets`: list/filter/detail PENDING/COMPLETED/REJECTED.
- Admin có hai cách reset: `Tạo ngẫu nhiên 8 số` bằng crypto-secure RNG hoặc nhập tay.
- Random 8 số => `must_change_password=true` bắt buộc.
- Manual password có option yêu cầu đổi lần đăng nhập sau, mặc định bật.
- Không lưu plaintext password ở DB/audit/notification. Chỉ hiển thị password vừa reset trong response hiện tại kèm nút copy.
- User có `must_change_password=true` chỉ được vào route đổi mật khẩu/logout cho tới khi đổi thành công.
- Audit REQUESTED/COMPLETED/REJECTED.

## Acceptance
- CAPTCHA sai không tạo request; CAPTCHA đúng tạo tối đa một PENDING request.
- Double click không tạo request trùng; rate limit hoạt động.
- Admin nhận in-app notification hook.
- Random password luôn đúng 8 chữ số và dùng secure RNG.
- User login bằng password random bị ép đổi password trước khi vào app.
- Non-admin không reset được password người khác.
- UI mobile chữ/nút lớn, có giải thích rõ quy trình và cách liên hệ Admin nhận mật khẩu tạm.
