"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="text-3xl font-black">Something went wrong</div>
        <p className="mt-2 text-sm text-muted-foreground">
          We hit an error loading this page. Try again or head back to the dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={reset} size="lg">Try again</Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
