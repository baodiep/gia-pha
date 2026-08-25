# 04 — Permission model

## Branch grant

Chỉ lưu:

```text
user_id -> root_person_id
```

Không lưu quyền từng descendant.

## Editable set

```text
Editable(root) = lineage descendants(root, include root) + spouses/partners of those persons
```

## Member được phép

- Sửa thông tin person trong editable set.
- Thêm con cho person trong editable set.
- Thêm spouse/partner cho person trong editable set.
- Upload avatar/tài liệu theo policy.

## Admin-only

- Cấp/thu hồi branch grant.
- Đổi cha/mẹ/ancestor của branch root.
- Chuyển cả nhánh.
- Merge person.
- Hard delete.

## Security rule

Mọi API mutation phải gọi PermissionService. RLS là lớp bảo vệ bổ sung, không thay thế business validation.
