"use client";

import confetti from "canvas-confetti";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { formatCurrency } from "@/lib/formatters";

export function PaymentCelebration({ paid, amountCents, voiceEnabled }: { paid: boolean; amountCents: number; voiceEnabled: boolean }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!paid || firedRef.current) return;
    firedRef.current = true;
    confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    if (voiceEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Paid boss. Received ${formatCurrency(amountCents)}.`);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }, [amountCents, paid, voiceEnabled]);

  return (
    <AnimatePresence>
      {paid ? (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-14 w-14 text-emerald-400" />
          <div className="text-3xl font-black tracking-tight text-emerald-300">Cheers legend!</div>
          <p className="mt-2 text-sm text-emerald-100/80">Money landed and the job is marked paid live.</p>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}