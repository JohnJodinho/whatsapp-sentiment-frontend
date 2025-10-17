import { useState } from "react";
import { UploadPlaceholder } from "./UploadPlaceholder";
import { PrimaryCTA } from "./PrimaryCTA";
import { DecorativeCloudIcon } from "./DecorativeCloudIcon";
import { DecorativeSpeechBubble } from "./DecorativeSpeechBubble";
import { Lock } from "lucide-react";

const handleFileReject = (reason: string) => {
    console.warn("File rejected:", reason);
    // In a future step, you would call a function here to show a toast or modal.
};



export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // This will be used in a later stage for the analysis step
  const [isProcessing] = useState(false);

  const handleFileDrop = (file: File) => {
    console.log("File accepted:", file.name);
    setSelectedFile(file);
  };
  return (
    <div className="relative w-full max-w-[880px] text-center p-12 rounded-2xl  mx-auto">
      <DecorativeSpeechBubble className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] z-0 opacity-95 dark:opacity-95 -[clamp(0.9rem, 1.2vw, 1.2rem)]" />
      <DecorativeCloudIcon className="absolute -top-28 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] z-0 opacity-95 -[clamp(0.9rem, 1.2vw, 1.2rem)]" />

      <div className="relative z-20 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            Upload your WhatsApp chat (.txt)
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-[620px] mx-auto leading-relaxed -[clamp(0.9rem, 1.2vw, 1.2rem)]">
            We’ll analyze the sentiment instantly — privately, in your browser.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-6">
          <UploadPlaceholder 
            onFileDrop={handleFileDrop} 
            onFileReject={handleFileReject} 
          />
          <div className="mx-auto w-[520px]">
            <PrimaryCTA 
              disabled={!selectedFile}
              processing={isProcessing}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground font-medium">
          <Lock className="w-4 h-4" />
          <span>No data leaves your device.</span>
        </div>
      </div>
    </div>
  );
}
