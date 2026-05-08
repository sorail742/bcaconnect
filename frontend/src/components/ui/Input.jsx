import React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef(({ 
    className, 
    type = 'text',
    icon: Icon,
    error,
    ...props 
}, ref) => {
    return (
        <div className="relative group/input">
            {Icon && (
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within/input:text-primary transition-colors z-10" />
            )}
            <input
                type={type}
                ref={ref}
                className={cn(
                    "w-full h-14 px-4 rounded-xl border-2 transition-all duration-300",
                    "bg-background text-foreground placeholder:text-muted-foreground",
                    "border-border hover:border-primary/30 focus:border-primary focus:outline-none",
                    "font-medium text-sm",
                    Icon && "pl-12",
                    error && "border-destructive focus:border-destructive",
                    className
                )}
                {...props}
            />
            {error && (
                <p className="text-xs text-destructive mt-2 ml-1">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export { Input };
export default Input;
