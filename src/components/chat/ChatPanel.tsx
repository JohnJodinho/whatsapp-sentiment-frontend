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
import { sendQueryStream, fetchHistory, resetMemory, getChatStatus } from "@/lib/api/chatToChatService";
import { getAnalyticsData, hasAnalyticsData } from "@/utils/analyticsStore";
import { generateUUID } from "@/utils/uuid"; 
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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

type EmbeddingStatus = "pending" | "processing" | "completed" | "failed";

export const ChatPanel = forwardRef<ChatPanelHandle>(
  (_, ref) => {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    
    // Logic Fix: Separate loading states
    const [isGenerating, setIsGenerating] = useState(false); // LLM generation
    const [isHistoryLoading, setIsHistoryLoading] = useState(true); // Initial load
    const [embeddingStatus, setEmbeddingStatus] = useState<EmbeddingStatus | null>("pending");
    const [streamingMessage, setStreamingMessage] = useState<ChatMessageType | null>(null);
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
          setIsHistoryLoading(false);
          return;
        }

        const checkStatusAndLoad = async () => {
          try {
                const { status } = await getChatStatus(chatId);
                setEmbeddingStatus(status);

                if (status === "completed") {
                    // Stop polling, load history
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    
                    const rawHistory = await fetchHistory(chatId);
                    const history = mapBackendHistory(rawHistory);
                    setMessages(history.length > 0 ? history : INITIAL_WELCOME_MESSAGE);
                    setIsHistoryLoading(false);
                } 
                else if (status === "failed") {
                    // Stop polling, show error
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setIsHistoryLoading(false);
                    toast.error("Analysis Failed", {
                        description: "We couldn't process this chat file. Please try uploading it again."
                    });
                }
                // If pending/processing, do nothing (keep polling, keep history loading)
            } catch (error) {
                console.error("Error checking chat status:", error);
                // Keep trying or fail gracefully?
            }
        };


        checkStatusAndLoad();

        // Start polling
        pollingIntervalRef.current = setInterval(checkStatusAndLoad, 3000);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        };
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

      if (!hasAnalyticsData()) {
          toast.info("Dashboard Data Missing", {
              description: "Please visit the Dashboard page to load your analytics first. Without it, I can only answer general questions.",
              duration: 5000,
          });
          
      }
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
                      content: `Sorry, the streaming messages failed. Error: ${error.message}`,
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

    // const getLoadingText = () => {
    //     if (embeddingStatus === 'processing' || embeddingStatus === 'pending') return "Processing your chat data...";
    //     if (isHistoryLoading) return "Loading history...";
    //     return undefined; 
    // };

    //Lock if Generating response OR History loading OR Processing embeddings 
    const shouldDisableInput = isGenerating || isHistoryLoading || embeddingStatus === 'processing' || embeddingStatus === 'pending';

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
          processingState = {embeddingStatus === 'processing' || embeddingStatus === 'pending'}
        />
        
        <div className="border-t border-border/60 bg-card/80 backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.05)] z-10">
            {/* Show a banner if processing */}
            {(embeddingStatus === 'processing' || embeddingStatus === 'pending') && (
                 <div className="bg-blue-50/50 dark:bg-blue-900/10 px-4 py-2 text-xs text-center text-blue-600 dark:text-blue-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Processing your chat data. This may take a moment.</span>
                 </div>
            )}
          
          <ChatInput
            isLoading={isGenerating}
            isHistoryLoading={shouldDisableInput} // Reusing this prop to lock the input
            onSend={handleSend}
          />
        </div>
      </div>
    );
  }
);