import type {  QueryPayload, QueryResponse, RawHistoryItem } from "@/types/chat";


import { apiClient } from "@/lib/api/apiClient";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8500/api/v1";
console.log(`The API BASE URL IS: ${API_BASE_URL}`);  

export async function sendQuery(
  chatId: string,
  payload: QueryPayload
): Promise<QueryResponse> {
  // apiClient handles 401/429/404 automatically!
  const response = await apiClient.post<QueryResponse>(
    `/rag/chat/${chatId}/query`,
    payload
  );
  return response.data;
}

interface StreamingCallbacks {
    onChunk: (chunk: string) => void;
    onEnd: (finalData: QueryResponse) => void;
    onError: (error: Error) => void;
}

/**
 * Sends a new user query and processes the streaming response via callbacks.
 * The backend must support Server-Sent Events (SSE).
 */
export async function sendQueryStream(
  chatId: string,
  payload: QueryPayload,
  callbacks: StreamingCallbacks
): Promise<void> {
  try {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/rag/chat/${chatId}/query/streamed`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}`: ""
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
        toast.error("Session Expired", {
          description: "Your session has ended. Redirecting...",
          duration: 5000,
        });
        localStorage.removeItem("access_token");
        localStorage.removeItem("current_chat");
        window.location.href = "/";
        throw new Error("Session expired");
    }
    if (response.status === 429) {
      toast.error("Too Many Messages", {
        description: "Please slow down and try again in a moment."
      });
        throw new Error("Rate limit exceeded");
    }

    if (!response.ok || !response.body) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let finalDataString = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const segments = chunk.split('\n\n').filter(s => s.trim() !== '');

      for (const segment of segments) {

        const rawData = segment.replace(/^data: /, '');

        try {
          const parsed = JSON.parse(rawData);

          if (typeof parsed === 'string') {
            // It's a text chunk (Markdown fragment)
            callbacks.onChunk(parsed); 
          } else if (parsed.sources) {
            // It's the final QueryResponse object
            finalDataString = rawData; // Store for onEnd logic
          }
        } catch (e) {
          console.error("Failed to parse SSE chunk", e);
        }
      }
  }
    
    // Process the final JSON object after the stream is complete
    if (finalDataString) {
        const finalData = JSON.parse(finalDataString) as QueryResponse;
        callbacks.onEnd(finalData);
    } else {
        // If no final data, but stream ended, send a final blank chunk
        callbacks.onEnd({ answer: "", sources: [], route: "" }); 
    }

  } catch (error) {
    callbacks.onError(error as Error);
  }
}


export async function fetchHistory(chatId: string): Promise<RawHistoryItem[]> {
  const response = await apiClient.get<RawHistoryItem[]>(`/rag/chat/${chatId}/history`);
  return response.data;
}


export async function resetMemory(chatId: string): Promise<void> {
  await apiClient.delete(`/rag/chat/${chatId}/history`);
}