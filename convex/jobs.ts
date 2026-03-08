import { customAlphabet } from "nanoid";
import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const token = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

async function getIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

export const create = mutation({
  args: { amountCents: v.number(), description: v.string() },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    return await ctx.db.insert("jobs", {
      merchantId: identity.subject,
      amountCents: args.amountCents,
      description: args.description,
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
      .withIndex("by_merchant", (q: any) => q.eq("merchantId", identity.subject))
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
    return await ctx.db
      .query("jobs")
      .withIndex("by_share_token", (q: any) => q.eq("shareToken", args.shareToken))
      .unique();
  }
});