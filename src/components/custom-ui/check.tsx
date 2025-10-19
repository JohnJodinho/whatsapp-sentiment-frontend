import { useState } from "react";
import { UploadPlaceholder } from "./UploadPlaceholder";
import { PrimaryCTA } from "./PrimaryCTA";
import { DecorativeCloudIcon } from "./DecorativeCloudIcon";
import { DecorativeSpeechBubble } from "./DecorativeSpeechBubble";
import { Lock } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { isWhatsAppExport } from "@/lib/whatsappUtils";
import { AnimatePresence, motion } from "framer-motion";

export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidExport, setIsValidExport] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileDrop = async (file: File) => {
    setSelectedFile(file);
    setIsValidExport(null); // Set to loading/checking state
    const isValid = await isWhatsAppExport(file);
    setIsValidExport(isValid);
  };

  const handleFileReject = (reason: string) => {
    console.warn("File rejected:", reason);
    // Future stage: This will trigger a toast notification.
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setIsValidExport(null);
  };
  
  const handleAnalyze = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    console.log("Starting analysis for:", selectedFile.name);
    // Stage 4 logic to start processing will be added here.
  };
  
  return (
    <div className="relative w-full max-w-[880px] text-center p-12 rounded-2xl mx-auto">
      <DecorativeSpeechBubble className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] z-0 dark:opacity-10" />
      <DecorativeCloudIcon className="absolute -top-28 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] z-0 opacity-95" />

      <div className="relative z-20 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            Upload your WhatsApp chat (.txt)
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-[620px] mx-auto leading-relaxed">
            We’ll analyze the sentiment instantly — privately, in your browser.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="relative min-h-[140px]">
            <AnimatePresence initial={false} mode="wait">
              {!selectedFile ? (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="absolute w-full"
                >
                  <UploadPlaceholder 
                    onFileDrop={handleFileDrop} 
                    onFileReject={handleFileReject} 
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="absolute w-full"
                >
                  <FilePreview 
                    file={selectedFile}
                    isValidExport={isValidExport}
                    onRemove={handleRemoveFile}
                    onReplace={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="mx-auto w-[520px]">
            <PrimaryCTA 
              disabled={!selectedFile}
              processing={isProcessing}
              onClick={handleAnalyze}
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