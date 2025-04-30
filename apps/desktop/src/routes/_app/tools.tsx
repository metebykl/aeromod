import { createFileRoute } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@aeromod/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aeromod/ui/components/card";
import {
  useClearRollingCache,
  useClearSceneryIndexes,
} from "@/features/sim/hooks";

export const Route = createFileRoute("/_app/tools")({
  component: Tools,
});

function Tools() {
  const rollingCacheMutation = useClearRollingCache({
    onSuccess: () => toast.success("Rolling cache cleared."),
  });

  const sceneryIndexMutation = useClearSceneryIndexes({
    onSuccess: () => toast.success("Scenery indexes cleared."),
  });

  return (
    <div className="flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Sim Tools</h1>
      </div>
      <div className="flex flex-col gap-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clear Rolling Cache</CardTitle>
            <CardDescription>
              Rolling Cache automatically stores world data such as aerial
              imagery, elevation models (DEM), terrain data (TIN), and vectors
              while flying or exploring the World Map. This reduces the need to
              re-download the same data multiple times and improves performance,
              especially when flying over the same areas repeatedly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              disabled={rollingCacheMutation.isPending}
              onClick={() => rollingCacheMutation.mutate()}
            >
              <Trash2Icon /> Clear Rolling Cache
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Clear Scenery Indexes</CardTitle>
            <CardDescription>
              Scenery Indexes are used to organize and optimize the loading of
              custom and default scenery files. Clearing the scenery indexes
              forces the simulator to rebuild its internal database of scenery
              elements, which can help resolve loading issues, fix missing
              scenery, or ensure newly added add-ons are correctly registered.
              This is especially useful after installing, removing, or modifying
              scenery packages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              variant="outline"
              disabled={sceneryIndexMutation.isPending}
              onClick={() => sceneryIndexMutation.mutate()}
            >
              <Trash2Icon /> Clear Scenery Indexes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
