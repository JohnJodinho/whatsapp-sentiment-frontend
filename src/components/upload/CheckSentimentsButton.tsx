import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
interface CheckSentimentsButtonProps {
  onClick: () => void;
}

export function CheckSentimentsButton({ onClick }: CheckSentimentsButtonProps) {
  const isMobile = useMediaQuery('(max-width: 640px)')

  const buttonClass = isMobile
  ? "w-120 h-12 text-base font-semibold rounded-full text-primary-foreground bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] transition-all duration-300 hover:opacity-90 hover:scale-105"
  : "w-70 h-12 text-base font-semibold rounded-full text-primary-foreground bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] transition-all duration-300 hover:opacity-90 hover:scale-105"

  return (
    <Button
      onClick={onClick}
      size="lg"
      className={buttonClass}
    >
      Check Sentiments
      <ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  );
}