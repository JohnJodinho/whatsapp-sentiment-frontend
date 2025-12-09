"use client"

import { useState, useEffect } from "react"
import { Menu, Home, Upload, LayoutDashboard, Info, MessageCircleIcon, Brain, ChevronRight } from "lucide-react"
import CustomButton from "@/components/custom-ui/projectbutton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Link,} from "react-router-dom"

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {name: "Sentiment", href: "/sentiment-dashboard", icon: Brain },
  { name: "Chat", href: "/chat-to-chat", icon: MessageCircleIcon },
  { name: "About", href: "/about", icon: Info }
]

export function Navbar() {
  // const [open, setOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => setHasScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (path: string) => location.pathname === path

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        hasScrolled 
          ? "bg-background/80 backdrop-blur-md shadow-sm border-b border-border/40" 
          : "bg-background/0 border-b border-transparent"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-8 max-w-7xl mx-auto">
        
        {/* Logo */}
        <Link to="/" className="flex gap-2 z-50">
          <h1 className="text-xl font-bold tracking-tight">
            Sentiment<span className="text-[hsl(var(--mint))]">Scope</span>
          </h1>
        </Link>

        {/* ----------------------- */}
        {/* DESKTOP NAVIGATION      */}
        {/* ----------------------- */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.name === "Dashboard" ? (
              <DropdownMenu key={link.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive(link.href) ? "text-[hsl(var(--mint))]" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    {link.name}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-52 p-2">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/dashboard">General Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/sentiment-dashboard">Sentiment Analysis</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive(link.href) 
                    ? "text-[hsl(var(--mint))] bg-muted/50" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4 mr-2" />
                {link.name}
              </Link>
            )
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          <CustomButton name="Upload Chat" href="/upload" />
        </div>

        {/* ----------------------- */}
        {/* MOBILE NAVIGATION       */}
        {/* ----------------------- */}
        <div className="md:hidden flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            
            {/* Mobile Sheet - Right Side */}
            <SheetContent side="right" className="w-[85vw] sm:w-[350px] p-0 flex flex-col border-l-border/50">
              <div className="p-6 border-b border-border/40">
                <SheetTitle className="text-left">
                   <span className="text-xl font-bold">Menu</span>
                </SheetTitle>
              </div>

              {/* Scrollable Links Area */}
              <div className="flex-1 overflow-y-auto py-4 px-4">
                <div className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.name}>
                      <Link
                        to={link.href}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl text-base font-medium transition-all active:scale-[0.98]",
                          isActive(link.href)
                            ? "bg-primary/5 text-primary border border-primary/10 shadow-sm"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <link.icon className={cn("h-5 w-5", isActive(link.href) ? "text-[hsl(var(--mint))]" : "text-muted-foreground")} />
                          {link.name}
                        </div>
                        {/* Little chevron for "tappable" affordance */}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {/* Mobile Footer Area */}
              <div className="p-6 mt-auto border-t border-border/40 bg-muted/10 space-y-4">
                 {/* Theme Toggle Row */}
                 <div className="flex items-center justify-between px-2">
                    <span className="text-sm font-medium text-muted-foreground">Appearance</span>
                    <ModeToggle />
                 </div>
                 
                 {/* CTA */}
                 <div className="pt-2">
                   <SheetClose asChild>
                     <div className="w-full">
                        <CustomButton name="Upload New Chat" className="w-full h-12 text-base shadow-lg shadow-primary/10" href="/upload" />
                     </div>
                   </SheetClose>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}