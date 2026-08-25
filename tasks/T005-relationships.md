# T005 — Parent-child & spouse relationships

## Goal
Quản lý quan hệ gia đình đúng domain model.

## Work
- Add/remove parent-child.
- Chọn `is_lineage_relation`.
- Add/update union spouse/partner.
- Chặn self relation và cycle lineage.
- Tests cho cycle detection.

## Acceptance
- Không tạo được cycle.
- Một person có thể có >1 parent relation.
- Một person có thể có nhiều union theo thời gian.
