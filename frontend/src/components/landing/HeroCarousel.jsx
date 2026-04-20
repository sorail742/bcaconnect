import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

import img1 from '../../assets/guinea_hub.png';
import img2 from '../../assets/guinea_agri.png';
import img3 from '../../assets/guinea_tech.png';
import img4 from '../../assets/guinea_logistics.png';

const carouselImages = [
    { src: img1, title: 'BCA Connect - Le Marché Guinéen' },
    { src: img2, title: 'Logistique & Agriculture Durable' },
    { src: img3, title: 'Innovation & Finance à Conakry' },
    { src: img4, title: 'Livraison Partout en Guinée' }
];

export function HeroCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
        }, 8000); // Slower, more cinematic 8s
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700"
                        style={{ 
                            backgroundImage: `url(${carouselImages[currentIndex].src})`,
                            filter: 'contrast(1.05) brightness(0.95)'
                        }}
                    />
                    
                    {/* Overlay de contraste minimal pour le texte (uniquement en Dark) */}
                    <div className="absolute inset-0 bg-transparent dark:bg-black/30" />
                    
                    {/* Dégradé directionnel unique pour la lisibilité en bas/gauche (uniquement en Dark) */}
                    <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-tr dark:from-black/60 dark:via-transparent dark:to-transparent opacity-80" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
