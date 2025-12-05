import type { ProgressData, ErrorData } from "@/types/sentimentProgress"; // Create/use a type definition file
import { apiClient } from "./apiClient";
// IMPORTANT: Set this to your actual backend URL
// You should use environment variables for this, e.g., import.meta.env.VITE_API_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://192.168.105.179:8000/api/v1";


console.log(`The API BASE URL IS: ${API_BASE_URL}`); 
/**
 * Creates and manages a Server-Sent Event (SSE) connection to monitor 
 * sentiment analysis progress.
 *
 * @returns A cleanup function to manually close the connection.
 */
export function monitorSentimentProgress(
  chatId: string,
  onProgress: (data: ProgressData) => void,
  onComplete: () => void,
  onError: (error: ErrorData) => void
): () => void {
  const token = localStorage.getItem("access_token");
  const url = `${API_BASE_URL}/sentiment/progress/${chatId}?token=${token}`;
  
  const eventSource = new EventSource(url, { withCredentials: false });

  eventSource.onopen = () => {
    console.log(`[SSE] Connection established for chat ${chatId}`);
  };

  eventSource.addEventListener("progress", (event: MessageEvent) => {
    try {
      const data: ProgressData = JSON.parse(event.data);
      onProgress(data);
    } catch (e) {
      console.error("Failed to parse 'progress' event data:", event.data, e);
    }
  });

  eventSource.addEventListener("completed", () => {
    console.log("[SSE] Received 'completed' event.");
    onComplete();
    eventSource.close(); 
  });

  eventSource.addEventListener("cancelled", (event: MessageEvent) => {
    console.log("[SSE] Received 'cancelled' event.");
    try {
        // The backend sends {"error": "Cancelled by user"} inside the data
        const data = JSON.parse(event.data);
        onError({ error: data.error || "Analysis cancelled by user" });
    } catch {
        // JSON.parse failed or data missing — report a generic cancellation message
        onError({ error: "Analysis cancelled." });
    }
    eventSource.close(); // Important: Close connection immediately
  });
  eventSource.onerror = (event) => {
    
    // --- A: Check for FATAL errors from our backend ---
    // These are *deliberate* errors sent as MessageEvents.
    // They have a 'data' property.
      if (event instanceof MessageEvent && event.data) {
      console.error("[SSE] Received fatal error from backend:", event.data);
      let errorData: ErrorData = { error: "Unknown backend error" };
      try {
        errorData = JSON.parse(event.data);
      } catch (parseErr) {
        errorData.error = `Failed to parse backend error: ${String(parseErr)} — original data: ${event.data}`;
      }
      
      // This is a REAL error. Report it and close.
      onError(errorData);
      eventSource.close();
      return; // Stop processing
    }

    // --- B: Handle TRANSIENT network errors ---
    // These are generic 'Event' types without 'data'.
    
    // Check if the browser has given up retrying (e.g., server is down)
    if (eventSource.readyState === EventSource.CLOSED) {
      console.error("[SSE] Connection closed permanently. Reporting failure.");
      onError({ error: "Connection to server lost. Please check network." });
      eventSource.close();
    
    } else if (eventSource.readyState === EventSource.CONNECTING) {
      // This is a transient error. The browser is retrying.
      // We DO NOT call onError. We DO NOT close.
      console.warn("[SSE] Network error. Browser is attempting to reconnect...");
    
    } else {
      // An unknown error state
      console.error("[SSE] Unknown error state.", event);
      onError({ error: "An unknown connection error occurred." });
      eventSource.close();
    }
  };

  // 6. Return the cleanup function
  return () => {
    if (eventSource.readyState !== eventSource.CLOSED) {
      console.log(`[SSE] Cleaning up and closing connection for chat ${chatId}`);
      eventSource.close();
    }
  };
}


/**
 * Sends a REAL API request to cancel the sentiment analysis.
 */
export async function cancelSentimentAnalysis(
  chatId: string
): Promise<{ status: string; chat_id: string }> {
  

  const response = await apiClient.post(`/sentiment/cancel/${chatId}`);
  return response.data;
}