import { useState, useEffect} from "react";
import { UploadPlaceholder } from "./UploadPlaceholder";
import { PrimaryCTA } from "./PrimaryCTA";
import { DecorativeCloudIcon } from "./DecorativeCloudIcon";
import { DecorativeSpeechBubble } from "./DecorativeSpeechBubble";
import { Lock } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { isWhatsAppExport } from "@/lib/whatsappUtils";
import { AnimatePresence, motion } from "framer-motion"
import { uploadWhatsAppChat, deleteChatMock } from "@/lib/api";
import type { ChatRead } from "@/types/chat";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ZipProcessingModal } from "./ZipProcessingModal";
import { toast } from "sonner";



const CHAT_STORAGE_KEY = "current_chat";

export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zipFileToProcess, setZipFileToProcess] = useState<File | null>(null);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isValidExport, setIsValidExport] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chat, setChat] = useState<ChatRead | null>(null);


  useEffect(() => {
    try {
      const storedChat = localStorage.getItem(CHAT_STORAGE_KEY);
      if (storedChat) {
        setChat(JSON.parse(storedChat));
      }
    } catch (error) {
      console.error("Failed to parse chat data from localStorage", error);
      localStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, []);

  const handleFileDrop = async (file: File) => {
    // ✨ NEW LOGIC: Route file based on type
    if (file.type.includes("zip") || file.name.toLowerCase().endsWith(".zip")) {
      setZipFileToProcess(file);
      setIsZipModalOpen(true);
    } else {
      // Existing .txt file logic
      setSelectedFile(file);
      setIsValidExport(null);
      const isValid = await isWhatsAppExport(file);
      setIsValidExport(isValid);
      if (!isValid) {
        toast.warning("Not a valid WhatsApp export file", {
          description: "Please make sure the file is a standard .txt export.",
        });
      }
    }
  };

  const handleZipExtractionComplete = (extractedFile: File | null) => {
    setIsZipModalOpen(false);
    setZipFileToProcess(null);

    if (extractedFile) {
      // Success! Recursively call handleFileDrop with the new .txt file
      handleFileDrop(extractedFile);
    }
    // On failure, the modal shows an error and we just reset.
  };

  const handleFileReject = (reason: string) => {
    toast.error("Invalid File", {
      description: reason,
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setIsValidExport(null);
  };
  
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    try {
      const chatData = await uploadWhatsAppChat(selectedFile);
      setChat(chatData);
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
      
      // ✨ UPDATED: Switched to sonner's success toast
      toast.success("Chat Uploaded Successfully", {
        description: "Sentiment analysis has started.",
      });
      setSelectedFile(null);
    } catch (error) {
      // ✨ UPDATED: Switched to sonner's error toast
      toast.error("Upload Failed", {
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!chat) return;
    await deleteChatMock(chat.id)
    setChat(null);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    
    // ✨ UPDATED: Switched to sonner's success toast for confirmation
    toast.success("Chat Deleted", {
      description: "The analysis has been removed.",
    });
  };

  const handleDeleteError = () => {
    toast.error("Deletion Failed", {
      description: "Could not delete the chat. Please try again.",
    });
  };

  const handleCheckSentiments = () => {
    // ✨ UPDATED: Switched to sonner's info toast
    toast.info("Navigating...", {
      description: `Loading results for Chat ID: ${chat?.id}`,
    });
  };

  return (
    <div className="relative w-full max-w-[880px] text-center p-12 rounded-2xl  mx-auto">
      <Dialog open={isZipModalOpen} onOpenChange={setIsZipModalOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} showCloseButton={false}>
          {zipFileToProcess && (
            <ZipProcessingModal
              zipFile={zipFileToProcess}
              onComplete={handleZipExtractionComplete}
            />
          )}
        </DialogContent>
      </Dialog>
      <DecorativeSpeechBubble className="absolute -top-24 left-1/2 -translate-x-1/2 w-[34rem] h-[34rem] z-0 opacity-95 dark:opacity-95 -[clamp(0.9rem, 1.2vw, 1.2rem)]" />
      <DecorativeCloudIcon className="absolute -top-28 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] z-0 opacity-95 -[clamp(0.9rem, 1.2vw, 1.2rem)]" />

      <div className="relative z-20 space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight">
            {chat ? "Upload Successful!" : "Upload your WhatsApp chat (.txt)"}
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-[620px] mx-auto leading-relaxed -[clamp(0.9rem, 1.2vw, 1.2rem)]">
            {chat ? `Chat "${chat.title}" has been uploaded for analysis.` : "Chats uploaded are securely sent to server to generate sentiment insights."}
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="relative min-h-[140px]">
            <AnimatePresence initial={false} mode="wait">
            {selectedFile && !chat ? (
              <motion.div key="preview" {...animationProps}>
                <FilePreview 
                  file={selectedFile}
                  isValidExport={isValidExport}
                  onRemove={handleRemoveFile}
              
                />
              </motion.div>
            ) : (
              <motion.div key="placeholder" {...animationProps}>
                <UploadPlaceholder onFileDrop={handleFileDrop} onFileReject={handleFileReject} disabled={!!chat} />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
          <div className="flex justify-center w-full">
            <PrimaryCTA 
              uploadState={chat ? 'uploaded' : 'ready'}
              disabled={!selectedFile || !isValidExport}
              processing={isProcessing}
              onAnalyze={handleAnalyze}
              onDelete={handleDeleteChat}
              onDeleteError={handleDeleteError}
              onCheckSentiments={handleCheckSentiments}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground font-medium">
          <Lock className="w-4 h-4" />
          <span>Uploaded chats are used only for analysis and are not stored after processing.</span>
        </div>
      </div>
    </div>
  );
}

const animationProps = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.25 },
  className: "absolute w-full",
};