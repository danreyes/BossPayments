"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/convex/_generated/api";

const initialState = {
  merchantName: "",
  likelihood: "7",
  willingness: "yes",
  oneThingToTellMates: ""
};

export function InterviewTracker({ interviews }: { interviews: any[] }) {
  const createInterview = useMutation(api.founder.createInterview);
  const [form, setForm] = useState(initialState);

  async function submit() {
    await createInterview({
      merchantName: form.merchantName,
      likelihood: Number(form.likelihood),
      willingness: form.willingness as "yes" | "maybe" | "no",
      oneThingToTellMates: form.oneThingToTellMates
    });
    setForm(initialState);
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Merchant name" value={form.merchantName} onChange={(event) => setForm((current) => ({ ...current, merchantName: event.target.value }))} />
          <Input placeholder="Likelihood 1-10" inputMode="numeric" value={form.likelihood} onChange={(event) => setForm((current) => ({ ...current, likelihood: event.target.value }))} />
          <Input placeholder="yes / maybe / no" value={form.willingness} onChange={(event) => setForm((current) => ({ ...current, willingness: event.target.value.toLowerCase() }))} />
          <Input placeholder="One thing to tell mates" value={form.oneThingToTellMates} onChange={(event) => setForm((current) => ({ ...current, oneThingToTellMates: event.target.value }))} />
        </div>
        <Button type="button" onClick={submit}>Save interview</Button>
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