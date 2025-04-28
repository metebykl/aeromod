import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  AlertCircleIcon,
  FolderSymlinkIcon,
  Loader2Icon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@aeromod/ui/components/button";
import { Switch } from "@aeromod/ui/components/switch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aeromod/ui/components/breadcrumb";
import {
  useDisableAddon,
  useEnableAddon,
  useGetAddon,
  useGetAddonThumbnail,
  useRenameAddon,
  useUninstallAddon,
} from "@/features/addons/hooks";
import type { Addon } from "@/features/addons/types";
import { revealAddon } from "@/features/addons/api";
import { useConfirm } from "@/hooks/use-confirm";
import { usePrompt } from "@/hooks/use-prompt";
import { humanFileSize } from "@/lib/utils";

export const Route = createFileRoute("/_app/addons/$addonId")({
  component: Addon,
});

function Addon() {
  const { addonId } = Route.useParams();
  const navigate = useNavigate();

  const { data: addon, isPending, isError, refetch } = useGetAddon(addonId);
  const {
    data: thumbnail,
    isPending: isPendingThumbnail,
    isError: isErrorThumbnail,
  } = useGetAddonThumbnail(addonId, { retry: false });

  const [ConfirmDialog, confirm] = useConfirm();
  const [PromptDialog, prompt] = usePrompt();

  const enable = useEnableAddon({
    onSuccess: () => {
      toast.success("Addon enabled.");
      refetch();
    },
  });

  const disable = useDisableAddon({
    onSuccess: () => {
      toast.success("Addon disabled.");
      refetch();
    },
  });

  const uninstall = useUninstallAddon({
    onSuccess: () => {
      toast.success("Addon uninstalled.");
      refetch();
      navigate({ to: "/" });
    },
  });

  const rename = useRenameAddon({
    onSuccess: () => {
      toast.success("Addon renamed.");
      refetch();
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
    navigate({ to: "/addons/$addonId", params: { addonId: name } });
  };

  if (isPending) {
    return (
      <div className="flex h-full flex-col gap-y-4 p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Addons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{addonId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex size-full items-center justify-center">
          <Loader2Icon className="size-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col gap-y-4 p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Addons</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{addonId}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex size-full flex-col items-center justify-center gap-y-2">
          <AlertCircleIcon className="text-destructive size-8" />
          <p className="text-destructive">An error occured.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-y-4 p-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Addons</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{addon.id}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex w-full justify-between">
        <div className="flex items-center gap-x-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold">{addon.name}</h1>
            <p className="text-muted-foreground">by {addon.creator}</p>
          </div>
          <Switch
            checked={addon.enabled}
            onCheckedChange={(checked) => {
              if (checked) {
                enable.mutate(addon.id);
              } else {
                disable.mutate(addon.id);
              }
            }}
          />
        </div>
        <div className="flex items-center gap-x-2">
          <Button variant="outline" onClick={() => handleRename(addon.id)}>
            <PencilIcon /> Rename
          </Button>
          <Button variant="outline" onClick={() => revealAddon(addon.id)}>
            <FolderSymlinkIcon /> Reveal
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleUninstall(addon.id)}
          >
            <Trash2Icon /> Uninstall
          </Button>
        </div>
      </div>
      <div className="flex w-full justify-between py-4">
        <div>
          <div className="flex items-center gap-x-2">
            <p className="text-muted-foreground">Id</p>
            <span>{addon.id}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <p className="text-muted-foreground">Version</p>
            <span>v{addon.version}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <p className="text-muted-foreground">Type</p>
            <span>{addon.content_type}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <p className="text-muted-foreground">Size</p>
            <span>{humanFileSize(addon.size)}</span>
          </div>
        </div>
        <div className="h-[170px] w-[412px] select-none">
          {thumbnail && <img className="size-full" src={thumbnail} />}
          {isPendingThumbnail && (
            <div className="bg-muted size-full animate-pulse"></div>
          )}
          {isErrorThumbnail && (
            <div className="bg-muted flex size-full items-center justify-center">
              <span className="text-muted-foreground">No Thumbnail</span>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog />
      <PromptDialog />
    </div>
  );
}
