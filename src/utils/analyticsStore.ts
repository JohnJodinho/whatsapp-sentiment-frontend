import type { DashboardData } from "@/types/dasboardData";
import type { SentimentDashboardData } from "@/types/sentimentDashboardData";

const ANALYTICS_STORAGE_KEY = "analytics_json";

export interface AnalyticsJson {
  chat_id?: string | number;
  general_dashboard?: DashboardData | null;
  sentiment_dashboard?: SentimentDashboardData | null;
}

/**
 * Retrieves the current analytics JSON from local storage.
 * Returns an empty object structure if nothing is saved.
 */
export const getAnalyticsData = (): AnalyticsJson => {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to parse analytics_json from localStorage", error);
    return {};
  }
};


export const hasAnalyticsData = (): boolean => {
  const data = getAnalyticsData();
  // Check if either dashboard has non-null data
  return !!(data.general_dashboard || data.sentiment_dashboard);
};

export const saveGeneralDashboardData = (data: DashboardData, chat_id?: string | number) => {
  try {
    const current = getAnalyticsData();
    if (chat_id === undefined && current.chat_id !== undefined) {
      chat_id = current.chat_id;
    }
    const updated: AnalyticsJson = {
      ...current,
      general_dashboard: data,
      chat_id,
    };
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
    // Optional: Dispatch event if other components need reactive updates
    window.dispatchEvent(new Event("analytics-updated"));
  } catch (error) {
    console.error("Failed to save general dashboard data", error);
  }
};


export const saveSentimentDashboardData = (data:  SentimentDashboardData, chat_id?: string | number) => {
  try {
    const current = getAnalyticsData();
    if (chat_id === undefined && current.chat_id !== undefined) {
      chat_id = current.chat_id;
    }
    const updated: AnalyticsJson = {
      ...current,
      sentiment_dashboard: data,
      chat_id,
    };
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("analytics-updated"));
  } catch (error) {
    console.error("Failed to save sentiment dashboard data", error);
  }
};