# PaidBoss

PaidBoss is a mobile-first SaaS MVP for tradies to create jobs fast, generate a QR payment link, and get live confirmation when a customer pays.

## Stack

- Next.js 15 App Router
- Convex
- Clerk
- Stripe
- Tailwind CSS
- shadcn/ui + Radix
- Recharts
- Framer Motion
- qrcode.react
- canvas-confetti

## Current status

This repo contains the MVP scaffold and core integration wiring for:

- Clerk auth screens
- Convex schema, queries, and mutations
- merchant dashboard
- new job flow
- QR share flow
- founder dashboard
- Stripe checkout webhook flow
- subscription billing entry points

TypeScript currently passes with:

```bash
npx tsc --noEmit
```

## Setup

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID`
- `NEXT_PUBLIC_APP_URL`

Install dependencies:

```bash
npm install
```

Start Convex dev sync:

```bash
npx convex dev
```

Start Next.js:

```bash
npm run dev
```

## Clerk setup

Create a Clerk JWT template named `convex`.

Recommended issuer value:

```text
https://inspired-unicorn-19.clerk.accounts.dev
```

Set this in Convex and locally as:

```env
CLERK_JWT_ISSUER_DOMAIN=https://inspired-unicorn-19.clerk.accounts.dev
```

## Convex setup

Current dev deployment URL:

```text
https://zany-axolotl-207.convex.cloud
```

Run `npx convex dev` in this repo to keep generated types and deployment in sync.

## Stripe notes

This project expects:

- one-time Checkout Sessions for job payments
- a flat `$29/month` subscription price for merchants
- Stripe webhooks routed to `app/api/stripe/webhook/route.ts`

You will need to configure your Stripe product, recurring price, webhook secret, and customer portal config.

## Founder access

The `/founder` route is gated by Clerk `publicMetadata.role === "superadmin"`.

Set that on your founder account in Clerk before testing the founder dashboard.

## Useful commands

```bash
npm install
npm run dev
npx convex dev
npx tsc --noEmit
```

## Repo structure

```text
app/
components/
convex/
lib/
```

## Notes

This is a strong MVP base, but before production you should still do a final hardening pass around:

- Stripe live-mode verification
- Clerk production auth config
- webhook replay/idempotency
- offline queue behavior
- end-to-end payment testing