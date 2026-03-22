import { ConvexHttpClient } from "convex/browser";
import type { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";

/**
 * Admin-authed Convex client for calling internal mutations/queries
 * from Next.js server-side code (API routes, server actions).
 *
 * Requires CONVEX_DEPLOY_KEY env var (found in the Convex dashboard under Settings → Deploy Key).
 */
function getAdminClient() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  const deployKey = process.env.CONVEX_DEPLOY_KEY;
  if (!deployKey) {
    throw new Error("CONVEX_DEPLOY_KEY is required to call internal Convex functions");
  }
  // setAdminAuth exists at runtime but is not in the public type definitions
  (client as unknown as { setAdminAuth(token: string): void }).setAdminAuth(deployKey);
  return client;
}

/** Call an internal mutation with admin auth. */
export async function adminMutation<F extends FunctionReference<"mutation", "internal">>(
  fn: F,
  args: FunctionArgs<F>
): Promise<FunctionReturnType<F>> {
  const client = getAdminClient();
  return client.mutation(fn as unknown as FunctionReference<"mutation">, args);
}

/** Call an internal query with admin auth. */
export async function adminQuery<F extends FunctionReference<"query", "internal">>(
  fn: F,
  args: FunctionArgs<F>
): Promise<FunctionReturnType<F>> {
  const client = getAdminClient();
  return client.query(fn as unknown as FunctionReference<"query">, args);
}
