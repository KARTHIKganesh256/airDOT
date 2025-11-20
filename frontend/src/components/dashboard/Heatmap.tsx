import { useMemo } from "react";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import type { FeatureCollection } from "geojson";
import "leaflet/dist/leaflet.css";

import type { MapCity, MapData } from "../../types";
import { Card } from "../ui/Card";

interface HeatmapProps {
  data?: MapData;
}

const DEFAULT_CENTER: [number, number] = [17.5, 79.5];

export function Heatmap({ data }: HeatmapProps) {
  const cities = data?.cities ?? [];
  const geojson = data?.geojson as FeatureCollection | undefined;

  const center = useMemo(() => {
    if (!cities.length) return DEFAULT_CENTER;
    const avgLat =
      cities.reduce((sum, city) => sum + city.location[0], 0) / cities.length;
    const avgLon =
      cities.reduce((sum, city) => sum + city.location[1], 0) / cities.length;
    return [avgLat, avgLon] as [number, number];
  }, [cities]);

  return (
    <Card title="Telangana & AP Air Quality" className="h-[420px]" id="heatmap">
      <MapContainer
        center={center}
        zoom={6.4}
        className="h-full w-full rounded-2xl"
        zoomControl={false}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geojson && (
          <GeoJSON
            data={geojson}
            style={(feature) => ({
              color: "#1f2937",
              weight: 1,
              fillOpacity: 0.05,
              fillColor:
                feature?.properties?.state === "Telangana"
                  ? "rgba(96, 165, 250, 0.12)"
                  : "rgba(249, 115, 22, 0.12)",
            })}
          />
        )}
        {cities.map((city: MapCity) => (
          <CircleMarker
            key={city.city}
            center={[city.location[0], city.location[1]]}
            radius={Math.min(Math.max(city.aqi / 8, 10), 28)}
            pathOptions={{
              color: city.color,
              fillColor: city.color,
              fillOpacity: 0.65,
              weight: 2,
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <div className="space-y-1 text-xs">
                <p className="font-semibold">
                  {city.city}, {city.state}
                </p>
                <p className="text-white/80">
                  AQI {Math.round(city.aqi)} · {city.category}
                </p>
                <p className="text-white/60">{city.health}</p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </Card>
  );
}

