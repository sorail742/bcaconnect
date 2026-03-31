import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all duration-300',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/20',
                secondary:
                    'border-transparent bg-secondary text-secondary-foreground',
                destructive:
                    'border-transparent bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20',
                outline:
                    'border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
                glass:
                    'bg-white/10 dark:bg-white/[0.05] border-white/10 dark:border-white/10 text-white backdrop-blur-md',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

const Badge = React.forwardRef(({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'span'
    return (
        <Comp
            className={cn(badgeVariants({ variant }), className)}
            ref={ref}
            {...props}
        />
    )
})
Badge.displayName = "Badge"

export { Badge, badgeVariants }
export default Badge
