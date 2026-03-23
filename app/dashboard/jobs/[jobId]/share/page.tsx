"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";

import { DashboardBackLink } from "@/components/dashboard/back-link";
import { QrShareView } from "@/components/qr-share-view";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export default function JobSharePage() {
  const params = useParams<{ jobId: string }>();
  const job = useQuery(api.jobs.getShareDataByJobId, { jobId: params.jobId as Id<"jobs"> });

  if (job === undefined) return <Skeleton className="h-[600px] rounded-[32px]" />;
  if (job === null) {
    return (
      <div className="space-y-4">
        <DashboardBackLink />
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-2xl font-black">Job not found</div>
            <p className="mt-2 text-sm text-muted-foreground">This QR is unavailable or belongs to another account.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DashboardBackLink />
      <QrShareView job={job} />
    </div>
  );
}