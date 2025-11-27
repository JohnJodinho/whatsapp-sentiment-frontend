import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";


interface ChatHeaderProps {
  onClear: () => void;
}

export function ChatHeader({
  onClear,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between py-4 border-b border-border/60">
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-[hsl(var(--mint))]" />
          Chat-to-Chat
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask questions using natural language.
        </p>
      </div>

      <div className="flex items-center gap-3">
        
        <Button variant="ghost" size="icon" onClick={onClear}>
          <RotateCcw className="w-4 h-4" />
          <span className="sr-only">Clear conversation</span>
        </Button>
      </div>
    </header>
  );
}
