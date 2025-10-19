import type { ChatRead } from "@/types/chat";


export const uploadWhatsAppChat = (file: File): Promise<ChatRead> => {
  console.log(`Simulating upload for: ${file.name}`);
  
  return new Promise((resolve, reject) => {
    
    setTimeout(() => {
      
      if (Math.random() > 0.15) { // 85% success rate
        const chatData: ChatRead = {
          id: Math.floor(Math.random() * 1000) + 1,
          title: `Analysis of ${file.name}`.slice(0, 50),
          created_at: new Date().toISOString(),
          sentiment_status: "pending",
        };
        console.log("Simulated upload successful:", chatData);
        resolve(chatData);
      } else {
        const errorResponse = { message: "Upload failed. The server couldn't process the file." };
        console.error("Simulated upload failed.");
        reject(new Error(errorResponse.message));
      }
    }, 1500); 
  });
};


export const deleteChatMock = (chatId: number): Promise<{ message: string }> => {
  console.log(`Simulating deletion for Chat ID: ${chatId}`);

  return new Promise((resolve, reject) => {
    
    setTimeout(() => {
    
      if (Math.random() > 0.1) { // 90% success rate
        resolve({ message: `Chat ${chatId} deleted successfully` });
      } else {
        reject(new Error("Failed to delete chat. Please try again."));
      }
    }, 1200); 
  });
};