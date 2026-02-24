# Coffee Carriers — Environment Setup
> Date: 2026-02-24

## Accounts

| Service | URL | Status |
|---------|-----|--------|
| GitHub | [MoEm7/vibe_codebase](https://github.com/MoEm7/vibe_codebase) | ✅ |
| Supabase | gxninvvafebpgkpmjvqe.supabase.co | ✅ |
| Vercel | Connected to GitHub | ✅ |

## Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://gxninvvafebpgkpmjvqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_f_DrH79D6Ke_iEbF8xLhew_vXuCnraU
SUPABASE_SERVICE_ROLE_KEY=<REDACTED — never share or commit this key>
```

## Vercel Environment Variables

Add in Vercel → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL` → All environments
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → All environments
- `SUPABASE_SERVICE_ROLE_KEY` → Production + Preview only

## Database Setup

Run the SQL migration in Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Execute — creates all 12 tables, indexes, triggers, RLS policies, and seed data
