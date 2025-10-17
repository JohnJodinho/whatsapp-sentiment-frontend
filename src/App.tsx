import { Routes, Route } from 'react-router-dom';
import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/home/HomePage";
import UploadPage from "@/pages/upload/UploadPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/upload" element={<MainLayout><UploadPage /></MainLayout>} />
    </Routes>
  );
}

export default App;