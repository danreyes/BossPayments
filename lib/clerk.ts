import { currentUser } from "@clerk/nextjs/server";

export async function requireSuperAdmin() {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    return null;
  }
  return user;
}