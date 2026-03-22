import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { internal } from "@/convex/_generated/api";
import { adminQuery } from "@/lib/convex-admin";
import { DashboardBackLink } from "@/components/dashboard/back-link";
import { InterviewTracker } from "@/components/founder/interview-tracker";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export default async function FounderPage() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") redirect("/dashboard");

  const [kpis, interviews] = await Promise.all([
    adminQuery(internal.founder.getKpis, {}),
    adminQuery(internal.founder.listInterviews, {})
  ]);

  const badgeVariant = kpis.successLevel === "GREEN" ? "success" : kpis.successLevel === "YELLOW" ? "warning" : "danger";

  return (
    <div className="space-y-5">
      <DashboardBackLink />
      <Card className="bg-gradient-to-br from-white/8 via-card to-card">
        <CardHeader>
          <Badge variant={badgeVariant}>Success Level {kpis.successLevel}</Badge>
          <CardTitle className="text-5xl font-black tracking-tight">Founder Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Active merchants" value={String(kpis.activeMerchants)} helper="Target 10+" />
            <MetricCard label="Total jobs" value={String(kpis.totalJobs)} helper="Target 80+" />
            <MetricCard label="PayTo rate" value={formatPercent(kpis.payToRate)} helper="Target 65%+" />
            <MetricCard label="14-day retention" value={formatPercent(kpis.retention14Day)} helper="Target high repeat" />
            <MetricCard label="Avg willingness" value={`${kpis.avgLikelihood.toFixed(1)}/10`} helper="Target 7+" />
            <MetricCard label="Subs revenue" value={formatCurrency(kpis.subscriptionRevenue)} helper="Live Stripe-linked signal" />
            <MetricCard label="Jobs this week" value={String(kpis.jobsThisWeek)} helper="Current momentum" />
            <MetricCard label="Yes to $29/mo" value={formatPercent(kpis.wouldPayYesRate)} helper="Founder interviews" />
          </div>
          {kpis.successLevel === "GREEN" ? <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/15 p-5 text-center text-2xl font-black text-emerald-200">Start charging! This has legs 🔥</div> : null}
        </CardContent>
      </Card>
      <InterviewTracker interviews={interviews} />
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{helper}</div>
    </div>
  );
}
