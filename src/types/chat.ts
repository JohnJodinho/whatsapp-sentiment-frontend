export interface ChatRead {
  id: number;
  title?: string;
  created_at: string;
  sentiment_status: "checking" | "no_chat" | "pending" | "processing" | "completed" | "error" | "failed";
  cancel_requested?: boolean;
}