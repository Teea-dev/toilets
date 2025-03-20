"use client";
import { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface DataFormat {
  building: string;
  building_code: string;
  building_status: string;
  rooms: {
    [key: string]: {
      roomNumber: string;
      slot: { openTime: string; closeTime: string; status: string }[];
    };
  };
  coordinates: [number, number];
  distance: number;
}

export default function Map({
  data,
  userPosition,
  handleMarkerClick,
}: {
  data: DataFormat[];
  userPosition: [number, number];
  handleMarkerClick: (building: string) => void;
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [center, setCenter] = useState<[number, number]>([0, 0]);
  const [zoom, setZoom] = useState<number>(15);
  const [pitch, setPitch] = useState<number>(0);
  const [mapInitialized, setMapInitialized] = useState(false);

  // Get the token directly from the environment variable
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  function getColorByStatus(status: string) {
    switch (status) {
      case "open":
        return "h-2 w-2 rounded-full bg-green-400 shadow-[0px_0px_4px_2px_rgba(34,197,94,0.7)]";

      case "closed":
        return "h-2 w-2 rounded-full bg-red-400 shadow-[0px_0px_4px_2px_rgba(239,68,68,0.9)]";

      case "unknown":
        return "h-2 w-2 rounded-full bg-amber-400 shadow-[0px_0px_4px_2px_rgba(245,158,11,0.9)]";

      default:
        return "gray";
    }
  }

  // Initialize the map
  useEffect(() => {
    if (!mapboxToken) {
      console.error("Mapbox token is not defined");
      return;
    }

    // Set the token explicitly
    mapboxgl.accessToken = mapboxToken;

    // Check if the container is available
    if (!mapContainerRef.current) {
      console.error("Map container is not available");
      return;
    }

    // Initialize the map
    try {
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/adetokunbo/cm84el8s1002q01sebajs3ril",
        center: center,
        zoom: zoom,
        pitch: pitch,
      });

      mapRef.current.on("load", () => {
        setMapInitialized(true);
      });

      mapRef.current.on("move", () => {
        if (mapRef.current) {
          const mapCenter = mapRef.current.getCenter();
          const mapZoom = mapRef.current.getZoom();
          const mapPitch = mapRef.current.getPitch();
          setZoom(mapZoom);
          setPitch(mapPitch);
          setCenter([mapCenter.lng, mapCenter.lat]);
        }
      });

      return () => {
        mapRef.current?.remove();
      };
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [mapboxToken]); // Only re-run if the token changes

  // Add markers after the map is initialized
  useEffect(() => {
    if (!mapInitialized || !mapRef.current) return;

    // Add building markers
    data.forEach((building) => {
      const el = document.createElement("div");
      el.className = getColorByStatus(building.building_status);
      el.addEventListener("click", () => {
        const accordionItem = document.getElementById(building.building_code);
        setTimeout(() => {
          accordionItem?.scrollIntoView({ behavior: "smooth" });
        }, 500);
        handleMarkerClick(building.building_code);
      });

      new mapboxgl.Marker(el)
        .setLngLat([building.coordinates[0], building.coordinates[1]])
        .addTo(mapRef.current!);
    });

    // Add user position marker
    if (userPosition && userPosition[0] !== 0 && userPosition[1] !== 0) {
      const e2 = document.createElement("div");
      e2.className =
        "h-3 w-3 border-[1.5px] border-zinc-50 rounded-full bg-blue-400 shadow-[0px_0px_4px_2px_rgba(14,165,233,1)]";

      new mapboxgl.Marker(e2)
        .setLngLat([userPosition[1], userPosition[0]])
        .addTo(mapRef.current);
    }
  }, [mapInitialized, data, userPosition]);

  return (
    <div className="h-[60vh] sm:w-full sm:h-full relative bg-red-500/0 rounded-[20px] p-2 sm:p-0">
      <div
        id="map-container"
        ref={mapContainerRef}
        className="h-full w-full rounded-[20px] opacity-100"
      />
      <div className="bg-[#18181b]/90 absolute bottom-10 left-2 sm:bottom-8 sm:left-0 flex flex-col gap-2 m-1 py-2.5 p-2 rounded-[16px]">
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-red-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-red-700/30 text-red-300/90">
            unavailable
          </div>
        </div>
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-amber-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-amber-800/30 text-amber-300/90">
            opening soon
          </div>
        </div>
        <div className="flex items-center gap-0">
          <div className="h-2 w-2 rounded-full bg-green-400 flex-none"></div>
          <div className="ml-2 rounded-lg px-2 py-1 text-sm w-full bg-green-800/30 text-green-300/90">
            open now
          </div>
        </div>
      </div>
    </div>
  );
}
