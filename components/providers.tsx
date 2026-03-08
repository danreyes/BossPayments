"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Toaster } from "sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorBackground: "#020617",
          colorPrimary: "#10b981",
          colorText: "#f8fafc",
          colorInputBackground: "#0f172a"
        }
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        <Toaster richColors closeButton theme="dark" />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}