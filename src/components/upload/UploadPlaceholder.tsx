import { File } from "lucide-react";
import { useUploadDrop } from "@/lib/hooks/useUploadDrop";
import { cn } from "@/lib/utils";

interface UploadPlaceholderProps {
  onFileDrop: (file: File) => void;
  onFileReject: (reason: string) => void;
}

export function UploadPlaceholder({ onFileDrop, onFileReject }: UploadPlaceholderProps) {
  const { getRootProps, getInputProps, isDragging } = useUploadDrop({
    onFileDrop,
    onFileReject,
  });

  return (
    <div
      {...getRootProps()}
      aria-describedby="file-upload-hints"
      className={cn(
        `w-full p-8 min-h-[140px] border-4 border-dashed rounded-[18px]
         transition-all duration-300 cursor-pointer flex items-center justify-center
         focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-[hsl(var(--ring))]`,
        {
          // Dragging State
          "ring-4 shadow-xl border-[color:hsl(var(--mint))]/50 bg-white/80 ring-[color:hsl(var(--mint))]/30 dark:border-[color:hsl(var(--mint))]/60 dark:bg-muted/40 dark:ring-[color:hsl(var(--mint))]/40 dark:shadow-[0_0_40px_-10px_hsl(var(--mint))]": isDragging,
          // Default State
          "shadow-[0_12px_30px_rgba(6,150,136,0.06)] border-[color:hsl(var(--mint))]/18 bg-white/60 hover:border-[color:hsl(var(--mint))]/30 dark:border-[color:hsl(var(--mint))]/25 dark:bg-muted/20 dark:hover:border-[color:hsl(var(--mint))]/40 dark:shadow-none": !isDragging,
        }
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground text-center pointer-events-none">
        <File className={cn("w-8 h-8 transition-transform duration-300", {
            "scale-105 -translate-y-1": isDragging
        })} />
        <div className="relative w-100 h-7 overflow-hidden">
             <p className={cn(
                "font-semibold text-lg text-foreground absolute inset-0 transition-all duration-300",
                {
                    "opacity-0 -translate-y-4": isDragging,
                    "opacity-100 translate-y-0": !isDragging
                }
             )}>
                Drag & drop your file here or click to upload
             </p>
             <p className={cn(
                "font-semibold text-lg text-foreground absolute inset-0 transition-all duration-300",
                {
                    "opacity-100 translate-y-0": isDragging,
                    "opacity-0 translate-y-4": !isDragging
                }
             )}>
                Drop it here to start analysis 🚀
             </p>
        </div>
      </div>
      <div id="file-upload-hints" className="sr-only">
        Accepts .txt files up to 5MB.
      </div>
    </div>
  );
}