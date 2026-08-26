# 03 — Authentication MVP 1

## Visible account

Phone input `0912 345 678` được normalize thành `0912345678`.
Tên đăng nhập hiển thị: `0912345678` (chuẩn hóa số điện thoại, không còn hậu tố `@`).

## Internal identity

Supabase Auth yêu cầu identifier kỹ thuật hợp lệ cho password flow. Server map:

```text
0912345678 -> 0912345678@auth.giapha.local
```

Domain lấy từ `AUTH_INTERNAL_EMAIL_DOMAIN`.

## State machine

```text
PENDING -> ACTIVE -> SUSPENDED
   ^         |
   +---------+ (Admin có thể kích hoạt lại tùy rule)
```

### PENDING
- Chưa truy cập dữ liệu.
- Không có quyền branch dù branch_grant tồn tại do lỗi dữ liệu.

### ACTIVE
- Cho phép đăng nhập và tính quyền.

### SUSPENDED
- Không truy cập dữ liệu.

## Khuyến nghị triển khai

Tạo Supabase Auth user bằng Admin API và giữ user bị disabled/banned trong thời gian `PENDING`; khi Admin activate thì enable/unban. Đồng thời application/RLS luôn kiểm tra `profiles.status = ACTIVE` để tránh phụ thuộc vào một lớp kiểm soát.

Không lưu mật khẩu plaintext. Self-register nhập password ngay khi đăng ký. Trường hợp Admin tạo hộ tài khoản: sinh mật khẩu tạm đủ mạnh và bắt đổi ở lần đăng nhập đầu (`must_change_password=true`).

## Phase 2

SMS activation/OTP được thêm sau bằng provider phù hợp Việt Nam. Không đổi `profiles.person_id`, `branch_grants` hay domain model khi thêm SMS.
