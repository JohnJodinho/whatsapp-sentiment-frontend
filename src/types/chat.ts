export interface ChatRead {
  id: number;
  title?: string;
  created_at: string;
  sentiment_status: "checking" | "no_chat" | "pending" | "processing" | "completed" | "error" | "failed";
  cancel_requested?: boolean;
}

export type ChatDefaultState = "noChat" | "noSentiment";

export type Role = "user" | "assistant";

// --- Add new types below ---
export interface RagSource {
  source_table: string; 
  source_id: number; 
  distance: number; 
  text: string; 
}
export interface ChatSource extends RagSource {

  type: string; 
  content: string; 

}

export interface ChatMessage {
  id: string; 
  role: Role;
  content: string;
  createdAt: Date;
  sources?: ChatSource[]; 
}


export interface QueryPayload {
  question: string;
  analytics_json: Record<string, unknown>;
}

export interface QueryResponse {
  answer: string;
  route: string;
  sources: ChatSource[]; 
}


export interface RawHistoryItem {
  id: number;
  role: Role;
  content: string;
  sources: RagSource[] | null;
  created_at: string;
}


export interface CitationTag {
  fullTag: string;
  source_table: string;
  source_id: number;
}