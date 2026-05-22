# Atelier Home — Premium E-commerce

Next.js App Router storefront with Supabase, Razorpay checkout, and Delhivery logistics.

## Stack

- **Frontend:** Next.js 16, Tailwind CSS 4, Shadcn-style UI, Framer Motion, Zustand cart
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **Payments:** Razorpay (server action + webhook verification)
- **Shipping:** Delhivery (pincode rates + waybill after payment)

## Quick start

### 1. Environment

Copy `.env.example` to `.env.local` and fill in credentials.

**Important:** `NEXT_PUBLIC_SUPABASE_URL` must be your project URL (e.g. `https://xxxx.supabase.co`), **not** the REST path (`/rest/v1`).

### 2. Supabase schema

Run the migration in the Supabase SQL editor or via CLI:

```bash
# supabase link && supabase db push
# Or paste: supabase/migrations/20250522000000_initial_schema.sql
```

### 3. Razorpay webhook

In Razorpay Dashboard → Webhooks, point to:

```
https://your-domain.com/api/verify-payment
```

Enable `payment.captured` and set `RAZORPAY_WEBHOOK_SECRET`.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Cloudflare Pages (recommended for mock / preview)

Your build log shows `npx @cloudflare/next-on-pages@1`. That adapter is **deprecated**, bundles a **Worker** (CSP blocks `eval`, middleware runs on every request), and often causes **“This page couldn’t load”** when Supabase env vars are missing or wrong.

### Use static export instead

In **Cloudflare Pages → Settings → Builds & deployments**:

| Setting | Value |
|--------|--------|
| **Build command** | `npm run build:preview` |
| **Build output directory** | `out` |
| **Environment variables** | `NEXT_PUBLIC_MOCK_PREVIEW` = `true` (optional) |

Remove or replace `npx @cloudflare/next-on-pages@1` as the build command.

`build:preview`:

- Exports static HTML/JS to `out/`
- Uses mock catalog + client-side checkout
- **No** middleware, **no** Worker, **no** `eval` / CSP issues

### If you keep `next-on-pages` temporarily

1. Set Cloudflare env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (correct URL, no `/rest/v1`).
2. Or set `NEXT_PUBLIC_MOCK_PREVIEW=true` so middleware passes through without Supabase.
3. Middleware now supports `ANON_KEY` or `PUBLISHABLE_KEY` and skips when env is missing.

For production with Supabase + Razorpay, use [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) instead of next-on-pages.

## Project structure

```
supabase/migrations/     # SQL schema + seed categories/products
src/lib/
  supabase/              # Browser, server, and admin clients
  razorpay.ts            # Order creation + HMAC signature verification
  delhivery.ts           # Shipping rates + waybill manifestation
  catalog.ts             # Product/category queries
src/stores/cart-store.ts # Persisted Zustand cart + slide-out sheet
src/actions/             # Server actions (Razorpay order, shipping rates)
src/app/api/verify-payment/  # Razorpay webhook (post-payment → Delhivery)
```

## Catalog

| Category       | Subcategories                          |
|----------------|----------------------------------------|
| Beddings       | Sheets, Duvets, Comforters             |
| Bath Towels    | Hand, Face, Bath, Mats                 |
| Pillow Covers  | Standard, King, Euro                   |

Prices are stored in **paise** (₹1 = 100 paise) for Razorpay compatibility.

## Payment flow

1. Customer completes checkout → `createRazorpayOrderAction` inserts order in Supabase and creates Razorpay order.
2. Razorpay Checkout modal opens on the client.
3. On `payment.captured`, webhook verifies `x-razorpay-signature` (HMAC-SHA256).
4. Order marked `paid` → `fulfillPaidOrder` triggers Delhivery waybill and sets status `processing`.
