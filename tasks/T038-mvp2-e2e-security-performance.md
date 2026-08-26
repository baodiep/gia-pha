# T038 — MVP2 E2E, security & performance

## Goal
Rà soát toàn bộ MVP2 trước release, ưu tiên security, permission, mobile UX 40+ và các journey quan trọng.

## Work
E2E tối thiểu:
1. Import gia phả Excel -> preview -> resolve warning -> import -> tree đúng.
2. Member claim “Đây là tôi” -> Admin approve -> profile map đúng.
3. Forgot password -> CAPTCHA -> Admin notification -> random 8 số -> forced password change.
4. Tra cứu quan hệ giữa hai person.
5. Lunar memorial -> calendar/dashboard -> notification.
6. Event -> RSVP -> Admin attendance list.
7. In-app notification -> browser push opt-in/test notification.
8. External family resource -> member open external link.
9. Contribution Admin CRUD/search/statistics -> Member read-only.
10. Contribution Excel import -> preview/map account/import.

Security regression:
- RLS/IDOR/permission.
- Password reset enumeration, rate limit, CAPTCHA validation, password secrecy.
- Upload/import parser validation và formula/file abuse phù hợp.
- External URL validation/XSS.
- Push subscription isolation.

Performance:
- Tree/search không regression.
- Contribution filters và dashboard query không N+1 đáng kể.
- Notification unread count không gây query dư thừa rõ ràng.

UX/mobile:
- Test tối thiểu viewport 360x800, 390x844, 768px, 1280px.
- Kiểm tra chữ, touch target, form, keyboard, overflow và hướng dẫn chức năng nâng cao theo `docs/mvp2/02-mobile-ux-40plus.md`.

## Acceptance
- Không còn critical/high bug đã biết.
- Critical journeys PASS.
- `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` PASS.
- Không task UI nào chỉ hoạt động tốt trên desktop.
