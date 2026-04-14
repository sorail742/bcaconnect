import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Landmark, Globe, Building2, Award } from 'lucide-react';

const partners = [
    { name: 'BCA GUINÉE', icon: Landmark, color: 'text-orange-500' },
    { name: 'BANQUE CENTRALE', icon: ShieldCheck, color: 'text-blue-600' },
    { name: 'ORANGE MONEY', icon: Globe, color: 'text-gray-900' },
    { name: 'CEDEAO', icon: Building2, color: 'text-emerald-600' },
    { name: 'CERTIFICATION AFNOR', icon: Award, color: 'text-red-600' },
];

export const TrustSection = () => {
    return (
        <section className="py-12 bg-muted/30 border-y border-border overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mb-10">
                    Propulsé par un écosystème de confiance certifié
                </p>

                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60">
                    {partners.map((partner, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 group transition-all duration-500 cursor-default"
                        >
                            <partner.icon className={`size-6 ${partner.color} transition-transform group-hover:scale-110`} />
                            <span className="text-sm font-black text-foreground tracking-tighter uppercase">
                                {partner.name}
                            </span>
                        </motion.div>
                    ))}
                </div>
                
                {/* Scrolling Divider logic if desired for "Giant" effect */}
                <div className="mt-12 flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-border" />
                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <div className="h-px w-12 bg-border" />
                </div>
            </div>
        </section>
    );
};

export default TrustSection;
