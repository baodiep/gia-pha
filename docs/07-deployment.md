# 07 — Deployment Vercel + Supabase

## Environments

- Local/Development
- Vercel Preview + Supabase DEV
- Vercel Production + Supabase PROD

DEV không dùng database PROD.

## Variables

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY  # server only
AUTH_INTERNAL_EMAIL_DOMAIN
NEXT_PUBLIC_APP_NAME
```

## Pipeline tối thiểu

1. PR/push.
2. lint + typecheck + tests.
3. Vercel Preview.
4. Migration DEV.
5. Merge main.
6. Migration PROD có kiểm soát.
7. Vercel Production.

## Backup

- PostgreSQL backup theo gói Supabase.
- Backup Storage riêng.
- Định kỳ test restore.
