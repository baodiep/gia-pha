# TASK INDEX

> Đây là điểm vào cho AI coding agent. Đọc `AGENTS.md` trước, sau đó đọc file task hiện tại.

## CURRENT TASK

**Không còn task đang mở.**

## Quy tắc chọn task tiếp theo

- Ưu tiên task `IN_PROGRESS`.
- Nếu không có, chọn task `READY` đầu tiên theo thứ tự index.
- Task chỉ chuyển `READY` khi toàn bộ `depends_on` đã `DONE`.
- Không tự bỏ qua task `BLOCKED` mà không ghi rõ blocker.

## Danh sách task

| ID | Status | Task | Depends on | File |
|---|---|---|---|---|
| T001 | DONE | Bootstrap project & quality gates | - | `tasks/T001-bootstrap.md` |
| T002 | DONE | Apply database schema & seed | T001 | `tasks/T002-database.md` |
| T003 | DONE | Account registration, activation & login | T002 | `tasks/T003-auth.md` |
| T004 | DONE | Person CRUD + deceased fields | T003 | `tasks/T004-persons.md` |
| T005 | DONE | Parent-child & spouse relationships | T004 | `tasks/T005-relationships.md` |
| T006 | DONE | Permission service + branch grants | T005 | `tasks/T006-permissions.md` |
| T007 | DONE | RLS security policies | T006 | `tasks/T007-rls.md` |
| T008 | DONE | Family tree visualization | T005, T006 | `tasks/T008-tree-ui.md` |
| T009 | DONE | Search & tree focus | T008 | `tasks/T009-search.md` |
| T010 | DONE | Memorials & deceased members | T004 | `tasks/T010-memorials.md` |
| T011 | DONE | Family events | T006 | `tasks/T011-events.md` |
| T012 | DONE | Admin account management | T003 | `tasks/T012-admin-accounts.md` |
| T013 | DONE | Admin permission management | T006, T008 | `tasks/T013-admin-permissions.md` |
| T014 | DONE | Audit log & recycle bin | T004, T006 | `tasks/T014-audit-trash.md` |
| T015 | DONE | Avatar & basic storage | T004, T007 | `tasks/T015-storage.md` |
| T016 | DONE | Admin dashboard & navigation | T010, T011, T012, T013, T014 | `tasks/T016-admin-dashboard.md` |
| T017 | DONE | E2E critical journeys | T007, T009, T010, T011, T013, T014 | `tasks/T017-e2e.md` |
| T018 | DONE | Vercel deployment & production checklist | T017 | `tasks/T018-deploy.md` |
| T019 | DONE | MVP hardening & release | T018 | `tasks/T019-release.md` |
| T020 | DONE | MVP2 baseline & specification | T019 | `tasks/T020-mvp2-baseline.md` |
| T021 | DONE | MVP2 database foundations | T020 | `tasks/T021-mvp2-database.md` |
| T022 | DONE | MVP2 RLS, audit & privacy | T021 | `tasks/T022-mvp2-rls-audit.md` |
| T023 | DONE | Family Excel import template & parser | T021 | `tasks/T023-family-import-parser.md` |
| T024 | DONE | Family import preview & duplicate detection | T023 | `tasks/T024-family-import-preview.md` |
| T025 | DONE | Transactional family import | T024, T022 | `tasks/T025-family-import-transaction.md` |
| T026 | DONE | Person claim & profile change requests | T021, T022 | `tasks/T026-person-claim-profile-change.md` |
| T027 | DONE | Password reset requests, CAPTCHA & forced password change | T021, T022 | `tasks/T027-password-reset-requests.md` |
| T028 | DONE | Kinship relationship engine | T020 | `tasks/T028-kinship-engine.md` |
| T029 | DONE | Lunar calendar & memorial recurrence | T020 | `tasks/T029-lunar-memorials.md` |
| T030 | DONE | Member dashboard & family calendar | T029 | `tasks/T030-member-dashboard-calendar.md` |
| T031 | DONE | External albums, documents & family history | T021, T022 | `tasks/T031-external-family-resources.md` |
| T032 | DONE | Event RSVP & attendance | T021, T022 | `tasks/T032-event-rsvp.md` |
| T033 | DONE | In-app notifications | T021, T022, T032 | `tasks/T033-inapp-notifications.md` |
| T034 | DONE | Browser push notifications & preferences | T033 | `tasks/T034-browser-push.md` |
| T035 | DONE | Contribution QR & configuration | T021, T022 | `tasks/T035-contribution-qr.md` |
| T036 | DONE | Contribution CRUD, search & statistics | T035 | `tasks/T036-contributions-management.md` |
| T037 | DONE | Contribution Excel import | T036 | `tasks/T037-contributions-import.md` |
| T038 | DONE | MVP2 E2E, security & performance | T025, T026, T027, T028, T030, T031, T034, T037 | `tasks/T038-mvp2-e2e-security-performance.md` |
| T039 | DONE | MVP2 production release | T038 | `tasks/T039-mvp2-release.md` |

## Commands

```bash
npm run task:current
npm run task:list
npm run task:start -- T001
npm run task:done -- T001
npm run task:block -- T001 "reason"
npm run task:refresh
```
