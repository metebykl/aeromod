import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";

import { Feature } from "ol";
import { Point } from "ol/geom";
import Map from "ol/map";
import View from "ol/view";
import { useGeographic } from "ol/proj";
import TileLayer from "ol/layer/tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/osm";

import { useGetSceneryCache } from "@/features/scenery/hooks";

import "ol/ol.css";

export const Route = createFileRoute("/_app/scenery")({
  component: Scenery,
});

function Scenery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map>(null);
  useGeographic();

  const {
    data: scenery,
    isPending: isPendingScenery,
    isError: isErrorScenery,
  } = useGetSceneryCache();

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
    if (!scenery || !mapRef.current) return;

    const map = mapRef.current;

    const features = scenery.airports.map(
      (airport) =>
        new Feature({
          geometry: new Point([airport.longitude, airport.latitude]),
        })
    );

    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features,
      }),
    });

    map.addLayer(markerLayer);

    return () => {
      map.removeLayer(markerLayer);
    };
  }, [scenery]);

  return (
    <div className="relative flex h-full flex-col gap-y-6 p-4">
      <div className="flex w-full">
        <h1 className="text-2xl font-semibold">Scenery Map</h1>
      </div>
      <div ref={containerRef} className="relative size-full">
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
