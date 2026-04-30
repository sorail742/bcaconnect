import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, Shield, Clock, Zap, ArrowRight, Tag, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../produits/ProductCard';
import productService from '../../services/productService';
import { useLanguage } from '../../context/LanguageContext';
import useCart from '../../hooks/useCart';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const FALLBACK = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=400';

// Helper pour les images locales/distantes
const getImageUrl = (url) => {
    if (!url) return FALLBACK;
    if (url.startsWith('http')) return url;
    const serverUrl = 'http://localhost:5000';
    return `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

// Countdown timer hook
function useCountdown(targetHours = 8) {
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
    }, []);
    return timeLeft;
}

function TimeUnit({ value, label }) {
    return (
        <div className="flex flex-col items-center">
            <div className="bg-slate-900 text-white font-black text-lg sm:text-xl px-2.5 py-1 rounded-lg min-w-[38px] text-center tabular-nums leading-none">
                {String(value).padStart(2, '0')}
            </div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</span>
        </div>
    );
}

export const FeaturedProducts = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('flash');
    const { addToCart } = useCart();
    const timeLeft = useCountdown(6);

    const fetchByTab = useCallback(async (tab) => {
        setIsLoading(true);
        try {
            let data;
            if (tab === 'flash') data = await productService.getFeatured(8);
            else if (tab === 'new') data = await productService.getAll({ sort: 'createdAt', order: 'desc', limit: 8 });
            else data = await productService.getAll({ sort: 'views', limit: 8 });
            const items = Array.isArray(data) ? data : (data?.products || data?.data || []);
            setProducts(items);
        } catch { setProducts([]); }
        finally { setIsLoading(false); }
    }, []);

    useEffect(() => { fetchByTab(activeTab); }, [activeTab, fetchByTab]);

    const tabs = [
        { id: 'flash', label: '🔥 Offres Flash', color: 'text-rose-600' },
        { id: 'new', label: '✨ Nouveautés', color: 'text-blue-600' },
        { id: 'popular', label: '⭐ Populaires', color: 'text-amber-600' },
    ];

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.nom_produit} ajouté au panier`);
    };

    return (
        <section className="bg-white py-8 sm:py-12">
            <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8">

                {/* ── Section Header ─────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {activeTab === 'flash' ? 'Ventes Flash' : activeTab === 'new' ? 'Nouveautés' : 'Best-sellers'}
                            </h2>
                            {activeTab === 'flash' && (
                                <span className="hidden sm:inline-flex px-3 py-1 bg-rose-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                    Live
                                </span>
                            )}
                        </div>
                        {/* Countdown */}
                        {activeTab === 'flash' && (
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden sm:block">Fin dans</span>
                                <div className="flex items-center gap-1">
                                    <TimeUnit value={timeLeft.h} label="H" />
                                    <span className="font-black text-slate-400 -mt-3">:</span>
                                    <TimeUnit value={timeLeft.m} label="M" />
                                    <span className="font-black text-slate-400 -mt-3">:</span>
                                    <TimeUnit value={timeLeft.s} label="S" />
                                </div>
                            </div>
                        )}
                    </div>
                    <Link to="/marketplace" className="flex items-center gap-1.5 text-[#FF6600] font-bold text-sm hover:underline shrink-0 self-end sm:self-auto">
                        Voir tout <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* ── Tabs ───────────────────────────────────────────────── */}
                <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                                activeTab === tab.id
                                    ? "bg-[#FF6600] text-white border-[#FF6600] shadow-md"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Product Grid ────────────────────────────────────────── */}
                <div className="relative min-h-[200px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center py-20">
                                <Loader2 className="size-8 text-[#FF6600] animate-spin" />
                            </motion.div>
                        ) : (
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                            >
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Bottom CTA banner ───────────────────────────────────── */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { icon: Shield, title: 'Paiement Sécurisé', desc: 'Protection Escrow sur toutes vos commandes', color: 'border-emerald-200 bg-emerald-50' },
                        { icon: Zap, title: 'Livraison Express', desc: 'Partout en Guinée en 24-48h', color: 'border-blue-200 bg-blue-50' },
                        { icon: Tag, title: 'Meilleurs Prix', desc: 'Garantis par nos vendeurs certifiés', color: 'border-amber-200 bg-amber-50' },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 p-4 rounded-xl border ${item.color}`}>
                            <item.icon className="size-6 text-slate-600 shrink-0" />
                            <div>
                                <p className="text-sm font-bold text-slate-800">{item.title}</p>
                                <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
