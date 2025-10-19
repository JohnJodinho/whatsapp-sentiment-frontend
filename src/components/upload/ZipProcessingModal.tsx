import { useState, useEffect } from "react";
import { extractChatTxtFromZip } from "@/lib/zipUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface ZipProcessingModalProps {
  zipFile: File;
  onComplete: (extractedFile: File | null, error?: string) => void;
}

type ModalState = 'extracting' | 'success' | 'failure';

export function ZipProcessingModal({ zipFile, onComplete }: ZipProcessingModalProps) {
  const [state, setState] = useState<ModalState>('extracting');
  const [message, setMessage] = useState("ZIP file received. Extracting chat...");

  useEffect(() => {
    const processZip = async () => {
      try {
        const extractedFile = await extractChatTxtFromZip(zipFile);
        setMessage("Chat file extracted successfully.");
        setState('success');
        setTimeout(() => onComplete(extractedFile), 2000);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setMessage(errorMessage);
        setState('failure');
        setTimeout(() => onComplete(null, errorMessage), 3000);
      }
    };
    processZip();
  }, [zipFile, onComplete]);

  const renderContent = () => {
    const iconMap = {
      extracting: <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />,
      success: <CheckCircle className="w-12 h-12 text-green-500" />,
      failure: <XCircle className="w-12 h-12 text-destructive" />,
    };

    return (
      <div className="flex flex-col items-center justify-center text-center gap-4 p-8 min-h-[220px]">
        {iconMap[state]}
        <p className="font-semibold text-lg">{message}</p>
      </div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>
    </AnimatePresence>
  );
}