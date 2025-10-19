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

  if (uploadState === 'uploaded') {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <CheckSentimentsButton onClick={onCheckSentiments} />
        <DeleteChatButton onDelete={onDelete} onError={onDeleteError}/>
        
      </div>
    );
  }
  const isButtonDisabled = disabled || processing;

  return (
    <Button
      disabled={isButtonDisabled}
      aria-disabled={isButtonDisabled}
      onClick={onAnalyze}
      className="
        w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw]
        h-10 sm:h-12 md:h-14 lg:h-16
        text-sm sm:text-base md:text-lg lg:text-xl
        font-semibold rounded-[36px] text-primary-foreground
        bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))]
        transition-all duration-300 hover:opacity-90 hover:scale-105
        focus:ring-4 focus:ring-[hsl(var(--mint))]/30
        disabled:opacity-50 shadow-[0_18px_36px_rgba(0,140,130,0.16)]
      "
    >
      {processing ? (
        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
      ) : (
        "Analyze Chat"
      )}
    </Button>



  );
}