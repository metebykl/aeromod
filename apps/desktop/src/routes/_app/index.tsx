import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DownloadIcon,
  FolderSymlinkIcon,
  Loader2,
  MoreHorizontalIcon,
  PencilIcon,
  RefreshCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@aeromod/ui/components/button";
import { Checkbox } from "@aeromod/ui/components/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@aeromod/ui/components/dropdown-menu";
import { Input } from "@aeromod/ui/components/input";
import { type Addon, revealAddon } from "@/api/addon";
import { Hint } from "@/components/hint";
import {
  useDisableAddon,
  useEnableAddon,
  useGetAddons,
  useInstallAddon,
  useRenameAddon,
  useUninstallAddon,
} from "@/hooks/addon";
import { useConfirm } from "@/hooks/confirm";
import { usePrompt } from "@/hooks/prompt";

export const Route = createFileRoute("/_app/")({
  component: Index,
});

function Index() {
  const {
    data: addons,
    isLoading: isLoadingAddons,
    refetch: refetchAddons,
  } = useGetAddons();

  const install = useInstallAddon({
    onSuccess: (done) => {
      if (done) {
        toast.success("Addon installed.");
        refetchAddons();
      }
    },
  });

  const [search, setSearch] = useState<string>("");
  const filteredAddons = useMemo(
    () =>
      addons?.filter((a) =>
        a.id.toLowerCase().trim().includes(search.toLowerCase().trim())
      ),
    [addons, search]
  );

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
    <div className="flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Addons</h1>
        <div className="flex items-center gap-x-2">
          <Hint label="Reload Addons">
            <Button variant="ghost" size="icon" onClick={() => refetchAddons()}>
              <RefreshCcwIcon />
            </Button>
          </Hint>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[300px]"
            placeholder="Search addons..."
          />
          <Button onClick={() => install.mutate()} disabled={install.isPending}>
            {install.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DownloadIcon className="size-4" />
            )}
            {install.isPending ? "Installing..." : "Install"}
          </Button>
        </div>
      </div>
      <AddonList addons={filteredAddons ?? []} refetchAddons={refetchAddons} />
    </div>
  );
}

interface AddonListProps {
  addons: Addon[];
  refetchAddons: () => void;
}

function AddonList({ addons, refetchAddons }: AddonListProps) {
  const [ConfirmDialog, confirm] = useConfirm();
  const [PromptDialog, prompt] = usePrompt();

  const enable = useEnableAddon({
    onSuccess: () => {
      toast.success("Addon enabled.");
      refetchAddons();
    },
  });

  const disable = useDisableAddon({
    onSuccess: () => {
      toast.success("Addon disabled.");
      refetchAddons();
    },
  });

  const uninstall = useUninstallAddon({
    onSuccess: () => {
      toast.success("Addon uninstalled.");
      refetchAddons();
    },
  });

  const rename = useRenameAddon({
    onSuccess: () => {
      toast.success("Addon renamed.");
      refetchAddons();
    },
  });

  const handleUninstall = async (id: Addon["id"]) => {
    const ok = await confirm({
      title: `Are you sure?`,
      description: `This action cannot be undone. This will permanently uninstall ${id}.`,
    });

    if (ok) {
      uninstall.mutate(id);
    }
  };

  const handleRename = async (id: Addon["id"]) => {
    const name = await prompt({
      title: "Rename addon",
      description: "Specify a new identifier for the addon.",
      initialValue: id,
    });

    rename.mutate({ id: id, newId: name });
  };

  return (
    <>
      <div className="flex flex-col gap-y-2 overflow-y-auto">
        {addons.map((addon) => (
          <div
            key={addon.id}
            className="bg-muted flex items-center justify-between rounded-md border px-4 py-1"
          >
            <div className="flex items-center gap-x-4">
              <Checkbox
                checked={addon.enabled}
                onCheckedChange={(value) => {
                  if (value === "indeterminate") return;
                  value ? enable.mutate(addon.id) : disable.mutate(addon.id);
                }}
              />
              <div>
                <Link
                  to="/addons/$addonId"
                  params={{ addonId: addon.id }}
                  className="underline"
                >
                  {addon.id}
                </Link>
                <div className="flex items-center gap-x-2">
                  <p className="text-muted-foreground text-sm">
                    {addon.creator}
                  </p>
                  <p className="text-sm">v{addon.version}</p>
                </div>
              </div>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem
                  onSelect={() => revealAddon(addon.id)}
                  className="cursor-pointer gap-x-2"
                >
                  <FolderSymlinkIcon />
                  <span>Open</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleRename(addon.id)}
                  className="cursor-pointer gap-x-2"
                >
                  <PencilIcon />
                  <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => handleUninstall(addon.id)}
                  className="cursor-pointer gap-x-2"
                >
                  <Trash2Icon />
                  <span>Uninstall</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
      <ConfirmDialog />
      <PromptDialog />
    </>
  );
}
