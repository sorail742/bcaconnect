import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Import choice high-quality assets for the hero
import img1 from '../../assets/demerer_maintenant.jpg';
import img2 from '../../assets/Ai_logistique.png';
import img3 from '../../assets/Marche_fermier.jpg';
import img4 from '../../assets/image_banque.avif';
import img5 from '../../assets/boutique_Veste2.webp';
import img6 from '../../assets/coordinateur-logistique-coordinatrice-logistique.png';

const carouselImages = [
    { src: img1, title: 'BCA Connect' },
    { src: img2, title: 'Intelligence Artificielle' },
    { src: img3, title: 'Agriculture Moderne' },
    { src: img4, title: 'Solutions Bancaires' },
    { src: img5, title: 'E-commerce Élite' },
    { src: img6, title: 'Logistique Globale' }
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
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${carouselImages[currentIndex].src})` }}
                    />
                    
                    {/* Overlays adaptatifs light/dark - TRÈS LÉGERS */}
                    <div className="absolute inset-0 bg-background/20" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent" />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
