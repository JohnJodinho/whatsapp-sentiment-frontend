import { useState, useEffect } from "react";
import { EmptySentimentState } from "@/pages/sentiment-dashboard/EmptySentimentState"; 
import { SentimentProgressView } from "@/pages/sentiment-dashboard/SentimentProgressView"; 
import { SentimentDashboardView } from "@/pages/sentiment-dashboard/SentimentDashboardView"; 
import type { ErrorData } from "@/types/sentimentProgress";
import { deleteChat } from "@/lib/api/chatService";


type SentimentStatus = "checking" | "no_chat" | "pending" | "processing" | "completed" | "error" | "failed";

interface CurrentChatInfo {
  id: number;
  title: string;
  created_at: string;
  sentiment_status: SentimentStatus | string; 
}

const CHAT_STORAGE_KEY = "current_chat";


export default function SentimentDashboardPage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [sentimentStatus, setSentimentStatus] = useState<SentimentStatus>("checking");

  // 🔹 Function to load and update state based on current_chat
  const updateFromLocalStorage = () => {
    const chatJsonString = localStorage.getItem(CHAT_STORAGE_KEY);

    if (!chatJsonString) {
      setSentimentStatus("no_chat");
      setChatId(null);
      return;
    }

    try {
      const chatInfo: CurrentChatInfo = JSON.parse(chatJsonString);
      const currentChatId = String(chatInfo.id);
      const initialStatus = chatInfo.sentiment_status as SentimentStatus;

      setChatId(currentChatId);

      const validStatuses: SentimentStatus[] = ["pending", "processing", "completed", "failed"];
      if (validStatuses.includes(initialStatus)) {
        setSentimentStatus(initialStatus);
      } else {
        console.warn(`Unknown sentiment status "${initialStatus}", defaulting to pending.`);
        setSentimentStatus("pending");
      }
    } catch (error) {
      console.error("Failed to parse current_chat from localStorage:", error);
      setSentimentStatus("no_chat");
      setChatId(null);
    }
  };

  useEffect(() => {
    // Run once on mount
    updateFromLocalStorage();

    // Listen for cross-tab updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_STORAGE_KEY) {
        updateFromLocalStorage();
      }
    };

    // Listen for same-tab updates (custom event)
    const handleChatUpdated = () => {
      updateFromLocalStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chat-updated", handleChatUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chat-updated", handleChatUpdated);
    };
  }, []);

  // ✅ When processing completes successfully
  const handleProcessingComplete = () => {
    if (!chatId) return;

    const chatJsonString = localStorage.getItem(CHAT_STORAGE_KEY);
    if (chatJsonString) {
      try {
        const chatInfo: CurrentChatInfo = JSON.parse(chatJsonString);
        chatInfo.sentiment_status = "completed";
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatInfo));
        localStorage.setItem(`sentiment_status_chat_${chatId}`, "completed");

        // Notify all listeners (same tab + others)
        window.dispatchEvent(new CustomEvent("chat-updated"));
      } catch (error) {
        console.error("Failed to update sentiment status:", error);
      }
    }

    setSentimentStatus("completed");
  };
  const handleCancelAndClear = async () => {
    if (!chatId) return;
    
    try {
      // 1. Call delete chat endpoint
      await deleteChat(Number(chatId));
    } catch (err) {
      console.error("Failed to delete chat from backend, but clearing locally anyway:", err);
      // We continue, to ensure the UI is cleared
    }

    // 2. Clear localStorage "current_chat"
    localStorage.removeItem(CHAT_STORAGE_KEY);
    // Also remove the specific status key
    localStorage.removeItem(`sentiment_status_chat_${chatId}`);

    // 3. Update all event listeners (notify other tabs)
    window.dispatchEvent(new CustomEvent("chat-updated"));

    // 4. Revert UI to no chat uploaded state
    // The event will trigger this, but we call it manually to be safe
    updateFromLocalStorage(); 
  };

  // ✅ When processing fails
  const handleProcessingError = (errorData: ErrorData) => {
    console.error("Sentiment processing error:", errorData);
    if (errorData.error.includes("Cancelled by user")) {
      handleCancelAndClear();
    } else {
      setSentimentStatus("failed");
    }
  };

  // 🔹 Render based on current sentiment status
  switch (sentimentStatus) {
    case "checking":
      return <div>Checking chat status...</div>;

    case "no_chat":
      return <EmptySentimentState />;

    case "pending":
    case "processing":
      if (!chatId) return <EmptySentimentState />;
      return (
        <SentimentProgressView
          chatId={chatId}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      );

    case "completed":
      if (!chatId) return <EmptySentimentState />;
      return <SentimentDashboardView chatId={chatId} />;

    case "failed":
      return <div>Sentiment analysis failed. Please try uploading again.</div>;

    default:
      return <EmptySentimentState />;
  }
}
