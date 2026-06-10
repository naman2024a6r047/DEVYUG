# Hostinger Deployment Guide - DVYUG

This guide explains how to deploy the DVYUG full-stack application (Next.js 15 frontend + Express.js backend + MySQL Database) on **Hostinger Business Hosting** (hPanel).

---

## 1. MySQL Database Sourcing on Hostinger

Hostinger Business Hosting provides free managed MySQL databases. We will use them to back Prisma.

1. Log into your **Hostinger hPanel**.
2. Navigate to **Databases** > **MySQL Databases**.
3. Create a new database and database user:
   - **Database Name:** e.g., `u123456789_dvyug`
   - **MySQL Username:** e.g., `u123456789_dvyug_user`
   - **Password:** Choose a strong password.
4. Once created, note the connection details. Usually, Hostinger's database host is `localhost` (if your Node.js application runs on the same server) or an external IP.
5. In your `/backend/.env` file, specify:
   ```env
   DATABASE_URL="mysql://u123456789_dvyug_user:your_password@localhost:3306/u123456789_dvyug"
   ```

---

## 2. Deploying Express.js API on Subdomain

Since Hostinger runs Node.js applications by binding them to ports, running both the Next.js and Express servers on the same domain requires assigning one to a subdomain (e.g. `api.yourdomain.com` for Express).

1. In hPanel, go to **Domains** > **Subdomains** and create `api.yourdomain.com`.
2. Navigate to **Advanced** > **Node.js** app manager on hPanel.
3. Create a new Node.js application:
   - **Domain/Subdomain:** `api.yourdomain.com`
   - **App Directory:** `/domains/api.yourdomain.com/public_html`
   - **App Version:** Choose **Node.js 20 or 22**.
   - **Application Startup File:** Set to `dist/index.js` (compiled from `src/index.ts`).
4. Upload the `/backend` codebase to `/domains/api.yourdomain.com/public_html` using the hPanel File Manager or FTP.
5. In the backend directory, run:
   ```bash
   npm install --production
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   npm run build
   ```
6. Click **Start App** in the Node.js hPanel dashboard. Your backend will now be live on `https://api.yourdomain.com/api/health`.

---

## 3. Deploying Next.js 15 Frontend on Main Domain

Next.js 15 can be deployed in **Standalone mode**, which outputs a highly optimized Node.js server that runs efficiently on Hostinger.

### Step 1: Configure Standalone Output
In `/frontend/next.config.ts`, add the `output` parameter:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Enables standalone production packaging
};

export default nextConfig;
```

### Step 2: Build locally and Upload
1. Set the production environment variables in `/frontend/.env.production`:
   ```env
   NEXT_PUBLIC_API_URL="https://api.yourdomain.com/api"
   ```
2. Run `npm run build` in the `/frontend` directory. Next.js creates:
   - A standalone folder under `/.next/standalone`.
   - A static files folder under `/.next/static`.
3. Compress and upload:
   - Copy the contents of `/.next/standalone` (which contains a minimal Node server `server.js`) to your Hostinger main domain root: `/public_html`.
   - Copy the `public` folder and the `/.next/static` folder to `/public_html/.next/static` so the server can resolve styles and images.

### Step 3: Run on Hostinger App Manager
1. In hPanel **Node.js Manager**, create a Node.js application for your main domain:
   - **App Directory:** `/public_html`
   - **Startup File:** `server.js`
2. Click **Start App**. Next.js will boot up and bind to your main domain!

---

## 4. Verification Checklists

Ensure the environment variables are active on both applications:
- **Backend Environment Variables:**
  - `PORT` (Provided automatically by Hostinger)
  - `DATABASE_URL` (Hostinger MySQL connection string)
  - `JWT_SECRET` (A strong custom string)
  - `FRONTEND_URL` (`https://yourdomain.com`)
- **Frontend Environment Variables:**
  - `NEXT_PUBLIC_API_URL` (`https://api.yourdomain.com/api`)
