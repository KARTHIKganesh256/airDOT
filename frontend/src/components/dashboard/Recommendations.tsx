import type { SensorReading } from "../../types";
import { Card } from "../ui/Card";

interface RecommendationsProps {
  latestReading?: SensorReading;
}

function getRecommendations(reading?: SensorReading): string[] {
  if (!reading) {
    return [
      "Connect your AeroSense sensors to start receiving actionable recommendations.",
    ];
  }

  const tips: string[] = [];
  const aqi = reading.aqi;

  if (aqi <= 50) {
    tips.push(
      "Outdoor activities are safe. Keep windows open to refresh indoor air.",
    );
  } else if (aqi <= 100) {
    tips.push(
      "Sensitive groups should limit prolonged outdoor exertion during peak hours.",
    );
  } else if (aqi <= 150) {
    tips.push(
      "Use air purifiers indoors and consider wearing light masks outdoors.",
    );
  } else if (aqi <= 200) {
    tips.push("Everyone should reduce outdoor activities and wear N95 masks.");
  } else {
    tips.push(
      "Stay indoors with air filtration running and seal windows to reduce inflow.",
    );
  }

  if (reading.pm25 > 55) {
    tips.push("Schedule a filter replacement; PM2.5 levels are elevated.");
  }

  if (reading.co2 > 1000) {
    tips.push("Increase ventilation to control CO₂ buildup indoors.");
  }

  if (reading.humidity < 30) {
    tips.push("Low humidity detected. Consider using a humidifier.");
  } else if (reading.humidity > 70) {
    tips.push("High humidity; dehumidifiers can prevent mold growth.");
  }

  return tips;
}

export function Recommendations({ latestReading }: RecommendationsProps) {
  const tips = getRecommendations(latestReading);

  return (
    <Card title="Smart Recommendations">
      <ul className="space-y-3 text-sm text-white/80">
        {tips.map((tip, index) => (
          <li key={index} className="flex gap-2">
            <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

