import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-[var(--primary)]/10 text-[var(--primary)]": variant === "default" || variant === "success",
          "border-transparent bg-[var(--warning)]/10 text-[var(--warning)]": variant === "warning",
          "border-transparent bg-[var(--danger)]/10 text-[var(--danger)]": variant === "danger",
          "text-white border-[var(--border)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }
