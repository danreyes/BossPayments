// npx shadcn-ui@latest add carousel
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  Bell,
  QrCode,
  Sparkles,
  Volume2
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const JOB_EXAMPLES = [
  { amount: "$750", description: "Bumper repair - white Holden" },
  { amount: "$495", description: "Full service - Toyota Hilux" },
  { amount: "$1200", description: "Aircon regas + tyres - Ford Ranger" },
  { amount: "$320", description: "Brake pads all round - VW Golf" },
  { amount: "$980", description: "Dent removal - black BMW" }
] as const;

const ROTATION_MS = 5000;

export function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % JOB_EXAMPLES.length);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const currentJob = useMemo(() => JOB_EXAMPLES[activeIndex], [activeIndex]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full px-4 sm:px-5">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full px-5 sm:px-6">
            <Link href="/sign-up">Start free</Link>
          </Button>
        </div>
      </header>

      <section className="grid flex-1 items-center gap-8 py-10 sm:py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.12)]">
            <Sparkles className="h-4 w-4" />
            Paid fast on site
          </div>

          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            QR payments built for tradies who want the money now.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Create a job in seconds, flash a big QR, get instant bank payments
            with no merchant fees, and hear &quot;Paid boss!!&quot; the moment it
            lands.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="text-base">
              <Link href="/sign-up">
                Create your first job
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/sign-in">Already onboard</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut", delay: 0.1 }}
        >
          <Card className="grid gap-4 p-4 sm:p-6">
            <div
              className="rounded-[28px] border border-white/10 bg-slate-950/75 p-5 sm:p-6"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Live job examples
              </div>

              <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.15),transparent_35%),linear-gradient(180deg,#020617,#020617)] p-5 sm:p-6">
                <div className="pointer-events-none absolute inset-0 opacity-50">
                  <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                  <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentJob.description}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative z-10"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <div className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                          {currentJob.amount}
                        </div>
                        <p className="mt-2 max-w-[16rem] text-sm leading-6 text-slate-300 sm:text-base">
                          {currentJob.description}
                        </p>
                      </div>
                      <QrPlaceholder seed={activeIndex} />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                      <QrCode className="h-3.5 w-3.5 text-emerald-400" />
                      Scan to pay - PayTo first
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <BadgeDollarSign className="mb-3 h-8 w-8 text-emerald-400" />
                <div className="text-2xl font-black">PayTo first</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  No-fee bank option front and centre, so customers can pay on
                  the spot.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.22)]">
                  <Bell className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black">
                  Instant &quot;Paid boss!!&quot; alerts
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Phone dings the second money lands - no more chasing payments.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  <Volume2 className="h-3.5 w-3.5" />
                  Live payment confirmation
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>
    </main>
  );
}

function QrPlaceholder({ seed }: { seed: number }) {
  return (
    <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent blur-xl" />
      <div className="grid h-full w-full grid-cols-5 gap-1 opacity-90 blur-[0.2px]">
        {Array.from({ length: 25 }).map((_, index) => {
          const active =
            ((index + 3) * (seed + 2)) % 5 === 0 ||
            index % 6 === 0 ||
            index % 7 === seed % 4;

          return (
            <div
              key={index}
              className={active ? "rounded-[3px] bg-emerald-400/90" : "rounded-[3px] bg-white/10"}
            />
          );
        })}
      </div>
    </div>
  );
}