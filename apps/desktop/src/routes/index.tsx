import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { invoke } from "@tauri-apps/api/core";

import type { Addon } from "@/api/types";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const [addons, setAddons] = useState<Addon[]>();

  useEffect(() => {
    const getAddons = async () => {
      try {
        const data = await invoke<Addon[]>("get_addons");
        setAddons(data);
      } catch (error) {
        console.error(error);
      }
    };

    getAddons();
  }, []);

  return (
    <div>
      <h1>Home Page</h1>
      <pre>
        <code>{JSON.stringify(addons, null, 4)}</code>
      </pre>
    </div>
  );
}
