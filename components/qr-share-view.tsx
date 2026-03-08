"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Copy, Mail, MessageSquareText, Volume2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

import { PaymentCelebration } from "@/components/payment-celebration";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/formatters";

export function QrShareView({ job }: { job: any }) {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const shareUrl = typeof window === "undefined"
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/pay/${job.shareToken}`
    : `${window.location.origin}/pay/${job.shareToken}`;

  const message = useMemo(
    () => `Pay ${formatCurrency(job.amountCents)} for ${job.description}: ${shareUrl}`,
    [job.amountCents, job.description, shareUrl]
  );

  return (
    <div className="space-y-5">
      <PaymentCelebration paid={job.status === "paid"} amountCents={job.amountCents} voiceEnabled={voiceEnabled} />
      <Card className="space-y-6 p-6 text-center">
        <div>
          <div className="text-5xl font-black tracking-tight">{formatCurrency(job.amountCents)}</div>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{job.description}</p>
        </div>
        <div className="mx-auto rounded-[32px] bg-white p-5 shadow-2xl">
          <QRCodeSVG value={shareUrl} size={280} level="H" includeMargin />
        </div>
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm">
          <Volume2 className="h-4 w-4 text-primary" />
          Voice alert ON
          <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success("Payment link copied."))}>
            <Copy className="h-4 w-4" /> Copy link
          </Button>
          <Button asChild variant="outline">
            <Link href={`sms:?body=${encodeURIComponent(message)}`}><MessageSquareText className="h-4 w-4" /> SMS share</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`mailto:?subject=${encodeURIComponent("Payment link from PaidBoss")}&body=${encodeURIComponent(message)}`}><Mail className="h-4 w-4" /> Email share</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}