import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Upload } from "lucide-react"; // Using Sparkles icon for sentiment

export function EmptySentimentState() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-background text-center space-y-6 px-6">
      <Sparkles className="w-20 h-20 text-muted-foreground/50" />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">
          Ready for Sentiment Insights?
        </h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Upload a chat first to analyze the sentiment and understand the emotional tone of the conversation.
        </p>
      </div>
      <Button
        onClick={() => navigate("/upload")}
        className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] hover:shadow-lg hover:scale-105 transition-transform duration-300"
      >
        <Upload className="w-4 h-4 mr-2" />
        Go to Upload Page
      </Button>
    </div>
  );
}
