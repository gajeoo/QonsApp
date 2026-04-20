import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };

const PLAN_PRICES: Record<string, number> = {
  starter: 49.99,
  pro: 49.99,
  premium: 49.99,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "QuonsApp Premium",
  pro: "QuonsApp Premium",
  premium: "QuonsApp Premium",
};

// ========== Internal helpers to read config from DB ==========

export const _getSettingByKey = internalQuery({
  args: { key: v.string() },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { key }) => {
    const setting = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return setting?.value ?? null;
  },
});

export const _upsertSetting = internalMutation({
  args: { key: v.string(), value: v.string() },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("appSettings", { key, value, updatedAt: Date.now() });
    }
  },
});

/**
 * Get PayPal credentials — env vars first, then database fallback
 */
async function getPayPalCredentials(ctx: any): Promise<{
  clientId: string;
  clientSecret: string;
  mode: string;
}> {
  let clientId = process.env.PAYPAL_CLIENT_ID;
  let clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  let mode = process.env.PAYPAL_MODE || "sandbox";

  // If env vars missing, try database
  if (!clientId || !clientSecret) {
    const dbClientId = await ctx.runQuery(internal.paypal._getSettingByKey, { key: "PAYPAL_CLIENT_ID" });
    const dbClientSecret = await ctx.runQuery(internal.paypal._getSettingByKey, { key: "PAYPAL_CLIENT_SECRET" });
    const dbMode = await ctx.runQuery(internal.paypal._getSettingByKey, { key: "PAYPAL_MODE" });
    if (dbClientId) clientId = dbClientId;
    if (dbClientSecret) clientSecret = dbClientSecret;
    if (dbMode) mode = dbMode;
  }

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  return { clientId, clientSecret, mode };
}

/**
 * Helper: get PayPal access token
 */
async function getPayPalAccessToken(ctx: any): Promise<string> {
  const { clientId, clientSecret, mode } = await getPayPalCredentials(ctx);

  const baseUrl = mode === "live"
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
    const errorText = await response.text();
    console.error("PayPal token error:", errorText);
    throw new Error("Failed to get PayPal access token");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

function getBaseUrl(mode: string): string {
  return mode === "live"
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
      const { mode } = await getPayPalCredentials(ctx);
      const accessToken = await getPayPalAccessToken(ctx);
      const baseUrl = getBaseUrl(mode);

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
              description: `${name} - Monthly Subscription`,
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
      const { mode } = await getPayPalCredentials(ctx);
      const accessToken = await getPayPalAccessToken(ctx);
      const baseUrl = getBaseUrl(mode);

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
 * Check if PayPal is configured (checks env vars + database)
 */
export const isConfigured = action({
  args: {},
  returns: v.object({
    configured: v.boolean(),
    clientId: v.union(v.string(), v.null()),
  }),
  handler: async (ctx) => {
    try {
      const { clientId } = await getPayPalCredentials(ctx);
      return { configured: true, clientId };
    } catch {
      return { configured: false, clientId: null };
    }
  },
});

/**
 * Admin: store PayPal credentials in the database
 * This is an alternative to env vars for deployments where env vars can't be set
 */
export const setCredentials = action({
  args: {
    clientId: v.string(),
    clientSecret: v.string(),
    mode: v.union(v.literal("sandbox"), v.literal("live")),
  },
  returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
  handler: async (ctx, { clientId, clientSecret, mode }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { success: false, error: "Not authenticated" };

    // Check if user is admin
    const profile = await ctx.runQuery(internal.admin.getProfileInternal, { userId });
    if (!profile || profile.role !== "admin") {
      return { success: false, error: "Admin access required" };
    }

    await ctx.runMutation(internal.paypal._upsertSetting, { key: "PAYPAL_CLIENT_ID", value: clientId });
    await ctx.runMutation(internal.paypal._upsertSetting, { key: "PAYPAL_CLIENT_SECRET", value: clientSecret });
    await ctx.runMutation(internal.paypal._upsertSetting, { key: "PAYPAL_MODE", value: mode });

    return { success: true };
  },
});
