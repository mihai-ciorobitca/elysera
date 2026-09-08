# Elysera storefront

Standalone Next.js storefront for Elysera. The app deploys independently from PeptiKing and keeps the existing brand-specific layout, routes, media, and client-side presale selection.

## Local development

1. Copy `.env.example` to `.env.local` and supply the shared PeptiKing database URLs.
2. Run `npm install`.
3. Run `npm run dev` and open `http://localhost:3001`.

## Shared PeptiKing database

`GET /api/products` queries the existing PeptiKing `Products` table through Prisma. Only the three fixed Elysera product IDs are selected, and only active, non-staff products with a positive EUR price are returned. Database credentials stay server-side.

The expected IDs are:

- `elysera-renewal-serum-30ml`
- `elysera-balance-toner-100ml`
- `elysera-contour-eye-cream-15ml`

No separate database or schema migration is required.

## PeptiKing checkout handoff

The storefront keeps the selection in `localStorage` and sends it as the URL-encoded `selection` query parameter to `${NEXT_PUBLIC_PEPTIKING_URL}/elysera-checkout`. PeptiKing remains responsible for customer authentication, cart validation, stock checks, payments, orders, referrals, and fulfillment.

## Vercel

The repository is linked to the Vercel project `mihai-ciorobitca/elysera`. Configure these values for Development, Preview, and Production:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_PEPTIKING_URL`
- `NEXT_PUBLIC_SITE_URL`

`DATABASE_URL` and `DIRECT_URL` use the same Supabase/Postgres project as PeptiKing.

## Product status

At the time of separation, the shared database connection worked but returned no publicly sellable Elysera products. The records must be active, priced, stocked, and legally approved before checkout can be enabled.
