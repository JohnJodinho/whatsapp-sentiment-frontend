import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ChatSource } from "@/types/chat";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Optional: if you have this component, otherwise standard div overflow works

interface CitationViewerProps {
  source: ChatSource | null;
  onClose: () => void;
}

export function CitationViewer({ source, onClose }: CitationViewerProps) {
  const isOpen = !!source;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[600px] max-h-[90vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/20">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Source Detail
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Raw information retrieved from the backend RAG system.
          </DialogDescription>
        </DialogHeader>

        {source && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Source Location
                 </span>
                 <div className="text-sm font-medium text-[hsl(var(--mint))] bg-[hsl(var(--mint))]/10 px-3 py-1.5 rounded-md w-fit">
                    {source.type} — ID: {source.source_id}
                 </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Content
                </span>
                <div className="p-4 bg-muted/30 border border-border rounded-lg">
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap break-words">
                    {source.text}
                  </p>
                </div>
              </div>

              {source.distance && (
                <p className="text-xs text-muted-foreground text-right pt-2">
                  Relevance Score: <span className="font-mono">{(1 - source.distance).toFixed(4)}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}