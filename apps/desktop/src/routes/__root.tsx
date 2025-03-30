import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Sidebar } from "@/components/sidebar";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <>
      <Sidebar />
      <main className="h-screen pl-16">
        <Outlet />
      </main>
    </>
  );
}
