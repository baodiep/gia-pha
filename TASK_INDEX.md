# TASK INDEX

> Đây là điểm vào cho AI coding agent. Đọc `AGENTS.md` trước, sau đó đọc file task hiện tại.

## CURRENT TASK

**T003 — Account registration, activation & login**  
File: `tasks/T003-auth.md`  
Status: **READY**

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
| T003 | READY | Account registration, activation & login | T002 | `tasks/T003-auth.md` |
| T004 | BACKLOG | Person CRUD + deceased fields | T003 | `tasks/T004-persons.md` |
| T005 | BACKLOG | Parent-child & spouse relationships | T004 | `tasks/T005-relationships.md` |
| T006 | BACKLOG | Permission service + branch grants | T005 | `tasks/T006-permissions.md` |
| T007 | BACKLOG | RLS security policies | T006 | `tasks/T007-rls.md` |
| T008 | BACKLOG | Family tree visualization | T005, T006 | `tasks/T008-tree-ui.md` |
| T009 | BACKLOG | Search & tree focus | T008 | `tasks/T009-search.md` |
| T010 | BACKLOG | Memorials & deceased members | T004 | `tasks/T010-memorials.md` |
| T011 | BACKLOG | Family events | T006 | `tasks/T011-events.md` |
| T012 | BACKLOG | Admin account management | T003 | `tasks/T012-admin-accounts.md` |
| T013 | BACKLOG | Admin permission management | T006, T008 | `tasks/T013-admin-permissions.md` |
| T014 | BACKLOG | Audit log & recycle bin | T004, T006 | `tasks/T014-audit-trash.md` |
| T015 | BACKLOG | Avatar & basic storage | T004, T007 | `tasks/T015-storage.md` |
| T016 | BACKLOG | Admin dashboard & navigation | T010, T011, T012, T013, T014 | `tasks/T016-admin-dashboard.md` |
| T017 | BACKLOG | E2E critical journeys | T007, T009, T010, T011, T013, T014 | `tasks/T017-e2e.md` |
| T018 | BACKLOG | Vercel deployment & production checklist | T017 | `tasks/T018-deploy.md` |
| T019 | BACKLOG | MVP hardening & release | T018 | `tasks/T019-release.md` |

## Commands

```bash
npm run task:current
npm run task:list
npm run task:start -- T001
npm run task:done -- T001
npm run task:block -- T001 "reason"
npm run task:refresh
```
