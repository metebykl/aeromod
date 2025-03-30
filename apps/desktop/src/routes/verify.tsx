import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/verify")({
  component: Verify,
});

function Verify() {
  return <div>Verify Page</div>;
}
