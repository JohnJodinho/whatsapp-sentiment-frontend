import { useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatPanel } from "./ChatPanel";
// import type { ChatContext } from "./ContextSelector";
import { TooltipProvider } from "@/components/ui/tooltip";

export interface ChatPanelHandle {
  clearChat: () => void;
}

export function ChatUI() {
  
  const chatPanelRef = useRef<ChatPanelHandle>(null);

  const handleClear = () => {
    chatPanelRef.current?.clearChat();
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen bg-background/95">
        <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent -z-10" />
        <div className="flex flex-col flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          <ChatHeader

            onClear={handleClear}
          />

          <ChatPanel ref={chatPanelRef}  />
        </div>
      </div>
    </TooltipProvider>
  );
}
