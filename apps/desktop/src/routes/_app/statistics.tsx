import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Bar, BarChart, Label, Pie, PieChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@aeromod/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@aeromod/ui/components/chart";
import { useGetAddons } from "@/hooks/addon";
import { humanFileSize } from "@/lib/utils";

export const Route = createFileRoute("/_app/statistics")({
  component: Statistics,
});

const typeChartConfig = {
  count: {
    label: "Count",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  status: {
    label: "Status",
  },
  enabled: {
    label: "Enabled",
    color: "var(--chart-1)",
  },
  disabled: {
    label: "Disabled",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

function Statistics() {
  const {
    data: addons,
    isPending: isPendingAddons,
    isError: isErrorAddons,
  } = useGetAddons();

  const stats = useMemo(() => {
    if (!addons) return null;

    const addonCount = addons.length;
    const enabledCount = addons.filter((a) => a.enabled).length;

    const totalSize = addons.reduce((acc, addon) => acc + addon.size, 0);
    const averageSize = totalSize / addonCount;

    const typeChartData = Object.entries(
      addons.reduce(
        (acc, addon) => {
          const type = addon.content_type.trim().toUpperCase() || "UNKNOWN";
          acc[type] = (acc[type] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      )
    ).map(([key, value]) => ({ type: key, count: value }));

    const statusChartData = [
      {
        status: "enabled",
        count: enabledCount,
        fill: "var(--color-enabled)",
      },
      {
        status: "disabled",
        count: addonCount - enabledCount,
        fill: "var(--color-disabled)",
      },
    ];

    return {
      addonCount,
      enabledCount,
      totalSize,
      averageSize,
      typeChartData,
      statusChartData,
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
      <div className="grid grid-cols-3 gap-4">
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
        <Card>
          <CardHeader>
            <CardDescription>Average Size</CardDescription>
            <CardTitle className="text-3xl">
              {humanFileSize(stats?.averageSize ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Addon Types</CardTitle>
            <CardDescription>Distribution by content type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={typeChartConfig}>
              <BarChart
                accessibilityLayer
                data={stats?.typeChartData}
                layout="vertical"
                margin={{
                  left: 20,
                }}
              >
                <XAxis type="number" dataKey="count" hide />
                <YAxis
                  dataKey="type"
                  type="category"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="count" fill="var(--color-count)" radius={5} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Addon Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig}>
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={stats?.statusChartData}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-3xl font-bold"
                            >
                              {stats?.enabledCount.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy ?? 0) + 24}
                              className="fill-muted-foreground"
                            >
                              Enabled
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
