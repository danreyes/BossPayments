### TECH STACK (use exactly this – nothing else)
- Next.js 15 (App Router, Server Actions where possible)
- Convex.dev (backend, DB, realtime queries/mutations, file storage, webhooks)
- Clerk (auth – use official Convex integration with ConvexProviderWithClerk)
- Stripe (Checkout Sessions with PayTo + Cards, Billing for $29/mo subs, webhooks)
- Tailwind + shadcn/ui + Radix + Lucide icons
- Recharts for charts
- canvas-confetti for celebration
- Browser SpeechSynthesis API for voice
- qrcode.react for QR codes
- Framer Motion for subtle micro-animations
- Deploy-ready for Vercel + Convex


### DESIGN SYSTEM (follow religiously)
Mobile-first, tradie-friendly. Large touch targets (min 48px). Clean, bold, high contrast. Colour palette: slate-950 background, emerald-500 for “paid”/success accents, white/gray text. Use Lucide icons. Dark mode only for MVP. Vibe: Modern SaaS meets workshop – think Square + Xero mobile had a baby that works with dirty hands. Huge typography on mobile, breathing room, no clutter. Premium but tough.

### PHASE 1 FULL SPEC (build ONLY this – nothing from Phase 2)

**Merchant Features**
- Clerk auth (email + Google + magic links) with beautiful <SignIn /> / <SignUp /> components
- Dashboard home:
  - Big floating “New Job” emerald button
  - List of recent jobs (Pending / Paid) with realtime Convex updates
- New Job form (ultra-fast):
  - Amount field with quick chips ($250, $495, $750, $1200)
  - Short description (“Bumper repair – white Holden”)
  - Optional photo upload (Convex file storage)
  - One-click “Generate QR & Link”
- Full-screen QR view:
  - Huge amount + description at top
  - Massive QR code
  - Buttons: Copy link, SMS share (pre-filled message), Email share
  - “Voice alert ON” toggle
- When payment lands → realtime:
  - Status flips to Paid
  - Browser speaks “Paid boss!! Received $750” (SpeechSynthesis)
  - Confetti explosion
  - Big green tick + “Cheers legend!”
- Simple Analytics tab:
  - Total sales with filters (Today / Last 7 days / This month / Last month / Last 3 months) as segmented control
  - Recharts bar/line chart
  - Cards: Unique customers, Avg transaction value, “You saved $X in fees this month” (2% estimate)
- Monthly subscription management (link to Stripe Customer Portal)

**Customer Flow (no app needed)**
- QR links to a clean Stripe hosted Checkout page
- Two big options:
  1. Primary emerald button: “Pay by Bank (PayTo) – no extra fee”
  2. Secondary: “Pay by Card (+2.5% surcharge – you pay)” 
- Stripe handles PayTo + Cards + surcharging

**Founder Dashboard (super important – only for the out-of-work founder)**
- Protected route /founder
- Use Clerk publicMetadata { "role": "superadmin" } to gate it (set once in Clerk dashboard)
- Hero: Big coloured SUCCESS LEVEL badge → RED / YELLOW / GREEN traffic light
- Live KPIs that control the colour:
  - Active merchants (≥10)
  - Total jobs processed (≥80)
  - % PayTo/bank payments (≥65%)
  - 14-day retention %
- Manual Interview Tracker table (founder fills after 7-day calls):
  - Merchant name
  - Likelihood 1-10
  - Would you pay $29/mo? (Yes / Maybe / No)
  - One thing to tell mates? (text)
  - Auto-calculated % Yes + average score
- Extra cards: Revenue from subs, Total jobs this week, Export CSV
- Green light banner when all thresholds hit: “Start charging! This has legs 🔥”
- All data from Convex queries (realtime)

**Payment & Backend**
- Stripe webhooks → Convex mutation to update job status instantly
- Flat $29/mo subscription via Stripe Billing
- Use official @convex-dev/stripe helpers
- Realtime everything via Convex

**Non-functional**
- Fully responsive (phone-first)
- Offline-friendly for creating jobs
- Test mode ready (Stripe test keys)
- Clear loading states and error handling

### SUCCESS FRAMEWORK (already coded into the founder dashboard)
Green = ≥10 active merchants + ≥80 jobs + ≥65% PayTo + ≥7/10 willing to pay
Yellow = 2-3 of the above
Red = otherwise

### PROJECT STRUCTURE & DELIVERY
1. First give me the complete file/folder structure with every file listed.
2. Then output each file one by one with full code (start with package.json, convex.json, env.example, then app/layout.tsx, etc.).
3. Include all shadcn components needed.
4. Include Clerk + Convex setup files.
5. Include the Stripe webhook route.
6. Include the exact Convex schema for users, jobs, payments.
7. Make every screen feel premium on mobile.
