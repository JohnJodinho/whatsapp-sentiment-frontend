import type { DashboardData } from "@/types/dasboardData";
import type { SentimentDashboardData } from "@/types/sentimentDashboardData";

const ANALYTICS_STORAGE_KEY = "analytics_json";

export interface AnalyticsJson {
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

/**
 * Updates the General Dashboard section of the analytics JSON.
 * Merges with existing Sentiment data if present.
 */
export const saveGeneralDashboardData = (data: DashboardData) => {
  try {
    const current = getAnalyticsData();
    const updated: AnalyticsJson = {
      ...current,
      general_dashboard: data,
    };
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
    // Optional: Dispatch event if other components need reactive updates
    window.dispatchEvent(new Event("analytics-updated"));
  } catch (error) {
    console.error("Failed to save general dashboard data", error);
  }
};

/**
 * Updates the Sentiment Dashboard section of the analytics JSON.
 * Merges with existing General Dashboard data if present.
 */
export const saveSentimentDashboardData = (data: SentimentDashboardData) => {
  try {
    const current = getAnalyticsData();
    const updated: AnalyticsJson = {
      ...current,
      sentiment_dashboard: data,
    };
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("analytics-updated"));
  } catch (error) {
    console.error("Failed to save sentiment dashboard data", error);
  }
};