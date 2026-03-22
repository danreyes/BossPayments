import Link from "next/link";
import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { CheckCircle2, ShieldCheck } from "lucide-react";

import { internal, api } from "@/convex/_generated/api";
import { adminMutation } from "@/lib/convex-admin";
import { getConvexToken } from "@/lib/clerk";
import { DashboardBackLink } from "@/components/dashboard/back-link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBaseUrl, getStripe } from "@/lib/stripe";

async function ensureCustomer(clerkUserId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const token = await getConvexToken();
  let existing;
  try {
    existing = await fetchQuery(api.users.getCurrentUser, {}, { token });
    if (!existing) {
      await fetchMutation(api.users.ensureCurrentUser, {}, { token });
      existing = await fetchQuery(api.users.getCurrentUser, {}, { token });
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Not authenticated")) {
      throw new Error("Convex authentication failed. Please check that CLERK_JWT_ISSUER_DOMAIN is set correctly and re-run 'npx convex dev'.");
    }
    throw err;
  }

  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined,
    metadata: { clerkUserId }
  });

  await adminMutation(internal.users.setStripeCustomerId, {
    clerkId: clerkUserId,
    stripeCustomerId: customer.id
  });

  return customer.id;
}

export default async function BillingPage({
  searchParams
}: {
  searchParams?: Promise<{ onboarding?: string; required?: string; status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = (await searchParams) ?? {};

  const token = await getConvexToken();
  let user;
  try {
    user = await fetchQuery(api.users.getCurrentUser, {}, { token });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Not authenticated")) {
      user = null;
    } else {
      throw err;
    }
  }

  const hasActiveSubscription = user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";
  const isOnboarding = params.onboarding === "1";
  const isRequired = params.required === "1";
  const isPendingActivation = params.status === "active" && !hasActiveSubscription;

  async function startSubscription() {
    "use server";
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const customerId = await ensureCustomer(userId);
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: process.env.STRIPE_PRICE_ID_MONTHLY!, quantity: 1 }],
      success_url: `${getBaseUrl()}/dashboard/billing?status=active`,
      cancel_url: `${getBaseUrl()}/dashboard/billing?onboarding=1`
    });
    redirect(session.url!);
  }

  async function openPortal() {
    "use server";
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const customerId = await ensureCustomer(userId);
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getBaseUrl()}/dashboard/billing`,
      configuration: process.env.STRIPE_CUSTOMER_PORTAL_CONFIGURATION_ID
    });
    redirect(session.url);
  }

  return (
    <div className="space-y-4">
      <DashboardBackLink href={hasActiveSubscription ? "/dashboard" : "/"} label={hasActiveSubscription ? "Back to dashboard" : "Back to home"} />

      {isOnboarding || isRequired ? (
        <Card className="border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 via-card to-card">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Activate PaidBoss
              </div>
              <div className="mt-3 text-3xl font-black tracking-tight">
                {isRequired ? "Start your subscription to unlock the dashboard." : "Start your subscription before you jump in."}
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {isRequired
                  ? "Your account is ready, but dashboard access stays locked until Stripe marks your $29/month subscription active."
                  : "You are signed up and ready to go. Kick off the $29/month subscription now so your account is ready for live jobs, billing, and payment links."}
              </p>
            </div>
            <form action={startSubscription}>
              <Button size="lg" className="w-full sm:w-auto">Start $29/mo</Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {hasActiveSubscription && params.status === "active" ? (
        <Card className="border-emerald-400/20 bg-emerald-500/10">
          <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-300" />
              <div>
                <div className="text-2xl font-black text-emerald-100">Subscription active</div>
                <p className="mt-1 text-sm text-emerald-100/80">
                  You are good to go. Head back to the dashboard and start creating jobs.
                </p>
              </div>
            </div>
            <Button asChild size="lg" variant="outline">
              <Link href="/dashboard">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isPendingActivation ? (
        <Card className="border-white/10 bg-white/5">
          <CardContent className="pt-6">
            <div className="text-xl font-black">Finalising your activation...</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Stripe sent us back successfully. We are just waiting for the subscription webhook to confirm everything.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-black tracking-tight">Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasActiveSubscription && (
            <div className="flex items-center gap-2 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Subscription active</span>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {hasActiveSubscription
              ? "Manage your cards, invoices, and cancellations in Customer Portal."
              : <>PaidBoss is a flat <span className="font-semibold text-white">$29/month</span>. Start the subscription in Stripe Checkout, then manage cards, invoices, and cancellations in Customer Portal.</>}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {!hasActiveSubscription && (
              <form action={startSubscription}>
                <Button size="lg">Start $29/mo</Button>
              </form>
            )}
            <form action={openPortal}>
              <Button size="lg" variant={hasActiveSubscription ? "default" : "outline"}>Open Customer Portal</Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
