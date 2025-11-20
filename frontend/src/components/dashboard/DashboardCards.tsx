import { motion } from "framer-motion";
import {
  Droplets,
  GaugeCircle,
  Thermometer,
  Waves,
} from "lucide-react";

import type { SensorReading } from "../../types";
import { Card } from "../ui/Card";

interface DashboardCardsProps {
  latestReading?: SensorReading;
}

const cards = [
  {
    label: "Air Quality Index",
    icon: GaugeCircle,
    value: (reading?: SensorReading) =>
      reading ? Math.round(reading.aqi) : "--",
    unit: "",
    description: (reading?: SensorReading) =>
      reading ? `Category: ${reading.category}` : "Awaiting data...",
    accent: "from-green-400/20 to-green-500/5",
  },
  {
    label: "Temperature",
    icon: Thermometer,
    value: (reading?: SensorReading) =>
      reading ? reading.temperature.toFixed(1) : "--",
    unit: "°C",
    description: () => "Ambient temperature from latest sensor.",
    accent: "from-orange-400/20 to-orange-500/5",
  },
  {
    label: "Humidity",
    icon: Droplets,
    value: (reading?: SensorReading) =>
      reading ? reading.humidity.toFixed(0) : "--",
    unit: "%",
    description: () => "Relative humidity at sensor location.",
    accent: "from-sky-400/20 to-sky-500/5",
  },
  {
    label: "PM2.5 Concentration",
    icon: Waves,
    value: (reading?: SensorReading) =>
      reading ? reading.pm25.toFixed(1) : "--",
    unit: "µg/m³",
    description: () => "Fine particulate matter density.",
    accent: "from-purple-400/20 to-purple-500/5",
  },
];

export function DashboardCards({ latestReading }: DashboardCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => (
        <Card
          key={card.label}
          motionProps={{
            initial: { opacity: 0, y: 16 },
            animate: { opacity: 1, y: 0 },
            transition: { delay: index * 0.05 },
          }}
          className="overflow-hidden"
        >
          <div
            className={`rounded-2xl bg-gradient-to-br ${card.accent} p-6 shadow-inner`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60">
                  {card.label}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-white">
                    {card.value(latestReading)}
                  </span>
                  <span className="text-white/50">{card.unit}</span>
                </div>
              </div>
              <div className="rounded-full bg-black/10 p-2 text-white/70">
                <card.icon size={28} />
              </div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 text-sm text-white/70"
            >
              {card.description(latestReading)}
            </motion.p>
          </div>
        </Card>
      ))}
    </div>
  );
}

