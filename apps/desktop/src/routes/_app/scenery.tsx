import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon, RefreshCcwIcon } from "lucide-react";

import { Feature, type MapBrowserEvent, Overlay } from "ol";
import { Point } from "ol/geom";
import Map from "ol/map";
import View from "ol/view";
import { useGeographic } from "ol/proj";
import TileLayer from "ol/layer/tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/osm";

import { Button } from "@aeromod/ui/components/button";
import { Hint } from "@/components/hint";
import {
  useGetSceneryCache,
  useRebuildSceneryCache,
} from "@/features/scenery/hooks";
import type { SceneryAirport } from "@/features/scenery/types";

import "ol/ol.css";

export const Route = createFileRoute("/_app/scenery")({
  component: Scenery,
});

function Scenery() {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useGeographic();

  const {
    data: scenery,
    isPending: isPendingScenery,
    isError: isErrorScenery,
    refetch: refetchScenery,
  } = useGetSceneryCache();

  const { mutate: rebuildScenery, isPending: isPendingRebuildScenery } =
    useRebuildSceneryCache({
      onSuccess: () => refetchScenery(),
    });

  useEffect(() => {
    if (!containerRef.current) return;

    const osmLayer = new TileLayer({
      source: new OSM(),
    });

    const map = new Map({
      target: containerRef.current,
      layers: [osmLayer],
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    });

    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!scenery || !mapRef.current || !popupRef.current) return;

    const map = mapRef.current;

    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: false,
    });
    map.addOverlay(popupOverlay);

    const features = scenery.airports.map((airport) => {
      const marker = new Feature({
        geometry: new Point([airport.longitude, airport.latitude]),
        airport: airport,
      });

      return marker;
    });

    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
    });
    map.addLayer(markerLayer);

    const pointerMoveHandler = (e: MapBrowserEvent) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
      const mapTarget = map.getTargetElement();

      if (!feature || !popupRef.current) {
        mapTarget.style.cursor = "";
        popupOverlay.setPosition(undefined);
        return;
      }

      mapTarget.style.cursor = "pointer";

      const airport = feature.get("airport") as SceneryAirport;
      if (!airport) return;

      popupRef.current.innerHTML = `
        <p class="text-center font-semibold">${airport.icao}</p>
        <span class="text-muted-foreground text-xs">${airport.bgl_path}</span>
      `;

      popupOverlay.setPosition(e.coordinate);
    };

    const clickHandler = (e: MapBrowserEvent) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, (f) => f);
      if (!feature) return;

      const airport = feature.get("airport") as SceneryAirport;
      if (!airport) return;

      navigate({
        to: "/addons/$addonId",
        params: { addonId: airport.addon_id },
      });
    };

    map.on("pointermove", pointerMoveHandler);
    map.on("click", clickHandler);

    return () => {
      map.removeLayer(markerLayer);
      map.removeOverlay(popupOverlay);
      map.un("pointermove", pointerMoveHandler);
      map.un("click", clickHandler);
    };
  }, [scenery, navigate]);

  return (
    <div className="relative flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold">Scenery Map</h1>
        <Hint label="Reload Scenery">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => rebuildScenery()}
            disabled={isPendingRebuildScenery}
          >
            <RefreshCcwIcon />
          </Button>
        </Hint>
      </div>
      <div ref={containerRef} className="relative size-full">
        <div
          ref={popupRef}
          className="bg-muted/80 rounded-md border p-3 text-sm shadow-lg backdrop-blur-sm"
        />
        {isPendingScenery && (
          <div className="bg-background/75 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <Loader2Icon className="size-8 animate-spin" />
          </div>
        )}
        {isErrorScenery && (
          <div className="bg-background/75 absolute inset-0 z-10 flex flex-col items-center justify-center gap-y-2 backdrop-blur-sm">
            <AlertCircleIcon className="text-destructive size-8" />
            <p className="text-destructive">An error occured.</p>
          </div>
        )}
      </div>
    </div>
  );
}
