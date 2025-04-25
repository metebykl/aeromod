import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useEventListener } from "@/hooks/use-event-listener";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  useEventListener("contextmenu", (e) => {
    // Disable context menu for production
    if (import.meta.env.PROD) {
      e.preventDefault();
    }
  });

  return (
    <>
      <Outlet />
    </>
  );
}
