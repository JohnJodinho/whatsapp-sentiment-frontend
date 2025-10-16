import React from "react"

export function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
      © {new Date().getFullYear()} SentimentScope. All rights reserved.
    </footer>
  )
}
