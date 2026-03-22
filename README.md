# PaidBoss

PaidBoss is a mobile-first SaaS MVP for tradies to create jobs fast, generate a QR payment link, and get live confirmation when a customer pays.

## Stack

- Next.js 16 App Router (Turbopack)
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

Live staging environment: `https://dev.getpaidboss.com`

Core features:

- Clerk auth (sign-in / sign-up)
- Convex schema, queries, and mutations
- Merchant dashboard with job list
- New job creation flow
- QR share flow with voice alerts ("Paid boss!!")
- Analytics dashboard with sales trends
- Founder dashboard (superadmin only)
- Stripe subscription billing ($29/month)
- Stripe checkout webhook flow for job payments
- Customer portal for subscription management
- Error boundaries for crash recovery
- Rate limiting on payment and webhook endpoints
- Desktop + mobile responsive navigation

## Setup

Create a local env file:

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `CONVEX_DEPLOY_KEY`
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

### Local webhook testing

Install the Stripe CLI and forward webhooks locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Update `STRIPE_WEBHOOK_SECRET` in `.env.local` with the signing secret from the CLI output.

## Clerk setup

1. Create a Clerk JWT template named `convex`
2. Enable the Convex integration in Clerk (Configure > Developers > Integrations)
3. Set the issuer domain in `.env.local` and restart `npx convex dev`:

```env
CLERK_JWT_ISSUER_DOMAIN=https://organic-pegasus-84.clerk.accounts.dev
```

## Convex setup

Current dev deployment: `zany-axolotl-207`

```text
https://zany-axolotl-207.convex.cloud
```

Run `npx convex dev` to keep generated types and deployment in sync.

To deploy functions to the cloud:

```bash
npx convex deploy
```

## Stripe notes

This project expects:

- One-time Checkout Sessions for job payments
- A flat `$29/month` subscription price for merchants
- Stripe webhooks routed to `/api/stripe/webhook`
- Customer Portal configured with cancellation and payment method updates

Webhook events to listen for:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`

## Deployment

- **Hosting:** Vercel (deploys from `dev` branch only)
- **Domain:** `dev.getpaidboss.com` (staging)
- **Convex:** Deploy functions separately with `npx convex deploy`
- **Search engines:** Blocked via `robots.txt` and `noindex` meta tag on staging

## Founder access

The `/founder` route is gated by Clerk `publicMetadata.role === "superadmin"`.

Set that on your founder account in Clerk (Users > your user > Metadata > Public):

```json
{
  "role": "superadmin"
}
```

The Founder nav link is hidden for non-superadmin users.

## Useful commands

```bash
npm install
npm run dev
npx convex dev
npx convex deploy
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Repo structure

```text
app/                  # Next.js pages and API routes
components/           # React components (app-shell, QR view, etc.)
convex/               # Convex schema, queries, mutations
lib/                  # Utilities (Stripe, Clerk, rate limiting, admin client)
public/               # Static assets (robots.txt)
```

## Notes

Before going to production:

- Switch to Clerk production instance with live keys
- Switch to Stripe live-mode keys
- Configure production webhook endpoint
- Remove `robots.txt` disallow and `noindex` meta tag
- Set `NEXT_PUBLIC_APP_URL` to production domain
- Review webhook replay/idempotency
- End-to-end payment testing with real bank accounts
