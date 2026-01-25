import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, onClick, ...props }: React.ComponentProps<"input">) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Auto open picker for date/time inputs when clicking anywhere on the input
    if ((type === 'date' || type === 'time' || type === 'datetime-local') && inputRef.current) {
      try {
        inputRef.current.showPicker()
      } catch {
        // showPicker() may not be supported in all browsers
      }
    }
    onClick?.(e)
  }
  
  return (
    <input
      ref={inputRef}
      type={type}
      data-slot="input"
      onClick={handleClick}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
        (type === 'date' || type === 'time' || type === 'datetime-local') && "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}

export { Input }
