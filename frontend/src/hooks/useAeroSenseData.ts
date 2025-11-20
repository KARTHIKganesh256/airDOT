import { useQuery } from "@tanstack/react-query";

import { fetcher } from "../lib/api";
import type {
  LatestPayload,
  MapData,
  ForecastResponse,
  SensorReading,
} from "../types";

const FIVE_SECONDS = 5000;
const ONE_MINUTE = 60000;

export function useLatest() {
  return useQuery<LatestPayload>({
    queryKey: ["latest"],
    queryFn: () => fetcher<LatestPayload>("/latest"),
    refetchInterval: FIVE_SECONDS,
  });
}

export function useHistory(city: string, limit = 200) {
  return useQuery<SensorReading[]>({
    queryKey: ["history", city, limit],
    enabled: Boolean(city),
    queryFn: async () => {
      const params = new URLSearchParams({
        city,
        limit: limit.toString(),
      });
      const response = await fetcher<{ readings: SensorReading[] }>(
        `/history?${params.toString()}`,
      );
      return response.readings;
    },
    refetchInterval: ONE_MINUTE,
  });
}

export function useForecast(city?: string) {
  return useQuery<ForecastResponse>({
    queryKey: ["forecast", city],
    queryFn: () =>
      fetcher<ForecastResponse>(
        `/predict${city ? `?city=${encodeURIComponent(city)}` : ""}`,
      ),
    refetchInterval: ONE_MINUTE,
  });
}

export function useMapData() {
  return useQuery<MapData>({
    queryKey: ["mapdata"],
    queryFn: () => fetcher<MapData>("/mapdata"),
    refetchInterval: ONE_MINUTE,
  });
}

