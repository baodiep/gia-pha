# T031 — External albums, documents & family history

## Goal
Quản lý album ảnh, tư liệu và lịch sử dòng họ bằng liên kết ngoài, không upload file vào hệ thống.

## Work
- CRUD `family_resources` cho Admin.
- Loại: ALBUM, DOCUMENT, HISTORY, VIDEO, OTHER.
- Fields tối thiểu: title, description, external_url, provider_name, thumbnail_url optional, root_person_id optional, status, display_order.
- Validate URL http/https; không render HTML từ description nếu chưa sanitize.
- Member chỉ xem resource active/published và mở link ngoài.
- Có cảnh báo/link icon rõ ràng khi chuyển sang website khác.
- UI member ưu tiên card lớn, title/mô tả dễ đọc, không dùng thumbnail bé làm điểm bấm duy nhất.

## Acceptance
- Không có upload storage mới cho module này.
- Admin CRUD và soft delete/audit hoạt động.
- Member không sửa được resource.
- Mobile card dễ đọc và action mở link >=44px.
