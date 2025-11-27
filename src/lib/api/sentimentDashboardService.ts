import axios from "axios";
import { apiClient } from "./apiClient";
// import axiosRetry from "axios-retry";
import type { SentimentDashboardData, SentimentFilterState } from "@/types/sentimentDashboardData";

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8500/api/v1";


// axiosRetry(
//   axios, {
//     retries: 2,
//     retryDelay: (retryCount) => {
//       return axiosRetry.exponentialDelay(retryCount);
//     },
//     retryCondition: (error) => {
//       const isNetworkError = !error.response;
//       const isServerError = (error.response?.status ?? 0) >= 500;
//       return isNetworkError || isServerError
//     }
//   }
// );


export async function fetchSentimentDashboardData(
  chatId: number,
  filters?: SentimentFilterState 
): Promise<SentimentDashboardData> {
  
  const params = new URLSearchParams();


  if (filters) {
    params.append('granularity', filters.granularity);
    
    if (filters.timePeriod && filters.timePeriod !== "All Day") {
      params.append('time_period', filters.timePeriod);
    }

    if (filters.dateRange?.from) {
      params.append('start_date', filters.dateRange.from.toISOString());
    }
    if (filters.dateRange?.to) {
      params.append('end_date', filters.dateRange.to.toISOString());
    }

    filters.participants?.forEach(p => params.append('participants', p));
    filters.sentimentTypes?.forEach(t => params.append('sentiment_types', t));
  }


  try {
    const response = await apiClient.get<SentimentDashboardData>(`/sentiment-dashboard/chats/${chatId}`, {
      params: params,
      timeout: 50000
    });

    
    return response.data;

  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.code === "ECONNABORTED") {
         console.error("Axios error: Request timed out after 30 seconds (and retries).");
      }

      if (err.response?.status === 404) {
        throw new Error(`Chat with ID ${chatId} not found or has no data.`);
      }

      console.error("Axios error fetching dashboard data:", err.response?.data || err.message);
    } else {
      console.error("Unknown error fetching dashboard data:", err);
    }
    
    throw new Error("Failed to fetch sentiment dashboard data. Please try again.");
  }
}