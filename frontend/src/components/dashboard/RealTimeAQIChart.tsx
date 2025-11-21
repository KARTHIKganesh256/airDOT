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

function buildGradient(ctx: CanvasRenderingContext2D, chartArea?: { bottom: number; top: number }) {
  if (!chartArea) {
    return "rgba(0, 224, 255, 0.2)";
  }
  
  const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  gradient.addColorStop(0, "rgba(0, 224, 255, 0.5)");
  gradient.addColorStop(0.3, "rgba(0, 224, 255, 0.25)");
  gradient.addColorStop(0.6, "rgba(0, 224, 255, 0.1)");
  gradient.addColorStop(1, "rgba(0, 224, 255, 0.02)");
  return gradient;
}

export function RealTimeAQIChart({
  readings = [],
  palette,
  city,
}: RealTimeAQIChartProps) {
  // Filter out invalid readings and sort
  const validReadings = readings.filter(
    (r) => r && r.timestamp && typeof r.aqi === "number" && !isNaN(r.aqi)
  );
  
  const sorted = [...validReadings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  // Ensure we have valid data
  if (sorted.length === 0) {
    return (
      <Card
        title="Real-time AQI Trend"
        className="h-[360px]"
      >
        <div className="flex h-full items-center justify-center text-sm text-white/60">
          {city ? `Waiting for data from ${city}...` : "Waiting for sensor activity..."}
        </div>
      </Card>
    );
  }

  const chartData = sorted.map((reading) => {
    const timestamp = new Date(reading.timestamp);
    return {
      x: timestamp.getTime(),
      y: reading.aqi,
    };
  });

  const data: ChartData<"line"> = {
    datasets: [
      {
        label: "AQI",
        data: chartData,
        borderColor: "rgba(0, 224, 255, 1)",
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBorderWidth: 3,
        pointHoverBackgroundColor: "rgba(0, 224, 255, 1)",
        pointHoverBorderColor: "#ffffff",
        fill: true,
        tension: 0.4,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          if (!chart.chartArea) {
            return "rgba(0, 224, 255, 0.2)";
          }
          const { ctx, chartArea } = chart;
          return buildGradient(ctx, chartArea);
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleColor: "#e2e8f0",
        bodyColor: "#cbd5e1",
        borderColor: "rgba(148, 163, 184, 0.2)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 13,
          weight: "600",
        },
        bodyFont: {
          size: 13,
          weight: "500",
        },
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            if (items.length === 0) return "";
            const raw = items[0].parsed.x ?? items[0].label;
            const date = typeof raw === "number" ? new Date(raw) : new Date(raw as string);
            return date.toLocaleString(undefined, {
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
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
        time: {
          displayFormats: {
            hour: "HH:mm",
            day: "MMM dd",
          },
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
          maxRotation: 0,
          autoSkip: true,
        },
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
          stepSize: 20,
          callback: function(value) {
            return Math.round(value as number);
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.08)",
          drawBorder: false,
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
            className="flex items-center gap-3 text-xs text-white/70"
          >
            {Object.entries(palette).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span 
                  className="h-2.5 w-2.5 rounded-full border border-white/10" 
                  style={{ backgroundColor: color }} 
                />
                <span className="hidden sm:inline">{label}</span>
              </span>
            ))}
          </motion.div>
        )
      }
      className="h-[360px]"
    >
      <div className="h-full w-full">
        <Line data={data} options={options} />
      </div>
    </Card>
  );
}

