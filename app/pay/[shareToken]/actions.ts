"use server";

import { redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import type Stripe from "stripe";

import { api } from "@/convex/_generated/api";
import { getBaseUrl, stripe } from "@/lib/stripe";

async function createCheckout(formData: FormData, method: "payto" | "card") {
  const shareToken = String(formData.get("shareToken") ?? "");
  const job = await fetchQuery(api.jobs.getByShareToken, { shareToken });
  if (!job) redirect("/");

  const amount = method === "card" ? Math.round(job.amountCents * 1.025) : job.amountCents;
  const paymentMethodTypes = (method === "card" ? ["card"] : ["payto"]) as unknown as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

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