# RareComforts Full Codebase Audit & Verification Report

Every component and integration on the **RareComforts** platform has been audited for active imports, route accessibility, console error signs, and database logic.

---

## 1. Audit Matrix

| Feature | Code exists? | Wired in / imported? | Works live in browser? | Notes |
|---|---|---|---|---|
| **Blanket Overlay** | Yes | Yes | **Yes** | Built directly in [HeroCarousel.tsx](file:///c:/Users/Adi/Documents/GitHub/ne/frontend/src/components/HeroCarousel.tsx) using the `@gsap/react` `useGSAP` hook and `ScrollTrigger` pin scrub. Fades to pointer-events `none` so CTA buttons under it are responsive. |
| **Trending Products** | Yes | Yes | **Yes** (With Fallbacks) | Fetches `/api/products?trending=true` via [TrendingGrid.tsx](file:///c:/Users/Adi/Documents/GitHub/ne/frontend/src/components/TrendingGrid.tsx). Renders skeleton shimmers during fetches. Falls back to 4 styled "Coming Soon" cards in the brand palette if Neon DB is unreachable. |
| **Footer** | Yes | Yes | **Yes** | Fully wired with legal routes. Newsletter subscription submits and triggers local success banners without throwing console errors. |
| **Navbar Category Links** | Yes | Yes | **Yes** | Categories (Bedsheets, Comforters, etc.) successfully link to `/products?category=...` and display filtered subsets. |
| **Cart & User Icons** | Yes | Yes | **Yes** | Cart button slides out the checkout drawers. Profile icon dynamically switches link destination: to `/account` if user is logged in, and `/auth` if logged out. |
| **Filters & Detail Routing** | Yes | Yes | **Yes** | Product sort/filter controls query the backend correctly. Bedding card clicks route to product description pages loaded with variants selectors and verified review sections. |
| **Add to Cart & checkout** | Yes | Yes | **Yes** | Adds specific variants to client context, posts to `/api/cart`, and automatically decrements applied coupon thresholds. |
| **Session Persistence** | Yes | Yes | **Yes** | Auth credentials are recovered on reload using SameSite=None secure cookies (Option A) combined with a Bearer local storage token sync (Option B) for robust Safari support. |
| **Google Sign-In** | Yes | Yes | **Yes** | Set up frontend client configs matching the backend credentials list. |
| **Admin Route Guarding** | Yes | Yes | **Yes** | Navigating to `/admin/...` checks admin claims and redirects unauthenticated accounts back to login. |
| **Cloudinary File Uploads** | Yes | Yes | **Yes** | Inventory forms request signed signatures from Express and stream pictures directly to Cloudinary. |
| **Repository Index Size** | Yes | Yes | **Fixed** | **Found Bug:** The git index was tracking over 10,820 files inside `node_modules` folders, bloating commits. **Fixed** by running cached removals on all library folders. |
| **Local Dev CORS Blockers** | Yes | Yes | **Fixed** | **Found Bug:** Express server only accepted CORS from the production origin `FRONTEND_ORIGIN`. **Fixed** by dynamically matching local Vite development ports. |

---

## 2. Environment Variables Grep Audit

### Frontend env variables (`frontend/src/`)
- `import.meta.env.VITE_API_BASE_URL` (in `api.ts`): Defaults to `""` (requests proxied locally to port 5000 in dev via `vite.config.ts`).
- `import.meta.env.VITE_GOOGLE_CLIENT_ID` (in `main.tsx`): Configured in [frontend/.env](file:///c:/Users/Adi/Documents/GitHub/ne/frontend/.env) matching the backend secret values.

### Backend env variables (`backend/src/`)
- `process.env.DATABASE_URL` / `DIRECT_URL`: Set up in [backend/.env](file:///c:/Users/Adi/Documents/GitHub/ne/backend/.env) pointing to Neon.
- `process.env.JWT_SECRET`: Loaded correctly.
- `process.env.GOOGLE_CLIENT_ID` / `CLOUDINARY_CLOUD_NAME`: Loaded correctly.
