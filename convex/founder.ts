import { subDays } from "date-fns";
import { v } from "convex/values";

import { ACTIVE_MERCHANTS_TARGET, JOBS_TARGET, PAYTO_TARGET, WILLINGNESS_TARGET } from "../lib/constants";
import { mutation, query } from "./_generated/server";

export const listInterviews = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db.query("interviews").collect();
    return interviews.sort((a, b) => b.createdAt - a.createdAt);
  }
});

export const createInterview = mutation({
  args: {
    merchantName: v.string(),
    likelihood: v.number(),
    willingness: v.union(v.literal("yes"), v.literal("maybe"), v.literal("no")),
    oneThingToTellMates: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("interviews", { ...args, createdAt: Date.now() });
  }
});

export const getKpis = query({
  args: {},
  handler: async (ctx) => {
    const [users, jobs, interviews] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("jobs").collect(),
      ctx.db.query("interviews").collect()
    ]);

    const activeMerchants = users.filter((user) => user.lastActiveAt >= subDays(new Date(), 30).getTime()).length;
    const totalJobs = jobs.length;
    const payToRate = jobs.length ? jobs.filter((job) => job.paymentMethod === "payto").length / jobs.length : 0;
    const jobsThisWeek = jobs.filter((job) => job.createdAt >= subDays(new Date(), 7).getTime()).length;
    const retention14Day = users.length ? users.filter((user) => user.lastActiveAt >= subDays(new Date(), 14).getTime()).length / users.length : 0;
    const yesInterviews = interviews.filter((interview) => interview.willingness === "yes");
    const wouldPayYesRate = interviews.length ? yesInterviews.length / interviews.length : 0;
    const avgLikelihood = interviews.length ? interviews.reduce((sum, interview) => sum + interview.likelihood, 0) / interviews.length : 0;
    const subscriptionRevenue = users.filter((user) => user.subscriptionStatus === "active").length * 2900;

    const hitCount = [
      activeMerchants >= ACTIVE_MERCHANTS_TARGET,
      totalJobs >= JOBS_TARGET,
      payToRate >= PAYTO_TARGET,
      avgLikelihood >= WILLINGNESS_TARGET
    ].filter(Boolean).length;

    return {
      activeMerchants,
      totalJobs,
      payToRate,
      retention14Day,
      avgLikelihood,
      wouldPayYesRate,
      subscriptionRevenue,
      jobsThisWeek,
      successLevel: hitCount === 4 ? "GREEN" : hitCount >= 2 ? "YELLOW" : "RED"
    };
  }
});