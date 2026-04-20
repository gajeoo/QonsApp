import { useAction, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";
import { PayPalCheckoutButton } from "@/components/PayPalButton";
import { APP_NAME } from "@/lib/constants";

const allFeatures = [
  "Unlimited properties & buildings",
  "AI-powered scheduling engine",
  "Complete HOA management suite",
  "Staff & resident management",
  "Interactive property maps",
  "GPS time tracking & clock-in",
  "Payroll exports (ADP, Paychex, QuickBooks, CSV)",
  "Executive analytics dashboard",
  "Team collaboration & task delegation",
  "Amenity booking system",
  "Sub-accounts with role-based access",
  "AI chat widget + admin inbox",
  "Shift swap management",
  "Reserve fund tracking",
  "Board vote management",
  "Resident messaging & announcements",
  "Custom reports",
  "Priority support",
];

const faqs = [
  {
    question: "Can I try before I buy?",
    answer:
      "Yes! Every new account gets a 14-day free trial with full access to all features. No credit card required.",
  },
  {
    question: "What happens after my trial ends?",
    answer:
      "After 14 days, you'll need to subscribe at $49.99/month to continue using the platform. Your data is preserved — just subscribe to pick up where you left off.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. Cancel anytime from your settings. You'll retain access through the end of your billing period.",
  },
  {
    question: "Do team members need their own subscription?",
    answer:
      "No! Invite unlimited staff, managers, and workers — their accounts are linked to your subscription automatically.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. We use enterprise-grade encryption, real-time database with automatic backups, and follow industry best practices for data security.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept payments securely through PayPal. You can use your PayPal balance, linked bank account, or any card connected to your PayPal account.",
  },
];

export function PricingPage() {
  const { isAuthenticated } = useConvexAuth();
  const subscription = useQuery(
    api.subscriptions.getMine,
    isAuthenticated ? {} : "skip",
  );
  const checkPayPal = useAction(api.paypal.isConfigured);
  const navigate = useNavigate();
  const [paypalClientId, setPaypalClientId] = useState<string | null>(
    import.meta.env.VITE_PAYPAL_CLIENT_ID || null,
  );
  const [showPayPal, setShowPayPal] = useState(false);

  useEffect(() => {
    if (paypalClientId) return;
    checkPayPal({}).then((r) => {
      if (r.configured && r.clientId) setPaypalClientId(r.clientId);
    }).catch(() => {});
  }, []);

  const hasActiveSub = subscription && (subscription.status === "active" || subscription.status === "trialing");

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative py-20 md:py-28">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sky-500/5 rounded-full blur-3xl" />
        </div>
        <div className="container text-center">
          <Badge variant="outline" className="mb-4 text-sky-600 border-sky-500/30 bg-sky-500/5">
            <Sparkles className="size-3 mr-1" />
            14-Day Free Trial — Full Access
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            One Plan. Everything Included.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No confusing tiers. No hidden fees. Get every feature for one simple price.
            Start with a 14-day free trial — no credit card required.
          </p>
        </div>
      </section>

      {/* Single Pricing Card */}
      <section className="pb-20 md:pb-28">
        <div className="container">
          <div className="max-w-xl mx-auto">
            <div className="relative rounded-3xl border-2 border-sky-500 bg-white dark:bg-slate-900 p-8 md:p-10 shadow-xl shadow-sky-500/10">
              {/* Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                  <Sparkles className="size-3.5" />
                  Start Free — No Credit Card
                </div>
              </div>

              <div className="text-center mb-8 pt-2">
                <h3 className="text-2xl font-bold mb-3">{APP_NAME} Premium</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-bold tracking-tight">$49</span>
                  <span className="text-3xl font-bold">.99</span>
                  <span className="text-muted-foreground ml-1 text-lg">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  14-day free trial included. Cancel anytime.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {allFeatures.map((feature) => (
                  <div key={feature} className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-4 text-sky-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {hasActiveSub ? (
                <Button size="lg" variant="outline" className="w-full h-13 text-base" disabled>
                  ✓ You're Subscribed
                </Button>
              ) : (
                <div className="space-y-3">
                  {!isAuthenticated ? (
                    <Button
                      size="lg"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white h-13 text-base font-semibold rounded-xl"
                      asChild
                    >
                      <Link to="/signup">
                        Start Free 14-Day Trial <ArrowRight className="size-4 ml-2" />
                      </Link>
                    </Button>
                  ) : paypalClientId ? (
                    <>
                      {!showPayPal ? (
                        <Button
                          size="lg"
                          className="w-full bg-[#0070ba] hover:bg-[#003087] text-white h-13 text-base font-semibold rounded-xl"
                          onClick={() => setShowPayPal(true)}
                        >
                          Subscribe with PayPal <ArrowRight className="size-4 ml-2" />
                        </Button>
                      ) : (
                        <div className="pt-1">
                          <PayPalCheckoutButton
                            plan="starter"
                            clientId={paypalClientId}
                            onSuccess={() => navigate("/dashboard")}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white h-13 text-base font-semibold rounded-xl"
                      disabled
                    >
                      <Loader2 className="size-4 animate-spin mr-2" /> Loading payment...
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trust signals */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Check className="size-4 text-sky-500" /> No credit card for trial</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-sky-500" /> Cancel anytime</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-sky-500" /> Unlimited team members</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-sky-500" /> Unlimited properties</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50">
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
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-blue-600 to-violet-600" />
        <div className="relative container text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Ready to Get Started?
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
            Join property professionals who manage their entire portfolio from one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-base h-12 px-8 bg-white text-sky-600 hover:bg-white/90 rounded-xl font-semibold"
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
              className="text-base h-12 px-8 border-white/30 text-white hover:bg-white/10 rounded-xl bg-transparent"
              asChild
            >
              <Link to="/contact">Talk to Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
