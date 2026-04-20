import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const TESTIMONIALS = [
    {
        name: "Abdoulaye Camara",
        role: "Vendeur Certifié - Kaloum",
        content: "Depuis que j'utilise BCA Connect, mes ventes ont triplé. La logistique intégrée me permet de livrer mes clients en un temps record sans stress.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
        name: "Mariama Diallo",
        role: "Acheteuse Elite",
        content: "La recherche par image est une révolution ! J'ai pris une photo d'un tissu Bazin et l'IA m'a trouvé exactement le même vendeur à Conakry.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
    },
    {
        name: "Ibrahima Sory Sylla",
        role: "Propriétaire PME",
        content: "Le système de séquestre (Escrow) m'a donné la confiance nécessaire pour passer de grosses commandes. C'est le futur du commerce en Guinée.",
        rating: 5,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200&auto=format&fit=crop"
    }
];

export const TestimonialsSection = () => {
    const { t } = useLanguage();

    return (
        <section className="py-32 bg-slate-50 dark:bg-background/50 relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-20 pointer-events-none" />
            
            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col items-center text-center mb-20 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Confiance Maximale</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Ce que disent <span className="text-primary italic">nos acteurs</span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl font-medium">
                        Rejoignez des milliers de professionnels qui transforment déjà leur quotidien grâce à l'écosystème BCA.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white dark:bg-card p-10 rounded-[3rem] border border-border shadow-2xl shadow-black/5 hover:-translate-y-2 transition-transform duration-500 flex flex-col items-start gap-6 relative"
                        >
                            <Quote className="size-10 text-primary/10 absolute top-8 right-8" />
                            
                            <div className="flex gap-1">
                                {[...Array(item.rating)].map((_, i) => (
                                    <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                                ))}
                            </div>

                            <p className="text-lg font-medium leading-[1.6] text-foreground/80 italic">
                                "{item.content}"
                            </p>

                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border w-full">
                                <img 
                                    src={item.avatar} 
                                    alt={item.name} 
                                    className="size-14 rounded-2xl object-cover ring-2 ring-primary/20"
                                />
                                <div className="text-left">
                                    <h4 className="font-black text-foreground uppercase tracking-tight">{item.name}</h4>
                                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{item.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
