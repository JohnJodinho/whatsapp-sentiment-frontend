import { useState, useEffect } from "react";
import { UploadPlaceholder } from "./UploadPlaceholder";
import { PrimaryCTA } from "./PrimaryCTA";
import { DecorativeCloudIcon } from "./DecorativeCloudIcon";
import { DecorativeSpeechBubble } from "./DecorativeSpeechBubble";
import { Lock, Loader2, CheckCircle2 } from "lucide-react";
import { FilePreview } from "./FilePreview";
import { isWhatsAppExport } from "@/lib/whatsappUtils";
import { AnimatePresence, motion } from "framer-motion"
import { uploadWhatsAppChat, deleteChat } from "@/lib/api/chatService";
import type { ChatRead } from "@/types/chat";
// Import BOTH Dialog and Sheet components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ZipProcessingModal } from "./ZipProcessingModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

const CHAT_STORAGE_KEY = "current_chat";
const ANALYTICS_STORAGE_KEY = "analytics_json";

export function UploadCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [zipFileToProcess, setZipFileToProcess] = useState<File | null>(null);
  const [isZipOpen, setIsZipOpen] = useState(false);
  const [isValidExport, setIsValidExport] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); 
  const [chat, setChat] = useState<ChatRead | null>(null);
  const [uploadPhase, setUploadPhase] = useState<'uploading' | 'processing'>('uploading');
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)"); // Detect mobile

  useEffect(() => {
    const loadChatFromLocalStorage = () => {
      try {
          const storedChat = localStorage.getItem(CHAT_STORAGE_KEY);
          if (storedChat) {
            setChat(JSON.parse(storedChat));
          } else {
            setChat(null); setSelectedFile(null); setIsValidExport(null); setUploadProgress(0);
          }
        } catch {
          // If parsing or access fails, clear potentially corrupted stored chat
          localStorage.removeItem(CHAT_STORAGE_KEY);
          setChat(null);
        }
    };
    loadChatFromLocalStorage();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === CHAT_STORAGE_KEY) loadChatFromLocalStorage();
    };
    const handleChatUpdated = () => loadChatFromLocalStorage();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("chat-updated", handleChatUpdated);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("chat-updated", handleChatUpdated);
    };
  }, []);

  const handleFileDrop = async (file: File) => {
    if (file.type.includes("zip") || file.name.toLowerCase().endsWith(".zip")) {
      setZipFileToProcess(file);
      setIsZipOpen(true);
    } else {
      setSelectedFile(file);
      setIsValidExport(null);
      const isValid = await isWhatsAppExport(file);
      setIsValidExport(isValid);
      if (!isValid) toast.warning("Not a valid WhatsApp export (.txt only)");
    }
  };

  const handleZipExtractionComplete = (extractedFile: File | null) => {
    setIsZipOpen(false);
    setZipFileToProcess(null);
    if (extractedFile) handleFileDrop(extractedFile);
  };

  const handleFileReject = (reason: string) => toast.error("Invalid File", { description: reason });

  const handleRemoveFile = () => {
    if (isProcessing) return; 
    setSelectedFile(null);
    setIsValidExport(null);
    setUploadProgress(0);
  };
  
  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setUploadProgress(0);
    setUploadPhase('uploading');
    
    try {
      const chatData = await uploadWhatsAppChat(selectedFile, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) setUploadPhase('processing');
      });
      
      setTimeout(() => {
        setChat(chatData);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
        window.dispatchEvent(new CustomEvent("chat-updated"));
        toast.success("Process Complete");
        setSelectedFile(null);
        setIsProcessing(false);
      }, 800);
      
    } catch (error: unknown) {
      console.error("Upload failed", error);
      const message = error instanceof Error ? error.message : String(error);
      toast.error("Upload Failed", { description: message || "Unknown error" });
      setIsProcessing(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteChat = async () => {
    if (!chat) return;
    try {
      await deleteChat(chat.id);
    } catch (error) {
      console.error(error);
      throw error; // Propagate to button component
    } finally {
      setChat(null);
      localStorage.removeItem(CHAT_STORAGE_KEY);
      if (localStorage.getItem(ANALYTICS_STORAGE_KEY)) {
        localStorage.removeItem(ANALYTICS_STORAGE_KEY);
      }
      window.dispatchEvent(new CustomEvent("chat-updated"));
    }
  };

  const handleDeleteError = () => {
    toast.error("Deletion Error", { description: "Deletion error. refreshing page..." });
  };

  const handleCheckSentiments = () => navigate("/sentiment-dashboard");

  // --- RENDER HELPERS FOR RESPONSIVE UI ---

  // 1. ZIP MODAL (Responsive)
  const ZipModalComponent = isMobile ? Sheet : Dialog;
  const ZipContentComponent = isMobile ? SheetContent : DialogContent;
  const zipProps = isMobile ? { side: "bottom" as const, className: "rounded-t-3xl min-h-[30vh]" } : {};

  // 2. PROCESSING MODAL (Responsive)
  const ProcessingComponent = isMobile ? Sheet : Dialog;
  const ProcessingContent = isMobile ? SheetContent : DialogContent;
  const processingProps = isMobile ? { side: "bottom" as const, className: "rounded-t-3xl pb-10" } : { className: "sm:max-w-md" };

  const renderProcessingContent = () => (
    <div className="flex flex-col items-center justify-center gap-6 px-4 py-6">
       <div className="relative">
          <div className="absolute inset-0 bg-[hsl(var(--mint))]/20 rounded-full blur-xl animate-pulse"></div>
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--mint))]" />
       </div>
      <div className="w-full max-w-xs space-y-2">
        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] h-full rounded-full transition-all ease-out duration-300" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wider">
          {uploadPhase === 'uploading' ? `${Math.round(uploadProgress)}% Uploaded` : "Processing"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      
      {/* --- BACKGROUND DECORATION --- */}
      <div className="absolute inset-0 z-0 overflow-visible pointer-events-none">
         {/* Adaptive sizing: Smaller on mobile (old feedback), Original huge size on Desktop (user preference) */}
         <DecorativeSpeechBubble className="absolute -top-10 left-1/2 -translate-x-1/2 w-[28rem] h-[28rem] md:w-[40rem] md:h-[40rem] opacity-40 dark:opacity-20" />
         <DecorativeCloudIcon className="absolute -top-16 left-1/2 -translate-x-1/2 w-[30rem] h-[30rem] md:w-[42rem] md:h-[42rem] opacity-40" />
      </div>

      {/* --- ZIP MODAL --- */}
      <ZipModalComponent open={isZipOpen} onOpenChange={setIsZipOpen}>
        <ZipContentComponent {...zipProps}>
          {zipFileToProcess && (
            <div className={isMobile ? "p-8" : ""}>
               <ZipProcessingModal zipFile={zipFileToProcess} onComplete={handleZipExtractionComplete} />
            </div>
          )}
        </ZipContentComponent>
      </ZipModalComponent>
      
      {/* --- PROCESSING MODAL/SHEET --- */}
      <ProcessingComponent open={isProcessing}>
        <ProcessingContent {...processingProps}>
          {isMobile ? (
             // Mobile Header inside Sheet
             <SheetHeader className="text-center mb-6">
                <SheetTitle className="text-xl">
                  {uploadPhase === 'uploading' ? 'Uploading Chat...' : 'Processing Uploaded Chat data...'}
                </SheetTitle>
             </SheetHeader>
          ) : (
             // Desktop Header inside Dialog
             <DialogHeader>
                <DialogTitle className="text-center">
                  {uploadPhase === 'uploading' ? 'Uploading Chat' : 'Processing Chat'}
                </DialogTitle>
                <DialogDescription className="text-center">
                   {uploadPhase === 'uploading' ? 'Securely uploading your export file.' : 'Processing your chat'}
                </DialogDescription>
             </DialogHeader>
          )}
          {renderProcessingContent()}
        </ProcessingContent>
      </ProcessingComponent>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-8 px-4">
        
        {/* Header Text */}
        <div className="space-y-3 pt-4">
          {chat ? (
             <div className="flex flex-col items-center gap-2">
                 <CheckCircle2 className="w-12 h-12 text-[hsl(var(--mint))]" />
                 <h1 className="text-2xl font-bold text-foreground">Upload Successful!</h1>
             </div>
          ) : (
             <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
               Upload WhatsApp Chat
             </h1>
          )}
          <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
            {chat 
              ? `Your chat is ready for analysis.` 
              : "Select your .txt export. We'll handle the rest."}
          </p>
        </div>

        {/* Upload Area */}
        <div className="w-full space-y-6">
          <div className="relative">
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
                  <UploadPlaceholder 
                    onFileDrop={handleFileDrop} 
                    onFileReject={handleFileReject} 
                    disabled={!!chat} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <PrimaryCTA 
            uploadState={chat ? 'uploaded' : 'ready'}
            disabled={!selectedFile || !isValidExport || isProcessing} 
            processing={isProcessing}
            onAnalyze={handleAnalyze}
            onDelete={handleDeleteChat} // This gets passed down
            onDeleteError={handleDeleteError}
            onCheckSentiments={handleCheckSentiments}
          />
        </div>

        {/* Footer Disclaimer */}
        <div className="flex items-center justify-center gap-2 py-4 px-4 bg-background/40 backdrop-blur-md rounded-full border border-border/40">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">
            Data auto-deleted after 4 hours.
          </span>
        </div>

      </div>
    </div>
  );
}

const animationProps = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
  className: "w-full",
};