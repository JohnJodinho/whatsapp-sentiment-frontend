import { Routes, Route } from 'react-router-dom'
import MainLayout from "@/layouts/MainLayout"
import HomePage from "@/pages/HomePage"
// import DashboardPage from "@/pages/DashboardPage" // Example for another page

function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } 
      />
      
      {/* 👇 Example of another route that would have the footer */}
      {/* <Route 
        path="/dashboard" 
        element={
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        } 
      /> */}
    </Routes>
  )
}

export default App