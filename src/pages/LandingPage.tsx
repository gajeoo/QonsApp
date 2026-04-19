import {
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Laptop,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { value: "$88B+", label: "US Property Management Market" },
  { value: "20-30hrs", label: "Saved Weekly on Scheduling" },
  { value: "500+", label: "Buildings Per Dashboard" },
  { value: "8.7%", label: "Market CAGR Through 2034" },
];

const steps = [
  {
    step: "01",
    title: "Connect Your Properties",
    description:
      "Import your buildings, staff, and schedules. QonsApp maps your entire portfolio in minutes — from a 10-building operation to 500+ properties.",
  },
  {
    step: "02",
    title: "Let AI Optimize",
    description:
      "Our AI engine matches staff to properties based on availability, certifications, proximity, and cost targets. Emergency coverage? Handled in seconds.",
  },
  {
    step: "03",
    title: "Manage & Scale",
    description:
      "Run payroll, track performance, book amenities, and manage HOA operations — all from one real-time dashboard. Scale without adding headcount.",
  },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Scheduling",
    description:
      "Match staff to properties automatically based on availability, certifications, and cost targets. Fill emergency shifts in seconds, not hours.",
    color: "text-teal bg-teal/10",
  },
  {
    icon: Building2,
    title: "Multi-Property Dashboard",
    description:
      "Manage 10 to 500+ buildings from a centralized command center. Interactive maps, regional grouping, and real-time status across your portfolio.",
    color: "text-chart-2 bg-chart-2/10",
  },
  {
    icon: BarChart3,
    title: "Executive Analytics",
    description:
      "CFO-ready dashboards with utilization rates, payroll breakdowns, and profitability insights. Know your numbers in real time, not quarterly.",
    color: "text-chart-4 bg-chart-4/10",
  },
  {
    icon: Smartphone,
    title: "Mobile-First Platform",
    description:
      "Real-time notifications, GPS clock-in, and time tracking built for field teams. Your staff have everything they need in their pocket.",
    color: "text-chart-3 bg-chart-3/10",
  },
  {
    icon: DollarSign,
    title: "Payroll Exports",
    description:
      "ADP, Paychex, QuickBooks — export to any system. Auto-calculated overtime, shift differentials, and compliance built in.",
    color: "text-chart-5 bg-chart-5/10",
  },
  {
    icon: Calendar,
    title: "Amenity Booking",
    description:
      "Residents book amenities directly. Pool, gym, party room, parking — all managed with availability calendars and automated approvals.",
    color: "text-chart-1 bg-chart-1/10",
  },
];

const testimonials = [
  {
    quote:
      "We went from spending 25 hours a week on scheduling to under 2. QonsApp's AI just handles it.",
    name: "Operations Director",
    title: "Concierge Management Firm, NYC",
  },
  {
    quote:
      "Finally, a platform that understands multi-property complexity. We manage 200+ buildings from one screen.",
    name: "VP of Operations",
    title: "National Property Services Company",
  },
  {
    quote:
      "The executive dashboards alone saved us. Real-time payroll visibility changed how our CFO operates.",
    name: "Regional Manager",
    title: "Luxury Residential Portfolio, Miami",
  },
];

