import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
    subscriptionCurrentPeriodEnd: v.optional(v.number()),
    createdAt: v.number(),
    lastActiveAt: v.number()
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_stripe_customer_id", ["stripeCustomerId"]),
  jobs: defineTable({
    merchantId: v.string(),
    shareToken: v.string(),
    amountCents: v.number(),
    description: v.string(),
    status: v.union(v.literal("pending"), v.literal("paid")),
    photoStorageId: v.optional(v.id("_storage")),
    stripeCheckoutSessionId: v.optional(v.string()),
    stripePaymentIntentId: v.optional(v.string()),
    paymentMethod: v.optional(v.string()),
    customerEmail: v.optional(v.string()),
    createdAt: v.number(),
    paidAt: v.optional(v.number())
  })
    .index("by_merchant", ["merchantId"])
    .index("by_share_token", ["shareToken"])
    .index("by_status", ["status"]),
  payments: defineTable({
    merchantId: v.string(),
    jobId: v.id("jobs"),
    stripeCheckoutSessionId: v.string(),
    stripePaymentIntentId: v.string(),
    paymentMethod: v.string(),
    amountCents: v.number(),
    createdAt: v.number()
  })
    .index("by_merchant", ["merchantId"])
    .index("by_job", ["jobId"])
    .index("by_stripe_checkout_session_id", ["stripeCheckoutSessionId"])
    .index("by_stripe_payment_intent_id", ["stripePaymentIntentId"]),
  interviews: defineTable({
    merchantName: v.string(),
    likelihood: v.number(),
    willingness: v.union(v.literal("yes"), v.literal("maybe"), v.literal("no")),
    oneThingToTellMates: v.string(),
    createdAt: v.number()
  })
});
