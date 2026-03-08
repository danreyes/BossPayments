import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, BadgeDollarSign, QrCode, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between">
        <Logo />
        <div className="flex gap-2">
          <Button asChild variant="ghost"><Link href="/sign-in">Sign in</Link></Button>
          <Button asChild><Link href="/sign-up">Start free</Link></Button>
        </div>
      </header>
      <section className="grid flex-1 items-center gap-8 py-12 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <Sparkles className="h-4 w-4" /> Paid fast on site
          </div>
          <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-7xl">QR payments built for tradies who want the money now.</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">Create a job in seconds, flash a big QR, push customers into Stripe Checkout, and get a live “Paid boss!” moment when cash lands.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/sign-up">Create your first job <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link href="/sign-in">Already onboard</Link></Button>
          </div>
        </div>
        <Card className="grid gap-4 p-6">
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
            <QrCode className="mb-4 h-10 w-10 text-primary" />
            <div className="text-3xl font-black">$750</div>
            <p className="mt-1 text-sm text-muted-foreground">Bumper repair - white Holden</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <BadgeDollarSign className="mb-3 h-8 w-8 text-emerald-400" />
              <div className="text-2xl font-black">PayTo first</div>
              <p className="mt-1 text-sm text-muted-foreground">No-fee bank option front and centre.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
              <Sparkles className="mb-3 h-8 w-8 text-amber-300" />
              <div className="text-2xl font-black">Founder signals</div>
              <p className="mt-1 text-sm text-muted-foreground">Know when this thing has legs.</p>
            </div>
          </div>
        </Card>
      </section>
    </main>
  );
}