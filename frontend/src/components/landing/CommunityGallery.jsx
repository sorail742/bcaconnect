import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { Activity, Globe, Zap, Cpu } from "lucide-react";
import LazyImage from '../ui/LazyImage';

import img1 from '../../assets/guinea_hub.png';
import img2 from '../../assets/guinea_agri.png';
import img3 from '../../assets/guinea_marketplace.png';
import img4 from '../../assets/guinea_logistics.png';
import img5 from '../../assets/guinea_tech.png';
import img6 from '../../assets/Un_cultivateur_apres_recolte_embarque_pour_le_marche.webp';
import img7 from '../../assets/orange_money.png';
import img8 from '../../assets/mtn_mobile_money.png';
import img9 from '../../assets/paycard.png';
import img10 from '../../assets/bca_marketplace.png';
import img11 from '../../assets/guinea_agriculture.png';
import img12 from '../../assets/guinea_tech.png';
import img13 from '../../assets/guinea_logistics.png';
import img14 from '../../assets/bca_logistics.png';
import img15 from '../../assets/bca_showcase.png';

export function CommunityGallery() {
    const { lang } = useLanguage();
    const imagesRow1 = [img1, img2, img3, img4, img5, img6, img7, img8, img1, img2, img3, img4];
    const imagesRow2 = [img9, img10, img11, img12, img13, img14, img15, img9, img10, img11, img12];

    return (
        <section className="relative py-16 bg-background overflow-hidden font-jakarta border-y border-border">
            <div className="container mx-auto px-8 md:px-12 mb-24 text-center z-10 relative space-y-16">
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-muted border border-border text-xs font-semibold text-foreground mb-4 uppercase tracking-wide shadow-sm"
                >
                    <Globe className="size-5 text-primary animate-pulse" />
                    {lang === 'FR' ? "NOTRE ÉCOSYSTÈME GLOBAL_SIG" : "GLOBAL_ECOSYSTEM_ARCH"}
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-2xl md:text-4xl font-bold text-foreground tracking-tight leading-tight"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                    {lang === 'FR' ? "EXCELLENCE DE LA" : "EXCELLENCE IN"}<br />
                    <span className="text-primary">{lang === 'FR' ? "Pluralité multiservice." : "Plurality & excellence."}</span>
                </motion.h2>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes scrollXReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .animate-scroll { animation: scrollX 60s linear infinite; }
                .animate-scroll-reverse { animation: scrollXReverse 60s linear infinite; }
            `}} />

            <div className="relative flex flex-col gap-8 w-[300vw] lg:w-[200vw]">
                
                {/* Row 1 - Left to Right */}
                <div className="flex gap-8 animate-scroll w-max hover:play-pause">
                    {imagesRow1.map((src, i) => (
                        <motion.div 
                            key={`r1-${i}`} 
                            whileHover={{ y: -8, scale: 1.03 }}
                            className="w-[320px] h-[220px] shrink-0 rounded-2xl overflow-hidden border border-border shadow-sm group cursor-pointer relative"
                        >
                            <LazyImage src={src} alt="BCA Network" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-8">
                                <p className="text-[12px] font-semibold text-white uppercase tracking-wider">
                                    {i % 4 === 0 ? "Hub Logistique Conakry" : 
                                     i % 4 === 1 ? "Producteurs Locaux 224" :
                                     i % 4 === 2 ? "Marché de Madina" : "Digital Finance Hub"}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2 - Right to Left */}
                <div className="flex gap-8 animate-scroll-reverse w-max">
                    {imagesRow2.map((src, i) => (
                        <motion.div 
                            key={`r2-${i}`} 
                            whileHover={{ y: 8, scale: 1.03 }}
                            className="w-[320px] h-[220px] shrink-0 rounded-2xl overflow-hidden border border-border shadow-sm group cursor-pointer relative"
                        >
                            <LazyImage src={src} alt="BCA Professionals" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-start p-8">
                                <p className="text-[12px] font-semibold text-white uppercase tracking-wider">
                                    {i % 4 === 0 ? "Innovation Technologique" : 
                                     i % 4 === 1 ? "Échanges Inter-régionaux" :
                                     i % 4 === 2 ? "Services Financiers" : "Excellence Opérationnelle"}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Gradient Mask */}
            <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            
            {/* Background Texture */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-full bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.01)_0%,transparent_70%)] pointer-events-none" />
        </section>
    );
}
