import { createFileRoute } from "@tanstack/react-router";
import { DownloadIcon, Loader2 } from "lucide-react";
import { Button } from "@aeromod/ui/components/button";
import { useGetAddons, useInstallAddon } from "@/hooks/addon";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const {
    data: addons,
    isLoading: isLoadingAddons,
    refetch: refetchAddons,
  } = useGetAddons();

  const installMutation = useInstallAddon({
    onSuccess: (done) => {
      if (done) {
        refetchAddons();
      }
    },
  });

  if (isLoadingAddons) {
    return (
      <div className="flex h-full flex-col gap-y-4 p-4">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-2xl font-semibold">Addons</h1>
        </div>
        <div className="flex size-full items-center justify-center">
          <Loader2 className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Addons</h1>
        {/* TODO: search bar */}
        <Button
          onClick={() => installMutation.mutate()}
          disabled={installMutation.isPending}
        >
          {installMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <DownloadIcon className="size-4" />
          )}
          {installMutation.isPending ? "Installing..." : "Install"}
        </Button>
      </div>
      <div className="flex flex-col gap-y-2 overflow-y-auto">
        {addons?.map((addon) => (
          <div
            key={addon.id}
            className="bg-muted flex items-center justify-between rounded-md border px-4 py-3"
          >
            {addon.id}
          </div>
        ))}
      </div>
    </div>
  );
}
