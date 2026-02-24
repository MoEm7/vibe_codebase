# Coffee Carriers — Next.js Route Architecture

## App Router Pages

```
app/
├── layout.tsx                          → Root layout (Navbar, bg-pattern, fonts)
├── page.tsx                            → / (Smart home: guest landing / role-based dashboard)
├── about/
│   └── page.tsx                        → /about
├── how-it-works/
│   └── page.tsx                        → /how-it-works
├── blog/
│   └── page.tsx                        → /blog (public, published posts only)
├── explore/
│   └── page.tsx                        → /explore (guest = limited, auth = full)
├── login/
│   └── page.tsx                        → /login
├── register/
│   └── page.tsx                        → /register
│
├── maker/
│   └── [id]/
│       ├── page.tsx                    → /maker/[id] (protected: sippers only)
│       └── order/
│           └── page.tsx                → /maker/[id]/order (protected: sippers only)
│
├── dashboard/                          → Protected: sippers only
│   ├── page.tsx                        → /dashboard
│   └── orders/
│       └── page.tsx                    → /dashboard/orders
│
├── studio/                             → Protected: makers only
│   ├── page.tsx                        → /studio
│   ├── location/
│   │   └── page.tsx                    → /studio/location
│   ├── orders/
│   │   └── page.tsx                    → /studio/orders
│   ├── products/
│   │   ├── page.tsx                    → /studio/products
│   │   └── new/
│   │       └── page.tsx                → /studio/products/new
│   └── blog/
│       ├── page.tsx                    → /studio/blog
│       └── new/
│           └── page.tsx                → /studio/blog/new
│
└── admin/                              → Protected: admin role only
    ├── page.tsx                        → /admin
    ├── blog/
    │   └── page.tsx                    → /admin/blog
    └── users/
        └── page.tsx                    → /admin/users
```

---

## API Route Handlers

```
app/api/
├── auth/
│   └── register/
│       └── route.ts                    → POST /api/auth/register (server-side signup, bypasses RLS)
│
├── blog/
│   └── route.ts                        → GET /api/blog (published posts), POST /api/blog (makers: pending_review)
│
├── orders/
│   ├── route.ts                        → GET /api/orders (role-aware), POST /api/orders (sippers only)
│   └── [id]/
│       └── status/
│           └── route.ts                → PATCH /api/orders/[id]/status (makers only)
│
├── reviews/
│   └── route.ts                        → POST /api/reviews (sippers only, upsert)
│
└── admin/
    ├── blog/
    │   ├── route.ts                    → GET /api/admin/blog (pending posts, admin only)
    │   └── [id]/
    │       └── route.ts                → PATCH /api/admin/blog/[id] (approve/reject, admin only)
    └── users/
        ├── route.ts                    → GET /api/admin/users (all users, admin only)
        └── [id]/
            └── route.ts                → PATCH /api/admin/users/[id] (verify/ban, admin only)
```

---

## Middleware (proxy.ts)

File: `src/proxy.ts` (renamed from `middleware.ts` for Next.js 16 compatibility)

**Protections:**
- `/dashboard/*`, `/maker/*` → requires authenticated session (any role)
- `/studio/*` → requires authenticated session (any role, role enforcement in page)
- `/admin/*` → requires authenticated session **AND** `role = 'admin'` (DB check)
- `/login`, `/register` → redirects to `/` if already authenticated

**Auth method:** Supabase SSR cookie-based sessions (JWT via `@supabase/ssr`)

---

## Notes

- **Server Actions**: Not used — all mutations go through Route Handlers for explicit auth checks
- **Supabase clients**: 3 tiers — `createClient()` (anon/user), `createServiceClient()` (SSR service role), `createAdminClient()` (base Supabase admin, bypasses RLS fully)
- **Registration**: Server-side only via `/api/auth/register` — uses service role to bypass email confirmation and RLS
- **Dynamic segments**: `[id]` used in `/maker/[id]`, `/maker/[id]/order`, `/api/orders/[id]/status`, `/api/admin/blog/[id]`, `/api/admin/users/[id]`
