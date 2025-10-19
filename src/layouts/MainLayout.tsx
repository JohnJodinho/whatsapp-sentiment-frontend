
import React from "react"
import { useLocation } from "react-router-dom" // 👈 Import the useLocation hook
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  
  // Check if the current path is the homepage ('/')
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      
      {/* 👇 Conditionally render the Footer if it's NOT the homepage */}
      {!isHomePage && <Footer />}
      <Toaster />
    </div>
  )
}
