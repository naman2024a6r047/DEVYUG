# Hostinger Custom Server Deployment Guide - DVYUG

This guide explains how to deploy the unified DVYUG platform (Express.js main server + Next.js App Router + Prisma ORM + MySQL) under a **single domain** and **single Node process** on **Hostinger Business Hosting**.

---

## 1. How the Architecture Works
*   **Primary Server:** The Express server acts as the master process listening on the port provided by Hostinger (`process.env.PORT`).
*   **Mounted Storefront:** Next.js is loaded programmatically using `next`'s custom server constructor (`app.prepare()` and `handle()`).
*   **Routing Hierarchy:**
    *   `/api/*` requests hit the Express Router controllers.
    *   All other paths `/*` are forwarded to the Next.js App Router handler.
*   **Prisma Client:** Optimized with a strict singleton pattern to prevent database connection exhaustion during restarts.

---

## 2. Local Compile Phase (Your Computer)
Because Hostinger shared instances restrict compiler resource usage, compile the TypeScript code locally:

1. Open your terminal in the workspace root directory and run:
   ```bash
   # Compiles Next.js storefront first, followed by Express TypeScript
   npm run build:all
   ```
2. This will generate:
   *   `frontend/.next/` (NextJS compiled production static assets).
   *   `backend/dist/` (Express compiled production JavaScript).

---

## 3. Database Sourcing (Hostinger hPanel)
1. Log into your **Hostinger hPanel**.
2. Go to **Databases** > **MySQL Databases**.
3. Create a new database and user:
   *   **Database Name:** e.g., `u123456789_dvyug`
   *   **MySQL Username:** e.g., `u123456789_dvyug_user`
   *   **Password:** Choose a strong password.
4. Note down the full database name, user, and password.

---

## 4. File Upload Directory Structure
Using hPanel File Manager or FTP, upload your compiled codebase to your domain root `/public_html`. Ensure it is structured exactly like this:

```
/public_html
 ├── backend/
 │    ├── dist/            (compiled JS folder)
 │    ├── prisma/          (Prisma schema & seed file)
 │    ├── package.json
 │    ├── package-lock.json
 │    └── .env             (Credentials file)
 └── frontend/
      ├── .next/           (Next.js compiled output folder)
      ├── public/          (Next.js static asset images)
      ├── package.json     
      └── package-lock.json
```

---

## 5. Environment Variables Setup (`.env`)
Create a new file named `.env` inside `/public_html/backend/` with the following variables:

```env
# Database connection string (runs locally on Hostinger node)
DATABASE_URL="mysql://u123456789_dvyug_user:YOUR_PASSWORD@localhost:3306/u123456789_dvyug"

# JWT token signature secret
JWT_SECRET="YOUR_SECURE_JWT_SECRET_PHRASE"

# Set node environment to production
NODE_ENV="production"
```

---

## 6. Hostinger Node.js Application Manager Setup

1. In hPanel, go to **Advanced** > **Node.js**.
2. Create/edit the Node application for your main domain:
   *   **App Directory:** `/public_html/backend` *(Points directly to the backend folder)*
   *   **Startup File:** **`dist/index.js`** *(Compiled Express server)*
   *   **Node Version:** Choose **Node.js 20** (or latest).
3. Click **Install** / **Save**.
4. Once saved, open the terminal console in your hPanel Node.js dashboard (or connect via SSH) and run:
   ```bash
   # 1. Install production dependencies and auto-generate Prisma Client
   npm install --production

   # 2. Push tables and models to Hostinger MySQL Database
   npx prisma db push

   # 3. Seed initial product catalog and admin credentials
   npm run prisma:seed
   ```
5. Click **Start App** on the hPanel Node.js manager page.

Your e-commerce storefront is now live on `https://yourdomain.com/` with API routing running natively on `https://yourdomain.com/api/` under a single process!
