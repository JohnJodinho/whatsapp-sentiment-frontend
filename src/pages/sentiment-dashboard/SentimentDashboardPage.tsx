import { useState, useEffect } from "react";
import { EmptySentimentState } from "@/pages/sentiment-dashboard/EmptySentimentState"; 
import { SentimentProgressView } from "@/pages/sentiment-dashboard/SentimentProgressView"; 
import { SentimentDashboardView } from "@/pages/sentiment-dashboard/SentimentDashboardView"; 

// possible sentiment processing states
type SentimentStatus = "checking" | "no_chat" | "pending" | "processing" | "completed" | "error" | "failed";
interface CurrentChatInfo {
  id: number;
  title: string;
  created_at: string;
  sentiment_status: SentimentStatus | string; 
}


export default function SentimentDashboardPage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [sentimentStatus, setSentimentStatus] = useState<SentimentStatus>("checking");

useEffect(() => {
    const chatJsonString = localStorage.getItem("current_chat");

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

         if (initialStatus === "completed") {
            setSentimentStatus("completed");
         } else {
            
             setSentimentStatus(initialStatus);
         }
      } else {
         console.warn(`Unknown initial sentiment status "${initialStatus}", defaulting to pending.`);
         setSentimentStatus("pending");
      }


    } catch (error) {
      console.error("Failed to parse current_chat from localStorage:", error);
      setSentimentStatus("no_chat"); 
      setChatId(null);
    }

  }, []);

  const handleProcessingComplete = () => {
    if (chatId) {
      localStorage.setItem(`sentiment_status_chat_${chatId}`, "completed");
    }
    setSentimentStatus("completed");
  };
  
   const handleProcessingError = (error: string) => {
     console.error("Sentiment processing error:", error);
     setSentimentStatus("failed"); 
   };

  // 
  switch (sentimentStatus) {
    case "checking":
      return <div>Checking chat status...</div>; 
    case "no_chat":
      return <EmptySentimentState />;
    case "pending": // Treat pending and processing similarly for UI
    case "processing":
       if (!chatId) return <EmptySentimentState />; // Should not happen, but safeguard
       return (
         <SentimentProgressView 
           chatId={chatId} 
           onComplete={handleProcessingComplete}
           onError={handleProcessingError} // Pass error handler
         />
       );
    case "completed":
       if (!chatId) return <EmptySentimentState />; // Safeguard
      // Render the actual dashboard view (placeholder for now)
      return <SentimentDashboardView chatId={chatId} />; 
    case "failed":
       // Optional: Render a specific error component
       return <div>Sentiment analysis failed. Please try uploading again.</div>; 
    default:
      return <EmptySentimentState />;
  }
}
