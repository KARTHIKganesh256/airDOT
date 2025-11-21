import { useState } from "react";
import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";

import "../../lib/chart";
import type { ForecastResponse } from "../../types";
import { Card } from "../ui/Card";

interface MultiModelForecastProps {
  forecastData?: ForecastResponse;
}

export function MultiModelForecast({ forecastData }: MultiModelForecastProps) {
  const [selectedModel, setSelectedModel] = useState<"ensemble" | "random_forest" | "linear_regression" | "lstm">("ensemble");

  if (!forecastData?.predictions) {
    return (
      <Card title="24-hour AQI Prediction" className="h-[320px]">
        <div className="flex h-full items-center justify-center text-sm text-white/60">
          Forecast model is preparing...
        </div>
      </Card>
    );
  }

  const { predictions, models, ensemble_weights } = forecastData;

  // Get selected model predictions
  const selectedPoints = predictions[selectedModel] || predictions.ensemble || [];

  const sorted = [...selectedPoints].sort(
    (a, b) => new Date(a.target_time).getTime() - new Date(b.target_time).getTime(),
  );

  // Prepare data for all models
  const allModelsData: ChartData<"line"> = {
    datasets: [
      {
        label: "Ensemble",
        data: (predictions.ensemble || []).map((p) => ({
          x: new Date(p.target_time).getTime(),
          y: p.predicted_aqi,
        })),
        borderColor: "#8b5cf6",
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
      },
      {
        label: "Random Forest",
        data: (predictions.random_forest || []).map((p) => ({
          x: new Date(p.target_time).getTime(),
          y: p.predicted_aqi,
        })),
        borderColor: "#10b981",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: "Linear Regression",
        data: (predictions.linear_regression || []).map((p) => ({
          x: new Date(p.target_time).getTime(),
          y: p.predicted_aqi,
        })),
        borderColor: "#3b82f6",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
      },
      {
        label: "LSTM",
        data: (predictions.lstm || []).map((p) => ({
          x: new Date(p.target_time).getTime(),
          y: p.predicted_aqi,
        })),
        borderColor: "#f59e0b",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: false,
        borderDash: [5, 5],
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
        display: true,
        position: "top" as const,
        labels: {
          color: "#94a3b8",
          font: { size: 11 },
          usePointStyle: true,
          padding: 12,
        },
      },
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
          label: (item: TooltipItem<"line">) => {
            const label = item.dataset.label || "";
            const value = Math.round(item.parsed.y ?? 0);
            return `${label}: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
      y: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "rgba(148,163,184,0.1)" },
      },
    },
  };

  return (
    <Card title="Multi-Model 24-hour AQI Forecast" className="h-[400px]">
      {/* Model Metrics */}
      <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
        {models?.random_forest && (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-2">
            <div className="font-semibold text-green-300">Random Forest</div>
            <div className="mt-1 space-y-0.5 text-green-200/80">
              <div>R²: {models.random_forest.r2?.toFixed(3) ?? "N/A"}</div>
              <div>MAE: {models.random_forest.mae?.toFixed(2) ?? "N/A"}</div>
              <div>RMSE: {models.random_forest.rmse?.toFixed(2) ?? "N/A"}</div>
            </div>
          </div>
        )}
        {models?.linear_regression && (
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
            <div className="font-semibold text-blue-300">Linear Regression</div>
            <div className="mt-1 space-y-0.5 text-blue-200/80">
              <div>R²: {models.linear_regression.r2?.toFixed(3) ?? "N/A"}</div>
              <div>MAE: {models.linear_regression.mae?.toFixed(2) ?? "N/A"}</div>
              <div>RMSE: {models.linear_regression.rmse?.toFixed(2) ?? "N/A"}</div>
            </div>
          </div>
        )}
        {models?.lstm && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
            <div className="font-semibold text-amber-300">LSTM</div>
            <div className="mt-1 space-y-0.5 text-amber-200/80">
              <div>R²: {models.lstm.r2?.toFixed(3) ?? "N/A"}</div>
              <div>MAE: {models.lstm.mae?.toFixed(2) ?? "N/A"}</div>
              <div>RMSE: {models.lstm.rmse?.toFixed(2) ?? "N/A"}</div>
            </div>
          </div>
        )}
        {ensemble_weights && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-2">
            <div className="font-semibold text-purple-300">Ensemble Weights</div>
            <div className="mt-1 space-y-0.5 text-purple-200/80">
              <div>RF: {(ensemble_weights.rf * 100).toFixed(1)}%</div>
              <div>LR: {(ensemble_weights.lr * 100).toFixed(1)}%</div>
              <div>LSTM: {(ensemble_weights.lstm * 100).toFixed(1)}%</div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-[280px]">
        <Line data={allModelsData} options={options} />
      </div>
    </Card>
  );
}

