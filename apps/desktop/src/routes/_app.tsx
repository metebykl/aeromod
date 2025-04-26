import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getOnboardingStatus } from "@/features/onboarding/api";
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
      <Sidebar />
      <main className="h-screen pl-16">
        <Outlet />
      </main>
    </>
  );
}
