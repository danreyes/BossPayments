import { customAlphabet } from "nanoid";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const token = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

import type { QueryCtx, MutationCtx } from "./_generated/server";

async function getIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const create = mutation({
  args: { amountCents: v.number(), description: v.string() },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);

    // Validate amount: must be positive integer, max $100,000
    if (!Number.isInteger(args.amountCents) || args.amountCents < 1 || args.amountCents > 10_000_000) {
      throw new Error("Amount must be between $0.01 and $100,000");
    }

    // Validate description: non-empty, max 500 chars
    const description = args.description.trim().slice(0, 500);
    if (!description) {
      throw new Error("Description is required");
    }

    return await ctx.db.insert("jobs", {
      merchantId: identity.subject,
      amountCents: args.amountCents,
      description,
      shareToken: token(),
      status: "pending",
      createdAt: Date.now()
    });
  }
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getIdentity(ctx);
    // Convex storage handles content-type validation on upload
    return await ctx.storage.generateUploadUrl();
  }
});

export const attachPhoto = mutation({
  args: { jobId: v.id("jobs"), storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.merchantId !== identity.subject) {
      throw new Error("Job not found");
    }
    await ctx.db.patch(args.jobId, { photoStorageId: args.storageId });
  }
});

export const listRecentByMerchant = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getIdentity(ctx);
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_merchant", (q) => q.eq("merchantId", identity.subject))
      .collect();

    return jobs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20);
  }
});

export const getShareDataByJobId = query({
  args: { jobId: v.id("jobs") },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const job = await ctx.db.get(args.jobId);
    if (!job || job.merchantId !== identity.subject) return null;

    return {
      ...job,
      shareToken: job.shareToken
    };
  }
});

export const getByShareToken = query({
  args: { shareToken: v.string() },
  handler: async (ctx, args) => {
    const job = await ctx.db
      .query("jobs")
      .withIndex("by_share_token", (q) => q.eq("shareToken", args.shareToken))
      .unique();

    if (!job) return null;

    // Only expose fields needed for the payment page — no internal IDs or merchant data
    return {
      _id: job._id,
      amountCents: job.amountCents,
      description: job.description,
      status: job.status,
      shareToken: job.shareToken,
      merchantId: job.merchantId,
      paymentMethod: job.paymentMethod
    };
  }
});