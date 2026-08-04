# Elite Gaming Hub — Free Fire Top-Up & Tournament Platform

A premium, production-ready gaming platform for Free Fire diamond top-ups and competitive tournaments. Built with Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma, and **Neon PostgreSQL**. Deployable on Netlify or Vercel. EasyPaisa payments supported out-of-the-box.

---

## ⚡ Quick Deploy on Netlify (5 minutes)

### 1. Create a Neon PostgreSQL database (free)
1. Go to https://neon.tech and sign up.
2. Create a new project — copy the **connection string** (looks like `postgres://neondb_owner:npg_xxx@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`).

### 2. Push this repo to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Elite Gaming Hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/elite-gaming-hub.git
git push -u origin main
```

### 3. Connect to Netlify
1. Go to https://app.netlify.com → **Add new site** → **Import an existing project**.
2. Connect your GitHub and select the `elite-gaming-hub` repo.
3. Netlify will auto-detect Next.js — keep defaults.

### 4. Set environment variables (CRITICAL — fixes signup/login errors)
In Netlify → **Site settings** → **Environment variables**, add:

| Key | Value | Notes |
|-----|-------|-------|
| `DATABASE_PROVIDER` | `postgresql` | **Must be `postgresql`** (not `sqlite`) |
| `DATABASE_URL` | `postgres://...neon.tech/neondb?sslmode=require` | Your Neon connection string |
| `JWT_SECRET` | (random 32+ char string) | Generate with `openssl rand -base64 48` |
| `NEXT_PUBLIC_APP_NAME` | `Elite Gaming Hub` | (optional) |

**This is the #1 fix for the signup/login errors on Netlify.** The original error happened because the project was using a local SQLite database file, which is **read-only** in Netlify's serverless functions. Switching to Neon PostgreSQL fixes it permanently.

### 5. Trigger a deploy
Push any commit (or click **Trigger deploy** in Netlify). The build will:
1. Swap Prisma schema to `postgresql` (via `scripts/swap-prisma-provider.sh`)
2. Install dependencies
3. Generate Prisma client for PostgreSQL
4. Push schema to Neon (creates all tables)
5. Build Next.js

### 6. Seed the database (one-time, after first deploy)
Run locally with production env vars to create the admin user:
```bash
DATABASE_PROVIDER=postgresql DATABASE_URL="postgres://...neon.tech/neondb?sslmode=require" bunx tsx prisma/seed.ts
```

This creates:
- **Admin login:** `admin@elitegaming.com` / `Admin@12345`
- **Demo user:** `user@elitegaming.com` / `User@12345`
- 6 diamond packages (PKR pricing)
- 3 tournaments (Daily/Weekly/Monthly)
- EasyPaisa settings (`0312-4376721`)
- 6 reviews, 2 demo coupons

---

## 💳 EasyPaisa Payment System

This platform uses a manual EasyPaisa payment flow with admin approval:

### Default EasyPaisa Number: `0312-4376721`

You can change this anytime in **Admin → Settings → EasyPaisa Payment Settings**.

### Payment Flow (Diamond Package Purchase)
1. User picks a diamond package from the Store.
2. On checkout, the EasyPaisa number is shown with payment instructions.
3. User sends payment via EasyPaisa app or `*786#`.
4. User enters the Transaction ID and uploads a payment screenshot.
5. Order status becomes **PENDING**.
6. Admin gets notified (visible in **Admin → Payments**).
7. Admin views screenshot + Transaction ID, then Approves or Rejects.
8. After approval:
   - Order status becomes **COMPLETED**.
   - User is notified.
   - Diamonds can be delivered manually.

