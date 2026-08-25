# 02 — Kiến trúc

```text
Browser
  -> Vercel CDN/HTTPS
  -> Next.js App Router
       -> Server Components / Route Handlers / Server Actions
       -> PermissionService
  -> Supabase
       -> Auth
       -> PostgreSQL + RLS
       -> Storage
```

## Nguyên tắc

- Monolith modular cho MVP.
- Database quan hệ PostgreSQL.
- Cây hiển thị bằng React Flow; layout ELK.
- Recursive CTE hoặc database function để truy vấn descendants.
- Security nhiều lớp: UI + server permission + RLS/policies.
