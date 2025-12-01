
import React from "react"
import { useLocation } from "react-router-dom" 
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"

interface MainLayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground transition-colors overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
      
      {!isHomePage && <Footer />}
      <Toaster />
    </div>
  )
}
