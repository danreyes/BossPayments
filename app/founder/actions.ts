"use server";

import { currentUser } from "@clerk/nextjs/server";

import { internal } from "@/convex/_generated/api";
import { adminMutation } from "@/lib/convex-admin";

const MAX_NAME_LENGTH = 200;
const MAX_TEXT_LENGTH = 1000;

export async function createFounderInterview(formData: FormData) {
  const user = await currentUser();
  if (!user || user.publicMetadata.role !== "superadmin") {
    throw new Error("Not authorized");
  }

  const merchantName = String(formData.get("merchantName") ?? "").trim().slice(0, MAX_NAME_LENGTH);
  const likelihood = Math.min(10, Math.max(0, Number(formData.get("likelihood") ?? 0)));
  const willingness = String(formData.get("willingness") ?? "").toLowerCase();
  const oneThingToTellMates = String(formData.get("oneThingToTellMates") ?? "").trim().slice(0, MAX_TEXT_LENGTH);

  if (!merchantName || !oneThingToTellMates || !["yes", "maybe", "no"].includes(willingness) || Number.isNaN(likelihood)) {
    throw new Error("Invalid interview details");
  }

  await adminMutation(internal.founder.createInterview, {
    merchantName,
    likelihood,
    willingness: willingness as "yes" | "maybe" | "no",
    oneThingToTellMates
  });
}
