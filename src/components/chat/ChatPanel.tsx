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
import { generateUUID } from "@/utils/uuid"; // Import the fix

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
        id: String(item.id),
        role: item.role,
        content: item.content,
        sources: item.sources ? item.sources.map(source => ({
            ...source, 
            type: source.source_table,
            content: `[${source.source_table}:${source.source_id}]`,
        } as ChatSource)) : undefined,
        createdAt: new Date(item.created_at), 
    }));
};

export const ChatPanel = forwardRef<ChatPanelHandle>(
  (_, ref) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    
    // Logic Fix: Separate loading states
    const [isGenerating, setIsGenerating] = useState(false); // LLM generation
    const [isHistoryLoading, setIsHistoryLoading] = useState(true); // Initial load
    
    const [streamingMessage, setStreamingMessage] = useState<ChatMessageType | null>(null);
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
        
        const loadHistory = async () => {
            if (!chatId) {
                setMessages(INITIAL_WELCOME_MESSAGE);
                setIsHistoryLoading(false);
                return;
            }

            try {
                // Ensure UI knows we are loading history
                setIsHistoryLoading(true);
                const rawHistory = await fetchHistory(chatId); 
                const history = mapBackendHistory(rawHistory);
                
                if (history.length === 0) {
                    setMessages(INITIAL_WELCOME_MESSAGE);
                } else {
                    setMessages(history);
                }
            } catch (error) {
                console.error("Error restoring chat history:", error);
                setMessages(INITIAL_WELCOME_MESSAGE);
            } finally {
                // Logic Fix: Unlock input
                setIsHistoryLoading(false);
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
        
        setMessages(INITIAL_WELCOME_MESSAGE);
        setStreamingMessage(null);
        setIsGenerating(false);
      },
    }));

    const handleSend = async (content: string) => {
      const chatId = getChatId();
      if (!chatId) return; 

      // 1. Add user message
      const userMessage: ChatMessageType = {
        id: generateUUID(), // Bug fix
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsGenerating(true);
      
      const streamId = generateUUID(); // Bug fix
      setStreamingMessage({
        id: streamId,
        role: "assistant",
        content: "",
        createdAt: new Date(),
      });

      const callbacks = {
          onChunk: (chunk: string) => {
              setStreamingMessage((prev) => 
                  prev && prev.id === streamId 
                      ? { ...prev, content: prev.content + chunk } 
                      : prev
              );
          },
          onEnd: (finalData: QueryResponse) => {
              setIsGenerating(false);
              setStreamingMessage(null);

              const assistantMessage: ChatMessageType = {
                  id: streamId,
                  role: "assistant",
                  content: finalData.answer,
                  createdAt: new Date(),
                  sources: finalData.sources,
              };
              setMessages((prev) => [...prev, assistantMessage]);
          },
          onError: (error: Error) => {
              console.error("LLM Query failed:", error);
              setIsGenerating(false);
              setStreamingMessage(null); 
              setMessages((prev) => [
                  ...prev,
                  {
                      id: generateUUID(), // Bug fix
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

          await sendQueryStream(chatId, {
              ...payload,
              analytics_json: getAnalyticsData() as unknown as Record<string, unknown>,
          }, callbacks); 
      
      } catch (error) {
          callbacks.onError(error as Error);
      }
    };

    return (
      <div className="relative flex flex-col flex-1 overflow-hidden bg-card 
        /* Mobile: Full width/height, no borders/radius */
        w-full h-full
        border-0 rounded-none shadow-none

        /* Desktop: Card style, fixed height, specific width */
        md:border md:border-border/60 md:rounded-2xl md:shadow-sm md:h-[75vh] md:mt-6
      ">
        <ChatMessages
          messages={messages}
          streamingMessage={streamingMessage}
          isLoading={isGenerating || isHistoryLoading} // Pass combined loading state
        />
        
        {/* Input Area Container */}
        <div className="border-t border-border/60 bg-card/80 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-10">
          <ChatInput
            isLoading={isGenerating}
            isHistoryLoading={isHistoryLoading} // Pass specific history state
            onSend={handleSend}
          />
        </div>
      </div>
    );
  }
);