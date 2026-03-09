import { auth, currentUser } from "@clerk/nextjs/server";
import { fetchMutation, fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { getBaseUrl, getStripe } from "@/lib/stripe";

async function ensureCustomer(clerkUserId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const existing = await fetchQuery(api.users.getByClerkId, { clerkId: clerkUserId });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined,
    metadata: { clerkUserId }
  });

  await fetchMutation(api.users.setStripeCustomerIdByClerkId, {
    clerkId: clerkUserId,
    stripeCustomerId: customer.id
  });

  return customer.id;
}

export default async function BillingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

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
      cancel_url: `${getBaseUrl()}/dashboard/billing`
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
    <Card>
      <CardHeader>
        <CardTitle className="text-4xl font-black tracking-tight">Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">PaidBoss is a flat <span className="font-semibold text-white">$29/month</span>. Start the subscription in Stripe Checkout, then manage cards, invoices, and cancellations in Customer Portal.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <form action={startSubscription}><Button size="lg">Start $29/mo</Button></form>
          <form action={openPortal}><Button size="lg" variant="outline">Open Customer Portal</Button></form>
        </div>
      </CardContent>
    </Card>
  );
}