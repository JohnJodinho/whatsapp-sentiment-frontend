import { isAxiosError } from "axios";
import { apiClient } from "./apiClient";
// import axiosRetry from  'axios-retry';
import type { DashboardData, FilterState, DayData } from "@/types/dasboardData";


// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8500/api/v1";



type DayOfWeekKey = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const dayOfWeekMap: Array<DayOfWeekKey> = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

function getDayFillColors(): Record<string, string> {
  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number): string => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  const baseHue = 171,
    baseSaturation = 79,
    baseLightness = 40,
    darkenStep = 5;
  const colors: Record<string, string> = {};
  dayOfWeekMap.forEach((day, index) => {
    const currentLightness = baseLightness - index * darkenStep;
    colors[day] = hslToHex(baseHue, baseSaturation, currentLightness);
  });
  return colors;
}

const dayColors = getDayFillColors();

export async function fetchDashboardData(
  chat_id: string | number,
  filters?: FilterState
): Promise<DashboardData> {
  

  const url = `/dashboard/chats/${chat_id}`;

  const params = new URLSearchParams();

  if (filters?.dateRange?.from) {
    params.append("start_date", filters.dateRange.from.toISOString());
  }

  if (filters?.dateRange?.to) {
    params.append("end_date", filters.dateRange.to.toISOString());
  }

  if (filters?.timePeriod && filters.timePeriod !== "All Day") {
    params.append("time_period", filters.timePeriod);
  }

  if (filters?.participants && filters.participants.length > 0) {
    filters.participants.forEach((participant) => {
      params.append("participants", participant);
    });
  }

  try{
    const response = await apiClient.get<DashboardData>(url, {
      params: params,
      timeout: 30000
    });

    const data: DashboardData = response.data;

    const processedActivityByDay = (data.activityByDay || []).map(
      (day: DayData) => ({
        ...day,
        fill: dayColors[day.day as DayOfWeekKey] || "#8884d8",
      })
    );

    return {
      ...data,
      participants: data.participants || [],
      kpiMetrics: data.kpiMetrics || [],
      messagesOverTime: data.messagesOverTime || [],
      timeline: data.timeline || [],
      hourlyActivity: data.hourlyActivity || [],
    
      activityByDay: processedActivityByDay,
      
      contribution: data.contribution || { type: "multi", data: [] },
      activity: data.activity || null,
      participantCount: data.participantCount || 0,
    };

  } catch (error) {
    
    if (isAxiosError(error)) {
      if (error.code === "ECONNABORTED") {
         console.error("Axios error: Request timed out after 30 seconds (and retries).");
      }
    
      const errorDetail = error.response?.data?.detail || "Failed to fetch dashboard data";
      console.error("API Error:", errorDetail, error.response?.data);
      throw new Error(errorDetail);
    } else {
      
      console.error("Network or other error:", error);
      throw new Error("An unknown error occurred while fetching data.");
    }
  }
}