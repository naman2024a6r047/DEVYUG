# Hostinger Deployment Guide - DVYUG (Single Domain)

This guide explains how to deploy the entire DVYUG platform (Next.js storefront + Express API + MySQL database) under a **single domain** (e.g. `yourdomain.com`) without needing subdomains.

---

## 1. Local Build Phase (Your Computer)

First, build both projects locally to generate the production JavaScript assets:

1. Open your terminal in the project root folder.
2. Build the project:
   ```bash
   # Compiles backend TypeScript to JS
   npm run build:backend

   # Compiles Next.js frontend to standalone build
   npm run build:frontend
   ```

---

## 2. MySQL Database Setup (Hostinger hPanel)

1. Log into your **Hostinger hPanel**.
2. Go to **Databases** > **MySQL Databases**.
3. Create a new database and user:
   - **Database Name:** e.g., `u123456789_dvyug`
   - **MySQL Username:** e.g., `u123456789_dvyug_user`
   - **Password:** Create a strong password.
4. Save the generated credentials.

---

## 3. Uploading Code to Hostinger `/public_html`

Using hPanel File Manager or FTP, structure your files inside the main domain root `/public_html` exactly like this:

```
/public_html
 ├── backend/
 │    ├── dist/            (compiled JS folder)
 │    ├── prisma/          (Prisma schema folder)
 │    ├── package.json
 │    └── package-lock.json
 ├── frontend/
 │    ├── .next/           (upload contents of frontend/.next/standalone/frontend/.next/)
 │    ├── node_modules/    (upload contents of frontend/.next/standalone/frontend/node_modules/)
 │    ├── package.json     (upload contents of frontend/.next/standalone/frontend/package.json)
 │    └── server.js        (upload contents of frontend/.next/standalone/frontend/server.js)
 ├── launcher.js           (The single startup script)
 └── .env                  (Your database and app credentials)
```

### Detailed steps:
1. Upload the entire `backend/` directory from your computer (skip `backend/node_modules/` and `backend/src/`).
2. Create a folder named `frontend/` in `/public_html`. Upload all files **inside** `frontend/.next/standalone/frontend/` directly into this new `/public_html/frontend/` folder.
3. Upload `launcher.js` from the project root directly into `/public_html/launcher.js`.

---

## 4. Environment Variables Setup

Create a new file named `.env` in the root of `/public_html` containing the following credentials:

```env
# Database Credentials
DATABASE_URL="mysql://u123456789_dvyug_user:YOUR_PASSWORD@localhost:3306/u123456789_dvyug"

# API Token Secret
JWT_SECRET="YOUR_SECURE_RANDOM_SECRET"

# Hostinger Domain
FRONTEND_URL="https://yourdomain.com"
```

---

## 5. Hostinger Node.js Application Manager Setup

1. Go to hPanel > **Advanced** > **Node.js**.
2. Select your main domain: **`yourdomain.com`**.
3. Configure settings:
   - **App Directory:** `/public_html`
   - **Startup File:** **`launcher.js`**
   - **Node Version:** Choose **Node.js 20** (or latest).
4. Click **Install** / **Save**.
5. Once saved, open the terminal console in your hPanel Node.js dashboard (or connect via SSH) and run:
   ```bash
   # Install dependencies for the launcher, backend, and frontend
   npm install --production
   npm run postinstall --prefix backend

   # Push table migrations and seed the data
   npx prisma db push --schema=backend/prisma/schema.prisma
   npm run prisma:seed --prefix backend
   ```
6. Click **Start App** on the hPanel Node.js manager dashboard.

### 🌟 Verify:
Navigate to `https://yourdomain.com/` in your browser. The Next.js storefront will load, and any `/api/*` calls will automatically be proxied locally to the Express backend running in the background.
