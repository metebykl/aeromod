import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@aeromod/ui/components/breadcrumb";
import { useGetAddon } from "@/hooks/addon";

export const Route = createFileRoute("/addons/$addonId")({
  component: Addon,
});

function Addon() {
  const { addonId } = Route.useParams();
  const { data: addon, isPending, isError } = useGetAddon(addonId);

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
      <div className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-xl">{addon.name}</h1>
          <p className="text-muted-foreground text-sm">{addon.creator}</p>
        </div>
        <div className="flex items-center gap-x-2">
          <div className="text-muted-foreground px-3 py-2 font-mono">
            {addon.version}
          </div>
          <div className="bg-muted text-muted-foreground rounded border px-3 py-2 text-sm">
            {addon.content_type}
          </div>
        </div>
      </div>
      {/* TODO: display addon thumbnail and metadata */}
    </div>
  );
}
