import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { CreditCard, Landmark } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatters";
import { api } from "@/convex/_generated/api";
import { startBankCheckout, startCardCheckout } from "./actions";

export default async function PayPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  const job = await fetchQuery(api.jobs.getByShareToken, { shareToken });

  if (!job) notFound();

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-4xl font-black tracking-tight">{formatCurrency(job.amountCents)}</CardTitle>
          <p className="text-sm text-muted-foreground">{job.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={startBankCheckout}>
            <input type="hidden" name="shareToken" value={shareToken} />
            <Button size="lg" className="w-full justify-between text-base">
              <span>Pay by Bank (PayTo)</span>
              <Landmark className="h-5 w-5" />
            </Button>
            <p className="mt-2 text-center text-xs uppercase tracking-[0.16em] text-emerald-300">No extra fee</p>
          </form>
          <form action={startCardCheckout}>
            <input type="hidden" name="shareToken" value={shareToken} />
            <Button size="lg" variant="outline" className="w-full justify-between text-base">
              <span>Pay by Card (+2.5% surcharge)</span>
              <CreditCard className="h-5 w-5" />
            </Button>
            <p className="mt-2 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">Customer covers the card fee</p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}