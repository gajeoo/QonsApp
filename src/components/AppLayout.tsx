import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

export function AppLayout() {
  const { hasAccess, isLoading, currentPlan, role } = useFeatureAccess();
  const location = useLocation();

  // Wait until feature access is loaded
  if (isLoading) {
    return null;
  }

  // If trial expired and no plan, redirect to account-paused page
  // Admins are exempt — they always have access
  // Allow settings page access so users can manage their account
  // Allow pricing page access so they can subscribe
  if (
    !hasAccess &&
    currentPlan === "none" &&
    role !== "admin" &&
    location.pathname !== "/settings"
  ) {
    return <Navigate to="/account-paused" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
