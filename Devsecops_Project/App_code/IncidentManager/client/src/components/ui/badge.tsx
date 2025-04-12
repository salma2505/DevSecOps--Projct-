import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants for incident management
        "status-open": "bg-slate-100 text-slate-700 border-slate-200",
        "status-in-progress": "bg-blue-100 text-blue-700 border-blue-200",
        "status-resolved": "bg-green-100 text-green-700 border-green-200",
        "status-closed": "bg-slate-900 bg-opacity-10 text-slate-800 border-slate-300",
        "priority-critical": "bg-red-100 text-red-700 border-red-200",
        "priority-high": "bg-orange-100 text-orange-700 border-orange-200",
        "priority-medium": "bg-amber-100 text-amber-700 border-amber-200",
        "priority-low": "bg-green-100 text-green-700 border-green-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
