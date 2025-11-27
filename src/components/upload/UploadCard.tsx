import { useState, useEffect} from "react";
import { UploadPlaceholder } from "./UploadPlaceholder";
import { PrimaryCTA } from "./PrimaryCTA";
import { DecorativeCloudIcon } from "./DecorativeCloudIcon";
import { DecorativeSpeechBubble } from "./DecorativeSpeechBubble";
import { Lock, Loader2 } from "lucide-react"; // Import Loader2
import { FilePreview } from "./FilePreview";
import { isWhatsAppExport } from "@/lib/whatsappUtils";
import { AnimatePresence, motion } from "framer-motion"
import { uploadWhatsAppChat, deleteChat } from "@/lib/api/chatService";
import type { ChatRead } from "@/types/chat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components
import { ZipProcessingModal } from "./ZipProcessingModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const CHAT_STORAGE_KEY = "current_chat";

export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zipFileToProcess, setZipFileToProcess] = useState<File | null>(null);
  const [isZipModalOpen, setIsZipModalOpen] = useState(false);
  const [isValidExport, setIsValidExport] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // State for upload progress
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [chat, setChat] = useState<ChatRead | null>(null);
  const [uploadPhase, setUploadPhase] = useState<'uploading' | 'processing'>('uploading');
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Function to load chat info from localStorage
    const loadChatFromLocalStorage = () => {
      try {
        const storedChat = localStorage.getItem(CHAT_STORAGE_KEY);
        if (storedChat) {
          setChat(JSON.parse(storedChat));
        } else {
          // Revert to default state if no chat exists
          setChat(null);
          setSelectedFile(null);
          setIsValidExport(null);
          setUploadProgress(0);
        }
      } catch (error) {
        console.error("Failed to parse chat data from localStorage", error);
        localStorage.removeItem(CHAT_STORAGE_KEY);
        setChat(null);
        setSelectedFile(null);
        setIsValidExport(null);
        setUploadProgress(0);
      }
    };

    // Load once when mounted
    loadChatFromLocalStorage();

    // ✅ Listen for cross-tab storage updates
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_STORAGE_KEY) {
        loadChatFromLocalStorage();
      }
    };

    // ✅ Listen for same-tab custom event (from SentimentDashboardPage)
    const handleChatUpdated = () => {
      loadChatFromLocalStorage();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chat-updated", handleChatUpdated);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chat-updated", handleChatUpdated);
    };
  }, []);


  const handleFileDrop = async (file: File) => {
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
      handleFileDrop(extractedFile);
    }
  };

  const handleFileReject = (reason: string) => {
    toast.error("Invalid File", {
      description: reason,
    });
  };

  const handleRemoveFile = () => {
    // Prevent removing file while processing
    if (isProcessing) return; 
    setSelectedFile(null);
    setIsValidExport(null);
    setUploadProgress(0); // Reset progress if file is removed
  };
  
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setUploadProgress(0); // Reset progress on new upload
    setUploadPhase('uploading');
    
    try {
      // Pass the progress callback to the updated service function
      const chatData = await uploadWhatsAppChat(selectedFile, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setUploadPhase('processing');
        }
      });
      
      // Keep modal open briefly on 100% to show completion
      setTimeout(() => {
        setChat(chatData);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
        window.dispatchEvent(new CustomEvent("chat-updated"));
        toast.success("Chat Uploaded Successfully", {
          description: "Sentiment analysis has started.",
        });
        setSelectedFile(null); // Clear file after successful upload
        setIsProcessing(false); // Close modal
      }, 500); // 0.5s delay to show 100%
      
    } catch (error: unknown) {

      console.error("Upload failed", error);


      let msg = "Upload failed.";
      if (error instanceof Error) {
        msg = error.message;
      } else if (typeof error === "string") {
        msg = error;
      } else if (error && typeof error === "object" && "message" in error && typeof (error as { message?: unknown }).message === "string") {
        msg = (error as { message: string }).message;
      }

      
      if (msg.includes("429") || msg.includes("Too Many Requests")) {
         toast.error("You are uploading too fast. Please wait.");
      } else {
         toast.error("Upload Failed", { description: msg });
      }

      
      setIsProcessing(false); 
      setUploadProgress(0); 
    }

  };

  const handleDeleteChat = async () => {
    if (!chat) return;
    try {
      await deleteChat(chat.id);
    } catch (error) {
      console.error("Delete chat error:", error);
    } finally {
      setChat(null);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent("chat-updated"));
      toast.success("Chat Deleted", {
        description: "The analysis has been removed.",
      });
    }
  };


  const handleDeleteError = () => {
    toast.error("Deletion Failed", {
      description: "Could not delete the chat. Please try again.",
    });
  };

  const handleCheckSentiments = () => {
    setTimeout(() => {
      navigate("/sentiment-dashboard");
    }, 500);
  };

  return (
    <div className="relative w-full max-w-[880px] text-center p-12 rounded-2xl  mx-auto">
      {/* --- ZIP Processing Modal --- */}
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
      
      {/* --- NEW Upload Progress Modal --- */}
      <Dialog open={isProcessing}>
        <DialogContent
          className="w-full max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              {uploadPhase === 'uploading' ? 'Uploading Chat' : 'Processing Chat'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {uploadPhase === 'uploading'
                ? "Please wait while we securely upload your WhatsApp chat."
                : "Upload complete! Now processing your chat... May take a moment."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <Loader2 className="w-10 h-10 animate-spin text-[hsl(var(--blue-accent))]" />
            
            {/* Progress Bar */}
            <div className="w-full">
              {/* MODIFIED: Replaced gray background with your theme's 'muted' color 
                for light/dark mode compatibility.
              */}
              <div className="w-full bg-muted rounded-full h-2.5">
                {/* MODIFIED: Replaced 'bg-blue-600' with your theme's gradient.
                */}
                <div 
                  className="bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] h-2.5 rounded-full transition-[width] ease-out duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {uploadPhase === 'uploading'
                  ? `${uploadProgress}% uploaded`
                  : "Processing..."}
              </p>
            </div>
          </div>
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
                    // isProcessing={isProcessing} // Pass this to disable remove btn
                  />
                  {/* --- Removed inline progress bar from here --- */}
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
              // Disable the button if no file, invalid, or during processing
              disabled={!selectedFile || !isValidExport || isProcessing} 
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

