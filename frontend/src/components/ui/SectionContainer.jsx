import React from 'react';
import { cn } from '../../lib/utils';

const SectionContainer = React.forwardRef(({ className, children, ...props }, ref) => {
    return (
        <section
            ref={ref}
            className={cn(
                "py-12 md:py-12 lg:py-24", // Standard vertical spacing
                className
            )}
            {...props}
        >
            <div className="container mx-auto px-4 md:px-6">
                {children}
            </div>
        </section>
    );
});

SectionContainer.displayName = "SectionContainer";

export { SectionContainer };
export default SectionContainer;
