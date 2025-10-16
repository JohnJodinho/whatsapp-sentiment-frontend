

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 1. Add `className` to the props interface to allow it to be passed in.
interface CustomButtonProps {
  name: string
  className?: string // Make it optional with `?`
}

export default function CustomButton({ name, className }: CustomButtonProps) { // 2. Destructure `className` from the props.
  return (
    <Button
      // 3. Use the `cn` utility to merge your button's default classes
      //    with any new classes passed in from the parent.
      className={cn(
        "bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 transition font-medium",
        className 
      )}
    >
      {name}
    </Button>
  )
}