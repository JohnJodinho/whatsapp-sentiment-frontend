export interface ChatRead {
  id: number;
  title?: string;
  created_at: string;
  sentiment_status: "pending" | "processing" | "completed" | "error";
  cancel_requested?: boolean;
}