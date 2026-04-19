import { useAction, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Building2,
  Check,
  Crown,
  Loader2,
  Sparkles,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";

const tiers = [
  {
    id: "starter" as const,
    name: "Starter",
    price: "$49",
    pricePer: "/month",
    description:
      "Perfect for small concierge companies managing up to 25 properties.",
    icon: Zap,
    featured: false,
    cta: "Start Free Trial",
    features: [
      "Up to 25 properties",
      "AI scheduling",
      "Staff management",
      "Mobile app access",
      "Basic analytics",
      "Email support",
      "Payroll CSV export",
    ],
  },
  {
    id: "pro" as const,
    name: "Professional",
    price: "$149",
    pricePer: "/month",
    description:
      "For growing operations that need advanced analytics and integrations.",
    icon: Sparkles,
    featured: true,
    cta: "Start Free Trial",
    features: [
      "Up to 150 properties",
      "Everything in Starter, plus:",
      "Executive dashboards",
      "ADP & Paychex integration",
      "Amenity booking",
      "Priority support",
      "Custom reports",
      "API access",
    ],
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "Custom",
    pricePer: "",
    description:
      "For large portfolios with 500+ buildings and custom requirements.",
    icon: Crown,
    featured: false,
    cta: "Contact Sales",
    features: [
      "Unlimited properties",
      "Everything in Professional, plus:",
      "HOA management suite",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantees",
      "On-site training",
      "White-label options",
    ],
  },
];

const faqs = [
  {
    question: "Can I try before I buy?",
    answer:
      "Yes! Every new account gets a 14-day free trial with full access to all features. No credit card required. At the end of your trial, choose the plan that fits your needs.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data is yours. If you cancel, you'll retain read-only access through the end of your billing period. We also provide a full data export at any time.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing period, and we'll prorate any differences.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, SOC 2-compliant infrastructure, and regular security audits. Your property and staff data is always protected.",
  },
  {
    question: "Do you offer onboarding support?",
    answer:
      "Yes. Every subscriber gets personalized onboarding. We'll help you import properties, configure schedules, and train your team.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe. Enterprise customers can pay via invoice.",
  },
];

export function PricingPage() {
  const { isAuthenticated } = useConvexAuth();
  const subscription = useQuery(
    api.subscriptions.getMine,
    isAuthenticated ? {} : "skip",
  );
  const createCheckout = useAction(api.stripe.createCheckoutSession);
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (plan: "starter" | "pro") => {
    if (!isAuthenticated) {
      navigate("/signup");
      return;
    }

    setLoadingPlan(plan);
    try {
      const result = await createCheckout({ plan });
      if (result.url) {
        window.location.href = result.url;
      } else {
        toast.error(result.error || "Failed to start checkout");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  const hasActiveSub =
    subscription && subscription.status === "active";

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-teal/5 rounded-full blur-3xl" />
        </div>
        <div className="container text-center">
          <Badge
            variant="outline"
            className="mb-4 text-teal border-teal/30 bg-teal/5"
          >
            <Sparkles className="size-3 mr-1" />
            14-Day Free Trial — Full Access
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start with a 14-day free trial — full access to every feature, no credit card required.
            Then choose the plan that fits your operation. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier) => {
              const isCurrentPlan =
                hasActiveSub && subscription?.plan === tier.id;
              const isLoading = loadingPlan === tier.id;

              return (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border p-6 md:p-8 flex flex-col ${
                    tier.featured
                      ? "border-teal bg-gradient-to-b from-teal/5 to-transparent shadow-lg shadow-teal/5"
                      : "bg-card"
                  }`}
                >
                  {tier.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-teal text-white hover:bg-teal-dark">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <tier.icon
                        className={`size-5 ${tier.featured ? "text-teal" : "text-muted-foreground"}`}
                      />
                      <h3 className="font-semibold text-lg">{tier.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.pricePer && (
                        <span className="text-muted-foreground text-sm">
                          {tier.pricePer}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {tier.description}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <div
                        key={feature}
                        className="flex gap-2.5 items-start text-sm"
                      >
                        <Check
                          className={`size-4 mt-0.5 shrink-0 ${
                            tier.featured
                              ? "text-teal"
                              : "text-muted-foreground"
                          }`}
                        />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {tier.id === "enterprise" ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <Link to="/contact">
                        Contact Sales
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className={`w-full ${
                        tier.featured
                          ? "bg-teal text-white hover:bg-teal-dark"
                          : ""
                      }`}
                      variant={tier.featured ? "default" : "outline"}
                      onClick={() =>
                        handleSubscribe(tier.id as "starter" | "pro")
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* All features note */}
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-teal/5 border border-teal/20">
              <Building2 className="size-5 text-teal shrink-0" />
              <p className="text-sm">
                <span className="font-medium">All plans include</span> — 14-day
                free trial, no credit card required to explore, and full
                onboarding support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 md:py-24 border-t bg-muted/20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Feature Comparison
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See exactly what's included in each tier.
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-center p-3 font-semibold">Starter</th>
                  <th className="text-center p-3 font-semibold text-teal">
                    Professional
                  </th>
                  <th className="text-center p-3 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Properties", "Up to 25", "Up to 150", "Unlimited"],
                  ["AI Scheduling", true, true, true],
                  ["Staff Management", true, true, true],
                  ["Mobile Access", true, true, true],
                  ["Basic Analytics", true, true, true],
                  ["Executive Dashboards", false, true, true],
                  [
                    "Payroll Integration",
                    "CSV only",
                    "ADP, Paychex, QB",
                    "Custom",
                  ],
                  ["Amenity Booking", false, true, true],
                  ["HOA Management", false, false, true],
                  ["API Access", false, true, true],
                  ["Custom Integrations", false, false, true],
                  ["Dedicated Account Manager", false, false, true],
                  ["SLA Guarantees", false, false, true],
                  ["Support", "Email", "Priority", "24/7 Dedicated"],
                ].map(([feature, starter, pro, enterprise]) => (
                  <tr key={feature as string} className="border-b">
                    <td className="p-3 text-muted-foreground">
                      {feature as string}
                    </td>
                    {[starter, pro, enterprise].map((val, i) => (
                      <td key={`${feature}-${i}`} className="text-center p-3">
                        {val === true ? (
                          <Check className="size-4 text-teal mx-auto" />
                        ) : val === false ? (
                          <span className="text-muted-foreground/40">—</span>
                        ) : (
                          <span className="text-xs">{val as string}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="border-b pb-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-navy text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Start Using QonsApp Today
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Join property management companies already saving 20+ hours per
            week. Start with a plan that fits your portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-base h-12 px-8 bg-teal text-white hover:bg-teal-dark"
              asChild
            >
              <Link to="/signup">
                Create Free Account
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12 px-8 border-white/30 text-white hover:bg-white/10"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
