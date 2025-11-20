export type AQICategory =
  | "Good"
  | "Moderate"
  | "Unhealthy for Sensitive Groups"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous"
  | "Unknown";

export interface SensorReading {
  id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  pm25: number;
  pm10: number;
  co2: number;
  no2: number;
  temperature: number;
  humidity: number;
  aqi: number;
  category: string;
  timestamp: string;
  color: string;
  health: string;
  primary_pollutant?: string | null;
}

export interface ForecastPoint {
  target_time: string;
  predicted_aqi: number;
  confidence: number | null;
}

export interface ForecastResponse {
  generated_at?: string;
  model_name?: string;
  metrics?: ModelMetrics | null;
  points: ForecastPoint[];
}

export interface ModelMetrics {
  r2: number | null;
  mae: number | null;
  rmse: number | null;
  training_records: number;
}

export interface Alert {
  id: number;
  city: string;
  severity: string;
  message: string;
  recommendation: string | null;
  pollutant: string | null;
  sensor_id: number | null;
}

export interface AQIColors {
  [key: string]: string;
}

export interface LatestPayload {
  updated_at: string | null;
  readings: SensorReading[];
  alerts: Array<{
    city: string;
    category: string;
    messages: string[];
    aqi: number;
    color: string;
    timestamp: string | null;
  }>;
  palette: AQIColors;
}

export interface MapCity {
  city: string;
  state: string;
  location: [number, number];
  aqi: number;
  category: string;
  color: string;
  health: string;
}

export interface MapData {
  updated_at: string;
  cities: MapCity[];
  geojson: GeoJSON.FeatureCollection;
}

