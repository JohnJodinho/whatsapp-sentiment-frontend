export interface ProgressData {
  chat_id: string;
  messages_done: number;
  messages_total: number;
  segments_done: number;
  segments_total: number;
  percent: number;
}

export interface ErrorData {
   error: string;
}