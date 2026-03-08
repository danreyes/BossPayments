# AGENTS.md

## Project

PaidBoss is a mobile-first SaaS MVP for tradies to create jobs quickly, generate QR payment links, and receive live payment confirmation.

## Primary stack

- Next.js 15 App Router
- TypeScript
- Convex
- Clerk
- Stripe
- Tailwind CSS
- shadcn/ui + Radix
- Recharts
- Framer Motion
- qrcode.react
- canvas-confetti

## Product scope

Focus on the current MVP only:

- merchant auth
- dashboard home
- new job creation
- QR/link sharing
- live payment updates
- analytics
- billing/subscriptions
- founder dashboard

Do not add Phase 2 ideas unless explicitly requested.

## Design rules

- Mobile-first always
- Dark mode only for MVP
- Large touch targets, minimum 48px
- High contrast, bold, tradie-friendly UI
- Prefer slate/emerald/white palette already in the repo
- Keep screens spacious and uncluttered

## Code rules

- Prefer App Router patterns
- Prefer server components by default
- Use client components only where interactivity requires them
- Use Server Actions where they fit naturally
- Keep code strongly typed
- Reuse existing UI primitives in `components/ui`
- Keep utility logic in `lib/`
- Keep Convex data logic in `convex/`
- Avoid introducing new libraries unless clearly necessary

## Auth and permissions

- Clerk is the source of truth for auth
- Convex uses Clerk JWT integration
- Founder route is gated by `publicMetadata.role === "superadmin"`
- Do not weaken auth checks for convenience

## Payments

- Stripe Checkout powers job payments
- Stripe Billing powers the `$29/month` subscription
- Stripe webhooks update Convex state
- Preserve idempotent-friendly webhook behavior where possible
- Be careful with payment method assumptions, especially `payto`

## Convex

- Do not edit `convex/_generated/*` manually
- Run `npx convex dev` after changing Convex functions or schema
- Keep schema updates deliberate and backwards-aware
- Prefer realtime queries/mutations over ad hoc API routes when possible

## Environment variables

Expected local env values include:

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID`
- `NEXT_PUBLIC_APP_URL`

Never commit real secrets.

## Workflow

Before major changes:

1. Read the existing implementation in the touched area.
2. Prefer extending existing patterns over inventing new ones.
3. Keep edits small and coherent.

After changes when tooling is available:

1. Run `npx convex dev` if Convex files changed.
2. Run `npx tsc --noEmit`.
3. Run any relevant app checks before calling work complete.

## Current repo expectations

- `.env.local` must stay uncommitted
- `.gitignore` and `.gitattributes` should be respected
- README should stay accurate as setup changes

## Good defaults for future agents

- Fix root causes, not just symptoms
- Preserve the existing visual style
- Keep merchant workflows fast and low-friction
- Treat payment, auth, and webhook code as high-risk areas
- If unsure about a Stripe or Clerk detail, verify against official docs before changing behavior