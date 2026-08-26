# T021 — MVP2 database foundations

## Goal
Bổ sung schema nền cho MVP2, giữ nguyên domain lõi MVP1 nếu không bắt buộc thay đổi.

## Work
Tạo migration mới cho các bảng/enum cần thiết, tối thiểu gồm:
- `person_claim_requests`.
- `profile_change_requests`.
- `password_reset_requests`.
- `family_resources`.
- `event_attendees`.
- `notifications`.
- `notification_preferences`.
- `push_subscriptions`.
- `contribution_settings`.
- `contributions`.

Yêu cầu:
- FK/index/check constraint rõ ràng.
- Soft delete cho dữ liệu nghiệp vụ cần khôi phục/audit.
- Không lưu plaintext password hoặc CAPTCHA answer.
- Contribution có `contributor_name`, `phone`, `amount`, `purpose`, `user_id nullable`, thời gian đóng góp và audit metadata.
- `family_resources` chỉ lưu metadata + external URL, không thêm storage upload.

## Acceptance
- Migration chạy được trên database mới sau các migration MVP1.
- Có index cho các trường query chính: thời gian, phone, amount, status, user_id.
- Schema không phá các bảng `persons`, `parent_child`, `unions`, `branch_grants` hiện có.
- TypeScript domain types được cập nhật.
- Test schema/validation phù hợp PASS.
