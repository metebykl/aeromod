import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aeromod/ui/components/card";
import { useGetAddons } from "@/hooks/addon";
import { humanFileSize } from "@/lib/utils";

export const Route = createFileRoute("/_app/statistics")({
  component: Statistics,
});

function Statistics() {
  const {
    data: addons,
    isPending: isPendingAddons,
    isError: isErrorAddons,
  } = useGetAddons();

  const stats = useMemo(() => {
    if (!addons) return null;

    const addonCount = addons.length;
    const totalSize = addons.reduce((acc, addon) => acc + addon.size, 0);

    return {
      addonCount,
      totalSize,
    };
  }, [addons]);

  if (isPendingAddons) {
    return (
      <div className="flex h-full flex-col gap-y-6 p-4">
        <div className="flex w-full">
          <h1 className="text-2xl font-semibold">Statistics</h1>
        </div>
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isErrorAddons) {
    return (
      <div className="flex h-full flex-col gap-y-6 p-4">
        <div className="flex w-full">
          <h1 className="text-2xl font-semibold">Statistics</h1>
        </div>
        <div className="flex size-full flex-col items-center justify-center gap-y-2">
          <AlertCircleIcon className="text-destructive size-8" />
          <p className="text-destructive">An error occured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Statistics</h1>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Addons</CardDescription>
            <CardTitle className="text-3xl">{stats?.addonCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Size</CardDescription>
            <CardTitle className="text-3xl">
              {humanFileSize(stats?.totalSize ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
