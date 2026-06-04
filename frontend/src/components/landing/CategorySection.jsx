import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import LandingProductCard from './LandingProductCard';
import { BCA_CATEGORIES } from '../../lib/categoryConstants';
import { BcaCategorySidebar } from './BcaCategorySidebar';

export const CategorySection = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [categories, setCategories] = useState(BCA_CATEGORIES);
    const [activeCategory, setActiveCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoadingCats, setIsLoadingCats] = useState(true);
    const [isLoadingProds, setIsLoadingProds] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await categoryService.getAll();
                const raw = Array.isArray(res) ? res : (res?.data || res?.categories || []);
                if (raw.length > 0) {
                    const mapped = BCA_CATEGORIES.map((bcaCat) => {
                        const backendMatch = raw.find((c) => {
                            const name = (c.nom_categorie || c.nom || c.name || '').toLowerCase();
                            return bcaCat.filter.toLowerCase().split(' ').some((w) => name.includes(w));
                        });
                        return { ...bcaCat, id: backendMatch?.id || bcaCat.id };
                    });
                    setCategories(mapped);
                    const firstReal = mapped.find((c) => !String(c.id).startsWith('cat-'));
                    setActiveCategory(firstReal?.id || mapped[0]?.id);
                } else {
                    setActiveCategory(BCA_CATEGORIES[0]?.id);
                }
            } catch {
                setActiveCategory(BCA_CATEGORIES[0]?.id);
            } finally {
                setIsLoadingCats(false);
            }
        };
        fetch();
    }, []);

    const fetchProducts = useCallback(async (catId) => {
        setIsLoadingProds(true);
        try {
            const params = catId && !String(catId).startsWith('cat-')
                ? { categorie_id: catId, limit: 12 }
                : { limit: 12 };
            const res = await productService.getAll(params);
            const items = Array.isArray(res) ? res : (res?.products || res?.data || []);
            setProducts(items.slice(0, 12));
        } catch {
            setProducts([]);
        } finally {
            setIsLoadingProds(false);
        }
    }, []);

    useEffect(() => {
        if (activeCategory) fetchProducts(activeCategory);
    }, [activeCategory, fetchProducts]);

    const handleSelect = (cat) => {
        if (cat.id === 'for-you') {
            setActiveCategory('for-you');
            fetchProducts(null);
            return;
        }
        setActiveCategory(cat.id);
    };

    const handleHover = (cat) => {
        if (cat.id === 'for-you') {
            setActiveCategory('for-you');
            return;
        }
        setActiveCategory(cat.id);
    };

    return (
        <section className="bg-[#f7f7f7] py-4 sm:py-6">
            <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-7 bg-[#FF6600] rounded-full" />
                        <h2 className="text-lg sm:text-xl font-bold text-[#333]">
                            {t('browseByCategory') || 'Parcourir par Catégorie'}
                        </h2>
                    </div>
                    <Link to="/marketplace" className="flex items-center gap-1 text-[#333] text-sm font-semibold hover:text-[#FF6600] transition-colors shrink-0">
                        {t('viewAll') || 'Tout voir'} <ArrowRight className="size-4" />
                    </Link>
                </div>

                <div className="bg-white rounded-2xl border border-[#ebebeb] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col lg:flex-row min-h-[400px]">
                    {/* Capture 3 — sidebar seule, avec Voir plus */}
                    <div className="lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-[#f0f0f0]">
                        {!isLoadingCats && (
                            <BcaCategorySidebar
                                categories={categories}
                                activeId={activeCategory}
                                onSelect={handleSelect}
                                onHover={handleHover}
                                maxHeight={460}
                                showSeeMore
                                className="rounded-none shadow-none border-0"
                            />
                        )}
                    </div>

                    {/* Produits à droite — clic = fiche produit, sans boutons */}
                    <div className="flex-1 p-4 sm:p-5 relative min-h-[320px] bg-[#fafafa]">
                        <AnimatePresence mode="wait">
                            {isLoadingProds ? (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="size-7 text-[#FF6600] animate-spin" />
                                </motion.div>
                            ) : products.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center text-[#999] gap-3">
                                    <Package className="size-10 opacity-30" />
                                    <p className="text-sm font-medium">{t('noProductsInCategory') || 'Aucun produit'}</p>
                                    <button type="button" onClick={() => navigate('/marketplace')} className="text-[#FF6600] text-sm font-semibold hover:underline">
                                        {t('explore') || 'Explorer'} →
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={activeCategory || 'all'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3"
                                >
                                    {products.map((product, idx) => (
                                        <motion.div key={product.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                                            <LandingProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};
