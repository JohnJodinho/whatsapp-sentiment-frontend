import {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import type {
  ChatMessage as ChatMessageType,
  RawHistoryItem,
  ChatSource,
  QueryResponse
  
} from "@/types/chat";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatMessages } from "@/components/chat/ChatMessages";

import type { ChatPanelHandle } from "@/components/chat/ChatUI"; 

import { sendQueryStream, fetchHistory, resetMemory } from "@/lib/api/chatToChatService";
import { getAnalyticsData } from "@/utils/analyticsStore";

// const getAnalyticsJson = () => {
//   return {
//       general_dashboard: { total_messages: 1245, active_users: 5 },
//       sentiment_dashboard: { overall_sentiment: "positive", top_phrases: ["feeling better"] }
//   };
// };


const INITIAL_WELCOME_MESSAGE: ChatMessageType[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: "Hi! How can I help you analyze your chat or dashboard data today?",
    createdAt: new Date(),
  },
];

const mapBackendHistory = (history: RawHistoryItem[]): ChatMessageType[] => {
    return history.map(item => ({
        // Map common fields
        id: String(item.id),
        role: item.role,
        content: item.content,
        // Ensure sources is undefined when backend returns null so it matches RagSource[] | undefined
        sources: item.sources ? item.sources.map(source => ({
            ...source, 
            type: source.source_table, // Placeholder: Use source_table as the 'type' for the UI
            content: `[${source.source_table}:${source.source_id}]`, // Placeholder: Recreate the citation key as 'content'
        } as ChatSource)) : undefined,
        createdAt: new Date(item.created_at), 
    }));
};



export const ChatPanel = forwardRef<ChatPanelHandle>(
  (_, ref) => {
    const [messages, setMessages] =
      useState<ChatMessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [streamingMessage, setStreamingMessage] =
      useState<ChatMessageType | null>(null);

    // Ref to manage the interval
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const getChatId = (): string | null => {
        try {
            const chatInfo = JSON.parse(localStorage.getItem('current_chat') || '{}');
            return chatInfo.id ? String(chatInfo.id) : null;
        } catch (e) {
            console.error("Failed to parse current_chat from localStorage:", e);
            return null;
        }
    };



    useEffect(() => {
        const chatId = getChatId();
        if (!chatId) {
            setMessages(INITIAL_WELCOME_MESSAGE);
            return;
        }
        
        const loadHistory = async () => {
            try {
                
                const rawHistory = await fetchHistory(chatId); 
                const history = mapBackendHistory(rawHistory) 
                
                if (history.length === 0) {
                    setMessages(INITIAL_WELCOME_MESSAGE);
                } else {
                    setMessages(history);
                }
            } catch (error) {
                console.error("Error restoring chat history:", error);
                setMessages(INITIAL_WELCOME_MESSAGE);
            }
        };

        loadHistory();
    }, []);

    useImperativeHandle(ref, () => ({
      clearChat: async () => {

        if (streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
        }
        
        const chatId = getChatId();
        if (chatId) {
          await resetMemory(chatId);
        }
        
        // Reset frontend state
        setMessages(INITIAL_WELCOME_MESSAGE);
        setStreamingMessage(null);
        setIsLoading(false);
      },
    }));

    // --- INTEGRATION POINT 1: SENDING LLM QUERY ---
    const handleSend = async (content: string) => {
      const chatId = getChatId();
      if (!chatId) {
          return; 
      }

      // 1. Add user message & set loading state (UI remains the same)
      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      const streamId = crypto.randomUUID();
      setStreamingMessage({
        id: streamId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      });

      const callbacks = {
          onChunk: (chunk: string) => {
              // Append new text chunk to the streaming message content
              setStreamingMessage((prev) => 
                  prev && prev.id === streamId 
                      ? { ...prev, content: prev.content + chunk } 
                      : prev
              );
          },
          onEnd: (finalData: QueryResponse) => {
              // 3. End of stream, clear skeleton and stop loading
              setIsLoading(false);
              setStreamingMessage(null);

              // 4. Add final message
              const assistantMessage: ChatMessageType = {
                  id: streamId, // Use the same ID as the shell
                  role: "assistant",
                  content: finalData.answer,
                  createdAt: new Date(),
                  sources: finalData.sources,
              };
              setMessages((prev) => [...prev, assistantMessage]);
          },
          onError: (error: Error) => {
              console.error("LLM Query failed:", error);
              // Fallback for error handling
              setIsLoading(false);
              setStreamingMessage(null); 
              setMessages((prev) => [
                  ...prev,
                  {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: `Sorry, the streaming connection failed. Error: ${error.message}`,
                      createdAt: new Date(),
                  } as ChatMessageType,
              ]);
          },
      };

      try {
        const payload = {
            question: content, 
            analytics_json: getAnalyticsData(), 
        }

      // --- SERVICE CALL ---
              // Ensure analytics_json matches the expected Record<string, unknown> shape
              // by casting the result of getAnalyticsData() to an indexable record.
              await sendQueryStream(chatId, {
                  ...payload,
                  analytics_json: getAnalyticsData() as unknown as Record<string, unknown>,
              }, callbacks); 
              // ------------------
      
            } catch (error) {
                // This catch block will usually only handle synchronous errors before the fetch starts
                callbacks.onError(error as Error);
            }
    };

    return (
      <div className="relative flex flex-col bg-card border border-border/60 rounded-2xl shadow-sm mt-6 h-[75vh] overflow-hidden">
        <ChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isLoading}
        />
        <div className="border-t border-border/60 bg-card/80 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
          <ChatInput
            isLoading={isLoading}
            onSend={handleSend}
          />
        </div>
      </div>
    );
  }
);