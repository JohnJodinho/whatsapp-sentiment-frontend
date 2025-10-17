import { FileText, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/utils";

interface FilePreviewProps {
  file: File;
  isValidExport: boolean | null; // null while checking
  onRemove: () => void;
  onReplace: () => void;
}

export function FilePreview({ file, isValidExport, onRemove, onReplace }: FilePreviewProps) {
  return (
    <div
      className="w-full p-6 min-h-[140px] border-2 border-dashed border-[color:hsl(var(--mint))]/40 rounded-[18px]
                 bg-background/50 dark:bg-muted/20 flex items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <FileText className="w-10 h-10 text-[hsl(var(--mint))]" />
        <div className="flex flex-col min-w-0">
          <p className="font-semibold text-foreground truncate" title={file.name}>
            {file.name}
          </p>
          <span className="text-sm text-muted-foreground">{formatBytes(file.size)}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {isValidExport !== null && (
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium px-3 py-1 rounded-full",
            isValidExport 
              ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300" 
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
          )}>
            {isValidExport ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{isValidExport ? "Valid WhatsApp export" : "Needs confirmation"}</span>
          </div>
        )}
        <Button onClick={onReplace} variant="link" className="text-primary font-semibold hidden sm:inline-flex">Replace</Button>
        <Button onClick={onRemove} variant="ghost" size="icon" aria-label="Remove uploaded file">
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}