"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BarChart3, CreditCard, Home, PlusCircle, ShieldCheck } from "lucide-react";
import { useMutation } from "convex/react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/convex/_generated/api";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/founder", label: "Founder", icon: ShieldCheck }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ensureUser = useMutation(api.users.ensureCurrentUser);

  useEffect(() => {
    void ensureUser({});
  }, [ensureUser]);

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-card/80 px-4 py-4 backdrop-blur">
        <Logo />
        <Button asChild size="lg" className="rounded-full px-5">
          <Link href="/dashboard/jobs/new">
            <PlusCircle className="h-5 w-5" />
            New Job
          </Link>
        </Button>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/95 px-3 pt-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center rounded-2xl px-2 py-2 text-xs font-semibold",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="mb-1 h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}