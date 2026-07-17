# RareComforts Monorepo Platform

Welcome to the **RareComforts** monorepo, a premium e-commerce site for luxury Egyptian cotton and satin bedding. This repository is split into two primary segments:
1. `frontend/`: A client-side Single Page Application (SPA) built with React 18, Vite, and Tailwind CSS. Employs **Lenis** smooth scrolling and **GSAP** timelines.
2. `backend/`: A REST API server powered by Node.js, Express, and Prisma ORM, connected to a **Neon.tech** Postgres server.

---

## Workspace Directory Structure

```
rarecomforts/
├── frontend/             # Client-side Vite app
│   ├── public/           # Static assets & redirects rule
│   └── src/
│       ├── components/   # Navbar, Footer, Hero, BlanketScroll, etc.
│       ├── pages/        # Landing, Listing, Detail, Auth, Admin
│       ├── lib/          # API fetch wrappers and scroll configs
│       └── main.tsx      # Entry mounting router & Lenis
├── backend/              # Server-side API app
│   ├── prisma/           # Database schemas and seeds
│   └── src/
│       ├── routes/       # Auth, products, cart, order endpoints
│       ├── middleware/   # JWT verification & admin checks
│       └── index.ts      # Express bootstrapper
└── package.json          # Root orchestration scripts
```

---

## Quick Start Setup

### 1. Install Dependencies
Run the following root orchestrator command to install packages inside both subfolders:
```bash
npm run install:all
```

### 2. Configure Environment Variables
Create a file named `.env` inside the `backend/` directory (`backend/.env`). Provide the connection strings and credentials:

```env
# Neon Postgres (pooled is for runtime, direct is for migrations)
DATABASE_URL="postgresql://user:password@neondb-pooler.neon.tech/rarecomforts?sslmode=require"
DIRECT_URL="postgresql://user:password@neondb-direct.neon.tech/rarecomforts?sslmode=require"

# Server Port & Secrets
PORT=5000
JWT_SECRET="your-private-session-secret-key"

# CORS configuration (matches local Vite client by default)
FRONTEND_ORIGIN="http://localhost:5173"

# Google Auth Client ID & Secret
GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-secret"

# Cloudinary signed image upload storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

Create a file named `.env` inside the `frontend/` directory (`frontend/.env` or `.env.local`):
```env
VITE_API_BASE_URL="http://localhost:5000"
VITE_GOOGLE_CLIENT_ID="xxxx.apps.googleusercontent.com"
```

### 3. Initialize the Database
Generate the Prisma Client, deploy the migrations, and run the seeding script to set up the default categories and products:
```bash
# Inside the backend/ directory
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```
*Note: The seed script creates a default administrator user: **admin@rarecomforts.com** with password **AdminPassword123**.*

### 4. Run Development Servers
Open two terminal windows or run concurrently:
```bash
# In Terminal 1: Run the Express API Server (Listening on port 5000)
npm run dev:backend

# In Terminal 2: Run the Vite React App (Listening on port 5173)
npm run dev:frontend
```

---

## Deployment Settings

### Frontend: Cloudflare Pages
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Deep Routing**: The `public/_redirects` file is pre-configured to rewrite `/* /index.html 200` to prevent 404 errors on manual page refreshes.
- Set `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in Cloudflare's environment variables dashboard.

### Backend: Render
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`
- Ensure all environment variables listed in `backend/.env` are added as secrets inside the Render service setup dashboard.
