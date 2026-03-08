import { v } from "convex/values";

import { mutation } from "./_generated/server";

export const recordCheckoutCompleted = mutation({
  args: {
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    jobId: v.id("jobs"),
    merchantId: v.string(),
    paymentMethod: v.string(),
    amountCents: v.number()
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) throw new Error("Job not found");

    await ctx.db.patch(job._id, {
      status: "paid",
      stripeCheckoutSessionId: args.stripeCheckoutSessionId,
      stripePaymentIntentId: args.stripePaymentIntentId,
      paymentMethod: args.paymentMethod,
      paidAt: Date.now()
    });

    await ctx.db.insert("payments", {
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

export const syncSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.query("users").withIndex("by_stripe_customer_id", (q) => q.eq("stripeCustomerId", args.stripeCustomerId)).unique();
    if (!user) return;
    await ctx.db.patch(user._id, {
      subscriptionStatus: args.status,
      subscriptionCurrentPeriodEnd: args.currentPeriodEnd
    });
  }
});