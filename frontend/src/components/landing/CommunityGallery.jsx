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
        <section className="relative py-40 bg-white overflow-hidden font-jakarta rounded-[5rem] -mt-20 z-10 shadow-2xl">
            {/* Engineering Grid & Depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,102,0,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 mb-32 relative z-20">
                <div className="flex flex-col items-center text-center space-y-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] font-black text-white uppercase tracking-[0.4em] shadow-2xl"
                    >
                        <Globe className="size-5 text-primary animate-pulse" />
                        GLOBAL_ECOSYSTEM_ARCH v9.4
                    </motion.div>
                    
                    <motion.h2 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl lg:text-[10rem] font-black text-slate-900 tracking-[calc(-0.06em)] leading-[0.85] uppercase"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        EXCELLENCE DE LA <br />
                        <span className="text-primary italic relative">
                            {lang === 'FR' ? "PLURALITÉ." : "PLURALITY."}
                            <motion.div 
                                initial={{ width: 0 }}
                                whileInView={{ width: "100%" }}
                                className="absolute -bottom-4 left-0 h-4 bg-primary/20 blur-2xl -z-10"
                            />
                        </span>
                    </motion.h2>

                    <motion.p 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl text-slate-500 font-medium leading-[1.3] max-w-3xl border-l-[12px] border-primary/40 pl-10 uppercase tracking-tight mx-auto"
                    >
                        Immersion visuelle dans l'écosystème BCA : là où l'innovation technologique rencontre la puissance du terrain guinéen.
                    </motion.p>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes scrollX { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                @keyframes scrollXReverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
                .animate-scroll { animation: scrollX 80s linear infinite; }
                .animate-scroll-reverse { animation: scrollXReverse 80s linear infinite; }
                .animate-scroll:hover, .animate-scroll-reverse:hover { animation-play-state: paused; }
            `}} />

            <div className="relative flex flex-col gap-12 w-[300vw] lg:w-[200vw] py-10 scale-[1.05]">
                
                {/* Row 1 - Left to Right */}
                <div className="flex gap-12 animate-scroll w-max">
                    {[...imagesRow1, ...imagesRow1].map((src, i) => (
                        <motion.div 
                            key={`r1-${i}`} 
                            className="w-[450px] h-[300px] shrink-0 rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group cursor-pointer relative"
                        >
                            <LazyImage src={src} alt="BCA Network" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col justify-end p-10">
                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-700">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">SYSTEM_NODE_{i}</p>
                                    <p className="text-2xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {i % 4 === 0 ? "HUB_LOGISTIQUE_CONAKRY" : 
                                         i % 4 === 1 ? "PRODUCTEURS_LOCAUX_224" :
                                         i % 4 === 2 ? "MARCHÉ_DE_MADINA" : "DIGITAL_FINANCE_HUB"}
                                    </p>
                                </div>
                            </div>
                            <div className="absolute top-8 right-8 size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                                <Zap className="size-5 text-primary fill-primary" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Row 2 - Right to Left */}
                <div className="flex gap-12 animate-scroll-reverse w-max">
                    {[...imagesRow2, ...imagesRow2].map((src, i) => (
                        <motion.div 
                            key={`r2-${i}`} 
                            className="w-[450px] h-[300px] shrink-0 rounded-[3rem] overflow-hidden border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] group cursor-pointer relative"
                        >
                            <LazyImage src={src} alt="BCA Professionals" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-out" />
                            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex flex-col items-start p-10">
                                <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-700">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-3">OPERATIONAL_CORE_{i}</p>
                                    <p className="text-2xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        {i % 4 === 0 ? "INNOVATION_TECHNOLOGIQUE" : 
                                         i % 4 === 1 ? "ÉCHANGES_INTER_RÉGIONAUX" :
                                         i % 4 === 2 ? "SERVICES_FINANCIERS" : "EXCELLENCE_OPÉRATIONNELLE"}
                                    </p>
                                </div>
                            </div>
                            <div className="absolute bottom-8 right-8 size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-center justify-center">
                                <Cpu className="size-5 text-primary" />
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Cinematic Gradient Masks */}
            <div className="absolute inset-y-0 left-0 w-[25%] bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-[25%] bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none" />
        </section>
    );
}
