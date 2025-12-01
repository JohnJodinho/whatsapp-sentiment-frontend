import { FileText, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  isValidExport: boolean | null;
  onRemove: () => void;
}

export function FilePreview({ file, isValidExport, onRemove }: FilePreviewProps) {
  return (
    <div
      className="w-full group relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      {/* Progress Bar / Status Indicator Strip */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300",
        isValidExport === true ? "bg-[hsl(var(--mint))]" : 
        isValidExport === false ? "bg-destructive" : "bg-muted"
      )} />

      <div className="flex items-center gap-4 p-4 pl-5">
        
        {/* Icon */}
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-xl shrink-0 transition-colors",
          isValidExport === true ? "bg-[hsl(var(--mint))]/10 text-[hsl(var(--mint))]" : "bg-muted text-muted-foreground"
        )}>
          <FileText className="w-6 h-6" />
        </div>

        {/* Text Details */}
        <div className="flex flex-col min-w-0 flex-1 gap-0.5">
          <p className="font-semibold text-foreground truncate text-base leading-tight">
            {file.name}
          </p>
          
          <div className="flex items-center gap-2 text-sm">
             <span className="text-muted-foreground font-medium tabular-nums text-xs">
               {formatBytes(file.size)}
             </span>
             
             {isValidExport !== null && (
               <>
                 <span className="text-muted-foreground/30">•</span>
                 <span className={cn(
                   "flex items-center gap-1.5 font-medium text-xs",
                   isValidExport ? "text-green-600 dark:text-green-400" : "text-destructive"
                 )}>
                   {isValidExport ? (
                     <>Valid Export <CheckCircle2 className="w-3.5 h-3.5" /></>
                   ) : (
                     <>Invalid File <AlertTriangle className="w-3.5 h-3.5" /></>
                   )}
                 </span>
               </>
             )}
          </div>
        </div>

        {/* Big Touch Target Close Button */}
        <Button 
          onClick={onRemove} 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors -mr-2"
          aria-label="Remove file"
        >
          <X className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}