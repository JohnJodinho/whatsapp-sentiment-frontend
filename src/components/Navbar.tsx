"use client"

import React, { useState, useEffect } from "react"

import { Menu, Home, Upload, LayoutDashboard, Info } from "lucide-react"
import CustomButton from "@/components/custom-ui/projectbutton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "About", href: "/about", icon: Info },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 transition-shadow duration-300",
        hasScrolled ? "shadow-md border-b border-border/40" : "border-b border-transparent"
      )}
    >
      <nav className="grid grid-cols-2 md:grid-cols-3 items-center h-16 w-full max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Logo */}
        <div className="flex justify-start">
          <a href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold select-none">
              Sentiment<span className="text-[color:hsl(var(--mint))] font-semibold">Scope</span>
            </h1>
          </a>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center space-x-2">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors",
                "hover:bg-muted hover:text-primary"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span>{link.name}</span>
            </a>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex justify-end items-center gap-3">
          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <CustomButton name="upload chat" href="/upload" />
          </div>

          {/* Mobile menu trigger (only visible when isMobile) */}
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent
                side={isMobile ? "bottom" : "right"}
                className={cn(
                  "p-0 overflow-hidden",
                  isMobile ? "h-[50vh]" : "w-[80%] sm:w-[400px]"
                )}
              >
                {/* AnimatePresence gives smooth open/close motion */}
                  {open && (
                    <div className="flex flex-col h-full">
                      <SheetHeader className="border-b p-4">
                        <SheetTitle>
                          <h2 className="text-lg font-bold">
                            Sentiment
                            <span className="text-[color:hsl(var(--mint))] font-semibold">Scope</span>
                          </h2>
                        </SheetTitle>
                      </SheetHeader>

                      {/* Nav Links */}
                      <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex flex-col space-y-2">
                          {navLinks.map((link, index) => (
                            <SheetClose asChild key={link.name}>
                              <a
                                href={link.href}
                                className="flex items-center gap-3 p-3 rounded-md text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                                style={{
                                  animationDelay: `${100 + index * 50}ms`,
                                }}
                              >
                                <link.icon className="h-5 w-5" />
                                {link.name}
                              </a>
                            </SheetClose>
                          ))}
                        </div>
                      </div>

                      {/* Footer (sticks to bottom) */}
                      <div className="border-t p-4 mt-auto">
                        <div className="flex flex-col gap-4">
                          <CustomButton name="Upload Your Chat" className="w-full" href="/upload" />
                          <div className="flex justify-between items-center rounded-md border p-3">
                            <span className="text-sm font-medium text-muted-foreground">Switch Theme</span>
                            <ModeToggle />
                          </div>
                        </div>
                      </div>
                    </div> 
                    )}
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
    </header>
  )
}
