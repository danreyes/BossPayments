"use client";

import { useState } from "react";
import { useQuery } from "convex/react";

import { AnalyticsChart } from "@/components/analytics-chart";
import { DashboardBackLink } from "@/components/dashboard/back-link";
import { SegmentControl } from "@/components/segment-control";
import { Card, CardContent } from "@/components/ui/card";
import { ANALYTICS_FILTERS, type AnalyticsFilter } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { api } from "@/convex/_generated/api";

const options: { label: string; value: AnalyticsFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Last 7", value: "last7" },
  { label: "This month", value: "thisMonth" },
  { label: "Last month", value: "lastMonth" },
  { label: "Last 3 months", value: "last3Months" }
];

export default function AnalyticsPage() {
  const [filter, setFilter] = useState<(typeof ANALYTICS_FILTERS)[number]>("last7");
  const analytics = useQuery(api.analytics.getOverview, { filter });

  return (
    <div className="space-y-5">
      <DashboardBackLink />
      <div>
        <h1 className="text-4xl font-black tracking-tight">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">Live sales signal without the spreadsheet headache.</p>
      </div>
      <SegmentControl options={options} value={filter} onChange={setFilter} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Total sales</div><div className="mt-2 text-3xl font-black">{analytics ? formatCurrency(analytics.totalSales) : "..."}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Unique customers</div><div className="mt-2 text-3xl font-black">{analytics?.uniqueCustomers ?? "..."}</div></CardContent></Card>
        <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">Avg transaction</div><div className="mt-2 text-3xl font-black">{analytics ? formatCurrency(analytics.averageTransaction) : "..."}</div></CardContent></Card>
      </div>
      <Card><CardContent className="pt-4"><div className="text-sm text-muted-foreground">You saved in fees this month</div><div className="mt-2 text-4xl font-black text-emerald-300">{analytics ? formatCurrency(analytics.feesSavedEstimate) : "..."}</div></CardContent></Card>
      <AnalyticsChart data={analytics?.series ?? []} />
    </div>
  );
}