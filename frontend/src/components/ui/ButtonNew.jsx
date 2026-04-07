import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const Button = React.forwardRef(({ 
    className, 
    variant = 'default',
    size = 'md',
    isLoading = false,
    children,
    ...props 
}, ref) => {
    const variants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        outline: 'border-2 border-primary text-primary hover:bg-primary/10',
        ghost: 'hover:bg-accent text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    };

    const sizes = {
        sm: 'h-10 px-4 text-sm',
        md: 'h-14 px-6 text-base',
        lg: 'h-16 px-8 text-lg',
    };

    return (
        <button
            ref={ref}
            disabled={isLoading || props.disabled}
            className={cn(
                "inline-flex items-center justify-center gap-3 rounded-xl font-semibold transition-all duration-300",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="size-5 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
export default Button;
