import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PrimaryCTAProps {
  disabled?: boolean;
  processing?: boolean;
}

export function PrimaryCTA({ disabled = true, processing = false }: PrimaryCTAProps) {
  const isDisabled = disabled || processing;

  return (
    <Button
      size="lg"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className="w-full h-16 text-base font-semibold rounded-[36px] text-primary-foreground 
                 bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))]
                 transition-all duration-300 hover:opacity-90 hover:scale-105
                 focus:ring-4 focus:ring-[hsl(var(--mint))]/30
                 disabled:opacity-50 shadow-[0_18px_36px_rgba(0,140,130,0.16)]"
    >
      {processing ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        "Analyze Chat"
      )}
    </Button>
  );
}