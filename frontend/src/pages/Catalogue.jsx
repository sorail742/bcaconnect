import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { useProducts, useCategories, useVendors, useHeroSlides } from '../hooks/useDomainData';
import { cn } from '../lib/utils';
import {
    Search, ChevronLeft, ChevronRight, LayoutGrid, List, ArrowRight,
    ShieldCheck, Truck, RotateCcw, Tag, Award, Sparkles
} from 'lucide-react';
import socketService from '../services/socketService';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';
import { ProductSkeleton } from '../components/ui/Loader';

const ProductCatalogue = () => {
    const { t, lang } = useLanguage();
    
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [priceRange, setPriceRange] = useState([0, 100000000]);
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [currentSlide, setCurrentSlide] = useState(0);

    // Fetching categories and hero slides
    const { data: categoriesRaw, loading: categoriesLoading } = useCategories();
    const { data: heroSlidesRaw, loading: heroLoading } = useHeroSlides();
    const { data: vendorsRaw, loading: vendorsLoading } = useVendors();

    const categories = Array.isArray(categoriesRaw) ? categoriesRaw : [];
    const heroSlides = Array.isArray(heroSlidesRaw) ? heroSlidesRaw : [];
    const vendors = Array.isArray(vendorsRaw) ? vendorsRaw : [];

    // Fetching products with server-side filters
    const { data: productsData, loading: productsLoading, error: productsError } = useProducts({
        page,
        search: searchQuery,
        categorie_id: activeCategory === 'Tous' ? '' : activeCategory,
        min_price: priceRange[0],
        max_price: priceRange[1],
        sort: sortBy,
        limit: 12
    });

    const products = productsData?.products || [];
    const totalPages = productsData?.pages || 1;

    // Fallback slides si l'API ne renvoie rien
    const DEFAULT_SLIDES = [
        {
            tag: "INNOVATION",
            title: "Performance & Mobilité",
            subtitle: "La nouvelle gamme d'ordinateurs professionnels est arrivée.",
            cta: "DÉCOUVRIR",
            ctaLink: "/marketplace",
            img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200",
        }
    ];

    const displaySlides = heroSlides.length > 0 ? heroSlides : DEFAULT_SLIDES;

    useEffect(() => {
        socketService.connect();
        const handleNewProduct = (newProduct) => {
            toast.info(`🎉 Nouveau produit : ${newProduct.nom_produit}`, {
                duration: 5000
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

    return (
        <div className="relative bg-card min-h-screen text-foreground font-jakarta selection:bg-primary selection:text-background">
            {/* Hero Section */}
            <section className="relative min-h-[50vh] flex items-center overflow-hidden pt-20">
                <div className="absolute inset-0 transition-all duration-[2s]">
                    <img src={slide.img} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-background/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
                </div>

                <div className="container mx-auto px-8 relative z-10">
                    <div className="max-w-[800px] space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Sparkles className="size-3" />
                            {slide.tag}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-[0.9]">
                            {slide.title}
                        </h1>
                        <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-xl">
                            {slide.subtitle}
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Link to={slide.ctaLink || '/marketplace'}>
                                <Button className="h-12 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-black rounded-xl shadow-lg group border-none">
                                    {slide.cta}
                                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Catalogue Grid */}
            <section className="max-w-[1600px] mx-auto px-4 md:px-8 py-12 flex flex-col lg:flex-row gap-8">
                
                {/* Advanced Filtering Rails */}
                <aside className="lg:w-80 shrink-0 space-y-6">
                    <div className="bg-muted/30 border border-border rounded-2xl p-6 space-y-8 sticky top-24">
                        <div>
                            <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Filtrage Intelligent</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    className="h-11 w-full pl-10 pr-4 bg-background border border-border focus:border-primary/50 rounded-xl text-sm outline-none transition-all"
                                    placeholder="Rechercher un produit..."
                                    value={searchQuery}
                                    onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Catégories</h4>
                            <div className="flex flex-wrap gap-2">
                                <button 
                                    onClick={() => { setActiveCategory('Tous'); setPage(1); }}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                                        activeCategory === 'Tous' ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground hover:border-primary/40"
                                    )}
                                >
                                    Tous
                                </button>
                                {categories.map(cat => (
                                    <button 
                                        key={cat.id}
                                        onClick={() => { setActiveCategory(cat.id); setPage(1); }}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                                            activeCategory === cat.id ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-background border-border text-muted-foreground hover:border-primary/40"
                                        )}
                                    >
                                        {cat.nom_categorie}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Budget (GNF)</h4>
                                <span className="text-[10px] font-black text-primary">{priceRange[1].toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min={0} 
                                max={100000000} 
                                step={100000}
                                value={priceRange[1]}
                                onChange={e => { setPriceRange([0, parseInt(e.target.value)]); setPage(1); }}
                                className="w-full h-1.5 bg-border rounded-full appearance-none accent-primary cursor-pointer"
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trier par</h4>
                            <select 
                                value={sortBy}
                                onChange={e => { setSortBy(e.target.value); setPage(1); }}
                                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-xs font-bold outline-none"
                            >
                                <option value="newest">Nouveautés</option>
                                <option value="price_asc">Prix croissant</option>
                                <option value="price_desc">Prix décroissant</option>
                                <option value="popular">Popularité</option>
                            </select>
                        </div>
                    </div>
                </aside>

                {/* Unified Terminal Grid */}
                <div className="flex-1 space-y-8">
                    <div className="flex items-center justify-between border-b border-border pb-6">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LayoutGrid className="size-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-foreground">Catalogue Global</h2>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{productsData?.total || 0} Résultats trouvés</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewMode('grid')} className={cn("size-10 flex items-center justify-center rounded-xl transition-all", viewMode === 'grid' ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button onClick={() => setViewMode('list')} className={cn("size-10 flex items-center justify-center rounded-xl transition-all", viewMode === 'list' ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground")}>
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>

                    {productsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : productsError ? (
                        <ErrorState error={productsError} />
                    ) : products.length > 0 ? (
                        <>
                            <div className={cn(
                                "grid gap-6",
                                viewMode === 'grid' ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                            )}>
                                {products.map(p => <ProductCard key={p.id} product={p} layout={viewMode} />)}
                            </div>

                            {/* Pagination Terminal */}
                            <div className="flex items-center justify-center gap-2 pt-12">
                                <Button 
                                    disabled={page <= 1}
                                    onClick={() => setPage(page - 1)}
                                    className="size-11 rounded-xl bg-muted border-none text-foreground hover:bg-foreground hover:text-background disabled:opacity-30"
                                >
                                    <ChevronLeft className="size-5" />
                                </Button>
                                <div className="h-11 px-6 bg-muted rounded-xl flex items-center justify-center text-xs font-black border-border border">
                                    PAGE {page} SUR {totalPages}
                                </div>
                                <Button 
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(page + 1)}
                                    className="size-11 rounded-xl bg-muted border-none text-foreground hover:bg-foreground hover:text-background disabled:opacity-30"
                                >
                                    <ChevronRight className="size-5" />
                                </Button>
                            </div>
                        </>
                    ) : (
                        <EmptyState message="Aucun produit ne correspond à ces critères d'exécution." />
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h2 className="text-3xl md:text-5xl font-black text-primary-foreground tracking-tighter">
                        Prenez le contrôle de vos achats
                    </h2>
                    <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto font-medium">
                        Rejoignez des milliers de clients satisfaits sur la plateforme BCA Connect.
                    </p>
                    <div className="flex justify-center">
                        <Link to="/register">
                            <Button className="h-14 px-10 bg-background text-foreground hover:bg-foreground hover:text-background font-black rounded-2xl border-none shadow-2xl transition-all scale-100 hover:scale-105">
                                Créer un compte maintenant
                                <ArrowRight className="size-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <Sparkles className="size-64" />
                </div>
            </section>
        </div>
    );
};

export default ProductCatalogue;
