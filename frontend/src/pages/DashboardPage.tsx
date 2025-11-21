import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { AlertsPanel } from "../components/dashboard/AlertsPanel";
import { DashboardCards } from "../components/dashboard/DashboardCards";
import { Recommendations } from "../components/dashboard/Recommendations";
import { MultiModelForecast } from "../components/dashboard/MultiModelForecast";
import { Card } from "../components/ui/Card";
import {
  useForecast,
  useHistory,
  useLatest,
  useMapData,
} from "../hooks/useAeroSenseData";
import type { SensorReading } from "../types";

const RealTimeAQIChart = lazy(() =>
  import("../components/dashboard/RealTimeAQIChart").then((module) => ({
    default: module.RealTimeAQIChart,
  })),
);

const ForecastChart = lazy(() =>
  import("../components/dashboard/ForecastChart").then((module) => ({
    default: module.ForecastChart,
  })),
);

const Heatmap = lazy(() =>
  import("../components/dashboard/Heatmap").then((module) => ({
    default: module.Heatmap,
  })),
);

function ChartFallback({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <Card title={title} className={className}>
      <div className="flex h-full items-center justify-center text-sm text-white/60">
        Loading {title.toLowerCase()}…
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: latest, isLoading: isLatestLoading, error: latestError } = useLatest();
  const { data: mapData } = useMapData();

  // Default to first city from latest data, or use a fallback
  const defaultCity = latest?.readings?.[0]?.city || "Hyderabad";
  const [selectedCity, setSelectedCity] = useState<string>(defaultCity);

  useEffect(() => {
    if (latest?.readings?.length && !selectedCity) {
      setSelectedCity(latest.readings[0].city);
    } else if (latest?.readings?.length && !latest.readings.find(r => r.city === selectedCity)) {
      // If selected city is not in the list, use first available
      setSelectedCity(latest.readings[0].city);
    }
  }, [latest, selectedCity]);

  const historyQuery = useHistory(selectedCity || defaultCity, 200);
  const forecastQuery = useForecast(selectedCity || defaultCity);

  const latestReading: SensorReading | undefined = useMemo(() => {
    if (!latest?.readings) return undefined;
    if (!selectedCity) return latest.readings[0];
    return latest.readings.find(
      (reading) => reading.city.toLowerCase() === selectedCity.toLowerCase(),
    );
  }, [latest, selectedCity]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">
            AeroSense · Telangana & Andhra Pradesh
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Real-time monitoring, predictive intelligence, and proactive alerts
            for 24/7 urban air safety.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <label className="text-xs uppercase tracking-wide text-white/40">
              Focus City
            </label>
            <select
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-2 text-sm text-white outline-none transition focus:border-accent"
              value={selectedCity ?? ""}
              onChange={(event) => setSelectedCity(event.target.value)}
            >
              {latest?.readings?.map((reading) => (
                <option key={reading.id} value={reading.city}>
                  {reading.city}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col text-right text-xs text-white/60">
            <span>Updated</span>
            <span className="text-sm font-medium text-white">
              {latestReading
                ? new Date(latestReading.timestamp).toLocaleTimeString()
                : isLatestLoading
                  ? "Connecting..."
                  : "Awaiting data"}
            </span>
          </div>
        </div>
      </section>

      <DashboardCards latestReading={latestReading} />

      <section
        id="analytics"
        className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
      >
        <Suspense
          fallback={<ChartFallback title="Real-time AQI Trend" className="h-[360px]" />}
        >
          <RealTimeAQIChart
            city={selectedCity || defaultCity}
            readings={historyQuery.data || []}
            palette={latest?.palette}
          />
        </Suspense>
        <Suspense
          fallback={<ChartFallback title="24-hour AQI Prediction" className="h-[400px]" />}
        >
          {forecastQuery.data?.predictions ? (
            <MultiModelForecast forecastData={forecastQuery.data} />
          ) : (
            <ForecastChart points={forecastQuery.data?.points} />
          )}
        </Suspense>
      </section>

      <section id="heatmap" className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Suspense
          fallback={<ChartFallback title="City Air Quality Heatmap" className="h-[420px]" />}
        >
          <Heatmap data={mapData} />
        </Suspense>
        <div className="grid gap-6">
          <AlertsPanel alerts={latest?.alerts} />
          <Recommendations latestReading={latestReading} />
        </div>
      </section>

      <footer className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-white/50">
              Model Performance
            </p>
            <p className="mt-1 text-sm">
              R²:{" "}
              <span className="font-semibold text-white">
                {forecastQuery.data?.metrics?.r2?.toFixed(3) ?? "N/A"}
              </span>{" "}
              · MAE:{" "}
              <span className="font-semibold text-white">
                {forecastQuery.data?.metrics?.mae?.toFixed(2) ?? "N/A"}
              </span>{" "}
              · Records trained on:{" "}
              <span className="font-semibold text-white">
                {forecastQuery.data?.metrics?.training_records ?? "N/A"}
              </span>
            </p>
          </div>
          <div className="ml-auto text-xs text-white/40">
            Forecast generated at{" "}
            {forecastQuery.data?.generated_at
              ? new Date(forecastQuery.data.generated_at).toLocaleString()
              : "Awaiting model inference"}
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
