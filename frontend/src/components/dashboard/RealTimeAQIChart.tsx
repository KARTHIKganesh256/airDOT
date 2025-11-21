import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

import "../../lib/chart";
import type { AQIColors, SensorReading } from "../../types";
import { Card } from "../ui/Card";

interface RealTimeAQIChartProps {
  readings?: SensorReading[];
  palette?: AQIColors;
  city?: string;
}

function buildGradient(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, "rgba(0, 224, 255, 0.35)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.05)");
  return gradient;
}

export function RealTimeAQIChart({
  readings = [],
  palette,
  city,
}: RealTimeAQIChartProps) {
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  const chartData = sorted.length > 0 ? sorted.map((reading) => ({
    x: new Date(reading.timestamp).getTime(),
    y: reading.aqi,
  })) : [];

  const data: ChartData<"line"> = {
    datasets: [
      {
        label: "AQI",
        data: chartData,
        borderColor: "rgba(0, 224, 255, 1)",
        borderWidth: 2,
        pointRadius: sorted.length > 50 ? 0 : 2,
        pointHoverRadius: 4,
        fill: true,
        tension: 0.35,
        backgroundColor: (context: { chart: { ctx: CanvasRenderingContext2D } }) =>
          buildGradient(context.chart.ctx),
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            if (items.length === 0) return "";
            const raw = items[0].parsed.x ?? items[0].label;
            const date = typeof raw === "number" ? new Date(raw) : new Date(raw as string);
            return date.toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "2-digit",
            });
          },
          label: (item: TooltipItem<"line">) => {
            const aqi = Math.round(item.parsed.y ?? 0);
            return `AQI: ${aqi}`;
          },
          afterLabel: (item: TooltipItem<"line">) => {
            const index = item.dataIndex;
            if (index >= 0 && index < sorted.length) {
              const reading = sorted[index];
              return reading?.category || "";
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#94a3b8",
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
        },
      },
    },
  };

  return (
    <Card
      title="Real-time AQI Trend"
      motionProps={{ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } }}
      actions={
        palette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hidden items-center gap-2 text-xs text-white/60 md:flex"
          >
            {Object.entries(palette).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </motion.div>
        )
      }
      className="h-[360px]"
    >
      {sorted.length ? (
        <Line data={data} options={options} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-white/60">
          {city ? `Waiting for data from ${city}...` : "Waiting for sensor activity..."}
        </div>
      )}
    </Card>
  );
}

