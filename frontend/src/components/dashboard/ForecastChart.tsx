import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

import "../../lib/chart";
import type { ForecastPoint } from "../../types";
import { Card } from "../ui/Card";

interface ForecastChartProps {
  points?: ForecastPoint[];
}

export function ForecastChart({ points = [] }: ForecastChartProps) {
  const sorted = [...points].sort(
    (a, b) =>
      new Date(a.target_time).getTime() - new Date(b.target_time).getTime(),
  );

  const chartData = sorted.length > 0 ? sorted.map((point) => ({
    x: new Date(point.target_time).getTime(),
    y: point.predicted_aqi,
  })) : [];

  const data: ChartData<"line"> = {
    datasets: [
      {
        label: "Predicted AQI",
        data: chartData,
        borderColor: "#8b5cf6",
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#c084fc",
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items: TooltipItem<"line">[]) => {
            const raw = items[0].parsed.x ?? items[0].label;
            return new Date(raw as string | number).toLocaleString(undefined, {
              hour: "2-digit",
              minute: "2-digit",
              month: "short",
              day: "2-digit",
            });
          },
          label: (item: TooltipItem<"line">) =>
            `Predicted AQI: ${Math.round(item.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8" },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
    },
  };

  return (
    <Card title="24-hour AQI Prediction" className="h-[320px]">
      {sorted.length ? (
        <Line data={data} options={options} />
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-white/60">
          Forecast model is preparing...
        </div>
      )}
    </Card>
  );
}

