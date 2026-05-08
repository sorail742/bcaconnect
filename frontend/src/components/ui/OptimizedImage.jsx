import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Composant Image optimisé pour BCA Connect
 * - Clarté maximale
 * - Pas d'overlays excessifs
 * - Responsive et performant
 */
export const OptimizedImage = React.forwardRef(({
    src,
    alt,
    className,
    overlay = false,
    overlayOpacity = 0.1,
    ...props
}, ref) => {
    return (
        <div className={cn("relative overflow-hidden", className)}>
            <img
                ref={ref}
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                loading="lazy"
                {...props}
            />
            
            {/* Overlay très léger si nécessaire */}
            {overlay && (
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{ 
                        backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` 
                    }}
                />
            )}
        </div>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
