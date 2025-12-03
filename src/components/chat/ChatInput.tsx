import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  isLoading: boolean;
  isHistoryLoading?: boolean; // New prop
  onSend: (message: string) => void;
}

export function ChatInput({ isLoading, isHistoryLoading = false, onSend }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !isLoading && !isHistoryLoading) {
      onSend(input);
      setInput(""); 
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); 
      handleSend();
    }
  };

  // Determine placeholder and disabled state
  const isInputDisabled = isLoading || isHistoryLoading;
  const placeholderText = isHistoryLoading 
    ? "Preparing your chat environment..." 
    : "Ask about your chat or dashboard insights...";

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-3 md:p-4 flex items-end gap-2 md:gap-3" // Adjusted alignment for multiline
    >
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholderText}
        rows={1}
        // Mobile: text-base (16px) prevents zoom. Desktop: text-sm
        className="flex-1 min-h-[44px] max-h-[120px] rounded-2xl bg-muted/40 border border-border px-4 py-3 
                   text-base md:text-sm placeholder:text-muted-foreground 
                   focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mint))] focus:border-transparent 
                   resize-none overflow-y-auto scrollbar-thin"
        disabled={isInputDisabled}
      />

      <Button
        className={`rounded-xl px-4 h-[44px] bg-gradient-to-r from-[hsl(var(--mint))] via-[hsl(var(--cyan-accent))] to-[hsl(var(--blue-accent))] 
                   text-white font-medium shadow hover:opacity-90 transition-all duration-200 
                   ${input.trim() === "" && !isLoading ? 'opacity-70' : 'opacity-100'}`}
        disabled={input.trim() === "" || isInputDisabled}
        onClick={handleSend}
      >
        {isLoading || isHistoryLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5 md:mr-1" />
        )}
        <span className="sr-only">Send message</span>
        <span className="hidden md:inline">Send</span>
      </Button>
    </motion.div>
  );
}