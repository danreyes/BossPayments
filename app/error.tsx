"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-6">
      <Card className="w-full">
        <CardContent className="py-12 text-center">
          <div className="text-3xl font-black">Something went wrong</div>
          <p className="mt-2 text-sm text-muted-foreground">
            An unexpected error occurred. Please try again.
          </p>
          <Button onClick={reset} size="lg" className="mt-6">
            Try again
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
