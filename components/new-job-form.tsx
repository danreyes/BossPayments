"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, WifiOff } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QUICK_AMOUNTS } from "@/lib/constants";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

const DRAFT_KEY = "paidboss-new-job-draft";
const OFFLINE_QUEUE_KEY = "paidboss-offline-jobs";
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

type Draft = {
  amount: string;
  description: string;
};

type QueuedJob = Draft & { queuedAt: number };

export function NewJobForm() {
  const router = useRouter();
  const createJob = useMutation(api.jobs.create);
  const generateUploadUrl = useMutation(api.jobs.generateUploadUrl);
  const attachPhoto = useMutation(api.jobs.attachPhoto);
  const [draft, setDraft] = useState<Draft>({ amount: "750", description: "Bumper repair - white Holden" });
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isOnline, setIsOnline] = useState(true);
  const syncingOfflineRef = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) setDraft(JSON.parse(saved));
    setIsOnline(navigator.onLine);

    const onOnline = () => {
      setIsOnline(true);
      void flushOfflineQueue();
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void flushOfflineQueue();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  async function flushOfflineQueue() {
    if (!navigator.onLine || syncingOfflineRef.current) return;

    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) ?? "[]") as QueuedJob[];
    if (!queue.length) return;

    syncingOfflineRef.current = true;
    try {
      for (const queued of queue) {
        await createJob({
          amountCents: Math.round(Number(queued.amount) * 100),
          description: queued.description
        });
      }
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      toast.success("Offline jobs synced.");
    } catch {
      toast.error("Offline jobs are still waiting to sync.");
    } finally {
      syncingOfflineRef.current = false;
    }
  }

  async function uploadIfNeeded(jobId: string) {
    if (!file) return;

    const uploadUrl = await generateUploadUrl({});
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file
    });
    const { storageId } = await result.json();
    await attachPhoto({ jobId: jobId as Id<"jobs">, storageId: storageId as Id<"_storage"> });
  }

  function queueOfflineJob() {
    const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) ?? "[]") as QueuedJob[];
    queue.push({ ...draft, queuedAt: Date.now() });
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    toast.success("Saved offline. We’ll finish creating it once you’re back online.");
  }

  function onSubmit() {
    if (!isOnline) {
      queueOfflineJob();
      return;
    }

    startTransition(async () => {
      try {
        const amountCents = Math.round(Number(draft.amount) * 100);
        if (!amountCents || amountCents < 1 || amountCents > 10_000_000) {
          toast.error("Amount must be between $0.01 and $100,000.");
          return;
        }
        if (!draft.description.trim()) {
          toast.error("Description is required.");
          return;
        }
        const jobId = await createJob({ amountCents, description: draft.description.trim().slice(0, 500) });
        await uploadIfNeeded(jobId);
        localStorage.removeItem(DRAFT_KEY);
        toast.success("QR ready to share.");
        router.push(`/dashboard/jobs/${jobId}/share`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create the job.");
      }
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-3xl font-black tracking-tight">New Job</CardTitle>
        <CardDescription>Fast enough to use with gloves off for ten seconds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!isOnline ? (
          <div className="flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
            <WifiOff className="h-4 w-4" />
            You’re offline. We’ll save the job draft locally.
          </div>
        ) : null}
        <div className="space-y-3">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" inputMode="decimal" value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="750" className="text-3xl font-black" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUICK_AMOUNTS.map((amount) => (
              <Button key={amount} type="button" variant="outline" onClick={() => setDraft((current) => ({ ...current, amount: String(amount) }))}>
                ${amount}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Bumper repair - white Holden" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="photo">Optional photo</Label>
          <label htmlFor="photo" className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-[24px] border border-dashed border-white/15 bg-slate-950/50 px-4 py-5 text-sm text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
            {file ? file.name : "Tap to attach a job photo"}
          </label>
          <input id="photo" type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            if (selected && !ALLOWED_IMAGE_TYPES.includes(selected.type)) {
              toast.error("Only JPEG, PNG, WebP, and HEIC images are allowed.");
              return;
            }
            if (selected && selected.size > MAX_FILE_SIZE) {
              toast.error("Image must be under 10MB.");
              return;
            }
            setFile(selected);
          }} />
        </div>
        <Button size="lg" className="w-full text-base" disabled={isPending} onClick={onSubmit}>
          {isPending ? "Building payment link..." : "Generate QR & Link"}
        </Button>
      </CardContent>
    </Card>
  );
}