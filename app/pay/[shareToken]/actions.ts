"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import type Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import { rateLimit } from "@/lib/rate-limit";
import { getBaseUrl, getStripe } from "@/lib/stripe";

// Allow 10 checkout attempts per minute per IP
const CHECKOUT_MAX = 10;
const CHECKOUT_WINDOW_MS = 60_000;

async function createCheckout(formData: FormData, method: "payto" | "card") {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`checkout:${ip}`, CHECKOUT_MAX, CHECKOUT_WINDOW_MS);
  if (!allowed) {
    throw new Error("Too many checkout attempts. Please wait a moment and try again.");
  }

  const shareToken = String(formData.get("shareToken") ?? "");
  const job = await fetchQuery(api.jobs.getByShareToken, { shareToken });
  if (!job) redirect("/");

  const amount = method === "card" ? Math.round(job.amountCents * 1.025) : job.amountCents;
  const paymentMethodTypes = (method === "card" ? ["card"] : ["payto"]) as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${getBaseUrl()}/pay/${shareToken}?status=success`,
    cancel_url: `${getBaseUrl()}/pay/${shareToken}`,
    payment_method_types: paymentMethodTypes,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "aud",
          product_data: { name: job.description },
          unit_amount: amount
        }
      }
    ],
    metadata: {
      jobId: job._id,
      merchantId: job.merchantId,
      method
    }
  });

  redirect(session.url!);
}

export async function startBankCheckout(formData: FormData) {
  return createCheckout(formData, "payto");
}

export async function startCardCheckout(formData: FormData) {
  return createCheckout(formData, "card");
}