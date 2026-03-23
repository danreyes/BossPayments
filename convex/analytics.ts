import { endOfDay, endOfMonth, format, startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { v } from "convex/values";

import { query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";

async function getIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  return identity;
}

function getRange(filter: string) {
  const now = new Date();
  if (filter === "today") return { from: startOfDay(now), to: endOfDay(now) };
  if (filter === "last7") return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
  if (filter === "thisMonth") return { from: startOfMonth(now), to: endOfMonth(now) };
  if (filter === "lastMonth") {
    const date = subMonths(now, 1);
    return { from: startOfMonth(date), to: endOfMonth(date) };
  }
  return { from: startOfMonth(subMonths(now, 2)), to: endOfDay(now) };
}

export const getOverview = query({
  args: { filter: v.string() },
  handler: async (ctx, args) => {
    const identity = await getIdentity(ctx);
    const jobs = await ctx.db.query("jobs").withIndex("by_merchant", (q) => q.eq("merchantId", identity.subject)).collect();
    const { from, to } = getRange(args.filter);
    const filtered = jobs.filter((job) => job.createdAt >= from.getTime() && job.createdAt <= to.getTime() && job.status === "paid");
    const totalSales = filtered.reduce((sum, job) => sum + job.amountCents, 0);
    const averageTransaction = filtered.length ? Math.round(totalSales / filtered.length) : 0;
    const uniqueCustomers = new Set(filtered.map((job) => job.customerEmail ?? `${job._id}`)).size;
    const buckets = new Map<string, number>();

    filtered.forEach((job) => {
      const label = format(new Date(job.createdAt), args.filter === "today" ? "HH:mm" : "dd MMM");
      buckets.set(label, (buckets.get(label) ?? 0) + job.amountCents);
    });

    return {
      totalSales,
      averageTransaction,
      uniqueCustomers,
      feesSavedEstimate: Math.round(totalSales * 0.02),
      series: Array.from(buckets.entries()).map(([label, total]) => ({ label, total }))
    };
  }
});