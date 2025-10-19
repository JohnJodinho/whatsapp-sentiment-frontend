

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"

// 1. Add `className` to the props interface to allow it to be passed in.
interface CustomButtonProps {
  name: string;
  className?: string; // Make it optional with `?`
  onClick?: () => void;
  href?: string
}



export default function CustomButton({ name, className, onClick, href}: CustomButtonProps) { // 2. Destructure `className` from the props.
  const navigate = useNavigate()

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    else if (href){
      navigate(href)
    }
  }
  
  return (
    <Button
      // 3. Use the `cn` utility to merge your button's default classes
      //    with any new classes passed in from the parent.
      className={cn(
        "bg-gradient-to-r from-[hsl(var(--mint))] to-[hsl(var(--blue-accent))] text-primary-foreground hover:opacity-90 transition font-medium",
        className 
      )}
      onClick={handleClick}
    >
      {name}
    </Button>
  )
}