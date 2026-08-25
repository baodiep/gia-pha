# T007 — RLS security policies

## Goal
Database không phụ thuộc UI để bảo vệ dữ liệu.

## Work
- Helper SQL functions kiểm tra ACTIVE/admin/branch membership.
- SELECT policy cho ACTIVE users theo visibility.
- Mutation policies phù hợp hoặc route privileged writes qua audited server RPC/service role với explicit PermissionService checks.
- Policy cho events BRANCH.
- Security tests bằng nhiều auth users.

## Acceptance
- PENDING không SELECT gia phả.
- Member không UPDATE sibling branch bằng direct Supabase call.
- Branch manager UPDATE descendant được theo thiết kế.
- Admin full access.
