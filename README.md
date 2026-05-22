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

## Deploy mock UI to Cloudflare Pages

Do **not** use `npx @cloudflare/next-on-pages@1` — it is deprecated and does not support Next.js 16 reliably. Your Vercel build may succeed, then the adapter step fails or the site breaks at runtime.

For **visual / mock preview**, use a **static export**:

| Setting | Value |
|--------|--------|
| **Build command** | `npm run build:preview` |
| **Build output directory** | `out` |
| **Environment variable** | `NEXT_PUBLIC_MOCK_PREVIEW` = `true` (optional; the script sets it) |

`build:preview` exports static HTML/JS, uses mock catalog data, and runs checkout entirely in the browser.

When you need real Supabase/Razorpay later, migrate to [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) (Workers) instead of next-on-pages.

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
