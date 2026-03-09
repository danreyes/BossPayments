import { UserButton } from "@clerk/nextjs";

import { AppShell } from "@/components/app-shell";

export default function FounderLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="mb-4 flex justify-end">
        <UserButton />
      </div>
      {children}
    </AppShell>
  );
}