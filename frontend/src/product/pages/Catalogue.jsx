import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/DataStates';
import { useHeroSlides } from '../../ad/hooks/useMarketingData';
import { useProducts } from '../hooks/useProductData';
import { useCategories } from '../../category/hooks/useCategoryData';
import { cn } from '../../lib/utils';
import {
    Search, ChevronLeft, ChevronRight, LayoutGrid, List, ArrowRight,
    Sparkles, Filter, ShieldCheck
} from 'lucide-react';
import socketService from '../../services/socketService';
import { toast } from 'sonner';
import { useLanguage } from '../../context/useLanguage';
import { ProductSkeleton } from '../../components/ui/Loader';
import { getCategoryIconComponent } from '../../category/lib/categoryConstants';
import BcaTrustBar from '../../components/marketplace/BcaTrustBar';

const ProductCatalogue = () => {
    const { t, lang } = useLanguage();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "Tous");
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

    // Synchroniser l'URL avec l'état local
    useEffect(() => {
        const params = new URLSearchParams();
        if (activeCategory !== 'Tous') params.set('category', activeCategory);
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        setSearchParams(params, { replace: true });
    }, [activeCategory, searchQuery, setSearchParams]);

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

    const PROMO_TILES = [
        { title: 'Gros volumes', desc: 'Prix de gros & MOQ', color: 'from-[#1CA0DB] to-[#0E86B4]', link: '/marketplace' },
        { title: 'Fournisseurs vérifiés', desc: 'Badges & audits BCA', color: 'from-[#0E86B4] to-[#1CA0DB]', link: '/vendors' },
        { title: 'Crédit B2B', desc: 'Paiement échelonné', color: 'from-[#4FC3F7] to-[#1CA0DB]', link: '/credits/simulate' },
        { title: 'Logistique', desc: 'Conakry & intérieur', color: 'from-[#1CA0DB] to-[#4FC3F7]', link: '/tracking' },
    ];

    return (
        <div className="relative marketplace-bg min-h-screen text-[#333] dark:text-foreground font-sans">
            
            {/* Hero B2B compact — style BCA */}
            <section className="bg-card dark:bg-slate-900 border-b border-[#e8e8e8] dark:border-border pt-24 pb-0">
                <div className="container px-4 md:px-12">
                    <div className="grid lg:grid-cols-12 gap-4 pb-6">
                        <div className="lg:col-span-8 relative rounded overflow-hidden min-h-[220px] md:min-h-[280px] border border-[#e8e8e8]">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSlide}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute inset-0"
                                >
                                    <img src={slide.img} className="w-full h-full object-cover" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                                </motion.div>
                            </AnimatePresence>
                            <div className="relative z-10 p-6 md:p-8 flex flex-col justify-center h-full min-h-[220px] md:min-h-[280px]">
                                <span className="inline-flex items-center gap-1.5 w-fit px-2 py-1 bg-[#1CA0DB] text-white text-[10px] font-bold uppercase tracking-wide mb-3">
                                    <Sparkles className="size-3" />
                                    {slide.tag}
                                </span>
                                <h1 className="text-2xl md:text-4xl font-bold text-white leading-tight max-w-lg">
                                    {slide.title}
                                </h1>
                                <p className="text-sm md:text-base text-white/85 mt-2 max-w-md line-clamp-2">
                                    {slide.subtitle}
                                </p>
                                <Link to={slide.ctaLink || '/marketplace'} className="mt-4">
                                    <Button className="h-10 px-6 bca-btn-primary text-sm font-semibold rounded">
                                        {slide.cta}
                                        <ArrowRight className="size-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                            {displaySlides.length > 1 && (
                                <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
                                    {displaySlides.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentSlide(i)}
                                            className={cn(
                                                "size-2 rounded-full transition-all",
                                                i === currentSlide ? "bg-[#1CA0DB] w-5" : "bg-card/60 hover:bg-card"
                                            )}
                                            aria-label={`Slide ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                            {PROMO_TILES.map((tile) => (
                                <Link
                                    key={tile.title}
                                    to={tile.link}
                                    className={cn("bca-promo-tile p-4 flex flex-col justify-end min-h-[100px] bg-gradient-to-br text-white", tile.color)}
                                >
                                    <p className="text-sm font-bold leading-tight">{tile.title}</p>
                                    <p className="text-[11px] text-white/85 mt-0.5">{tile.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <BcaTrustBar />

            {/* ══ MAIN CATALOGUE ══ */}
            <section className="container px-4 md:px-12 py-8 flex flex-col lg:flex-row gap-4">
                
                {/* Sidebar filtres — style BCA */}
                <aside className="lg:w-64 shrink-0">
                    <div className="bca-sidebar-panel p-4 space-y-6 sticky top-24">
                        
                        {/* Search Input */}
                        <div>
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#f0f0f0]">
                                <Filter className="size-4 text-[#1CA0DB]" />
                                <h3 className="text-sm font-bold text-[#333] dark:text-white">{t('catSmartFiltering') || "Filtres"}</h3>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#999]" />
                                <input
                                    className="h-10 w-full pl-10 pr-3 bg-card border border-[#d9d9d9] focus:border-[#1CA0DB] rounded text-sm outline-none transition-all text-[#333] dark:text-white dark:bg-slate-800"
                                    placeholder={t('searchPlaceholder') || "Mot-clé, produit..."}
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        {/* Categories List */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[#999] uppercase">Catégories</h4>
                            <div className="flex flex-col gap-0.5">
                                <button 
                                    onClick={() => { setActiveCategory('Tous'); setPage(1); }}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center gap-2",
                                        activeCategory === 'Tous' ? "bg-[#eff6ff] text-[#1CA0DB] font-semibold" : "text-[#666] hover:bg-[#fafafa] hover:text-[#1CA0DB]"
                                    )}
                                >
                                    <LayoutGrid className="size-4" />
                                    {t('catFullDirectory') || "Toutes les catégories"}
                                </button>
                                {!categoriesLoading && categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setPage(1); }}
                                        className={cn(
                                            "w-full text-left px-3 py-2 rounded text-sm transition-all truncate flex items-center gap-2",
                                            activeCategory === cat.id ? "bg-[#eff6ff] text-[#1CA0DB] font-semibold" : "text-[#666] hover:bg-[#fafafa] hover:text-[#1CA0DB]"
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
                                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('catMaxPrice') || "Budget Max"}</h4>
                                <span className="text-sm font-bold text-foreground dark:text-white">{priceRange[1].toLocaleString()} GNF</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={1000000000} 
                                step={1000000}
                                value={priceRange[1]}
                                onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setPage(1); }}
                                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-[#1CA0DB] cursor-pointer"
                            />
                        </div>

                        {/* Condition Filter */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">État du Produit</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['neuf', 'occasion'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => { setCondition(condition === c ? '' : c); setPage(1); }}
                                        className={cn(
                                            "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                            condition === c 
                                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                                : "bg-transparent border-border dark:border-border text-muted-foreground dark:text-muted-foreground hover:border-primary/50"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Seller Type Filter */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Certification</h4>
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div 
                                    className={cn(
                                        "size-5 rounded-lg border flex items-center justify-center transition-all",
                                        isVerified ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20" : "border-border dark:border-border bg-transparent"
                                    )}
                                    onClick={() => { setIsVerified(!isVerified); setPage(1); }}
                                >
                                    {isVerified && <ShieldCheck className="size-3.5 text-white" />}
                                </div>
                                <span className={cn(
                                    "text-xs font-bold transition-colors",
                                    isVerified ? "text-emerald-500" : "text-muted-foreground dark:text-muted-foreground group-hover:text-primary"
                                )}>{t('catCertifiedVendors') || "Fournisseurs Vérifiés"}</span>
                            </label>
                        </div>

                        {/* Sort Select */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Trier par</h4>
                            <select 
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                                className="w-full h-12 px-4 bg-muted dark:bg-slate-700/50 border border-border rounded-xl text-sm font-bold text-foreground dark:text-white outline-none focus:border-[#1CA0DB]"
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
                    {/* Toolbar BCA */}
                    <div className="bca-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3">
                        <div>
                            <h2 className="text-base font-bold text-[#333] dark:text-white">{t('catalog') || "Catalogue grossiste"}</h2>
                            <p className="text-xs text-[#999]">{productsData?.total || 0} {t('catResultsFiltered') || "résultats"} · {activeCategory === 'Tous' ? 'Toutes catégories' : 'Filtré'}</p>
                        </div>
                        <div className="flex items-center gap-1 border border-[#e8e8e8] rounded p-0.5">
                            <button onClick={() => setViewMode('grid')} className={cn("size-8 flex items-center justify-center rounded transition-all", viewMode === 'grid' ? "bg-[#1CA0DB] text-white" : "text-[#666] hover:text-[#1CA0DB]")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("size-8 flex items-center justify-center rounded transition-all", viewMode === 'list' ? "bg-[#1CA0DB] text-white" : "text-[#666] hover:text-[#1CA0DB]")}>
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {productsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {[...Array(10)].map((_, i) => <ProductSkeleton key={i} />)}
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
                                    "grid gap-3",
                                    viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1 gap-3"
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
                                <div className="flex items-center justify-center gap-2 pt-8 pb-6">
                                    <Button 
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="h-9 px-3 rounded border border-[#d9d9d9] bg-card text-[#333] hover:border-[#1CA0DB] hover:text-[#1CA0DB] disabled:opacity-40"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <span className="h-9 px-4 flex items-center text-sm text-[#666] border border-[#e8e8e8] bg-card rounded">
                                        {page} / {totalPages}
                                    </span>
                                    <Button 
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="h-9 px-3 rounded border border-[#d9d9d9] bg-card text-[#333] hover:border-[#1CA0DB] hover:text-[#1CA0DB] disabled:opacity-40"
                                    >
                                        <ChevronRight className="size-4" />
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
