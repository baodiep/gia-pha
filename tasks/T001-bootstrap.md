# T001 — Bootstrap project & quality gates

## Goal
Có Next.js project chạy local, lint/typecheck/test commands rõ ràng và cấu trúc module theo repository.

## Work
- Cài dependencies.
- Xác nhận Next.js dev server chạy.
- Bổ sung ESLint config nếu cần theo Next 16.
- Thêm test runner phù hợp (Vitest khuyến nghị) và 1 smoke test.
- Xác nhận `.env.example` đủ biến.
- Không implement business feature ở task này.

## Acceptance
- `npm run build` pass.
- `npm run typecheck` pass.
- `npm run lint` pass.
- Test smoke pass.
- README setup command đúng.

## Next
Sau DONE, task engine mở T002.