### Payment Flow (Tournament Registration)
For paid tournaments (entry fee > 0):
1. User clicks "Register" on tournament detail page.
2. Registration dialog shows EasyPaisa number + payment form.
3. User submits Transaction ID + screenshot.
4. Registration status becomes **PENDING_APPROVAL** (registered count NOT incremented yet).
5. Admin reviews in **Admin → Payments**.
6. After approval:
   - Registration status becomes **APPROVED`.
   - Tournament `registeredCount` is incremented.
   - User is notified they're officially registered.

### Admin Payments Management
Navigate to **Admin → Payments** to:
- View all payments with filters (Pending / Approved / Rejected, Diamond Packages / Tournaments)
- Search by Transaction ID, user email, or name
- View payment screenshot (full size, downloadable)
- View Transaction ID
- **Approve** payment (user gets notified)
- **Reject** payment with reason (user gets notified)
- **Delete** payment record

---

## 🛠️ Admin Panel Features

### Diamond Packages (Admin → Products)
- Create / Edit / Delete packages
- Edit: name, description, diamonds, **bonus diamonds**, price (PKR), original price, image, sort order
- Toggle active/inactive (instantly hides from store)
- Changes appear instantly on user side

### Tournaments (Admin → Tournaments)
- Create / Edit / Delete tournaments
- Edit: title, type, banner, description, start time, **entry fee (PKR)**, **prize pool (PKR)**, **total slots**, **status**
- Publish Room ID & Password (instantly visible to registered users)
- All changes apply without code changes

### EasyPaisa Settings (Admin → Settings → EasyPaisa)
- EasyPaisa Number (used everywhere on the site)
- Account Name
- Payment Instructions (multi-line, shown on checkout & registration)
- Changes apply instantly site-wide

### Other Admin Sections
- **Dashboard**: stats, 7-day orders chart, revenue (PKR)
- **Users**: list, activate/deactivate, change role, delete
- **Orders**: list, change status, view details
- **Results**: announce winners (notifies users with prize amount in PKR)
- **Notifications**: send to single user or broadcast to all
- **Coupons**: create/edit/delete, PERCENTAGE or FIXED discount (PKR)

---

## 🏗️ Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Database | Prisma ORM + **Neon PostgreSQL** (production) / SQLite (sandbox) |
| Auth | bcryptjs + JWT (httpOnly cookies, 7-day sessions) |
| Validation | Zod |
| Charts | Recharts |
| State | Zustand + TanStack Query |
| Notifications | Sonner toasts |
| Payments | EasyPaisa (manual + admin approval) + provider-agnostic architecture |

---

## 🔐 Security Features

- bcrypt password hashing (10 rounds)
- JWT session tokens (httpOnly, secure, sameSite=lax)
- Server-side session validation on every request
- Rate limiting: 10/min auth, 120/min API, 5/min contact form
- Zod input validation on every API
- Admin role enforcement on `/api/admin/*` routes
- CSRF protection on mutations (double-submit cookie)
- Screenshot upload size & type validation (5 MB max, JPEG/PNG/WebP only)

---

## 📁 Project Structure

```
.
├── prisma/
│   ├── schema.prisma        # SQLite (local sandbox)
│   ├── schema.prod.prisma   # PostgreSQL (Neon production)
│   └── seed.ts              # Seeds admin, products, tournaments, settings
├── scripts/
│   └── swap-prisma-provider.sh  # Auto-swaps schema based on DATABASE_PROVIDER
├── src/
│   ├── app/
│   │   ├── api/             # 40+ API routes (auth, payments, admin, etc.)
│   │   ├── layout.tsx
│   │   ├── page.tsx         # SPA router (all views)
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/          # Navbar, Footer, MobileNav
│   │   ├── sections/        # Landing sections (Hero, FAQ, Reviews, etc.)
│   │   ├── shared/          # GoldButton, StatusBadge, TournamentCard, etc.
│   │   ├── ui/              # shadcn/ui components
│   │   └── views/           # 23 views (Landing, Auth, Dashboard, Admin, etc.)
│   ├── lib/                 # auth, db, validators, constants, payment/, etc.
│   ├── store/               # Zustand stores (auth, navigation, cart)
│   └── hooks/               # use-auth, use-toast, use-mobile
├── netlify.toml             # Netlify build config
├── .env.example             # All required env vars documented
└── package.json
```

---

## 📱 Capacitor (Android App)

This is a pure web app with no native dependencies, ready to wrap with Capacitor:

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init EliteGamingHub com.elitegaming.app --web-dir=.next/standalone
npx cap add android
npx cap sync
npx cap open android  # opens Android Studio
```

---

## 🎮 Demo Logins (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@elitegaming.com` | `Admin@12345` |
| User | `user@elitegaming.com` | `User@12345` |

---

## 🧪 Testing Checklist

- [x] Landing page renders all sections
- [x] Signup creates account + session
- [x] Login authenticates + creates session
- [x] Store shows 6 products with PKR prices
- [x] Checkout shows EasyPaisa number + payment form
- [x] Payment submission (Transaction ID + Screenshot) creates Payment row
- [x] Order confirmation shows pending review status
- [x] Tournament detail shows "Register — Rs. XXX" for paid tournaments
- [x] Tournament registration requires payment proof for paid tournaments
- [x] Admin Payments page lists all payments with filters
- [x] Admin can approve payment → user notified, order completed
- [x] Admin can reject payment with reason → user notified
- [x] Admin can delete payment record
- [x] Admin Settings shows EasyPaisa section (editable)
- [x] Footer shows EasyPaisa number
- [x] Build passes with zero TypeScript errors
- [x] Lint passes with zero errors

---

## 🆘 Troubleshooting Netlify Deploy

### "Signup / Login errors" on Netlify
**Cause**: DATABASE_URL is pointing to a local SQLite file (read-only on serverless).
**Fix**: Set `DATABASE_PROVIDER=postgresql` and `DATABASE_URL=postgres://...neon.tech/...` in Netlify env vars, then redeploy.

### Build fails with "Prisma provider mismatch"
**Cause**: `prisma/schema.prisma` still has `provider = "sqlite"`.
**Fix**: The `scripts/swap-prisma-provider.sh` script auto-swaps this when `DATABASE_PROVIDER=postgresql`. Make sure the env var is set BEFORE the build runs (Netlify UI → Site settings → Environment variables).

### "Database connection failed" after deploy
**Cause**: Neon connection string is wrong, or Neon project is suspended (free tier sleeps).
**Fix**: Verify the connection string in Neon dashboard. Wake the project by logging into Neon.

### Prisma client not generated
**Cause**: `bun run db:generate` didn't run.
**Fix**: The `netlify.toml` build command includes `bun run db:generate` — verify it's not removed.

---

## 📄 License

MIT — Free to use, modify, and distribute.
