import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                'flex h-12 w-full rounded-[1.2rem] border-2 border-slate-100 dark:border-slate-300 dark:border-foreground/10 bg-slate-50/50 dark:bg-slate-900/[0.02] dark:bg-white/[0.02] px-5 py-3 text-sm font-bold shadow-inner transition-all duration-300 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/5 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-900 dark:text-foreground',
                className
            )}
            ref={ref}
            {...props}
        />
    )
})
Input.displayName = "Input"

export { Input }
export default Input
