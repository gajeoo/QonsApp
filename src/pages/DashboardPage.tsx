import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileSpreadsheet,
  Gavel,
  Settings,
  Sparkles,
  TreePalm,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "../../convex/_generated/api";
import { TrialBanner } from "@/components/FeatureGate";

export function DashboardPage() {
  const user = useQuery(api.auth.currentUser);
  const subscription = useQuery(api.subscriptions.getMine);
  const onboarding = useQuery(api.onboarding.getMine);
  const propertyStats = useQuery(api.properties.getStats);
  const staffStats = useQuery(api.staffMembers.getStats);
  const shiftStats = useQuery(api.shifts.getStats);
  const timeStats = useQuery(api.timeTracking.getStats, {});
  const ensureProfile = useMutation(api.admin.ensureProfile);

  useEffect(() => {
    if (user) { ensureProfile().catch(() => {}); }
  }, [user, ensureProfile]);

  const hasSubscription = subscription && (subscription.status === "active" || subscription.status === "trialing");

  const onboardingComplete = onboarding?.completed === true;

  const setupSteps = [
    { done: true, label: "Create account" },
    { done: !!hasSubscription, label: "Choose a plan" },
    { done: !!onboardingComplete, label: "Complete onboarding" },
  ];
  const completedSteps = setupSteps.filter((s) => s.done).length;
  const progressPercent = Math.round((completedSteps / setupSteps.length) * 100);

  const planName = "Premium";

  const renewsOn = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="space-y-8">
      {/* Trial Banner */}
      <TrialBanner />

      {/* Welcome */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1">
          {hasSubscription ? "Manage your QuonsApp operations from here" : "Get started with QuonsApp"}
        </p>
      </div>

      {/* Setup Progress */}
      {progressPercent < 100 && (
        <Card className="bg-gradient-to-br from-teal/5 to-transparent border-teal/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="size-5 text-teal" /> Getting Started</CardTitle>
            <CardDescription>Complete these steps to get the most out of QuonsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Progress value={progressPercent} className="flex-1 h-2" />
              <span className="text-sm font-medium text-muted-foreground">{completedSteps}/{setupSteps.length}</span>
            </div>
            <div className="space-y-3">
              {setupSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  {step.done ? <CheckCircle2 className="size-5 text-teal shrink-0" /> : <div className="size-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  <span className={`text-sm ${step.done ? "line-through text-muted-foreground" : "font-medium"}`}>{step.label}</span>
                  {!step.done && i === 1 && <Button variant="outline" size="sm" className="ml-auto" asChild><Link to="/pricing">Choose Plan <ArrowRight className="size-3" /></Link></Button>}
                  {!step.done && i === 2 && hasSubscription && <Button variant="outline" size="sm" className="ml-auto" asChild><Link to="/onboarding">Complete Setup <ArrowRight className="size-3" /></Link></Button>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Properties", value: propertyStats?.active ?? 0, sub: `${propertyStats?.totalUnits ?? 0} units`, icon: Building2, color: "text-teal bg-teal/10" },
          { label: "Active Staff", value: staffStats?.active ?? 0, sub: `${staffStats?.total ?? 0} total`, icon: Users, color: "text-blue-600 bg-blue-100" },
          { label: "Scheduled Shifts", value: shiftStats?.scheduled ?? 0, sub: `${shiftStats?.open ?? 0} open`, icon: Calendar, color: "text-purple-600 bg-purple-100" },
          { label: "Hours Tracked", value: timeStats?.totalHours ?? 0, sub: `${timeStats?.activeNow ?? 0} active now`, icon: Clock, color: "text-amber-600 bg-amber-100" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-xl p-2.5 ${s.color}`}><s.icon className="size-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-[10px] text-muted-foreground/70">{s.sub}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscription + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="size-5 text-teal" /> Your Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            {hasSubscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold">{planName} Plan</p>
                    <p className="text-sm text-muted-foreground">{subscription.cancelAtPeriodEnd ? `Cancels on ${renewsOn}` : `Renews on ${renewsOn}`}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${subscription.status === "active" ? "bg-teal/10 text-teal" : subscription.status === "past_due" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}>
                    {subscription.status === "active" ? "Active" : subscription.status.replace("_", " ")}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/settings"><ExternalLink className="size-4" /> Manage Billing</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="size-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No active subscription</p>
                <Button className="bg-teal text-white hover:bg-teal-dark" size="sm" asChild><Link to="/pricing">View Plans <ArrowRight className="size-3.5" /></Link></Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="size-5 text-muted-foreground" /> Quick Actions</CardTitle></CardHeader>
          <CardContent className="grid gap-3">
            {[
              { label: "Add Property", href: "/properties", icon: Building2, desc: "Add and manage your buildings" },
              { label: "Manage Staff", href: "/staff", icon: Users, desc: "Add team members and set availability" },
              { label: "View Schedule", href: "/schedule", icon: Calendar, desc: "See today's shifts and auto-schedule" },
              { label: "Company Setup", href: "/onboarding", icon: Settings, desc: "Configure your company details" },
            ].map((action) => (
              <Button key={action.label} variant="outline" className="justify-between h-auto py-3 px-4 group" asChild>
                <Link to={action.href}>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2 transition-colors group-hover:bg-primary/10"><action.icon className="size-4 transition-colors group-hover:text-primary" /></div>
                    <div className="text-left">
                      <span className="text-sm font-medium block">{action.label}</span>
                      <span className="text-xs text-muted-foreground">{action.desc}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Platform Features — Active Links */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Features</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Sparkles, title: "AI Scheduling", desc: "Intelligent staff-to-property matching with one click", color: "text-teal bg-teal/10", href: "/schedule" },
            { icon: Building2, title: "Property Manager", desc: "Add, edit, and manage all your properties", color: "text-blue-600 bg-blue-100", href: "/properties" },
            { icon: Users, title: "Staff Directory", desc: "Track availability, certifications, and skills", color: "text-purple-600 bg-purple-100", href: "/staff" },
            { icon: Calendar, title: "Shift Calendar", desc: "Weekly view with drag-and-drop scheduling", color: "text-amber-600 bg-amber-100", href: "/schedule" },
            { icon: Clock, title: "GPS Time Tracking", desc: "Mobile clock-in with GPS verification", color: "text-green-600 bg-green-100", href: "/time-tracking" },
            { icon: FileSpreadsheet, title: "Payroll Export", desc: "ADP, Paychex, QuickBooks, CSV export", color: "text-red-600 bg-red-100", href: "/payroll" },
            { icon: BarChart3, title: "Executive Analytics", desc: "Utilization, cost-per-building, performance", color: "text-indigo-600 bg-indigo-100", href: "/analytics" },
            { icon: TreePalm, title: "Amenity Booking", desc: "Pool, gym, rooftop — resident reservations", color: "text-cyan-600 bg-cyan-100", href: "/amenities" },
            { icon: Gavel, title: "HOA Management", desc: "Violations, dues, voting, ARC requests, messaging", color: "text-orange-600 bg-orange-100", href: "/hoa" },
          ].map((feature) => (
            <Link key={feature.title} to={feature.href} className="group">
              <Card className="h-full hover:shadow-md transition-all hover:border-teal/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`inline-flex size-10 items-center justify-center rounded-xl ${feature.color}`}>
                      <feature.icon className="size-5" />
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="font-semibold text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
