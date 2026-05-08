import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, ShoppingCart, Star, Shield, ChevronRight, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ProductCard from '../produits/ProductCard';
import { toast } from 'sonner';
import useCart from '../../hooks/useCart';
import { cn } from '../../lib/utils';
import { ALIBABA_ICONS, ALIBABA_CATEGORIES } from '../../lib/categoryConstants';

export const CategorySection = () => {
    const { lang, t } = useLanguage();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [categories, setCategories] = useState(ALIBABA_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoadingCats, setIsLoadingCats] = useState(true);
    const [isLoadingProds, setIsLoadingProds] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await categoryService.getAll();
                const raw = Array.isArray(res) ? res : (res?.data || res?.categories || []);
                if (raw.length > 0) {
                    // Try to map backend categories to our static Alibaba list to get valid IDs for fetching products
                    const mappedCategories = ALIBABA_CATEGORIES.map((alibabaCat, i) => {
                        const backendMatch = raw.find(c => {
                            const name = (c.nom_categorie || c.nom || c.name || '').toLowerCase();
                            // Attempt loose matching based on keywords in filter
                            const filterWords = alibabaCat.filter.toLowerCase().split(' ');
                            return filterWords.some(w => name.includes(w));
                        });
                        return {
                            ...alibabaCat,
                            id: backendMatch?.id || `static-${alibabaCat.id}`,
                        };
                    });
                    setCategories(mappedCategories);
                    setActiveCategory(mappedCategories[0]?.id || ALIBABA_CATEGORIES[0].id);
                } else {
                    setActiveCategory(ALIBABA_CATEGORIES[0].id);
                }
            } catch { setActiveCategory(ALIBABA_CATEGORIES[0].id); }
            finally { setIsLoadingCats(false); }
        };
        fetch();
    }, []);

    // Fetch products when category changes
    const fetchProducts = useCallback(async (catId) => {
        if (!catId) return;
        setIsLoadingProds(true);
        try {
            // The backend expects categorie_id, not category_id
            const res = await productService.getAll({ categorie_id: catId, limit: 5 });
            const items = Array.isArray(res) ? res : (res?.products || res?.data || []);
            setProducts(items.slice(0, 5));
        } catch { setProducts([]); }
        finally { setIsLoadingProds(false); }
    }, []);

    useEffect(() => { if (activeCategory) fetchProducts(activeCategory); }, [activeCategory, fetchProducts]);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
        toast.success(`${product.nom_produit} ajouté au panier`);
    };

    return (
        <section className="bg-slate-50 py-8 sm:py-12 border-t border-slate-100">
            <div className="w-full max-w-none px-4 lg:px-12">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-8 bg-[#FF6600] rounded-full" />
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            {t('browseByCategory')}
                        </h2>
                    </div>
                    <Link to="/marketplace" className="flex items-center gap-1 text-[#FF6600] font-bold text-sm hover:underline shrink-0">
                        {t('viewAll')} <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* ── Layout: Category sidebar + Products ────────────────── */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="flex flex-col md:flex-row min-h-[380px]">

                        {/* Category List — scroll on mobile, sidebar on desktop */}
                        <div className="md:w-[280px] shrink-0 border-b md:border-b-0 md:border-r border-slate-100 overflow-x-auto md:overflow-y-auto md:overflow-x-hidden bg-white">
                            <div className="flex md:flex-col gap-0">
                                {/* Alibaba specific header */}
                                <div className="hidden md:flex items-center gap-3 px-4 py-3.5 bg-[#f5f5f5] text-slate-800 shrink-0">
                                    {ALIBABA_ICONS.star()}
                                    <span className="text-[15px] font-bold">{t('categoriesForYou')}</span>
                                </div>
                                {(isLoadingCats ? ALIBABA_CATEGORIES : categories).map((cat, idx) => (
                                    <button
                                        key={`${cat.id}-${idx}`}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 text-left transition-colors shrink-0 md:w-full group",
                                            activeCategory === cat.id
                                                ? "bg-orange-50/50 text-[#FF6600]"
                                                : "hover:bg-slate-50/80 text-slate-700"
                                        )}
                                    >
                                        <span className={cn("shrink-0", activeCategory === cat.id ? "text-[#FF6600]" : "text-slate-500 group-hover:text-slate-800")}>
                                            {cat.icon()}
                                        </span>
                                        <span className={cn("text-[14px] leading-tight flex-1 hidden md:block", activeCategory === cat.id ? "font-bold text-[#FF6600]" : "text-slate-600 group-hover:text-slate-900")}>
                                            {cat.nom}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products area */}
                        <div className="flex-1 p-4 sm:p-6 relative min-h-[280px]">
                            <AnimatePresence mode="wait">
                                {isLoadingProds ? (
                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="size-7 text-[#FF6600] animate-spin" />
                                    </motion.div>
                                ) : products.length === 0 ? (
                                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <Package className="size-10 opacity-30" />
                                        <p className="text-sm font-bold">{t('noProductsInCategory')}</p>
                                        <button onClick={() => navigate('/marketplace')}
                                            className="text-[#FF6600] text-xs font-bold hover:underline">
                                            {t('explore')} →
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div key={activeCategory} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
                                    >
                                        {products.map((product, idx) => (
                                            <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                                                <ProductCard product={product} />
                                            </motion.div>
                                        ))}

                                        {/* "Voir tout" card */}
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: products.length * 0.05 }}>
                                            <button
                                                onClick={() => navigate(`/marketplace?category=${activeCategory}`)}
                                                className="group w-full h-full min-h-[160px] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#FF6600] hover:bg-orange-50 transition-all"
                                            >
                                                <ArrowRight className="size-6 text-slate-300 group-hover:text-[#FF6600] transition-colors" />
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-[#FF6600] transition-colors text-center px-2">
                                                    {t('viewAllInCategory')}
                                                </span>
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* ── Category Pills (Mobile shortcut) ───────────────────── */}
                <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {(isLoadingCats ? ALIBABA_CATEGORIES : categories).map((cat, idx) => (
                        <button
                            key={`${cat.id}-${idx}`}
                            onClick={() => navigate(`/marketplace?category=${cat.id}`)}
                            className={cn("shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-all hover:shadow-sm bg-white border-slate-200 text-slate-700")}
                        >
                            <span className="size-4 shrink-0 flex items-center justify-center text-slate-500">{cat.icon({ className: "size-4" })}</span>
                            <span className="hidden sm:inline">{cat.nom}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-full bg-[#FF6600] text-white text-xs font-bold hover:bg-orange-600 transition-colors"
                    >
                        <ArrowRight className="size-3" /> {t('moreCategories')}
                    </button>
                </div>
            </div>
        </section>
    );
};
