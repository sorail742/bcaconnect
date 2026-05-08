import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import AnimatedCounter from '../ui/AnimatedCounter';
import { useLanguage } from '../../context/LanguageContext';

const TESTIMONIALS = [
    {
        name: "Abdoulaye Camara",
        company: "Tech Solutions SARL, Kaloum",
        content: "Depuis BCA Connect, mes ventes ont triplé. La logistique intégrée me permet de livrer mes clients en un temps record.",
        rating: 5,
        orders: "120+",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
        badge: "Fournisseur Or"
    },
    {
        name: "Mariama Diallo",
        company: "Acheteuse Premium, Conakry",
        content: "La recherche par image est une révolution ! J'ai pris une photo d'un tissu Bazin et l'IA m'a trouvé exactement le même fournisseur.",
        rating: 5,
        orders: "85+",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
        badge: "Elite Buyer"
    },
    {
        name: "Ibrahima Sory Sylla",
        company: "PME Import-Export",
        content: "Le système Escrow m'a donné la confiance nécessaire pour passer de grosses commandes. C'est le futur du commerce en Guinée.",
        rating: 5,
        orders: "340+",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&auto=format&fit=crop",
        badge: "Partenaire Vérifié"
    }
];

export const TestimonialsSection = () => {
    const { t } = useLanguage();

    const testimonials = [
        {
            name: t('testi1Name') || "Abdoulaye Camara",
            company: t('testi1Company') || "Tech Solutions SARL, Kaloum",
            content: t('testi1Content') || "Depuis BCA Connect, mes ventes ont triplé. La logistique intégrée me permet de livrer mes clients en un temps record.",
            rating: 5,
            orders: "120+",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop",
            badge: t('testi1Badge') || "Fournisseur Or"
        },
        {
            name: t('testi2Name') || "Mariama Diallo",
            company: t('testi2Company') || "Acheteuse Premium, Conakry",
            content: t('testi2Content') || "La recherche par image est une révolution ! J'ai pris une photo d'un tissu Bazin et l'IA m'a trouvé exactement le même fournisseur.",
            rating: 5,
            orders: "85+",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop",
            badge: t('testi2Badge') || "Elite Buyer"
        },
        {
            name: t('testi3Name') || "Ibrahima Sory Sylla",
            company: t('testi3Company') || "PME Import-Export",
            content: t('testi3Content') || "Le système Escrow m'a donné la confiance nécessaire pour passer de grosses commandes. C'est le futur du commerce en Guinée.",
            rating: 5,
            orders: "340+",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&auto=format&fit=crop",
            badge: t('testi3Badge') || "Partenaire Vérifié"
        }
    ];

    const trustMetrics = [
        { emoji: '🏆', text: t('trustActiveMembers') || '10,000+ membres actifs' },
        { emoji: '✅', text: t('trustVerifiedSuppliers') || 'Fournisseurs 100% vérifiés' },
        { emoji: '🔒', text: t('trustSecureEscrow') || 'Paiements Escrow sécurisés' },
        { emoji: '🚚', text: t('trustGpsDelivery') || 'Livraison suivie GPS' },
        { emoji: '⭐', text: t('trustSatisfactionRate') || '99.8% satisfaction' },
    ];

    return (
        <section className="bg-white py-10 sm:py-16 border-t border-slate-100">
            <div className="container px-3 sm:px-6 lg:px-8">
 
                 {/* Header */}
                 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                     <div className="space-y-2">
                         <div className="flex items-center gap-3">
                             <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                             <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                 {t('testimonialsTitle') || "Ce que disent nos membres"}
                             </h2>
                         </div>
                         <p className="text-slate-500 text-sm pl-4 ml-1 border-l-2 border-slate-100">
                             {t('testimonialsDesc') || "Rejoignez des milliers de professionnels qui transforment leur commerce en Guinée"}
                         </p>
                     </div>
                     {/* Trust score — Alibaba style */}
                     <div className="flex items-center gap-2 shrink-0">
                         <div className="flex flex-col items-end">
                             <div className="flex items-center gap-1">
                                 {[1,2,3,4,5].map(i => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
                             </div>
                             <span className="text-xs text-slate-500 font-medium">{t('globalRating') || "Note globale"} <AnimatedCounter value="4.9" />/5</span>
                         </div>
                         <div className="text-3xl font-black text-slate-900 border-l border-slate-200 pl-3">
                             <AnimatedCounter value="4.9" />
                         </div>
                     </div>
                 </div>
 
                 {/* Cards grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                     {testimonials.map((item, idx) => (
                         <motion.div
                             key={idx}
                             initial={{ opacity: 0, y: 24 }}
                             whileInView={{ opacity: 1, y: 0 }}
                             viewport={{ once: true }}
                             transition={{ delay: idx * 0.1, duration: 0.5 }}
                             className="group bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-[#FF6600]/20 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
                         >
                             {/* Decorative quote */}
                             <Quote className="absolute -top-2 -right-2 size-16 text-slate-50 rotate-12 pointer-events-none" />
 
                             {/* Stars */}
                             <div className="flex items-center justify-between">
                                 <div className="flex gap-0.5">
                                     {[...Array(item.rating)].map((_, i) => (
                                         <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                                     ))}
                                 </div>
                                 <span className="text-[10px] font-black text-[#FF6600] bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                     {item.badge}
                                 </span>
                             </div>
 
                             {/* Content */}
                             <p className="text-sm sm:text-base text-slate-700 leading-relaxed flex-1">
                                 "{item.content}"
                             </p>
 
                             {/* Author */}
                             <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                 <div className="relative shrink-0">
                                     <img
                                         src={item.avatar}
                                         alt={item.name}
                                         className="size-11 rounded-full object-cover ring-2 ring-[#FF6600]/20 group-hover:ring-[#FF6600]/40 transition-all"
                                     />
                                     <div className="absolute -bottom-0.5 -right-0.5 size-5 bg-[#FF6600] rounded-full flex items-center justify-center border-2 border-white">
                                         <CheckCircle2 className="size-3 text-white" />
                                     </div>
                                 </div>
                                 <div className="min-w-0">
                                     <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                                     <p className="text-xs text-slate-400 truncate">{item.company}</p>
                                 </div>
                                 <div className="ml-auto shrink-0 text-right">
                                     <p className="text-base font-black text-slate-900">
                                         <AnimatedCounter value={item.orders} />
                                     </p>
                                     <p className="text-[10px] text-slate-400">{t('ordersCount') || "commandes"}</p>
                                 </div>
                             </div>
                         </motion.div>
                     ))}
                 </div>
 
                 {/* Bottom trust strip — Alibaba trademark */}
                 <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 border-t border-slate-100">
                     {trustMetrics.map((item, i) => (
                         <span key={i} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                             <span>{item.emoji}</span> 
                             <AnimatedCounter value={item.text} />
                         </span>
                     ))}
                 </div>
             </div>
         </section>
     );
 };
