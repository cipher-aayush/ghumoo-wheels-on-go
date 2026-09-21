import { useEffect, useRef, useState } from "react";
import { cityPoint } from "@/lib/cities";

type CityCount = { city: string; count: number };

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;
const CHANNEL = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;

const CALLBACK = "__driveEasyMapsReady";
let loader: Promise<void> | null = null;

function loadMaps(): Promise<void> {
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    if (!BROWSER_KEY) {
      reject(new Error("Map key missing"));
      return;
    }
    const w = window as unknown as Record<string, unknown>;
    if ((w["google"] as { maps?: unknown } | undefined)?.maps) {
      resolve();
      return;
    }
    w[CALLBACK] = () => resolve();
    const script = document.createElement("script");
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=${CALLBACK}` +
      (CHANNEL ? `&channel=${CHANNEL}` : "");
    script.async = true;
    script.onerror = () => reject(new Error("Map failed to load"));
    document.head.appendChild(script);
  });
  return loader;
}

export function VehicleMap({ cities }: { cities: CityCount[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !ref.current) return;
    if (!mapRef.current) {
      mapRef.current = new google.maps.Map(ref.current, {
        center: { lat: 21.5, lng: 78.5 },
        zoom: 4.4,
        clickableIcons: false,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", stylers: [{ visibility: "off" }] },
          { elementType: "geometry", stylers: [{ color: "#111a2e" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8fa3c8" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0b1220" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#1b2740" }] },
          { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2a3a5c" }] },
        ],
      });
    }

    for (const m of markersRef.current) m.setMap(null);
    markersRef.current = [];

    for (const entry of cities) {
      const point = cityPoint(entry.city);
      if (!point || entry.count === 0) continue;
      const marker = new google.maps.Marker({
        map: mapRef.current,
        position: point,
        title: `${entry.city}: ${entry.count} active vehicle${entry.count === 1 ? "" : "s"}`,
        label: { text: String(entry.count), color: "#04121f", fontSize: "11px", fontWeight: "700" },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: Math.min(22, 10 + entry.count * 1.6),
          fillColor: "#2dd4bf",
          fillOpacity: 0.9,
          strokeColor: "#a78bfa",
          strokeWeight: 2,
        },
      });
      markersRef.current.push(marker);
    }
  }, [ready, cities]);

  if (failed) {
    return (
      <div className="grid h-80 place-items-center rounded-3xl glass p-6 text-center text-sm text-muted-foreground">
        The live map couldn’t load right now. Vehicle counts by city are listed above.
      </div>
    );
  }

  return (
    <div className="relative h-80 overflow-hidden rounded-3xl glass">
      <div ref={ref} className="size-full" />
      {!ready ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">
          Loading map…
        </p>
      ) : null}
    </div>
  );
}
