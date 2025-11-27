import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { monitorSentimentProgress, cancelSentimentAnalysis } from "@/lib/api/sentimentSSEService"; // Import simulation functions
import type { ProgressData, ErrorData } from "@/types/sentimentProgress";
interface SentimentProgressViewProps {
  chatId: string;
  onComplete: () => void;
  onError: (error: ErrorData) => void;
}

export function SentimentProgressView({ chatId, onComplete, onError }: SentimentProgressViewProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing sentiment analysis...");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    console.log("Starting SSE connection for chat:", chatId);
    setStatusText("Connecting to analysis worker...");

    // 2. This call remains identical, but now uses the REAL EventSource implementation
    const cleanup = monitorSentimentProgress(
      chatId,
      (data: ProgressData) => { // onProgress callback
        setProgress(data.percent);
        setStatusText(
          `Analyzing... (${data.messages_done}/${data.messages_total} messages, ${data.segments_done}/${data.segments_total} segments)`
        );
      },
      () => { // onComplete callback
        setStatusText("Analysis Complete!");
        setProgress(100);
        setTimeout(onComplete, 1000); 
      },
      (errorData: ErrorData) => { // onError callback
         setStatusText(`Error: ${errorData.error}`);
         // Note: The SSE error handler will also catch when the chat
         // is deleted after cancellation (e.g., "Chat not found").
         // This is the expected way to stop the process.
         onError(errorData); // Notify parent
      }
    );

    // Return cleanup function to close EventSource if component unmounts
    return cleanup;

  }, [chatId, onComplete, onError]);

 const handleCancel = async () => {
    setIsCancelling(true);
    setStatusText("Requesting cancellation...");
    try {
      await cancelSentimentAnalysis(chatId); // Call REAL API
      setStatusText("Cancellation requested. Waiting for worker to stop...");
      // The onError callback will handle the next step
    } catch (error) {
      console.error("Failed to request cancellation:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setStatusText(`Failed to request cancellation: ${errorMsg}`);
      setIsCancelling(false); 
    }
  };

  // 3. No changes needed to your JSX! It's all state-driven.
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background text-center space-y-6 px-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-[hsl(var(--blue-accent))] animate-spin" />
         <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-foreground">
           {progress}%
         </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">
          Analyzing Sentiment
        </h2>
        <p className="max-w-md text-sm text-muted-foreground px-4">
          {statusText}
        </p>
      </div>

      <Progress value={progress} className="w-full max-w-md h-3 [&>*]:bg-gradient-to-r [&>*]:from-[hsl(var(--mint))] [&>*]:to-[hsl(var(--blue-accent))]" />

      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isCancelling || progress === 100} // Disable if cancelling or complete
        className="rounded-xl"
      >
        {isCancelling ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <XCircle className="w-4 h-4 mr-2" />
        )}
        {isCancelling ? "Cancelling..." : "Cancel Analysis"}
      </Button>
      <p className="text-xs text-muted-foreground max-w-sm">
         Sentiment analysis runs in the background. You can safely close this tab; 
         the analysis will continue.
      </p>
    </div>
  );
}