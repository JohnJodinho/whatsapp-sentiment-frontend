export function Footer() {
  return (
    <footer className="w-full py-6 md:py-8 text-center text-sm text-muted-foreground border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <p className="px-4">
        © {new Date().getFullYear()} SentimentScope. All rights reserved.
      </p>
    </footer>
  )
}