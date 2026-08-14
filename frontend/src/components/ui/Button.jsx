import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active-press",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 border border-border',
                destructive:
                    'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90',
                outline:
                    'border border-border bg-background/50 text-foreground shadow-sm hover:bg-muted backdrop-blur-sm',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
                ghost:
                    'text-foreground hover:bg-muted',
                link: 'text-primary underline-offset-4 hover:underline',
                premium: 'bg-premium-gradient text-slate-900 dark:text-foreground shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 border border-foreground/20',
            },
            size: {
                default: 'h-10 px-5 py-2.5',
                sm: 'h-9 px-4 text-xs',
                xs: 'h-8 px-3 text-xs2',
                lg: 'h-11 px-8 text-sm',
                icon: 'size-9',
                'icon-sm': 'size-8',
                'icon-lg': 'size-10',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, isLoading = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }), isLoading && "opacity-70 pointer-events-none")}
            ref={ref}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? (
                <>
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {children}
                </>
            ) : children}
        </Comp>
    )
})
Button.displayName = "Button"

export { Button, buttonVariants }
export default Button
