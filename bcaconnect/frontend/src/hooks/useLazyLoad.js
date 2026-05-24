import { useState, useEffect, useRef, useCallback } from 'react';

export const useVirtualScroll = (items, itemHeight, containerHeight) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef(null);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;

        const scrollTop = containerRef.current.scrollTop;
        const start = Math.floor(scrollTop / itemHeight);
        const end = start + Math.ceil(containerHeight / itemHeight) + 5;

        setVisibleRange({ start, end });
    }, [itemHeight, containerHeight]);

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll]);

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const offsetY = visibleRange.start * itemHeight;

    return {
        containerRef,
        visibleItems,
        offsetY,
        totalHeight: items.length * itemHeight,
    };
};

export const useInfiniteScroll = (fetchMore, hasMore) => {
    const observerTarget = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && hasMore) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [fetchMore, hasMore]);

    return observerTarget;
};

export const useLazyLoad = (callback, options = {}) => {
    const elementRef = useRef(null);
    const { threshold = 0.1, rootMargin = '50px' } = options;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    callback();
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, [callback, threshold, rootMargin]);

    return elementRef;
};
