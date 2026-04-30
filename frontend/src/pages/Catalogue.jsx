import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { useProducts, useCategories, useHeroSlides } from '../hooks/useDomainData';
import { cn } from '../lib/utils';
import {
    Search, ChevronLeft, ChevronRight, LayoutGrid, List, ArrowRight,
    Sparkles, Filter, ShieldCheck
} from 'lucide-react';
import socketService from '../services/socketService';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { ProductSkeleton } from '../components/ui/Loader';
import { getCategoryIconComponent } from '../lib/categoryConstants';

const ProductCatalogue = () => {
    const { t, lang } = useLanguage();
    
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [priceRange, setPriceRange] = useState([0, 1000000000]);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [condition, setCondition] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const { data: categoriesRaw, loading: categoriesLoading } = useCategories();
    const { data: heroSlidesRaw } = useHeroSlides();

    const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
    const heroSlides = Array.isArray(heroSlidesRaw) ? heroSlidesRaw : [];

    // Mapping exact des paramètres pour valider le DTO (Backend validateSearch)
    const queryParams = {
        page,
        limit: 36,
        sort: sortBy
    };
    if (searchQuery.trim()) queryParams.q = searchQuery.trim();
    if (activeCategory !== 'Tous') queryParams.categorie_id = activeCategory;
    if (priceRange[0] > 0) queryParams.min_price = priceRange[0];
    if (priceRange[1] < 1000000000) queryParams.max_price = priceRange[1];
    if (condition) queryParams.condition = condition;
    if (isVerified) queryParams.is_verified = true;

    const { data: productsData, loading: productsLoading, error: productsError } = useProducts(queryParams);

    const products = productsData?.products || [];
    const totalPages = productsData?.pages || 1;

    const DEFAULT_SLIDES = [
        {
            tag: "INNOVATION B2B",
            title: "Performance & Mobilité",
            subtitle: "Découvrez notre sélection premium d'équipements pour professionnels et entreprises.",
            cta: "DÉCOUVRIR LE CATALOGUE",
            ctaLink: "/marketplace",
            img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1600",
        }
    ];

    const displaySlides = heroSlides.length > 0 ? heroSlides : DEFAULT_SLIDES;

    useEffect(() => {
        socketService.connect();
        const handleNewProduct = (newProduct) => {
            toast.info(`Nouveau produit disponible : ${newProduct.nom_produit}`, {
                duration: 5000,
                icon: '🛒'
            });
        };
        socketService.on('product_added', handleNewProduct);
        return () => socketService.off('product_added', handleNewProduct);
    }, []);

    useEffect(() => {
        if (displaySlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % displaySlides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, [displaySlides.length]);

    const slide = displaySlides[currentSlide] || DEFAULT_SLIDES[0];

    const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <div className="relative bg-slate-50 dark:bg-[#0A0D14] min-h-screen text-slate-900 dark:text-foreground font-sans">
            
            {/* ══ HERO SECTION ══ */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div 
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <img src={slide.img} className="w-full h-full object-cover" alt="Hero background" />
                        <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#0A0D14]/80" />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/50 to-transparent dark:from-[#0A0D14] dark:via-[#0A0D14]/80" />
                    </motion.div>
                </AnimatePresence>

                <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10 w-full pt-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-2xl space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FF6600]/30 bg-[#FF6600]/10 text-xs font-bold uppercase tracking-wider text-[#FF6600] backdrop-blur-sm">
                            <Sparkles className="size-4" />
                            {slide.tag}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                            {slide.title}
                        </h1>
                        <p className="text-lg text-slate-300 font-medium leading-relaxed max-w-xl">
                            {slide.subtitle}
                        </p>
                        <div className="pt-6">
                            <Button className="h-14 px-10 bg-[#FF6600] text-white hover:bg-[#FF6600]/90 text-sm font-bold rounded-xl shadow-xl shadow-[#FF6600]/20 transition-all hover:-translate-y-1">
                                {slide.cta}
                                <ArrowRight className="size-5 ml-3" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ══ TRUST BAR ══ */}
            <div className="border-b border-border bg-white dark:bg-slate-900 hidden md:block relative z-20 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-16 flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-2 text-slate-900 dark:text-white"><ShieldCheck className="size-5 text-[#FF6600]"/> Achat Protégé</span>
                    <span className="w-px h-4 bg-border" />
                    <span>Fournisseurs Certifiés</span>
                    <span className="w-px h-4 bg-border" />
                    <span>Paiements Sécurisés (Escrow)</span>
                    <span className="w-px h-4 bg-border" />
                    <span>Support Client B2B 24/7</span>
                </div>
            </div>

            {/* ══ MAIN CATALOGUE ══ */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-12 py-12 flex flex-col lg:flex-row gap-8">
                
                {/* Advanced Filtering Sidebar */}
                <aside className="lg:w-72 shrink-0 space-y-6">
                    <div className="bg-white dark:bg-slate-800 border border-border rounded-2xl p-6 space-y-8 sticky top-24 shadow-sm">
                        
                        {/* Search Input */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
                                <Filter className="size-5" />
                                <h3 className="text-base font-bold">Filtres de recherche</h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                <input
                                    className="h-12 w-full pl-12 pr-4 bg-slate-50 dark:bg-slate-700/50 border border-border focus:border-[#FF6600] rounded-xl text-sm font-medium outline-none transition-all text-slate-900 dark:text-white"
                                    placeholder="Mot-clé, produit..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catégories</h4>
                            <div className="flex flex-col gap-1">
                                <button 
                                    onClick={() => { setActiveCategory('Tous'); setPage(1); }}
                                    className={cn(
                                        "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                                        activeCategory === 'Tous' ? "bg-orange-50 dark:bg-[#FF6600]/10 text-[#FF6600]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    <LayoutGrid className="size-4" />
                                    Toutes les catégories
                                </button>
                                {!categoriesLoading && categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setPage(1); }}
                                        className={cn(
                                            "w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all truncate flex items-center gap-2",
                                            activeCategory === cat.id ? "bg-orange-50 dark:bg-[#FF6600]/10 text-[#FF6600]" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <span className="scale-[0.8] flex items-center justify-center shrink-0">{getCategoryIconComponent(cat.nom_categorie)}</span>
                                        {cat.nom_categorie}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Max</h4>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{priceRange[1].toLocaleString()} GNF</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={1000000000} 
                                step={1000000}
                                value={priceRange[1]}
                                onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setPage(1); }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-[#FF6600] cursor-pointer"
                            />
                        </div>

                        {/* Condition Filter */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">État du Produit</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['neuf', 'occasion'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setCondition(condition === c ? '' : c); setPage(1); }}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            condition === c 
                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                                : "bg-transparent border-slate-200 dark:border-border text-slate-600 dark:text-slate-400 hover:border-primary/50"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seller Type Filter */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Certification</h4>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div 
                                    className={cn(
                                        "size-5 rounded-lg border flex items-center justify-center transition-all",
                                        isVerified ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-slate-200 dark:border-border bg-transparent"
                                    )}
                                    onClick={() => { setIsVerified(!isVerified); setPage(1); }}
                                >
                                    {isVerified && <ShieldCheck className="size-3.5 text-white" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-bold transition-colors",
                                    isVerified ? "text-emerald-500" : "text-slate-600 dark:text-slate-400 group-hover:text-primary"
                                )}>Fournisseurs Vérifiés</span>
                            </label>
                        </div>

                        {/* Sort Select */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trier par</h4>
                            <select 
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                                className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-700/50 border border-border rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-[#FF6600]"
                            >
                                <option value="newest">Nouveautés d'abord</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="popular">Popularité globale</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Main Grid Area */}
                <div className="flex-1 space-y-6">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-border rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF6600]">
                                <LayoutGrid className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Catalogue Produit</h2>
                                <p className="text-sm text-slate-500 font-medium">{productsData?.total || 0} produits correspondants</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                            <button onClick={() => setViewMode('grid')} className={cn("size-9 flex items-center justify-center rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("size-9 flex items-center justify-center rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-900 dark:hover:text-white")}>
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {productsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
                        </div>
                    ) : productsError ? (
                        <ErrorState error={productsError} />
                    ) : products.length > 0 ? (
                        <>
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className={cn(
                                    "grid gap-6",
                                    viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                                )}
                            >
                                {products.map(p => (
                                    <motion.div key={p.id} variants={itemVariants}>
                                        <ProductCard product={p} layout={viewMode} />
                                    </motion.div>
                                ))}
                            </motion.div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-3 pt-12 pb-8">
                                    <Button 
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="size-12 rounded-xl bg-white dark:bg-slate-800 border border-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 shadow-sm"
                                    >
                                        <ChevronLeft className="size-5" />
                                    </Button>
                                    <div className="h-12 px-6 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold border border-border text-slate-900 dark:text-white shadow-sm">
                                        Page {page} sur {totalPages}
                                    </div>
                                    <Button 
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="size-12 rounded-xl bg-white dark:bg-slate-800 border border-border text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 shadow-sm"
                                    >
                                        <ChevronRight className="size-5" />
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <EmptyState message="Aucun produit ne correspond à vos filtres de recherche." />
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductCatalogue;
