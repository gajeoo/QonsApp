import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query } from "./_generated/server";

/**
 * Feature access definitions per plan.
 * "trial" gets access to ALL features for 14 days.
 */
const PLAN_FEATURES: Record<string, string[]> = {
  starter: [
    "properties",       // Up to 25 properties
    "staff",            // Staff management
    "schedule",         // AI scheduling
    "time_tracking",    // GPS time tracking
    "payroll_csv",      // Payroll CSV export
    "basic_analytics",  // Basic analytics
    "dashboard",        // Dashboard
    "residents",        // Resident management
  ],
  pro: [
    "properties",        // Up to 150 properties
    "staff",
    "schedule",
    "time_tracking",
    "payroll_csv",
    "payroll_integrations", // ADP, Paychex, QuickBooks
    "basic_analytics",
    "executive_analytics",  // Executive dashboards
    "amenities",            // Amenity booking
    "dashboard",
    "custom_reports",
    "api_access",
    "team_management",      // Invite workers/managers
    "residents",            // Resident management
    "shift_swaps",          // Shift swap requests
  ],
  enterprise: [
    "properties",           // Unlimited
    "staff",
    "schedule",
    "time_tracking",
    "payroll_csv",
    "payroll_integrations",
    "basic_analytics",
    "executive_analytics",
    "amenities",
    "hoa",                  // HOA management suite
    "dashboard",
    "custom_reports",
    "api_access",
    "team_management",
    "white_label",
    "dedicated_support",
    "residents",
    "shift_swaps",
    "reserve_fund",
  ],
  trial: [
    // Trial gets EVERYTHING
    "properties", "staff", "schedule", "time_tracking",
    "payroll_csv", "payroll_integrations", "basic_analytics",
    "executive_analytics", "amenities", "hoa", "dashboard",
    "custom_reports", "api_access", "team_management",
    "white_label", "dedicated_support", "residents",
    "shift_swaps", "reserve_fund",
  ],
  admin: [
    // Admin gets EVERYTHING
    "properties", "staff", "schedule", "time_tracking",
    "payroll_csv", "payroll_integrations", "basic_analytics",
    "executive_analytics", "amenities", "hoa", "dashboard",
    "custom_reports", "api_access", "team_management",
    "white_label", "dedicated_support", "admin_panel",
    "residents", "shift_swaps", "reserve_fund",
  ],
};

// Property limits per plan
const PROPERTY_LIMITS: Record<string, number> = {
  starter: 25,
  pro: 150,
  enterprise: 999999,
  trial: 999999,
  admin: 999999,
};

/**
 * Get the effective plan for the current user (considering trial, subscription, role)
 */
export const getEffectivePlan = query({
  args: {},
  returns: v.union(
    v.object({
      plan: v.string(),
      features: v.array(v.string()),
      propertyLimit: v.number(),
      isOnTrial: v.boolean(),
      trialDaysRemaining: v.number(),
      hasAccess: v.boolean(),
      role: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    // Admin always has full access
    if (profile.role === "admin") {
      return {
        plan: "admin",
        features: PLAN_FEATURES.admin,
        propertyLimit: PROPERTY_LIMITS.admin,
        isOnTrial: false,
        trialDaysRemaining: 0,
        hasAccess: true,
        role: "admin",
      };
    }

    // Workers/managers inherit from org
    let effectiveUserId = userId;
    if ((profile.role === "worker" || profile.role === "manager") && profile.organizationUserId) {
      effectiveUserId = profile.organizationUserId;
    }

    // Check subscription
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", effectiveUserId))
      .order("desc")
      .first();

    if (sub && (sub.status === "active" || sub.status === "trialing")) {
      const plan = sub.plan;
      return {
        plan,
        features: PLAN_FEATURES[plan] || [],
        propertyLimit: PROPERTY_LIMITS[plan] || 25,
        isOnTrial: false,
        trialDaysRemaining: 0,
        hasAccess: true,
        role: profile.role,
      };
    }

    // Check trial — use the effective user's profile for trial dates
    let trialProfile = profile;
    if (effectiveUserId !== userId) {
      const orgProfile = await ctx.db
        .query("userProfiles")
        .withIndex("by_userId", (q) => q.eq("userId", effectiveUserId))
        .unique();
      if (orgProfile) trialProfile = orgProfile;
    }

    const now = Date.now();
    const trialEnd = trialProfile.trialEndDate || 0;
    if (trialEnd > now) {
      const daysRemaining = Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000));
      return {
        plan: "trial",
        features: PLAN_FEATURES.trial,
        propertyLimit: PROPERTY_LIMITS.trial,
        isOnTrial: true,
        trialDaysRemaining: daysRemaining,
        hasAccess: true,
        role: profile.role,
      };
    }

    // No access — trial expired, no subscription
    return {
      plan: "none",
      features: ["dashboard"],
      propertyLimit: 0,
      isOnTrial: false,
      trialDaysRemaining: 0,
      hasAccess: false,
      role: profile.role,
    };
  },
});

/**
 * Map route paths to features for frontend gating
 */
export const ROUTE_FEATURE_MAP: Record<string, string> = {
  "/properties": "properties",
  "/staff": "staff",
  "/schedule": "schedule",
  "/time-tracking": "time_tracking",
  "/payroll": "payroll_csv",
  "/analytics": "basic_analytics",
  "/amenities": "amenities",
  "/hoa": "hoa",
  "/dashboard": "dashboard",
  "/settings": "dashboard",
};
