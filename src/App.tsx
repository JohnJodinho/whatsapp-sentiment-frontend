import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/home/HomePage";
import UploadPage from "@/pages/upload/UploadPage";
import DashboardPage from "./pages/dashboard/DashboardPage2";
import SentimentDashboardPage from "./pages/sentiment-dashboard/SentimentDashboardPage";
import ChatPage from "./pages/chat/ChatPage";
import AboutPage from "./pages/about/AboutPage";

import { apiClient } from "@/lib/api/apiClient";


function App() {
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        try {
          
          const response = await apiClient.post("/auth/guest");
          localStorage.setItem("access_token", response.data.access_token);
        } catch (error) {
          console.error("Failed to initialize guest session", error);
        }
      }
    };
    initSession();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/upload" element={<MainLayout><UploadPage /></MainLayout>} />
      <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
      <Route path="/sentiment-dashboard" element={<MainLayout><SentimentDashboardPage /></MainLayout>} />
      <Route path="/chat-to-chat" element={<MainLayout><ChatPage /></MainLayout>} />
      <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
      <Route path="/guide" element={<MainLayout><AboutPage /></MainLayout>} />
    </Routes>
  );
}

export default App;
