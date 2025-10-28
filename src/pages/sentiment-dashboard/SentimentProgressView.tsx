import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";
import { simulateSentimentProgress, cancelSentimentAnalysis } from "@/lib/api"; // Import simulation functions

interface SentimentProgressViewProps {
  chatId: string;
  onComplete: () => void;
  onError: (error: string) => void;
}

export function SentimentProgressView({ chatId, onComplete, onError }: SentimentProgressViewProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing sentiment analysis...");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    console.log("Starting SSE simulation for chat:", chatId);
    setStatusText("Starting analysis...");

    // Simulate SSE connection
    const cleanup = simulateSentimentProgress(
      chatId,
      (data) => { // onProgress callback
        setProgress(data.percent);
        setStatusText(
          `Analyzing... (${data.messages_done}/${data.messages_total} messages, ${data.segments_done}/${data.segments_total} segments)`
        );
      },
      () => { // onComplete callback
        setStatusText("Analysis Complete!");
        setProgress(100);
        // Add a small delay before calling parent onComplete to show 100%
        setTimeout(onComplete, 1000); 
      },
      (errorData) => { // onError callback
         setStatusText(`Error: ${errorData.error}`);
         onError(errorData.error); // Notify parent
      }
    );

    // Return cleanup function to stop simulation if component unmounts
    return cleanup;

  }, [chatId, onComplete, onError]); // Rerun if chatId changes (shouldn't normally)

  const handleCancel = async () => {
    setIsCancelling(true);
    setStatusText("Requesting cancellation...");
    try {
      await cancelSentimentAnalysis(chatId); // Call simulated API
      setStatusText("Cancellation requested. Stopping analysis...");
      // Note: In a real scenario, the backend might take time to stop.
      // The SSE stream might send a final 'cancelled' event.
      // For simulation, we might just stop listening or manually trigger an error/different state.
      // For now, let's assume the cleanup handles stopping the simulation.
      // You might want to navigate away or show a different UI after cancellation.
       console.log("Cancellation requested for chat:", chatId);
       // Example: navigate back or show a "cancelled" message
       // navigate(-1); 
    } catch (error) {
      console.error("Failed to request cancellation:", error);
      setStatusText("Failed to request cancellation.");
    } finally {
      setIsCancelling(false); // Re-enable button if needed, though usually you'd navigate away
    }
  };


  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background text-center space-y-6 px-6">
      <div className="relative">
        <Loader2 className="w-16 h-16 text-mint animate-spin" />
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

      <Progress value={progress} className="w-full max-w-md h-3" />

      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={isCancelling}
        className="rounded-xl"
      >
        <XCircle className="w-4 h-4 mr-2" />
        {isCancelling ? "Cancelling..." : "Cancel Analysis"}
      </Button>
      <p className="text-xs text-muted-foreground max-w-sm">
         Sentiment analysis runs locally in the background. You can navigate away, but cancelling will stop the current process.
      </p>
    </div>
  );
}
