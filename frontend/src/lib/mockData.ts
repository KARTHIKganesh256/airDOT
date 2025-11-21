import type {
  LatestPayload,
  MapData,
  ForecastResponse,
  SensorReading,
} from "../types";

// Mock cities for Telangana & Andhra Pradesh
const MOCK_CITIES = [
  { city: "Hyderabad", state: "Telangana", latitude: 17.3850, longitude: 78.4867 },
  { city: "Warangal", state: "Telangana", latitude: 17.9689, longitude: 79.5941 },
  { city: "Vijayawada", state: "Andhra Pradesh", latitude: 16.5062, longitude: 80.6480 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", latitude: 17.6868, longitude: 83.2185 },
  { city: "Guntur", state: "Andhra Pradesh", latitude: 16.3067, longitude: 80.4365 },
];

// Generate realistic AQI values
function getAQIForCity(city: string): number {
  const seed = city.charCodeAt(0) + city.length;
  const base = 45 + (seed % 40); // AQI between 45-85 (Moderate range)
  return Math.round(base);
}

function getCategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

function getColor(category: string): string {
  const colors: Record<string, string> = {
    Good: "#00E400",
    Moderate: "#FFFF00",
    "Unhealthy for Sensitive Groups": "#FF7E00",
    Unhealthy: "#FF0000",
    "Very Unhealthy": "#8F3F97",
    Hazardous: "#7E0023",
  };
  return colors[category] || "#9ca3af";
}

function getHealth(category: string): string {
  const health: Record<string, string> = {
    Good: "Air quality is satisfactory.",
    Moderate: "Acceptable; some pollutants may be a moderate concern.",
    "Unhealthy for Sensitive Groups": "Sensitive groups should limit outdoor exertion.",
    Unhealthy: "Everyone may begin to experience effects.",
    "Very Unhealthy": "Health warnings of emergency conditions.",
    Hazardous: "Serious risk for entire population.",
  };
  return health[category] || "Insufficient data";
}

// Generate mock reading for a city
function generateMockReading(cityData: typeof MOCK_CITIES[0]): SensorReading {
  const aqi = getAQIForCity(cityData.city);
  const category = getCategory(aqi);
  const timestamp = new Date().toISOString();

  // Generate realistic values based on AQI
  const pm25 = Math.round((aqi / 2) * 10) / 10;
  const temperature = 28 + Math.random() * 6; // 28-34°C
  const humidity = 45 + Math.random() * 25; // 45-70%

  return {
    id: `mock-${cityData.city.toLowerCase()}`,
    city: cityData.city,
    state: cityData.state,
    latitude: cityData.latitude,
    longitude: cityData.longitude,
    pm25,
    pm10: pm25 * 2,
    co2: 450 + Math.random() * 100,
    no2: 25 + Math.random() * 15,
    temperature: Math.round(temperature * 10) / 10,
    humidity: Math.round(humidity),
    aqi,
    category,
    color: getColor(category),
    health: getHealth(category),
    timestamp,
    primary_pollutant: "pm25",
  };
}

// Mock latest data
export function getMockLatest(): LatestPayload {
  const readings = MOCK_CITIES.map(generateMockReading);
  const now = new Date().toISOString();

  return {
    updated_at: now,
    readings,
    alerts: [],
    palette: {
      Good: "#00E400",
      Moderate: "#FFFF00",
      "Unhealthy for Sensitive Groups": "#FF7E00",
      Unhealthy: "#FF0000",
      "Very Unhealthy": "#8F3F97",
      Hazardous: "#7E0023",
    },
  };
}

// Mock history data
export function getMockHistory(city: string, limit: number = 200): SensorReading[] {
  const cityData = MOCK_CITIES.find((c) => c.city === city) || MOCK_CITIES[0];
  const readings: SensorReading[] = [];
  const now = new Date();
  const baseAQI = getAQIForCity(cityData.city);

  // Generate more recent data (last 24-48 hours with more frequent readings)
  const hoursBack = Math.min(limit / 4, 48); // Generate data for last 48 hours max
  const intervalMinutes = (hoursBack * 60) / limit; // Distribute readings evenly

  for (let i = limit - 1; i >= 0; i--) {
    const minutesBack = i * intervalMinutes;
    const timestamp = new Date(now.getTime() - minutesBack * 60 * 1000);
    
    // Create base reading
    const baseReading = generateMockReading(cityData);
    
    // Add realistic variation with daily pattern
    const hourOfDay = timestamp.getHours();
    const dailyPattern = 1 + 0.2 * Math.sin((hourOfDay - 6) * Math.PI / 12);
    const variation = (Math.random() - 0.5) * 8;
    const aqi = Math.max(0, Math.min(500, Math.round(baseAQI * dailyPattern + variation)));

    readings.push({
      ...baseReading,
      id: `mock-${city.toLowerCase()}-${i}`,
      city: cityData.city,
      state: cityData.state,
      timestamp: timestamp.toISOString(),
      aqi: aqi,
      category: getCategory(aqi),
      color: getColor(getCategory(aqi)),
      health: getHealth(getCategory(aqi)),
      pm25: Math.max(0, Math.round((aqi / 2) * 10) / 10 + (Math.random() - 0.5) * 2),
      pm10: Math.max(0, Math.round((aqi / 2) * 2 * 10) / 10 + (Math.random() - 0.5) * 4),
      temperature: 28 + Math.sin((hourOfDay - 6) * Math.PI / 12) * 4 + (Math.random() - 0.5) * 2,
      humidity: 50 + Math.cos((hourOfDay - 6) * Math.PI / 12) * 15 + (Math.random() - 0.5) * 5,
    });
  }

  return readings;
}

// Mock forecast data
export function getMockForecast(city?: string): ForecastResponse {
  const cityData = city
    ? MOCK_CITIES.find((c) => c.city === city) || MOCK_CITIES[0]
    : MOCK_CITIES[0];
  const baseAQI = getAQIForCity(cityData.city);
  const points = [];

  for (let hour = 1; hour <= 24; hour++) {
    const targetTime = new Date();
    targetTime.setHours(targetTime.getHours() + hour);
    // Simulate daily pattern (lower at night, higher during day)
    const hourOfDay = targetTime.getHours();
    const dailyPattern = 1 + 0.3 * Math.sin((hourOfDay - 6) * Math.PI / 12);
    const predictedAQI = Math.round(baseAQI * dailyPattern + (Math.random() - 0.5) * 5);
    
    points.push({
      target_time: targetTime.toISOString(),
      predicted_aqi: Math.max(0, Math.min(500, predictedAQI)),
      confidence: 0.75 + Math.random() * 0.2,
    });
  }

  return {
    generated_at: new Date().toISOString(),
    model_name: "Mock Forecast Model",
    points,
    metrics: {
      r2: 0.85,
      mae: 8.5,
      rmse: 12.3,
      training_records: 1000,
    },
  };
}

// Mock map data
export function getMockMapData(): MapData {
  const readings = MOCK_CITIES.map(generateMockReading);
  const cities = readings.map((reading) => ({
    city: reading.city,
    state: reading.state,
    location: [reading.latitude, reading.longitude] as [number, number],
    aqi: reading.aqi,
    category: reading.category,
    color: reading.color,
    health: reading.health,
  }));

  return {
    updated_at: new Date().toISOString(),
    cities,
    geojson: {
      type: "FeatureCollection",
      features: [],
    },
  };
}

