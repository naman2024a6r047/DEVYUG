# Hostinger Deployment Guide — DVYUG
**Architecture:** Express.js (API) + Next.js (Storefront) — Unified single Node.js process on one port.

---

## How it Works

```
Browser → Hostinger → Node.js (Express on PORT)
                         ├── /api/*        → Express Router (Prisma + MySQL)
                         └── /* (all else) → Next.js App Router (React SSR/SSG)
```

---

## Step 1 — Build Locally (on your computer)

Because Hostinger shared hosting restricts compiler resources, **always compile on your computer** and upload the compiled files.

```bash
# From the project root (DEVYUG/)
npm run build:all
```

This produces:
- `frontend/.next/`  — Next.js compiled output
- `backend/dist/`    — Express TypeScript compiled to JS

> **If `tsc` fails**, fix the errors before uploading. Never upload with a broken build.

---

## Step 2 — Database Setup (Hostinger hPanel)

1. Log in to **hPanel** → **Databases** → **MySQL Databases**
2. Create a new database, e.g. `u878206810_devyug`
3. Create a MySQL user with a strong password
4. Note down: **Database Name**, **Username**, **Password**

---

## Step 3 — Files to Upload (hPanel File Manager or FTP)

Upload the following to your domain's root directory (`/public_html/`):

```
/public_html/
  ├── backend/
  │    ├── dist/           ← Compiled Express JS (REQUIRED)
  │    ├── prisma/         ← schema.prisma + seed.ts
  │    ├── package.json
  │    ├── package-lock.json
  │    └── .env            ← PRODUCTION env variables (see Step 4)
  └── frontend/
       ├── .next/          ← Compiled Next.js (REQUIRED)
       ├── public/         ← Static assets
       ├── package.json
       └── package-lock.json
```

> ⚠️ **Do NOT upload:**
> - `node_modules/` from either folder (will be installed on server)
> - `backend/src/` (source TypeScript — not needed in production)
> - `frontend/src/` (source files — not needed in production)
> - `.env.local` from frontend (not used in production; values baked in at build time)

---

## Step 4 — Production `.env` File

Inside `/public_html/backend/`, create (or update) the `.env` file with these **EXACT** values:

```env
# ── DATABASE ──────────────────────────────────────────────────────────
# Replace with your actual Hostinger MySQL credentials
# If password has special chars (@ $ # etc.), URL-encode them: @ → %40
DATABASE_URL="mysql://u878206810_devyug_user:YOUR_PASSWORD_HERE@localhost:3306/u878206810_devyug"

# ── SERVER ────────────────────────────────────────────────────────────
# Hostinger will set PORT automatically via the Node.js manager
# You can leave this as 5000 as a fallback
PORT=5000

# ── ENVIRONMENT (CRITICAL) ────────────────────────────────────────────
# This MUST be "production" on the server
# Without it, Next.js runs in slow development mode
NODE_ENV=production

# ── SECURITY ──────────────────────────────────────────────────────────
# Change this to a long random string in production!
JWT_SECRET="REPLACE_WITH_YOUR_OWN_LONG_RANDOM_SECRET_KEY_HERE"

# ── FRONTEND URL (for CORS) ───────────────────────────────────────────
# Set this to your domain (no trailing slash)
FRONTEND_URL=https://yourdomain.com
```

> 🔑 **Never share your `.env` file publicly or commit it to Git.**

---

## Step 5 — Hostinger Node.js Manager Setup

1. In **hPanel** → **Advanced** → **Node.js**
2. Configure the Node application:
   | Setting | Value |
   |---|---|
   | **Application root** | `/public_html/backend` |
   | **Application startup file** | `dist/index.js` |
   | **Node.js version** | **20.x** (or latest LTS) |
3. Click **Save**

---

## Step 6 — Install Dependencies & Push Database

Open the **SSH Terminal** (hPanel → Advanced → SSH Access) or use the built-in terminal in the Node.js manager:

```bash
# Navigate to backend directory
cd /public_html/backend

# 1. Install production dependencies (auto-generates Prisma Client via postinstall)
npm install --production

# 2. Push the Prisma schema to create all database tables
npx prisma db push

# 3. (Optional) Seed the database with initial products and admin user
npx ts-node prisma/seed.ts
# OR if ts-node is unavailable:
# node -e "require('./dist/seed')" 
# (only works if seed.ts was compiled — compile it separately if needed)
```

---

## Step 7 — Start the Application

In hPanel → Node.js Manager, click **Start App** (or **Restart** if already running).

---

## Step 8 — Verify the Deployment

After starting:

| URL | Expected Response |
|-----|-------------------|
| `https://yourdomain.com/` | DVYUG storefront loads |
| `https://yourdomain.com/api/health` | `{"status":"healthy","message":"DVYUG Vedic Wellness API is online"}` |
| `https://yourdomain.com/api/products` | JSON list of products |

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| White screen / 500 error | `NODE_ENV` not set to `production` | Update `.env` → Restart app |
| `Cannot find module 'next'` | `npm install` not run on server | Run `npm install --production` in `/public_html/backend/` |
| Database connection error | Wrong `DATABASE_URL` or MySQL not running | Check credentials in `.env`; verify DB exists in hPanel |
| API returns 401 | `JWT_SECRET` mismatch | Ensure same `JWT_SECRET` is set on server as used to sign tokens |
| Images not loading | Cloudinary or external CDN blocked | Already fixed — `next.config.ts` allows `https://**` patterns |
| `prisma db push` fails | Prisma not installed | Run `npm install --production` first (it runs `prisma generate` automatically) |

---

## Architecture Notes

- **No separate `server.js`** at the root is needed for this deployment. The app entry point is `backend/dist/index.js`.
- The Express server **serves the Next.js frontend directly** using Next.js's custom server API. No separate process or port is needed.
- **CORS is disabled for same-origin requests** (since frontend and API share the same port). It only activates for external tool access.
