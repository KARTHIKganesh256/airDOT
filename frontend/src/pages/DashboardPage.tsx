import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import { AlertsPanel } from "../components/dashboard/AlertsPanel";
import { DashboardCards } from "../components/dashboard/DashboardCards";
import { Recommendations } from "../components/dashboard/Recommendations";
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

  const [selectedCity, setSelectedCity] = useState<string | undefined>();

  useEffect(() => {
    if (!selectedCity && latest?.readings?.length) {
      setSelectedCity(latest.readings[0].city);
    }
  }, [latest, selectedCity]);

  const historyQuery = useHistory(selectedCity ?? "", 200);
  const forecastQuery = useForecast(selectedCity);

  const latestReading: SensorReading | undefined = useMemo(() => {
    if (!latest?.readings) return undefined;
    if (!selectedCity) return latest.readings[0];
    return latest.readings.find(
      (reading) => reading.city.toLowerCase() === selectedCity.toLowerCase(),
    );
  }, [latest, selectedCity]);

  // Check if API is not configured or unavailable
  const apiError = latestError && (
    (latestError as any).apiNotConfigured || 
    (latestError as any).networkError ||
    (latestError as any).code === "ERR_NETWORK"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {apiError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-orange-500/50 bg-orange-500/10 p-4 text-sm text-orange-200"
        >
          <p className="font-semibold">⚠️ API Connection Required</p>
          <p className="mt-1 text-orange-300/80">
            The backend API is not configured. To see live data, please:
          </p>
          <ul className="mt-2 ml-4 list-disc space-y-1 text-orange-300/70">
            <li>Deploy your backend API to a hosting service (e.g., Railway, Render, Heroku)</li>
            <li>Set the <code className="bg-black/20 px-1 rounded">VITE_API_URL</code> secret in GitHub repository settings</li>
            <li>Or run the backend locally and use the development version</li>
          </ul>
          <p className="mt-2 text-xs text-orange-300/60">
            See <code className="bg-black/20 px-1 rounded">DEPLOYMENT.md</code> for detailed instructions.
          </p>
        </motion.div>
      )}
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
            city={selectedCity}
            readings={historyQuery.data}
            palette={latest?.palette}
          />
        </Suspense>
        <Suspense
          fallback={<ChartFallback title="24-hour AQI Prediction" className="h-[320px]" />}
        >
          <ForecastChart points={forecastQuery.data?.points} />
        </Suspense>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
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

