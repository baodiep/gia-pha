# 05 — Data model

## Core tables

- `profiles`: account state, phone, linked person, admin flag.
- `persons`: hồ sơ thành viên, sống/đã mất, ngày sinh/ngày mất/ngày giỗ.
- `parent_child`: quan hệ cha/mẹ-con.
- `unions`: vợ/chồng/partner.
- `branch_grants`: quyền quản lý nhánh.
- `family_events`: sự kiện dòng họ.
- `audit_logs`: lịch sử thay đổi.

## Không dùng `persons.parent_id` duy nhất

Một person có thể có nhiều quan hệ cha/mẹ và nhiều kiểu quan hệ. Quan hệ được normalize trong `parent_child`.

## Ngày giỗ

MVP lưu:
- `death_date date` — ngày dương nếu biết.
- `death_lunar_day smallint`.
- `death_lunar_month smallint`.
- `death_lunar_is_leap_month boolean`.
- `death_anniversary_note text`.

Không tự quy đổi âm/dương trong database migration đầu tiên.
