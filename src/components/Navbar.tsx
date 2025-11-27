"use client"

import { useState, useEffect } from "react"
import { Menu, Home, Upload, LayoutDashboard, Info, MessageCircleIcon } from "lucide-react"
import CustomButton from "@/components/custom-ui/projectbutton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/lib/hooks/useMediaQuery"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Link } from "react-router-dom"

const navLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "Upload", href: "/upload", icon: Upload },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Chat", href: "/chat-to-chat", icon: MessageCircleIcon },
  { name: "About", href: "/about", icon: Info }
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)") // This corresponds to "md" breakpoint

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
      <nav className="grid grid-cols-2 md:grid-cols-3 items-center h-16 w-full px-4 md:px-8">
        
        {/* Logo */}
        <div className="flex justify-start">
          <Link to="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold select-none">
              Sentiment<span className="text-[color:hsl(var(--mint))] font-semibold">Scope</span>
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-center items-center space-x-1 lg:space-x-2">
          {navLinks.map((link) =>
            link.name === "Dashboard" ? (
              <DropdownMenu key={link.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center p-2 lg:px-3 lg:py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors",
                      "hover:bg-muted hover:text-primary",
                      "lg:space-x-2" // Space only on large screens
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    {/* ✅ MODIFICATION: Hide text unless screen is lg or larger */}
                    <span className="hidden lg:inline">{link.name}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/sentiment-dashboard">Sentiment Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center p-2 lg:px-3 lg:py-2 rounded-md text-sm font-medium text-muted-foreground transition-colors",
                  "hover:bg-muted hover:text-primary",
                  "lg:space-x-2" // Space only on large screens
                )}
              >
                <link.icon className="h-4 w-4" />
                {/* ✅ MODIFICATION: Hide text unless screen is lg or larger */}
                <span className="hidden lg:inline">{link.name}</span>
              </Link>
            )
          )}
        </div>

        {/* Right Section (and Mobile Menu) */}
        <div className="flex justify-end items-center gap-3">
          {/* Show these on desktop/tablet view */}
          <div className="hidden md:flex items-center gap-3">
            <ModeToggle />
            <CustomButton name="upload chat" href="/upload" />
          </div>

          {/* Show this only on mobile */}
          {isMobile && (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Toggle menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="bottom" className="p-0 overflow-hidden h-[50vh]">
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

                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="flex flex-col space-y-2">
                        {navLinks.map((link, index) => (
                          <SheetClose asChild key={link.name}>
                            <Link
                              to={link.href}
                              className="flex items-center gap-3 p-3 rounded-md text-base font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                              style={{ animationDelay: `${100 + index * 50}ms` }}
                            >
                              <link.icon className="h-5 w-5" />
                              {link.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </div>

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