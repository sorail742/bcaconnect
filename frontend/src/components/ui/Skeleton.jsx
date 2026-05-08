import React from "react"
import { cn } from "../../lib/utils"

const Skeleton = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  )
})

Skeleton.displayName = "Skeleton"

export { Skeleton }
export default Skeleton
