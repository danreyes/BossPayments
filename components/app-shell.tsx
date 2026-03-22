"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CreditCard, Home, PlusCircle, ShieldCheck } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/founder", label: "Founder", icon: ShieldCheck, superadminOnly: true }
];

function HomeLogoLink() {
  return (
    <Link
      href="/dashboard"
      aria-label="Back to dashboard"
      className="group -m-2 inline-flex items-center gap-3 rounded-[24px] p-2 transition hover:bg-white/5 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Logo />
      <span className="inline-flex min-h-9 items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200 transition group-hover:border-emerald-300/30 group-hover:bg-emerald-500/15 sm:hidden">
        Home
      </span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user: clerkUser } = useUser();
  const isSuperadmin = clerkUser?.publicMetadata?.role === "superadmin";
  const ensureUser = useMutation(api.users.ensureCurrentUser);
  const currentUser = useQuery(api.users.getCurrentUser, isAuthenticated ? {} : "skip");
  const isBillingRoute = pathname.startsWith("/dashboard/billing");
  const isFounderRoute = pathname.startsWith("/founder");
  const hasActiveSubscription = currentUser?.subscriptionStatus === "active" || currentUser?.subscriptionStatus === "trialing";
  // currentUser is `undefined` while the query is still loading — only treat `null` (loaded but not found) as "no user"
  const isUserLoading = isAuthenticated && currentUser === undefined;
  const isSyncingUser = isAuthenticated && currentUser === null;

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void ensureUser({});
  }, [ensureUser, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || isUserLoading || isSyncingUser || isBillingRoute || isFounderRoute || hasActiveSubscription) {
      return;
    }

    router.replace("/dashboard/billing?required=1");
  }, [hasActiveSubscription, isAuthenticated, isBillingRoute, isFounderRoute, isUserLoading, isSyncingUser, router]);

  if (isLoading || !isAuthenticated || isUserLoading || isSyncingUser) {
    return (
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6">
        <header className="mb-6 flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-card/80 px-4 py-4 backdrop-blur">
          <HomeLogoLink />
          <div className="h-12 w-32 rounded-full bg-white/10" />
        </header>
        <Card>
          <CardContent className="py-16 text-center">
            <div className="text-2xl font-black">Loading your jobs...</div>
            <p className="mt-2 text-sm text-muted-foreground">Secure sign-in and billing are syncing with Convex.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6">
      <header className="mb-6 flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-card/80 px-4 py-4 backdrop-blur">
        <HomeLogoLink />
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {nav.filter(item => !item.superadminOnly || isSuperadmin).map(({ href, label, icon: Icon }) => {
              const active = href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
          <Button asChild size="lg" className="rounded-full px-5">
            <Link href="/dashboard/jobs/new">
              <PlusCircle className="h-5 w-5" />
              New Job
            </Link>
          </Button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="safe-bottom fixed bottom-0 left-0 right-0 border-t border-white/10 bg-slate-950/95 px-3 pt-3 backdrop-blur sm:hidden">
        <div className={cn("mx-auto grid max-w-6xl gap-2", isSuperadmin ? "grid-cols-4" : "grid-cols-3")}>
          {nav.filter(item => !item.superadminOnly || isSuperadmin).map(({ href, label, icon: Icon }) => {
            const active = href === "/dashboard" ? pathname === "/dashboard" : pathname === href || pathname.startsWith(`${href}/`);
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
