# T003 — Account registration, activation & login

## Goal
Hoàn thành auth MVP không SMS.

## Behavior
- User/Admin tạo account -> PENDING.
- Visible login: `<phone>@`.
- Server map sang internal email Supabase.
- Admin activate -> ACTIVE.
- Login username + password.
- PENDING/SUSPENDED bị chặn.
- Admin-created account có temporary password + `must_change_password`.

## Work
- Implement phone normalization.
- Implement visible-login <-> internal-email mapper.
- Registration action/API.
- Admin activate/suspend server functions.
- Login/logout.
- Auth session helpers.
- Server guard `requireActiveUser`.
- Unit tests cho normalization/state.

## Acceptance
- `0912 345 678` -> login `0912345678@`.
- PENDING không vào `/tree`.
- ACTIVE login thành công.
- SUSPENDED không vào app.
- Client không chứa service-role key.
