import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

async function getIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const ensureCurrentUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    const clerkId = identity.subject;
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", clerkId))
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: identity.email ?? existing.email,
        name: identity.name ?? existing.name,
        imageUrl: identity.pictureUrl ?? existing.imageUrl,
        lastActiveAt: now
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId,
      email: identity.email ?? "",
      name: identity.name,
      imageUrl: identity.pictureUrl,
      createdAt: now,
      lastActiveAt: now
    });
  }
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
  }
});

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .unique();
  }
});

export const setStripeCustomerId = mutation({
  args: { stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { stripeCustomerId: args.stripeCustomerId });
  }
});

export const setStripeCustomerIdByClerkId = mutation({
  args: { clerkId: v.string(), stripeCustomerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q: any) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { stripeCustomerId: args.stripeCustomerId });
  }
});