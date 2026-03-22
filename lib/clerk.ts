import { auth, currentUser } from "@clerk/nextjs/server";

export async function requireSuperAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    return null;
  }
  return user;
}

/**
 * Get a Convex-compatible auth token from Clerk for server-side use.
 * Pass the result as `{ token }` in the third argument of fetchQuery/fetchMutation.
 */
export async function getConvexToken() {
  const { getToken } = await auth();
  return (await getToken({ template: "convex" })) ?? undefined;
}