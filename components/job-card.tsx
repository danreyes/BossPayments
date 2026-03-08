import Link from "next/link";
import { ArrowRight, CircleDot, QrCode } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";

export function JobCard({ job }: { job: any }) {
  const paid = job.status === "paid";

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-black tracking-tight">{formatCurrency(job.amountCents)}</div>
          <p className="mt-1 text-sm text-muted-foreground">{job.description}</p>
        </div>
        <Badge variant={paid ? "success" : "secondary"}>{paid ? "Paid" : "Pending"}</Badge>
      </div>
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span className="flex items-center gap-2"><CircleDot className="h-3.5 w-3.5" /> {job.paymentMethod ?? "Awaiting payment"}</span>
        <Link className="flex items-center gap-2 text-white" href={`/dashboard/jobs/${job._id}/share`}>
          <QrCode className="h-4 w-4" /> Open QR <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </Card>
  );
}