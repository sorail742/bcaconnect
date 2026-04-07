import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

export const LazyImage = ({ 
    src, 
    alt, 
    className, 
    placeholder = 'bg-muted animate-pulse',
    onLoad,
    ...props 
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    return (
        <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
            {!isLoaded && <div className={cn('absolute inset-0', placeholder)} />}
            {isVisible && (
                <img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        isLoaded ? 'opacity-100' : 'opacity-0'
                    )}
                    {...props}
                />
            )}
        </div>
    );
};

export default LazyImage;
