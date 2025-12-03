// src\components\chat\ChatMessages.tsx

import { useEffect, useRef, useState } from "react";
import type { ChatMessage as ChatMessageType, ChatSource } from "@/types/chat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { CitationViewer } from "@/components/chat/CitationViewer";
import { Skeleton } from "@/components/ui/skeleton";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  streamingMessage: ChatMessageType | null;
  isLoading: boolean;
  processingState?: boolean;
}

// New Skeleton Component
function AssistantSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start"
    >
      <div
        className={`relative px-4 py-3 rounded-2xl shadow-sm text-sm max-w-[75%]
          self-start bg-card text-muted-foreground border border-border/80`}
      >
        <div className="absolute -top-3 -left-3 w-7 h-7 bg-card border border-border/80 rounded-full flex items-center justify-center shadow-sm">
          <BrainCircuit className="w-4 h-4 text-[hsl(var(--cyan-accent))]" />
        </div>
        <div className="space-y-2 p-2">
          <Skeleton className="h-4 w-48 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </motion.div>
  );
}

function ProcessingIndicator() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 p-8">
            <div className="relative w-16 h-16 flex items-center justify-center">
                 <div className="absolute inset-0 border-4 border-[hsl(var(--mint))/20] rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-[hsl(var(--mint))] rounded-full animate-spin"></div>
                 <BrainCircuit className="w-6 h-6 text-[hsl(var(--mint))]" />
            </div>
            <div className="text-center space-y-1">
                <h3 className="font-medium text-foreground">Preparing your environment</h3>
                <p className="text-xs max-w-[250px] mx-auto opacity-80">
                    We're processing your chat history to provide accurate insights.
                </p>
            </div>
        </div>
    )
}

export function ChatMessages({
  messages,
  streamingMessage,
  isLoading,
  processingState = false,
}: ChatMessagesProps) {
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [selectedSource, setSelectedSource] = useState<ChatSource | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage?.content]); 
  const handleSourceClick = (source: ChatSource) => {
    setSelectedSource(source);
  };
  
  // Handler to close the modal
  const handleCloseViewer = () => {
    setSelectedSource(null);
  };

  if (processingState) {
    return (
      <div className="flex-1 overflow-hidden relative">
        <ProcessingIndicator />
      </div>
    )
  }
  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
        
        {messages.map((message) => (
        
          <ChatMessage 
            key={message.id} 
            message={message} 
            onSourceClick={handleSourceClick} 
          />
        ))}

        
        {streamingMessage && (
            // Note: streamingMessage.content is allowed to be empty here
            <ChatMessage message={streamingMessage} onSourceClick={handleSourceClick} />
        )}

        {/* 3. Render the skeleton (if loading, but streaming message is not yet active) */}
        {isLoading && !streamingMessage && ( // Only show skeleton if loading AND no streaming message shell exists
          <AssistantSkeleton />
        )}

        <div ref={chatEndRef} />
      </div>
      <CitationViewer
        source={selectedSource}
        onClose={handleCloseViewer}
      />
    </>
  );
}