import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const PLAN_PRICES: Record<string, number> = {
  starter: 49,
  pro: 149,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter Plan",
  pro: "Professional Plan",
};

/**
 * Helper: get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const baseUrl = process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

function getBaseUrl(): string {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/**
 * Create a PayPal order for subscription payment
 */
export const createOrder = action({
  args: {
    plan: v.union(v.literal("starter"), v.literal("pro")),
  },
  returns: v.object({
    orderId: v.union(v.string(), v.null()),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { plan }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { orderId: null, error: "Not authenticated" };

    const price = PLAN_PRICES[plan];
    const name = PLAN_NAMES[plan];

    try {
      const accessToken = await getPayPalAccessToken();
      const baseUrl = getBaseUrl();

      const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description: `QonsApp ${name} - Monthly Subscription`,
              amount: {
                currency_code: "USD",
                value: price.toFixed(2),
              },
              custom_id: `${userId}|${plan}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PayPal create order error:", errorText);
        return { orderId: null, error: "Failed to create PayPal order" };
      }

      const order = (await response.json()) as { id: string };
      return { orderId: order.id };
    } catch (e: any) {
      console.error("PayPal error:", e);
      return { orderId: null, error: e.message || "PayPal error" };
    }
  },
});

/**
 * Capture a PayPal order after user approval
 */
export const captureOrder = action({
  args: {
    orderId: v.string(),
    plan: v.union(v.literal("starter"), v.literal("pro")),
  },
  returns: v.object({
    success: v.boolean(),
    error: v.optional(v.string()),
  }),
  handler: async (ctx, { orderId, plan }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false, error: "Not authenticated" };

    try {
      const accessToken = await getPayPalAccessToken();
      const baseUrl = getBaseUrl();

      const response = await fetch(
        `${baseUrl}/v2/checkout/orders/${orderId}/capture`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        return { success: false, error: "Failed to capture PayPal payment" };
      }

      const captureData = (await response.json()) as {
        status: string;
        id: string;
        purchase_units?: Array<{
          payments?: {
            captures?: Array<{ id: string }>;
          };
        }>;
      };

      if (captureData.status !== "COMPLETED") {
        return { success: false, error: "Payment not completed" };
      }

      // Create subscription record
      const now = Date.now();
      const periodEnd = now + 30 * 24 * 60 * 60 * 1000; // 30 days

      await ctx.runMutation(internal.subscriptions.upsertFromStripe, {
        userId,
        stripeCustomerId: `paypal_${captureData.id}`,
        stripeSubscriptionId: `paypal_order_${orderId}`,
        stripePriceId: `paypal_${plan}`,
        plan: plan as "starter" | "pro" | "enterprise",
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
      });

      return { success: true };
    } catch (e: any) {
      console.error("PayPal capture error:", e);
      return { success: false, error: e.message || "PayPal error" };
    }
  },
});

/**
 * Check if PayPal is configured
 */
export const isConfigured = action({
  args: {},
  returns: v.object({
    configured: v.boolean(),
    clientId: v.union(v.string(), v.null()),
  }),
  handler: async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    return {
      configured: !!(clientId && clientSecret),
      clientId: clientId || null,
    };
  },
});
