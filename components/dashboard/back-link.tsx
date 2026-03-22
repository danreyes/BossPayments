import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

export function DashboardBackLink({
  href = "/dashboard",
  label = "Back to dashboard",
  className
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-200",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Link>
  );
}