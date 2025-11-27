import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Inbox, BarChart3, Upload, PieChart } from "lucide-react"; // Using PieChart for sentiment
import { useNavigate } from "react-router-dom";
import type { ChatDefaultState } from "@/types/chat"; // Import the type

// Define prop types
interface DefaultStateProps {
  state: ChatDefaultState;
};

export function DefaultState({ state }: DefaultStateProps) {
  const navigate = useNavigate();

  const content = {
    noChat: {
      icon: <Inbox className="w-12 h-12 text-muted-foreground" />,
      title: "No Chat Uploaded Yet",
      desc: "Upload your WhatsApp chat to start exploring insights and ask questions naturally.",
      action: "Go to Upload Page",
      path: "/upload",
      iconAction: <Upload className="w-4 h-4 mr-2" />
    },
    noSentiment: {
      icon: <PieChart className="w-12 h-12 text-muted-foreground" />, // Using PieChart icon
      title: "Sentiment Analysis Pending",
      desc: "We’re still processing your chat sentiment. Come back once it’s done to start your conversation.",
      action: "Check Analysis Progress",
      path: "/sentiment-dashboard", // Point to sentiment progress page
      iconAction: <BarChart3 className="w-4 h-4 mr-2" />
    },
  }[state];

  return (
    <motion.div
      // Use min-h-screen and subtract header height if you have a global header
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-lg bg-card/70 backdrop-blur-sm border border-border/60 rounded-3xl shadow-xl p-6 sm:p-10">
        <CardContent className="p-0">
          <div className="flex justify-center mb-4">
            {content.icon}
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">{content.title}</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">{content.desc}</p>
          <Button
            className="rounded-xl text-white bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] hover:shadow-lg hover:scale-105 transition-transform duration-300"
            onClick={() => navigate(content.path)}
          >
            {content.iconAction}
            {content.action}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
