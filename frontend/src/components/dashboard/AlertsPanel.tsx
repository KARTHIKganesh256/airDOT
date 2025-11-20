import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Card } from "../ui/Card";

interface AlertItem {
  city: string;
  category: string;
  messages: string[];
  aqi: number;
  color: string;
  timestamp: string | null;
}

interface AlertsPanelProps {
  alerts?: AlertItem[];
}

export function AlertsPanel({ alerts = [] }: AlertsPanelProps) {
  const isEmpty = alerts.length === 0;

  return (
    <Card
      title="Pollution Alerts"
      id="alerts"
      className="h-full"
      actions={
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70">
          Auto-generated
        </span>
      }
    >
      {isEmpty ? (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
          <CheckCircle2 className="shrink-0" />
          <div>
            <p className="font-semibold">All clear</p>
            <p className="text-sm text-emerald-100/80">
              Air quality is stable across monitored cities.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={`${alert.city}-${index}`}
              className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <AlertTriangle />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {alert.city}: AQI {alert.aqi} ({alert.category})
                  </p>
                  <p className="mt-1 text-xs text-red-100/80">
                    {alert.timestamp
                      ? new Date(alert.timestamp).toLocaleString()
                      : "Just now"}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-red-100">
                    {alert.messages.map((message, messageIndex) => (
                      <li key={messageIndex}>• {message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

