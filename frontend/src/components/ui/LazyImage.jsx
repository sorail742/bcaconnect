import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';

export const LazyImage = ({ 
    src, 
    alt, 
    className, 
    placeholder = 'bg-muted animate-pulse',
    onLoad,
    ...props 
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    
    // A working Unsplash placeholder (Headphones) instead of the 404 one
    const FALLBACK = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';

    React.useEffect(() => {
        setImgSrc(src);
        setIsLoaded(false);
        setHasError(false);
    }, [src]);

    React.useEffect(() => {
        if (imgRef.current && imgRef.current.complete && imgSrc) {
            if (imgRef.current.naturalWidth > 0) {
                setIsLoaded(true);
                onLoad?.();
            } else if (imgSrc !== FALLBACK && !hasError) {
                handleError();
            }
        }
    }, [imgSrc]);

    const handleLoad = () => {
        setIsLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        if (!hasError) {
            setImgSrc(FALLBACK);
            setHasError(true);
            // We do NOT set isLoaded to true here. 
            // We wait for the FALLBACK image to trigger handleLoad.
        } else {
            // If even the fallback fails, we just show the broken state or placeholder
            setIsLoaded(true);
        }
    };

    return (
        <div className={cn('relative overflow-hidden', className)}>
            {!isLoaded && <div className={cn('absolute inset-0', placeholder)} />}
            <img
                ref={imgRef}
                src={imgSrc}
                alt={alt}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
                className={cn(
                    'w-full h-full object-cover transition-opacity duration-500',
                    isLoaded ? 'opacity-100' : 'opacity-0'
                )}
                {...props}
            />
        </div>
    );
};

export default LazyImage;

