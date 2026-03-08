"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, PlusCircle } from "lucide-react";

import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  const jobs = useQuery(api.jobs.listRecentByMerchant, {});

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-500/20 via-card to-card">
        <CardHeader>
          <CardTitle className="text-4xl font-black tracking-tight">Jobs rolling in?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-sm text-muted-foreground">Build a fresh payment QR in seconds, then let Convex flip it live when Stripe confirms the money landed.</p>
          <Button asChild size="lg"><Link href="/dashboard/jobs/new"><PlusCircle className="h-5 w-5" /> New Job</Link></Button>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight">Recent jobs</h2>
        <Link href="/dashboard/analytics" className="flex items-center gap-2 text-sm text-muted-foreground">Analytics <ArrowRight className="h-4 w-4" /></Link>
      </div>
      <div className="grid gap-4">
        {jobs === undefined ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-[28px]" />) : jobs.length ? jobs.map((job) => <JobCard key={job._id} job={job} />) : (
          <Card className="text-center"><CardContent className="py-12"><div className="text-2xl font-black">No jobs yet</div><p className="mt-2 text-sm text-muted-foreground">Create your first QR and start collecting on site.</p></CardContent></Card>
        )}
      </div>
    </div>
  );
}