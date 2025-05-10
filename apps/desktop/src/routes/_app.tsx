import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getOnboardingStatus } from "@/features/onboarding/api";
import { AppBar } from "@/components/app-bar";
import { Sidebar } from "@/components/sidebar";

export const Route = createFileRoute("/_app")({
  component: Layout,
  beforeLoad: async () => {
    const complete = await getOnboardingStatus();
    if (!complete) {
      throw redirect({ to: "/onboarding" });
    }
  },
});

function Layout() {
  return (
    <>
      <AppBar />
      <Sidebar />
      <main className="h-screen pl-16 pt-7">
        <Outlet />
      </main>
    </>
  );
}
