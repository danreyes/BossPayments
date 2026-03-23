import { v } from "convex/values";

import { internalMutation } from "./_generated/server";

export const recordCheckoutCompleted = internalMutation({
  args: {
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    jobId: v.id("jobs"),
    merchantId: v.string(),
    paymentMethod: v.string(),
    amountCents: v.number()
  },
  handler: async (ctx, args) => {
    const existingPayment = await ctx.db
      .query("payments")
      .withIndex("by_stripe_checkout_session_id", (q) => q.eq("stripeCheckoutSessionId", args.stripeCheckoutSessionId))
      .unique();

    if (existingPayment) {
      return existingPayment._id;
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");
    if (job.merchantId !== args.merchantId) throw new Error("Merchant mismatch");

    await ctx.db.patch(job._id, {
      status: "paid",
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      paymentMethod: args.paymentMethod,
      paidAt: Date.now()
    });

    return await ctx.db.insert("payments", {
      merchantId: args.merchantId,
      jobId: args.jobId,
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      paymentMethod: args.paymentMethod,
      amountCents: args.amountCents,
      createdAt: Date.now()
    });
  }
});

const VALID_SUBSCRIPTION_STATUSES = [
  "active", "canceled", "incomplete", "incomplete_expired",
  "past_due", "paused", "trialing", "unpaid"
];

export const syncSubscription = internalMutation({
  args: {
    stripeCustomerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number()
  },
  handler: async (ctx, args) => {
    if (!VALID_SUBSCRIPTION_STATUSES.includes(args.status)) {
      throw new Error(`Invalid subscription status: ${args.status}`);
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_stripe_customer_id", (q) => q.eq("stripeCustomerId", args.stripeCustomerId))
      .unique();

    if (!user) return null;

    // Idempotency: skip if status and period haven't changed
    if (user.subscriptionStatus === args.status && user.subscriptionCurrentPeriodEnd === args.currentPeriodEnd) {
      return user._id;
    }

    await ctx.db.patch(user._id, {
      subscriptionStatus: args.status,
      subscriptionCurrentPeriodEnd: args.currentPeriodEnd
    });

    return user._id;
  }
});