export function LandingPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32">
        {/* Background pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-teal/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-background text-xs font-medium text-teal">
            <Zap className="size-3" />
            14-Day Free Trial — No Credit Card Required
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            Stop Losing Hours to{" "}
            <span className="text-teal">Manual Scheduling</span>
          </h1>

          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            QonsApp is the AI-powered platform that replaces spreadsheets, phone
            trees, and disconnected tools with one system for scheduling, staff
            management, building operations, and executive analytics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              size="lg"
              className="text-base h-12 px-8 bg-teal text-white hover:bg-teal-dark"
              asChild
            >
              <Link to="/contact">
                Start Free Trial
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base h-12 px-8"
              asChild
            >
              <Link to="/features">See All Features</Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-teal" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-teal" />
              <span>No credit card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-4 text-teal" />
              <span>Set up in minutes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y bg-muted/30">
        <div className="container py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-bold text-navy">
                  {stat.value}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
              How It Works
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Up and Running in Three Steps
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Whether you manage 10 properties or 500, QonsApp scales with you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((item) => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-bold text-teal/15 mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-28 border-t bg-muted/20">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
              Features
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Everything You Need to Run Operations
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              From AI scheduling to payroll exports, QonsApp replaces your entire
              toolkit with one intelligent platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-background to-muted/50 border p-6 md:p-8 transition-all hover:shadow-lg hover:border-foreground/20"
              >
                <div className="relative">
                  <div
                    className={`inline-flex size-11 items-center justify-center rounded-xl ${feature.color} mb-5`}
                  >
                    <feature.icon className="size-5" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button variant="outline" size="lg" asChild>
              <Link to="/features">
                Explore All Features
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points / Why QonsApp */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
                The Problem
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Manual Operations Don't Scale
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: Clock,
                    text: "20-30 hours/week lost to manual scheduling across multiple properties",
                  },
                  {
                    icon: Building2,
                    text: "Systems break down beyond 10-15 properties — spreadsheets can't keep up",
                  },
                  {
                    icon: DollarSign,
                    text: "$4,800+ per employee lost annually to scheduling inefficiencies",
                  },
                  {
                    icon: Users,
                    text: "Zero real-time visibility into staff performance and utilization",
                  },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex gap-3 items-start text-sm"
                  >
                    <div className="mt-0.5 size-8 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <item.icon className="size-4 text-destructive" />
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-teal/5 to-navy/5 rounded-2xl border p-8 md:p-10">
              <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
                The Solution
              </p>
              <h3 className="text-2xl font-bold mb-4">QonsApp Automates It All</h3>
              <div className="space-y-3">
                {[
                  "AI fills shifts in seconds — not hours of phone calls",
                  "One dashboard for 10 to 500+ properties",
                  "Real-time analytics for executives and field teams",
                  "Payroll exports to ADP, Paychex, QuickBooks",
                  "Mobile GPS clock-in and time tracking",
                  "Amenity booking and HOA management built in",
                ].map((item) => (
                  <div key={item} className="flex gap-2.5 items-start text-sm">
                    <Check className="size-4 text-teal mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 md:py-28 border-t bg-muted/20">
        <div className="container">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
              Trusted by Property Professionals
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              What Our Early Adopters Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-card rounded-2xl border p-6 md:p-8"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Sparkles
                      key={star}
                      className="size-4 text-teal fill-teal"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6 text-muted-foreground italic">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Competitors */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-teal mb-3 tracking-wide uppercase">
              Why QonsApp
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              The AI-Native Alternative
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Legacy platforms like BuildingLink, Yardi Breeze, and AppFolio
              weren't built for AI. QonsApp is purpose-built from the ground up
              with artificial intelligence at its core.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="font-semibold p-3" />
              <div className="font-semibold text-center p-3 bg-teal/10 rounded-t-xl text-teal">
                QonsApp
              </div>
              <div className="font-semibold text-center p-3 text-muted-foreground">
                BuildingLink
              </div>
              <div className="font-semibold text-center p-3 text-muted-foreground">
                AppFolio
              </div>
              {[
                ["AI Scheduling", true, false, false],
                ["Multi-Property (500+)", true, false, true],
                ["Real-Time Analytics", true, false, true],
                ["Mobile GPS Clock-in", true, false, false],
                ["Payroll Integration", true, false, true],
                ["Amenity Booking", true, true, false],
                ["HOA Management", true, false, true],
                ["14-Day Free Trial", true, false, false],
              ].map(([feature, q, b, a]) => (
                <div
                  key={feature as string}
                  className="contents [&>div]:border-t [&>div]:p-3"
                >
                  <div className="text-muted-foreground">{feature as string}</div>
                  <div className="text-center bg-teal/5">
                    {q ? (
                      <Check className="size-4 text-teal mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                  <div className="text-center">
                    {b ? (
                      <Check className="size-4 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                  <div className="text-center">
                    {a ? (
                      <Check className="size-4 text-muted-foreground mx-auto" />
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-navy text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-xs font-medium">
              <Laptop className="size-3" />
              Start Your Free Trial
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Join the early adopters who are already saving 20+ hours per week.
              Get full access to every QonsApp feature free for 14 days. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                size="lg"
                className="text-base h-12 px-8 bg-teal text-white hover:bg-teal-dark"
                asChild
              >
                <Link to="/contact">
                  Start Free Trial
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-base h-12 px-8 border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
