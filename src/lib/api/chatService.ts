import { apiClient } from "./apiClient"; // Use your centralized client
import type { ChatRead } from "@/types/chat";

export function uploadWhatsAppChat(
  file: File,
  onProgress: (progress: number) => void
): Promise<ChatRead> {
  const formData = new FormData();
  formData.append("file", file);

  // Axios returns a Promise, so we return it directly
  return apiClient.post<ChatRead>("/uploads/whatsapp", formData, {
    // 1. Built-in Progress Handler
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
    // 2. Increase timeout for large files (e.g., 5 minutes)
    timeout: 300000, 
  }).then(res => res.data); // Return just the data
}

export async function deleteChat(chatId: number): Promise<void> {
  await apiClient.delete(`/chats/${chatId}`);
}