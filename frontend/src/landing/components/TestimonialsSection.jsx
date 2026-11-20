import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, Quote, Loader2 } from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import { formatPercent, formatCount } from '../lib/landingStats';
import reviewService from '../../review/services/reviewService';

const AVATAR_SEEDS = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&h=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&h=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&h=100&auto=format&fit=crop',
];

export const TestimonialsSection = ({ stats }) => {
    const { t } = useLanguage();

    const { data: reviewsData, isLoading } = useQuery({
        queryKey: ['reviews', 'featured'],
        queryFn: () => reviewService.getFeatured(),
        staleTime: 5 * 60 * 1000,
    });

    const testimonials = useMemo(() => {
        const live = reviewsData?.testimonials?.filter((item) => item.content?.trim()) || [];
        return live.slice(0, 3).map((item, idx) => ({
            ...item,
            avatar: AVATAR_SEEDS[idx % AVATAR_SEEDS.length],
        }));
    }, [reviewsData]);

    const avgRating = parseFloat(reviewsData?.avgRating) || stats?.avgRating || 0;
    const satisfactionLabel = formatPercent(stats?.satisfactionRate ?? 98, 1);
    const hasReviews = testimonials.length > 0;

    const trustMetrics = [
        { emoji: '🏆', text: `${formatCount(stats?.totalUsers ?? 0)} ${t('trustActiveMembers')}` },
        { emoji: '✅', text: `${formatCount(stats?.storesCount ?? stats?.totalFournisseurs ?? 0)} ${t('trustVerifiedSuppliers')}` },
        { emoji: '🔒', text: t('trustSecureEscrow') },
        { emoji: '🚚', text: t('trustGpsDelivery') },
        { emoji: '⭐', text: `${satisfactionLabel} ${t('satisfaction')}` },
    ];

    return (
        <section className="bg-white py-10 sm:py-16 border-t border-slate-100">
            <div className="container px-3 sm:px-6 lg:px-8">

                 <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                     <div className="space-y-2">
                         <div className="flex items-center gap-3">
                             <div className="w-1 h-8 bg-[#1CA0DB] rounded-full" />
                             <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                 {t('testimonialsTitle')}
                             </h2>
                         </div>
                         <p className="text-slate-500 text-sm pl-4 ml-1 border-l-2 border-slate-100">
                             {t('testimonialsDesc')}
                         </p>
                     </div>
                     {avgRating > 0 && (
                         <div className="flex items-center gap-2 shrink-0">
                             <div className="flex flex-col items-end">
                                 <div className="flex items-center gap-1">
                                     {[1,2,3,4,5].map(i => <Star key={i} className="size-4 fill-amber-400 text-amber-400" />)}
                                 </div>
                                 <span className="text-xs text-slate-500 font-medium">
                                     {t('globalRating')} {avgRating}/5
                                     {reviewsData?.totalReviews ? ` · ${reviewsData.totalReviews} avis` : ''}
                                 </span>
                             </div>
                             <div className="text-3xl font-black text-slate-900 border-l border-slate-200 pl-3">
                                 {avgRating}
                             </div>
                         </div>
                     )}
                 </div>

                 {isLoading ? (
                     <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
                         <Loader2 className="size-6 animate-spin text-[#1CA0DB]" />
                         <span className="text-sm font-medium">Chargement des avis...</span>
                     </div>
                 ) : hasReviews ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                         {testimonials.map((item) => (
                             <motion.div
                                 key={item.id}
                                 initial={{ opacity: 0, y: 24 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 viewport={{ once: true }}
                                 className="group bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 hover:shadow-lg hover:border-[#1CA0DB]/20 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden"
                             >
                                 <Quote className="absolute -top-2 -right-2 size-16 text-slate-50 rotate-12 pointer-events-none" />

                                 <div className="flex items-center justify-between">
                                     <div className="flex gap-0.5">
                                         {[...Array(item.rating || 5)].map((_, i) => (
                                             <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                                         ))}
                                     </div>
                                     <span className="text-[10px] font-black text-[#1CA0DB] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                         {item.badge}
                                     </span>
                                 </div>

                                 <p className="text-sm sm:text-base text-slate-700 leading-relaxed flex-1">
                                     "{item.content}"
                                 </p>

                                 <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                     <div className="relative shrink-0">
                                         <img
                                             src={item.avatar}
                                             alt={item.name}
                                             className="size-11 rounded-full object-cover ring-2 ring-[#1CA0DB]/20 group-hover:ring-[#1CA0DB]/40 transition-all"
                                         />
                                         <div className="absolute -bottom-0.5 -right-0.5 size-5 bg-[#1CA0DB] rounded-full flex items-center justify-center border-2 border-white">
                                             <CheckCircle2 className="size-3 text-white" />
                                         </div>
                                     </div>
                                     <div className="min-w-0">
                                         <p className="text-sm font-black text-slate-900 truncate">{item.name}</p>
                                         <p className="text-xs text-slate-400 truncate">{item.company}</p>
                                     </div>
                                     {item.orders && (
                                         <div className="ml-auto shrink-0 text-right">
                                             <p className="text-base font-black text-slate-900">{item.orders}</p>
                                             <p className="text-[10px] text-slate-400">{t('ordersCount')}</p>
                                         </div>
                                     )}
                                 </div>
                             </motion.div>
                         ))}
                     </div>
                 ) : (
                     <div className="text-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
                         <p className="text-slate-600 font-medium">Aucun avis publié pour le moment.</p>
                         <p className="text-sm text-slate-400 mt-2">Passez une commande et laissez votre avis pour alimenter cette section.</p>
                     </div>
                 )}

                 <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 border-t border-slate-100">
                     {trustMetrics.map((item, i) => (
                         <span key={i} className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                             <span>{item.emoji}</span>
                             {item.text}
                         </span>
                     ))}
                 </div>
             </div>
         </section>
     );
 };
