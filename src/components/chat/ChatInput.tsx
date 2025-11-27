import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  isLoading: boolean;
  onSend: (message: string) => void;
  // onClear prop is removed
}

export function ChatInput({ isLoading, onSend }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput(""); // Clear input after sending
    }
  };

  // Handles Enter to send and Shift+Enter for newlines
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent default newline
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="p-4 flex items-start gap-3 rounded-b-2xl"
    >
      {/* Clear Chat Button (Trash2) is removed */}

      {/* Text Input Area */}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your chat or dashboard insights..."
        rows={1}
        className="flex-1 rounded-xl bg-muted/40 border border-border px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mint))] focus:border-transparent resize-none overflow-y-auto scrollbar-thin"
        disabled={isLoading}
      />

      {/* Send Button */}
      <Button
        className="rounded-xl px-4 py-2 bg-gradient-to-r from-[hsl(var(--mint))] via-[hsl(var(--cyan-accent))] to-[hsl(var(--blue-accent))] text-white font-medium shadow hover:opacity-90 transition-all duration-200"
        disabled={input.trim() === "" || isLoading}
        onClick={handleSend}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Send</span>
          </>
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </motion.div>
  );
}