# T026 — Person claim & profile change requests

## Goal
Cho thành viên gửi yêu cầu “Đây là tôi” và đề nghị cập nhật hồ sơ mà không tự sửa dữ liệu nhạy cảm.

## Work
- Member chọn person và tạo `person_claim_requests`.
- Chặn claim trùng/pending trùng; không tự link profile.
- Admin/manager phù hợp approve/reject; approve mới map `profiles.person_id`.
- Member gửi `profile_change_requests` cho ngày sinh, quê quán, bio, avatar/field được phép.
- Reviewer thấy old/new rõ ràng và approve/reject từng request.
- Có trạng thái, lịch sử, notification hook và audit.
- UI có hướng dẫn giải thích “Đây là tôi”, hậu quả khi duyệt, trạng thái đang chờ.

## Acceptance
- Member không claim thay người khác bằng mutation trực tiếp.
- Approve cập nhật đúng profile/person; reject không thay dữ liệu.
- Mobile form/card dễ đọc, nút lớn, trạng thái có text.
- Test permission và duplicate request PASS.
