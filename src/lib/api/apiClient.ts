// src/lib/api/apiClient.ts
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8500/api/v1";

const CHAT_STORAGE_KEY = "current_chat";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});


apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {

    if (error.response?.status === 429) {
        const msg = error.response.data?.detail || "You are sending requests too fast.";
        toast.error("Too many requests",
            {
                description: msg,
                duration: 4000,
            }
        );
        return Promise.reject(error);
    }


    if (error.response?.status === 401) {
      
      if (window.location.pathname !== '/') {
        toast.error("Session Expired", {
          description: "Your session timed out. Please upload your chat again.",
          duration: 5000,
        });
      }

      console.warn("Session expired. Resetting.");
      localStorage.removeItem('access_token');
      localStorage.removeItem(CHAT_STORAGE_KEY);
      
      
      window.location.href = '/'; 
      
      return Promise.reject(error);
    }

    
    if (error.response?.status === 404) {
      const storedChat = localStorage.getItem('current_chat');
 
      if (storedChat && error.config.url?.includes(JSON.parse(storedChat).id)) {
         
         toast.error("Chat Not Found", {
            description: "This chat has been deleted or expired.",
            duration: 5000,
         });

         localStorage.removeItem('current_chat');
         window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);