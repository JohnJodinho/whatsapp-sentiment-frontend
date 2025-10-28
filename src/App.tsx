import { Routes, Route } from 'react-router-dom';
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/home/HomePage";
import UploadPage from "@/pages/upload/UploadPage";
import DashboardPage from './pages/dashboard/DashboardPage2';
import SentimentDashboardPage from './pages/sentiment-dashboard/SentimentDashboardPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/upload" element={<MainLayout><UploadPage /></MainLayout>} />
      <Route path="/dashboard" element={<MainLayout><DashboardPage/></MainLayout>} />
      <Route path='/sentiment-dashboard' element={<MainLayout><SentimentDashboardPage/></MainLayout>} />
    </Routes>
  );
}

export default App;