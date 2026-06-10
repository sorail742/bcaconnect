import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingProductCard from './LandingProductCard';
import productService from '../../services/productService';
import { useLanguage } from '../../context/useLanguage';
import { cn } from '../../lib/utils';

function useCountdown(targetHours = 6) {
    const [timeLeft, setTimeLeft] = useState({ h: targetHours, m: 0, s: 0 });
    useEffect(() => {
        const end = Date.now() + targetHours * 3600 * 1000;
        const tick = () => {
            const diff = Math.max(0, end - Date.now());
            setTimeLeft({
                h: Math.floor(diff / 3600000),
                m: Math.floor((diff % 3600000) / 60000),
                s: Math.floor((diff % 60000) / 1000),
            });
        };
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [targetHours]);
    return timeLeft;
}

export const FeaturedProducts = () => {
    const { t } = useLanguage();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('recommended');
    const timeLeft = useCountdown(6);

    const fetchByTab = useCallback(async (tab) => {
        setIsLoading(true);
        try {
            let data;
            if (tab === 'flash') data = await productService.getFeatured(12);
            else if (tab === 'new') data = await productService.getAll({ sort: 'createdAt', order: 'desc', limit: 12 });
            else data = await productService.getAll({ limit: 12 });
            const items = Array.isArray(data) ? data : (data?.products || data?.data || []);
            setProducts(items);
        } catch {
            setProducts([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchByTab(activeTab);
    }, [activeTab, fetchByTab]);

    const tabs = [
        { id: 'recommended', label: t('recommendedForYou') || 'Recommandé pour vous' },
        { id: 'flash', label: t('flashDeals') || 'Offres flash' },
        { id: 'new', label: t('newArrivals') || 'Nouveautés' },
    ];

    return (
        <section className="bg-[#f7f7f7] py-6 sm:py-8">
            <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-4 flex-wrap">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    'text-sm font-semibold pb-1 border-b-2 transition-colors',
                                    activeTab === tab.id
                                        ? 'text-[#333] border-[#FF6600]'
                                        : 'text-[#999] border-transparent hover:text-[#666]'
                                )}
                            >
                                {tab.label}
                            </button>
                        ))}
                        {activeTab === 'flash' && (
                            <span className="text-[11px] text-[#999] tabular-nums">
                                {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                            </span>
                        )}
                    </div>
                    <Link
                        to="/marketplace"
                        className="flex items-center gap-1 text-[#333] text-sm font-semibold hover:text-[#FF6600] transition-colors shrink-0"
                    >
                        {t('viewAll') || 'Tout voir'} <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="relative min-h-[240px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-24"
                            >
                                <Loader2 className="size-7 text-[#FF6600] animate-spin" />
                            </motion.div>
                        ) : products.length === 0 ? (
                            <motion.p
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-[#999] py-16 text-sm"
                            >
                                {t('noProductsInCategory') || 'Aucun produit disponible'}
                            </motion.p>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
                            >
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <LandingProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
};
