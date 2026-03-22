"use client";

import { useRef, useTransition } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { createFounderInterview } from "@/app/founder/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function InterviewTracker({ interviews }: { interviews: any[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        await createFounderInterview(formData);
        toast.success("Interview saved.");
        formRef.current?.reset();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save interview.");
      }
    });
  }

  function exportCsv() {
    const rows = [
      ["Merchant", "Likelihood", "Would pay", "One thing to tell mates"],
      ...interviews.map((interview) => [interview.merchantName, interview.likelihood, interview.willingness, interview.oneThingToTellMates])
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "paidboss-founder-interviews.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Interview Tracker</CardTitle>
        <Button type="button" variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Export CSV</Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <form ref={formRef} action={submit} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="merchantName" placeholder="Merchant name" maxLength={200} />
            <Input name="likelihood" placeholder="Likelihood 1-10" inputMode="numeric" defaultValue="7" />
            <Input name="willingness" placeholder="yes / maybe / no" defaultValue="yes" />
            <Input name="oneThingToTellMates" placeholder="One thing to tell mates" maxLength={1000} />
          </div>
          <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save interview"}</Button>
        </form>
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Would pay?</TableHead>
                <TableHead>One thing to tell mates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview._id}>
                  <TableCell>{interview.merchantName}</TableCell>
                  <TableCell>{interview.likelihood}</TableCell>
                  <TableCell className="capitalize">{interview.willingness}</TableCell>
                  <TableCell>{interview.oneThingToTellMates}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
