import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Button } from "@aeromod/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aeromod/ui/components/select";
import { useGetAddons, useVerifyAddon } from "@/hooks/addon";
import { humanFileSize } from "@/lib/utils";

export const Route = createFileRoute("/verify")({
  component: Verify,
});

function Verify() {
  const { data: addons, isPending: isPendingAddons } = useGetAddons();
  const {
    mutate,
    data: verification,
    status: verificationStatus,
  } = useVerifyAddon();

  const [selected, setSelected] = useState<string>();

  if (isPendingAddons) {
    return (
      <div className="flex h-full flex-col p-4">
        <div className="flex w-full">
          <h1 className="text-2xl font-semibold">Verify</h1>
        </div>
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Verify</h1>
      </div>
      <div className="flex w-full items-center gap-x-2">
        <Select value={selected} onValueChange={(v) => setSelected(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select addon" />
          </SelectTrigger>
          <SelectContent>
            {addons?.map((addon) => (
              <SelectItem key={addon.id} value={addon.id}>
                <p>{addon.id}</p>
                <p className="text-muted-foreground">{addon.creator}</p>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          disabled={!selected}
          onClick={() => selected && mutate(selected)}
        >
          Verify
        </Button>
      </div>
      {verificationStatus === "pending" && (
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      )}
      {verificationStatus === "error" && (
        <div className="text-destructive flex size-full flex-col items-center justify-center gap-y-2">
          <AlertCircleIcon className="size-8" />
          <p>An error occured.</p>
        </div>
      )}
      {verificationStatus === "success" && (
        <div className="flex flex-col gap-y-2 overflow-y-auto">
          {verification?.files.map((f) => (
            <div
              key={f.path}
              className="bg-muted flex w-full items-center justify-between rounded px-3 py-1.5"
            >
              <div className="flex items-center gap-x-3">
                {f.status === "Ok" && (
                  <div className="size-4 rounded-full bg-green-500"></div>
                )}
                {f.status === "SizeMismatch" && (
                  <div className="size-4 rounded-full bg-yellow-500"></div>
                )}
                {f.status === "NotFound" && (
                  <div className="size-4 rounded-full bg-red-500"></div>
                )}
                <p className="text-sm">{f.path}</p>
              </div>
              <div className="flex items-center gap-x-3">
                <p className="text-muted-foreground text-sm">
                  {humanFileSize(f.size)}
                </p>
                {f.status === "SizeMismatch" && (
                  <div className="flex items-center gap-x-2 text-sm text-amber-500">
                    <AlertCircleIcon className="size-4" />
                    Size Mismatch
                  </div>
                )}
                {f.status === "NotFound" && (
                  <div className="flex items-center gap-x-2 text-sm text-red-500">
                    <AlertCircleIcon className="size-4" />
                    Not Found
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
