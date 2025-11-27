import { ChatUI } from "@/components/chat/ChatUI";
import { DefaultState } from "@/components/chat/DefaultState";
import { useEffect, useState } from "react";
import type { ChatDefaultState } from "@/types/chat";

type ChatStatus = "loading" | ChatDefaultState | "active";

interface CurrentChatInfo {
  id: number;
  sentiment_status: string; 
}

const CHAT_STORAGE_KEY = "current_chat";

export default function ChatPage() {
  const [status, setStatus] = useState<ChatStatus>("loading");


  const updateFromLocalStorage = () => {
    const chatJsonString = localStorage.getItem(CHAT_STORAGE_KEY);

    if (!chatJsonString) {
      setStatus("noChat");
      return;
    }

    try {
      const chatInfo: CurrentChatInfo = JSON.parse(chatJsonString);

      if (chatInfo.sentiment_status === "completed" || chatInfo.sentiment_status === "pending") {
        setStatus("active");
      } else {
        // "processing", "failed"...
        setStatus("noSentiment");
      }
    } catch (e) {
      console.error("Failed to parse current_chat:", e);
      setStatus("noChat");
    }
  };

  useEffect(() => {
    
    updateFromLocalStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_STORAGE_KEY) {
        updateFromLocalStorage();
      }
    };

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


  switch (status) {
    case "noChat":
      return <DefaultState state="noChat" />;
    case "noSentiment":
      return <DefaultState state="noSentiment" />;
    case "active":
      return <ChatUI />;
    case "loading":
    default:
      return null; // Replace to show spinner later...
  }
}
