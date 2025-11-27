// src/components/chat/CitationViewer.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ChatSource } from "@/types/chat";

interface CitationViewerProps {
  source: ChatSource | null;
  onClose: () => void;
}

export function CitationViewer({ source, onClose }: CitationViewerProps) {

  const isOpen = !!source;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            Source Detail
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Raw information retrieved from the backend RAG system.
          </DialogDescription>
        </DialogHeader>
        
        {source && (
          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium">
              Source Location:{" "}
              <span className="font-normal text-[hsl(var(--mint))]">
                {source.type} - ID: {source.source_id}
              </span>
            </p>
            <div className="p-3 bg-muted/40 border border-border rounded-lg">
              <p className="text-sm italic text-foreground/80 whitespace-pre-wrap">
                {/* The 'text' field contains the raw message content (e.g., "Okay what help do you need?") */}
                {source.text} 
              </p>
            </div>
            
            {/* Optional details (distance is from the example response) */}
            {source.distance && (
              <p className="text-xs text-muted-foreground">
                Relevance Score: {(1 - source.distance).toFixed(4)}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}