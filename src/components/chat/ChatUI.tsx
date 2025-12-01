import { useRef } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatPanel } from "./ChatPanel";
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
      {/* Mobile: h-[100dvh] locks the height to the viewport, preventing window scrolling.
         bg-background/95 ensures readability.
      */}
      <div className="flex flex-col h-[100dvh] bg-background/95 relative overflow-hidden">
        
        {/* Background gradient - adjusted z-index to be behind content */}
        <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-[hsl(var(--mint))]/10 to-transparent -z-10 pointer-events-none" />
        
        {/* Container:
           Mobile: p-0 (Full edge-to-edge), flex-1 (fills height)
           Desktop: max-w-6xl, centered, padding
        */}
        <div className="flex flex-col flex-1 w-full max-w-6xl mx-auto md:px-6 md:py-6 h-full">
          
          {/* Header: hidden or minimized on very small screens if needed, but currently preserved */}
          <div className="px-4 md:px-0 flex-shrink-0">
            <ChatHeader onClear={handleClear} />
          </div>

          {/* Panel: Takes remaining height */}
          <ChatPanel ref={chatPanelRef} />
        </div>
      </div>
    </TooltipProvider>
  );
}