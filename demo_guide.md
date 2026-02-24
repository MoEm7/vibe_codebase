# Coffee Carriers — Demo Guide

## Live URL
**https://vibe-codebase.vercel.app/**

## Demo Credentials

No pre-seeded demo accounts — registration is instant (no email confirmation required).

| Role | How to get access |
|------|------------------|
| Guest | Just visit the site — no login needed |
| Sipper | Register at /register → "I Need Coffee" |
| Maker | Register at /register → "I Make Coffee" |
| Admin | Contact team (manually assigned in DB) |

---

## 30-Second Happy Path

### 🔍 Guest Flow
1. Visit **https://vibe-codebase.vercel.app/**
2. Click **"Guest Mode"** → sees the explore page with map placeholder
3. Map shows nearby makers (if any are registered and live)

### ☕ Sipper Flow
1. Click **"I Need Coffee"** → Register with name, email, password
2. Redirected to `/dashboard`
3. Go to **Explore** → browse makers on the map
4. Click a maker → see menu, rating, reviews
5. Click **"🛒 Pre-Order"** → pick items → Place Order
6. Go to **My Orders** → see live status updates
7. When order is **Ready** → rate the maker ⭐

### 🧑‍🍳 Maker Flow
1. Click **"I Make Coffee"** → Register
2. Redirected to **Maker Studio** (`/studio`)
3. Add products at `/studio/products/new`
4. Set location at `/studio/location` → drop pin → toggle **"I'm Live"**
5. When a sipper orders → see it at `/studio/orders` → advance status

---

## Limited Features / Known Notes
- **Maps**: Explore page currently shows a placeholder — interactive Leaflet map is Phase 2 (location data is stored and working)
- **Image uploads**: UI fields exist but Supabase Storage buckets need to be created in dashboard for uploads to save
- **Blog**: Maker posts go into approval queue — admin must approve before they appear on `/blog`
- **Payment**: Pay-at-pickup only (Phase 1) — online payments are Phase 5 roadmap
