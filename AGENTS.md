# AGENTS.md — Quy tắc làm việc cho AI coding agent

## 1. Điểm vào bắt buộc

Mỗi phiên làm việc phải:

1. Đọc `TASK_INDEX.md`.
2. Xác định `CURRENT TASK`.
3. Đọc file `tasks/<CURRENT_TASK>-*.md`.
4. Kiểm tra dependency của task đã `DONE`.
5. Chỉ sau đó mới sửa code.

Không tự chọn task khác nếu current task chưa `DONE` hoặc `BLOCKED`.

## 2. Sau khi hoàn thành task

Phải thực hiện đủ:

- Chạy acceptance checks nêu trong task.
- Chạy `npm run typecheck` / `npm run lint` / test phù hợp nếu project đã cài dependency.
- Cập nhật tài liệu nếu behavior/schema thay đổi.
- Chạy `npm run task:done -- <TASK_ID>`.
- Mở lại `TASK_INDEX.md` và báo task kế tiếp.

Nếu không thể hoàn thành:

```bash
npm run task:block -- <TASK_ID> "mô tả blocker"
```

Không đánh dấu DONE khi acceptance criteria chưa đạt.

## 3. Nguyên tắc kiến trúc

- Không chuyển sang microservice trong MVP 1.
- Không thêm Redis/Kafka/Graph DB nếu chưa có task yêu cầu.
- Mọi mutation phải kiểm tra quyền server-side; UI hide button không được coi là security.
- Permission theo `User -> Branch Root`, không materialize danh sách quyền từng person.
- Branch editable gồm descendants theo lineage + spouse/partner của các descendants.
- Chỉ Admin được đổi ancestor của branch root, chuyển nhánh, merge person, cấp/thu hồi branch grant.
- Soft delete mặc định; không hard delete dữ liệu nghiệp vụ trong UI.
- Mọi thay đổi nhạy cảm phải ghi audit log.

## 4. Quy tắc Authentication MVP 1

- Visible login: `<phone>@`, ví dụ `0912345678@`.
- Internal Supabase email: `<normalized_phone>@<AUTH_INTERNAL_EMAIL_DOMAIN>`.
- Tài khoản mới: `PENDING`.
- Admin activate -> `ACTIVE`.
- Chưa dùng SMS/OTP.
- `PENDING`/`SUSPENDED` phải bị chặn ở server và RLS/app policies.
- Không lưu plain-text password trong database của ứng dụng.

## 5. Coding standards

- TypeScript strict.
- Server actions/route handlers validate input bằng Zod hoặc validation tương đương.
- Không dùng service-role key ở client.
- SQL migration là source of truth cho schema.
- Function xử lý permission phải có unit test cho cả positive/negative cases.
