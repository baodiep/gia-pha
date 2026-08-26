# AGENTS.md — Quy tắc làm việc cho AI coding agent

## 1. Điểm vào bắt buộc

Mỗi phiên làm việc phải:

1. Đọc `TASK_INDEX.md`.
2. Xác định `CURRENT TASK`.
3. Đọc file `tasks/<CURRENT_TASK>-*.md`.
4. Kiểm tra dependency của task đã `DONE`.
5. Nếu task thuộc MVP2, đọc thêm `docs/mvp2/01-scope.md` và `docs/mvp2/02-mobile-ux-40plus.md`.
6. Chỉ sau đó mới sửa code.

Không tự chọn task khác nếu current task chưa `DONE` hoặc `BLOCKED`.

## 2. Sau khi hoàn thành task

Phải thực hiện đủ:

- Chạy acceptance checks nêu trong task.
- Chạy `npm run typecheck` / `npm run lint` / test phù hợp nếu project đã cài dependency.
- Task có UI phải kiểm tra mobile theo chuẩn MVP2 trước khi DONE.
- Cập nhật tài liệu nếu behavior/schema thay đổi.
- Chạy `npm run task:done -- <TASK_ID>`.
- Mở lại `TASK_INDEX.md` và báo task kế tiếp.

Nếu không thể hoàn thành:

```bash
npm run task:block -- <TASK_ID> "mô tả blocker"
```

Không đánh dấu DONE khi acceptance criteria chưa đạt.

## 3. Nguyên tắc kiến trúc

- Giữ kiến trúc Next.js + Supabase/PostgreSQL/RLS; không tự chuyển microservice.
- Không thêm Redis/Kafka/Graph DB nếu chưa có task yêu cầu.
- Mọi mutation phải kiểm tra quyền server-side; UI hide button không được coi là security.
- Permission theo `User -> Branch Root`, không materialize danh sách quyền từng person.
- Branch editable gồm descendants theo lineage + spouse/partner của các descendants.
- Chỉ Admin được đổi ancestor của branch root, chuyển nhánh, merge person, cấp/thu hồi branch grant.
- Soft delete mặc định cho dữ liệu nghiệp vụ cần khôi phục/audit; không hard delete qua UI nếu task không yêu cầu.
- Mọi thay đổi nhạy cảm phải ghi audit log.
- SQL migration là source of truth cho schema.

## 4. Authentication & password reset

- Visible login hiện tại là số điện thoại chuẩn hóa, không có hậu tố `@`.
- Internal Supabase email vẫn map qua `AUTH_INTERNAL_EMAIL_DOMAIN`.
- Tài khoản mới: `PENDING`; Admin activate -> `ACTIVE`; `SUSPENDED` bị chặn.
- MVP2 không dùng SMS/OTP/xác thực SĐT.
- Quên mật khẩu dùng request tới Admin + CAPTCHA đơn giản + rate limit.
- Admin reset bằng mật khẩu random 8 chữ số hoặc nhập tay.
- Random 8 chữ số phải dùng cryptographically secure RNG và luôn đặt `must_change_password=true`.
- Không lưu plaintext password/temporary password trong database, audit log hoặc notification.
- User có `must_change_password=true` chỉ được phép đổi mật khẩu/logout cho tới khi đổi thành công.

## 5. Coding standards

- TypeScript strict.
- Server actions/route handlers validate input bằng Zod hoặc validation tương đương.
- Không dùng service-role key ở client.
- Function xử lý permission phải có unit test positive/negative.
- Import Excel phải validate server-side, có preview trước mutation và chống double-submit/idempotency phù hợp.
- External URL phải validate; không render HTML không sanitize.

## 6. MVP2 product scope bắt buộc

Đọc `docs/mvp2/01-scope.md`. Không tự thêm các mục ngoài scope như SMS, OTP, GEDCOM, payment gateway, banking API, upload tài liệu/album trực tiếp, chat, multi-tenant, microservice.

Module đóng góp chỉ quản lý/hiển thị thông tin và danh sách do Admin nhập/import; không xử lý giao dịch hoặc tự đối soát ngân hàng.

## 7. Mobile-first UX cho người dùng 40+

Đây là quality gate bắt buộc, không phải gợi ý. Đọc đầy đủ `docs/mvp2/02-mobile-ux-40plus.md`.

Tối thiểu:
- Body member UI >=16px, ưu tiên 17–18px; label/input >=16px.
- Touch target tối thiểu khoảng 44x44px; action chính ưu tiên cao 48–52px.
- Không dùng icon hoặc màu làm tín hiệu duy nhất; action quan trọng phải có text/accessible label.
- Form có label cố định, lỗi cạnh field, trạng thái `Đang xử lý...`, chống double click.
- Mobile không ép table nhiều cột nếu có thể chuyển card/list.
- Có Back action rõ ràng ở màn hình chi tiết/phức tạp.
- Loading/empty/success/warning/error phải rõ ràng bằng text.
- Chức năng nâng cao phải có hướng dẫn từng bước: import Excel, browser notification, claim person, tra cứu quan hệ, reset/đổi mật khẩu tạm.
- Task UI phải kiểm tra ít nhất viewport khoảng 360x800, 390x844, 768px và 1280px.
- Không đánh dấu DONE nếu chỉ dùng tốt trên desktop.
