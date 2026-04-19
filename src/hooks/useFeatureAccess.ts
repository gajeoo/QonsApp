import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// Route-to-feature mapping (mirrors backend)
const ROUTE_FEATURE_MAP: Record<string, string> = {
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

// Friendly names for features per plan
export const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Professional",
  enterprise: "Enterprise",
  trial: "Free Trial",
  admin: "Admin",
  none: "No Plan",
};

// Which plan is needed to unlock a feature
export const FEATURE_REQUIRED_PLAN: Record<string, string> = {
  properties: "Starter",
  staff: "Starter",
  schedule: "Starter",
  time_tracking: "Starter",
  payroll_csv: "Starter",
  basic_analytics: "Starter",
  payroll_integrations: "Professional",
  executive_analytics: "Professional",
  amenities: "Professional",
  team_management: "Professional",
  hoa: "Enterprise",
};

export function useFeatureAccess() {
  const plan = useQuery(api.featureGating.getEffectivePlan);

  const hasFeature = (feature: string): boolean => {
    if (!plan) return false;
    return plan.features.includes(feature);
  };

  const hasRouteAccess = (path: string): boolean => {
    const feature = ROUTE_FEATURE_MAP[path];
    if (!feature) return true; // Unknown routes are accessible
    return hasFeature(feature);
  };

  const getRequiredPlan = (feature: string): string => {
    return FEATURE_REQUIRED_PLAN[feature] || "Starter";
  };

  return {
    plan,
    isLoading: plan === undefined,
    hasAccess: plan?.hasAccess ?? false,
    isOnTrial: plan?.isOnTrial ?? false,
    trialDaysRemaining: plan?.trialDaysRemaining ?? 0,
    currentPlan: plan?.plan ?? "none",
    planLabel: PLAN_LABELS[plan?.plan ?? "none"] ?? "No Plan",
    role: plan?.role ?? "customer",
    propertyLimit: plan?.propertyLimit ?? 0,
    features: plan?.features ?? [],
    hasFeature,
    hasRouteAccess,
    getRequiredPlan,
  };
}
