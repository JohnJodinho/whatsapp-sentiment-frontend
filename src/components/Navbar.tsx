"use client"

import React, { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import CustomButton from "@/components/custom-ui/projectbutton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { Separator } from "@/components/ui/separator" // 👈 Import Separator
import { cn } from "@/lib/utils"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Upload", href: "/upload" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "About", href: "/about" },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20)
    }
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
        
        {/* Column 1: Logo */}
        <div className="flex justify-start">
          <h1 className="text-xl font-bold select-none">
            Sentiment<span className="text-[color:hsl(var(--mint))] font-semibold">Scope</span>
          </h1>
        </div>

        {/* Column 2: Centered Links (Desktop) */}
        <div className="hidden md:flex justify-center items-center space-x-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              )}
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Column 3: Actions */}
        <div className="flex justify-end items-center gap-3">
          {/* Desktop-only actions */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <CustomButton name="upload chat" />
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              {/* 👇 START OF UPDATED MOBILE SIDEBAR CONTENT 👇 */}
              <SheetContent side="right" className="p-6 bg-background text-foreground flex flex-col">
                {/* 1. Header with Logo & Close Button */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">
                    Sentiment<span className="text-[color:var(--mint)] font-semibold">Scope</span>
                  </h2>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                
                <Separator className="mb-4" />

                {/* 2. Main Navigation Links (This part now grows to fill space) */}
                <div className="flex flex-col space-y-2 flex-1">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className="text-lg font-medium text-muted-foreground transition-colors hover:text-primary p-2 rounded-md"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>

                {/* 3. Footer with Actions */}
                <div className="mt-6 flex flex-col gap-4">
                  <CustomButton name="upload chat" className="w-full" />
                  <div className="flex justify-between items-center rounded-md border p-2">
                    <span className="text-sm font-medium text-muted-foreground">Switch Theme</span>
                    <ModeToggle />
                  </div>
                </div>
              </SheetContent>
              {/* 👆 END OF UPDATED CONTENT 👆 */}
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}