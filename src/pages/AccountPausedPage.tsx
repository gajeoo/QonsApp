import { useAuthActions } from "@convex-dev/auth/react";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CreditCard,
  LogOut,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    description: "For small property operations",
    features: [
      "Up to 25 properties",
      "Staff management",
      "AI scheduling",
      "GPS time tracking",
      "Payroll CSV export",
      "Basic analytics",
      "Resident management",
    ],
  },
  {
    id: "pro",
    name: "Professional",
    price: "$149",
    description: "For growing teams & portfolios",
    featured: true,
    features: [
      "Up to 150 properties",
      "Everything in Starter",
      "Payroll integrations (ADP, QuickBooks)",
      "Executive analytics & reports",
      "Amenity booking system",
      "Team invitations & roles",
      "Shift swap requests",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "Unlimited scale & support",
    features: [
      "Unlimited properties",
      "Everything in Pro",
      "HOA management suite",
      "Reserve fund tracking",
      "White-label options",
      "Dedicated support",
      "Custom API access",
    ],
  },
];

export function AccountPausedPage() {
  const { signOut } = useAuthActions();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="size-8 rounded-lg bg-teal flex items-center justify-center">
              <span className="text-white font-bold text-sm">Q</span>
            </div>
            {APP_NAME}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        {/* Alert */}
        <div className="max-w-2xl mx-auto mb-10 text-center">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
            <AlertTriangle className="size-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Your Free Trial Has Ended
          </h1>
          <p className="text-muted-foreground text-lg">
            Your 14-day trial has expired. Choose a plan below to restore access to all your data and features.
            Your data is safe — nothing has been deleted.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${plan.featured ? "border-teal shadow-lg ring-1 ring-teal/20" : ""}`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="size-3" /> Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  {plan.id === "starter" && <Zap className="size-5 text-teal" />}
                  {plan.id === "pro" && <CreditCard className="size-5 text-teal" />}
                  {plan.id === "enterprise" && <Sparkles className="size-5 text-teal" />}
                  {plan.name}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="pt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground text-sm">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-teal shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.id === "enterprise" ? (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/contact">Contact Sales</Link>
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${plan.featured ? "bg-teal text-white hover:bg-teal/90" : ""}`}
                    variant={plan.featured ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/pricing">
                      Subscribe Now <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Reassurance */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            ✨ All your properties, staff, schedules, and data are preserved.
            Once you subscribe, everything will be restored instantly.
          </p>
        </div>
      </main>
    </div>
  );
}
