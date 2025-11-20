import { motion } from "framer-motion";
import {
  Bell,
  CloudSun,
  Database,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "../components/layout/ThemeToggle";

export default function SettingsPage() {
  const [alertThreshold, setAlertThreshold] = useState(150);
  const [city, setCity] = useState("San Francisco, CA");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 text-white"
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Settings</h1>
          <p className="mt-2 text-sm text-white/60">
            Configure AeroSense preferences for notifications, data, and
            appearance.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Bell />
            <div>
              <h2 className="text-lg font-semibold">Alert Threshold</h2>
              <p className="text-sm text-white/60">
                Choose AQI thresholds for push alerts.
              </p>
            </div>
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={alertThreshold}
            onChange={(event) => setAlertThreshold(Number(event.target.value))}
            className="w-full accent-accent"
          />
          <p className="text-sm text-white/70">
            Trigger alerts when AQI exceeds{" "}
            <span className="font-semibold text-white">{alertThreshold}</span>.
          </p>
          <button
            type="button"
            className="rounded-full bg-accent/70 px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent"
          >
            Save Alert Settings
          </button>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <MapPin />
            <div>
              <h2 className="text-lg font-semibold">Primary City</h2>
              <p className="text-sm text-white/60">
                Tailor predictions and heatmap focus.
              </p>
            </div>
          </div>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="Enter city or coordinates"
          />
          <p className="text-xs text-white/50">
            Provide a city name or lat/long pair (e.g., 37.7749,-122.4194).
          </p>
          <button
            type="button"
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-accent/60 hover:text-white"
          >
            Update Location
          </button>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <Database />
            <div>
              <h2 className="text-lg font-semibold">Data Retention</h2>
              <p className="text-sm text-white/60">
                Choose how long to store historical sensor data.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["7 days", "30 days", "90 days"].map((option) => (
              <button
                key={option}
                type="button"
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-medium text-white/70 transition hover:border-accent/60 hover:text-white"
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center gap-3">
            <CloudSun />
            <div>
              <h2 className="text-lg font-semibold">Weather Provider</h2>
              <p className="text-sm text-white/60">
                Connect the weather API used for AQI forecasting.
              </p>
            </div>
          </div>
          <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-accent">
            <option>Open-Meteo (default)</option>
            <option>Tomorrow.io</option>
            <option>WeatherAPI.com</option>
          </select>
          <div className="space-y-2 text-xs text-white/60">
            <p>
              Configure API keys in the backend `.env` file to switch providers.
            </p>
            <p>
              Forecast accuracy improves when weather data aligns with sensor
              coordinates.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-3">
          <SlidersHorizontal />
          <div>
            <h2 className="text-lg font-semibold">
              System Integrations (Coming Soon)
            </h2>
            <p className="text-sm text-white/60">
              Connect AeroSense with Slack, Teams, or automation platforms to
              broadcast alerts in real-time.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


