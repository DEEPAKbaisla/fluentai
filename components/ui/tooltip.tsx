"use client"

import { useState, useRef, useCallback, type ReactNode } from "react"
import { cn } from "@/lib/utils"

function TooltipProvider({ children }: { children: ReactNode; delay?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: { children: ReactNode }) {
  return <>{children}</>
}

function TooltipTrigger({ children, asChild, ...props }: { children: ReactNode; asChild?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props}>{children}</button>
}

function TooltipContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
