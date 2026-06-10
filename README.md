# DVYUG - Divine Vedic Essentials

DVYUG (Divine Essentials for Vedic Yield and Universal Goodness) is a modern, premium, responsive full-stack e-commerce web application promoting healthy, sustainable, and spiritually aligned living through authentic organic, Ayurvedic, herbal, and Vedic products.

---

## Tech Stack Overview

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, TailwindCSS v4.0, Framer Motion, Lucide Icons.
- **Backend:** Node.js, Express.js, TypeScript.
- **Database ORM:** Prisma Client connecting to MySQL (optimized for Hostinger).
- **Authentication:** Credentials & OTP JWT-based authentication.
- **Payments:** Razorpay simulated checkout.

---

## Folder Structure

```
DEVYUG/
├── backend/                  # Express.js REST API
│   ├── prisma/               # Schema configuration and seeding
│   ├── src/                  # Routes, controllers, and middlewares
│   └── package.json
├── frontend/                 # Next.js 15 App
│   ├── src/app/              # Next.js pages
│   ├── src/components/       # UI Cards, Navbar, Footer, Chatbot
│   ├── src/context/          # Auth and Cart providers
│   └── package.json
├── HOSTINGER_DEPLOYMENT.md   # Step-by-step production hPanel guide
├── package.json              # Monorepo task orchestrator
└── README.md
```

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- MySQL Server running locally (or setup an external DB string)

### 1. Install Dependencies
Run the helper script from the root folder to automatically install dependencies for the root, frontend, and backend packages:
```bash
npm run install:all
```

### 2. Configure Database & Environment
1. Create a MySQL database named `dvyug_db` on your local MySQL server.
2. In the `/backend/.env` file, adjust your database connection credentials:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/dvyug_db"
   ```
3. Set up and seed the database using Prisma:
   ```bash
   # Generate Prisma client
   npm run prisma:generate --prefix backend
   
   # Deploy tables schema
   npm run prisma:migrate --prefix backend
   
   # Populate catalog seed (Admin user, standard products & blogs)
   npm run prisma:seed --prefix backend
   ```

### 3. Start Development Servers
Run the following command in the root folder to launch both the Express backend (`http://localhost:5000`) and the Next.js frontend (`http://localhost:3000`) concurrently:
```bash
npm run dev
```

---

## Advanced Systems Implemented

### 1. AI Product Recommendation Quiz
Located on the **Shop** page. Allows users to submit their Age, Lifestyle, Goal, and concerns. The backend matches these parameters with product ingredients, descriptions, and Ayurvedic Properties (Vata, Pitta, Kapha) returning custom items with written Vedic rationale.

### 2. AI Wellness Assistant Chatbot
A floating chat drawer active on all pages. Programmed with Ayurvedic keywords, product queries, FAQ answers, and simulated order tracking code lookup.

### 3. Custom Gift Hamper Builder
Allows customers to select box sizes (Small, Medium, Large) and pick corresponding quantities of organic teas, soaps, ghee, or incenses to fill them. Automatically applies dynamic discounts (up to 15%) and packages the bundle for direct cart insertion.

### 4. Admin Inventory CRUD & Analytics
Logging in as `admin@dvyug.com` (password: `admin123`) activates the Admin Portal dashboard. Admin can:
- CRUD catalog products.
- Alter statuses of orders in the database.
- Inspect aggregate revenue timelines using CSS charts.
- Export customer files.

---

## Production Deployment
Please review the [HOSTINGER_DEPLOYMENT.md](file:///c:/Users/lenovo/OneDrive/Attachments/OneDrive/Desktop/Full%20stack%20projects/DEVYUG/HOSTINGER_DEPLOYMENT.md) for hPanel subdomain configurations, standalone Next.js builds, and database setup.
