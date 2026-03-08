import { Hammer, WalletCards } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_20px_60px_rgba(16,185,129,0.24)]">
        <Hammer className="h-5 w-5" />
      </div>
      <div>
        <div className="text-lg font-black tracking-tight">PaidBoss</div>
        <div className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <WalletCards className="h-3.5 w-3.5" />
          Get Paid Fast
        </div>
      </div>
    </div>
  );
}