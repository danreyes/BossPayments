import { AppShell } from "@/components/app-shell";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
