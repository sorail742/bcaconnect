import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Composant Carousel optimisé
 * - Images très claires
 * - Navigation fluide
 * - Responsive
 */
export const Carousel = ({
    images = [],
    autoPlay = true,
    autoPlayInterval = 8000,
    showControls = true,
    showIndicators = true,
    className = '',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!autoPlay || images.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, autoPlayInterval);

        return () => clearInterval(timer);
    }, [autoPlay, autoPlayInterval, images.length]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    if (images.length === 0) {
        return (
            <div className={cn("w-full h-96 bg-muted rounded-lg flex items-center justify-center", className)}>
                <p className="text-muted-foreground">Aucune image disponible</p>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
            {/* Images Container */}
            <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={images[currentIndex].src}
                            alt={images[currentIndex].alt || `Slide ${currentIndex + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            {showControls && images.length > 1 && (
                <>
                    {/* Previous Button */}
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-all duration-300 text-foreground hover:text-primary"
                        aria-label="Image précédente"
                    >
                        <ChevronLeft className="size-6" />
                    </button>

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-all duration-300 text-foreground hover:text-primary"
                        aria-label="Image suivante"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </>
            )}

            {/* Indicators */}
            {showIndicators && images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-background/50 hover:bg-background/70"
                            )}
                            aria-label={`Aller à la slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-background/80 text-foreground text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default Carousel;
