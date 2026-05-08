import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const ScrollTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const toggleVisibility = () => {
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollTotal > 0) {
                const scrollProgress = (window.scrollY / scrollTotal) * 100;
                setProgress(scrollProgress);
                setIsVisible(window.scrollY > 300);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-[150] group"
                >
                    {/* Progress Circle Wrapper */}
                    <div className="relative size-14 flex items-center justify-center">
                        <svg className="size-full -rotate-90">
                            <circle
                                cx="28"
                                cy="28"
                                r="26"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-muted-foreground/20"
                            />
                            <circle
                                cx="28"
                                cy="28"
                                r="26"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray="163.36"
                                strokeDashoffset={163.36 - (163.36 * progress) / 100}
                                className="text-primary transition-all duration-300"
                            />
                        </svg>
                        
                        {/* Central Button */}
                        <div className="absolute inset-2 rounded-full bg-background border border-border shadow-xl flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 transform group-hover:-translate-y-1">
                            <ArrowUp className="size-5" />
                        </div>
                    </div>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollTop;
