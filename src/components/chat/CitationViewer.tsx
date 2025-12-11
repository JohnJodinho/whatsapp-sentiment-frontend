import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ChatSource } from "@/types/chat";
import { Calendar, MessageSquareQuote, Info } from "lucide-react"; // Assuming you have lucide-react

interface CitationViewerProps {
  source: ChatSource | null;
  onClose: () => void;
}

export function CitationViewer({ source, onClose }: CitationViewerProps) {
  const isOpen = !!source;

  // Helper to format timestamp nicely
  const formatDate = (dateInput?: string | Date) => {
    if (!dateInput) return "Unknown date";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  // Helper to get initials for the avatar fallback
  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl border-border">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2 text-foreground">
            <MessageSquareQuote className="w-5 h-5 text-primary" />
            <DialogTitle className="text-lg font-semibold">
              Source Context
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Original message retrieved from conversation history.
          </DialogDescription>
        </DialogHeader>

        {source && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex flex-col gap-6">
              
              {/* 1. Human Context (Who & When) */}
              <div className="flex items-start gap-4">
                {/* Avatar Placeholder */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                  {getInitials(source.sender_name)}
                </div>
                
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-foreground">
                    {source.sender_name || "Unknown Sender"}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(source.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* 2. The Content (Natural Language) */}
              <div className="relative group">
                <div className="absolute inset-0 bg-muted/20 rounded-lg -z-10" />
                <div className="p-4 border border-border/60 rounded-lg bg-card shadow-sm">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                    {source.text}
                  </p>
                </div>
              </div>

              {/* 3. Technical Metadata (Footer) */}
              <div className="mt-2 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  
                  {/* Left: Source ID/Type */}
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/70">
                      System Metadata
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="bg-muted px-2 py-0.5 rounded border border-border/50">
                          {source.type}
                       </span>
                       <span className="font-mono opacity-70">
                          ID: {source.source_id}
                       </span>
                    </div>
                  </div>

                  {/* Right: Relevance Score */}
                  {source.distance !== undefined && (
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground/70">
                        AI Relevance
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Info className="w-3 h-3" />
                        <span className="font-mono text-foreground">
                          {(1 - source.distance).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}