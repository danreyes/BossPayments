"use client";

import { cn } from "@/lib/utils";

export function SegmentControl<T extends string>({ options, value, onChange }: { options: { label: string; value: T }[]; value: T; onChange: (value: T) => void; }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-3xl bg-secondary p-2 sm:grid-cols-5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "touch-target rounded-2xl px-3 py-3 text-sm font-semibold transition",
            value === option.value ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground hover:bg-white/5 hover:text-white"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}