import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DeleteChatButton } from "./DeleteChatButton";
import { CheckSentimentsButton } from "./CheckSentimentsButton";

interface PrimaryCTAProps {
  uploadState: 'ready' | 'uploaded';
  disabled?: boolean;
  processing?: boolean;
  onAnalyze: () => void;
  onDelete: () => Promise<void>;
  onDeleteError: () => void;
  onCheckSentiments: () => void;
}

export function PrimaryCTA({ 
  uploadState,
  disabled,
  processing,
  onAnalyze,
  onDelete,
  onDeleteError,
  onCheckSentiments
}: PrimaryCTAProps) {

  // -------------------------
  // STATE: UPLOADED (Result)
  // -------------------------
  if (uploadState === 'uploaded') {
    return (
      <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center justify-center animate-in fade-in slide-in-from-bottom-4">
        
        {/* Desktop: Buttons side by side. Mobile: Stacked */}
        <div className="w-full md:w-auto">
             <CheckSentimentsButton onClick={onCheckSentiments} />
        </div>

        <div className="w-full md:w-auto">
            {/* Restored the Dedicated Button Component to handle Modal Logic */}
            <DeleteChatButton onDelete={onDelete} onError={onDeleteError} />
        </div>
      </div>
    );
  }

  // -------------------------
  // STATE: READY TO UPLOAD
  // -------------------------
  const isButtonDisabled = disabled || processing;

  return (
    <Button
      disabled={isButtonDisabled}
      aria-disabled={isButtonDisabled}
      onClick={onAnalyze}
      className="
        w-full sm:w-auto min-w-[280px] h-14
        text-lg font-bold rounded-2xl
        bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))]
        text-primary-foreground shadow-xl shadow-mint/25
        hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed
        transition-all duration-300
      "
    >
      {processing ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        "Process Chat"
      )}
    </Button>
  );
}