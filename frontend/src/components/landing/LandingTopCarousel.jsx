import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import { cn } from '../../lib/utils';

import img1 from '../../assets/guinea_hub.png';
import img2 from '../../assets/guinea_agri.png';
import img3 from '../../assets/guinea_tech.png';
import img4 from '../../assets/guinea_logistics.png';

const buildSlides = (t) => [
    {
        src: img1,
        title: t('carouselTitle1') || 'BCA Connect — Le marché guinéen',
        subtitle: t('heroDesc') || 'Achetez, vendez et livrez partout en Guinée',
        cta: t('exploreMarket') || 'Explorer le marché',
        link: '/marketplace',
        accent: 'from-[#FF6600]/90 to-[#e65c00]/80',
    },
    {
        src: img2,
        title: t('carouselTitle2') || 'Agriculture & logistique durable',
        subtitle: 'Des producteurs aux acheteurs B2B',
        cta: t('explore') || 'Explorer',
        link: '/marketplace?category=cat-15',
        accent: 'from-emerald-700/85 to-emerald-900/75',
    },
    {
        src: img3,
        title: t('carouselTitle3') || 'Innovation & finance à Conakry',
        subtitle: 'Crédit B2B · Escrow · Mobile Money',
        cta: t('register') || 'Créer un compte',
        link: '/register',
        accent: 'from-blue-700/85 to-indigo-900/75',
    },
    {
        src: img4,
        title: t('carouselTitle4') || 'Livraison partout en Guinée',
        subtitle: 'Conakry & intérieur du pays',
        cta: t('trackOrder') || 'Suivre une commande',
        link: '/tracking',
        accent: 'from-violet-700/85 to-purple-900/75',
    },
];

/**
 * Carousel pleine largeur — après la navbar (style BCA promo strip)
 */
export default function LandingTopCarousel() {
    const { t } = useLanguage();
    const slides = buildSlides(t);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => setIndex((p) => (p + 1) % slides.length), 5500);
        return () => clearInterval(timer);
    }, [slides.length]);

    const prev = () => setIndex((p) => (p - 1 + slides.length) % slides.length);
    const next = () => setIndex((p) => (p + 1) % slides.length);
    const slide = slides[index];

    return (
        <section className="relative w-full h-[240px] sm:h-[300px] md:h-[360px] lg:h-[420px] overflow-hidden bg-[#1a1a1a]">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                >
                    <img src={slide.src} alt="" className="w-full h-full object-cover" />
                    <div className={cn('absolute inset-0 bg-gradient-to-r', slide.accent)} />
                    <div className="absolute inset-0 bg-black/20" />
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col justify-center">
                <motion.div
                    key={`text-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15 }}
                    className="max-w-xl"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white leading-tight drop-shadow-md">
                        {slide.title}
                    </h2>
                    <p className="text-sm sm:text-base text-white/90 mt-1.5 line-clamp-2">{slide.subtitle}</p>
                    <Link
                        to={slide.link}
                        className="inline-flex mt-3 h-9 px-5 items-center bg-white text-[#FF6600] text-sm font-bold rounded-full hover:bg-[#fff7e6] transition-colors shadow-lg"
                    >
                        {slide.cta}
                    </Link>
                </motion.div>
            </div>

            <button type="button" onClick={prev} aria-label="Précédent" className="absolute left-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
                <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={next} aria-label="Suivant" className="absolute right-3 top-1/2 -translate-y-1/2 z-20 size-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors">
                <ChevronRight className="size-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-label={`Slide ${i + 1}`}
                        className={cn(
                            'h-1.5 rounded-full transition-all',
                            i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                        )}
                    />
                ))}
            </div>
        </section>
    );
}
