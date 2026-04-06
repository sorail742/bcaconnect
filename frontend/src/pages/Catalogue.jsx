import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Loader';
import { cn } from '../lib/utils';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import {
    Search, ChevronLeft, ChevronRight, LayoutGrid, List, ArrowRight,
    Star, ShieldCheck, Truck, RotateCcw, Tag,
    Flame, Award, Store, Zap, Sparkles
} from 'lucide-react';
import api from '../services/api';
import socketService from '../services/socketService';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const ProductCatalogue = () => {
    const { t, lang } = useLanguage();
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [realCategories, setRealCategories] = useState([]);
    const [realVendors, setRealVendors] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 50000000]);

    const HERO_SLIDES = [
        {
            tag: lang === 'FR' ? "COLLECTION_EXCLUSIVE_2024" : "EXCLUSIVE_COLLECTION_2024",
            title: t('catInnovationTitle'),
            subtitle: t('catInnovationSubbolt'),
            cta: lang === 'FR' ? "EXPLORER_L'INNOVATION" : "EXPLORE_INNOVATION",
            ctaLink: "/marketplace?cat=Électronique",
            img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200",
            badge: "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/30",
        },
        {
            tag: lang === 'FR' ? "ARTISANAT_D'EXCEPTION" : "EXCEPTIONAL_CRAFTSMANSHIP",
            title: t('catEleganceTitle'),
            subtitle: t('catEleganceSub'),
            cta: lang === 'FR' ? "DÉCOUVRIR_LA_MODE" : "DISCOVER_FASHION",
            ctaLink: "/marketplace?cat=Mode",
            img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
            badge: "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/30",
        },
        {
            tag: lang === 'FR' ? "LOGISTIQUE_INTELLIGENTE" : "SMART_LOGISTICS",
            title: t('catLogisticsTitle'),
            subtitle: t('catLogisticsSub'),
            cta: lang === 'FR' ? "COMMANDER_MAINTENANT" : "ORDER_NOW",
            ctaLink: "/marketplace",
            img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
            badge: "bg-[#FFB703]/20 text-[#FFB703] border-[#FFB703]/30",
        },
    ];

    const TRUST_BADGES = [
        { icon: ShieldCheck, title: lang === 'FR' ? "PAIEMENT_SÉCURISÉ" : "SECURE_PAYMENT", desc: lang === 'FR' ? "TRANSACTIONS_CRYPTÉES_SSL" : "SSL_ENCRYPTED_TRANSACTIONS", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { icon: Truck, title: t('feat3Title'), desc: lang === 'FR' ? "48H_À_CONAKRY" : "48H_IN_CONAKRY", color: "text-[#FFB703]", bg: "bg-[#FFB703]/10" },
        { icon: RotateCcw, title: lang === 'FR' ? "RETOURS_FACILES" : "EASY_RETURNS", desc: lang === 'FR' ? "30_JOURS_PROTOCOLE" : "30_DAYS_PROTOCOL", color: "text-muted-foreground", bg: "bg-foreground/5" },
        { icon: Award, title: lang === 'FR' ? "PRODUITS_CERTIFIÉS" : "CERTIFIED_PRODUCTS", desc: lang === 'FR' ? "MARCHAND_VÉRIFIÉ" : "VERIFIED_MERCHANTS", color: "text-[#FFB703]", bg: "bg-[#FFB703]/10" },
    ];

    useEffect(() => {
        socketService.connect();
        const handleNewProduct = (newProduct) => {
            setProducts(prev => [newProduct, ...prev]);
            toast.info(`🎉 ${lang === 'FR' ? 'NOUVEAU_PRODUIT' : 'NEW_PRODUCT'} : ${newProduct.nom_produit}`, {
                description: lang === 'FR' ? "INDEX_ACTUALISÉ_RÉSEAU." : "NETWORK_INDEX_UPDATED.",
                duration: 5000
            });
        };
        socketService.on('product_added', handleNewProduct);
        return () => socketService.off('product_added', handleNewProduct);
    }, [lang]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
        }, 12000);
        return () => clearInterval(timer);
    }, [HERO_SLIDES.length]);

    useEffect(() => {
        const load = async () => {
            try {
                const [prodData, catData, storeData] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll(),
                    api.get('/stores').then(r => r.data).catch(() => [])
                ]);
                setProducts(prodData || []);
                setRealCategories(catData || []);
                setRealVendors(storeData.slice(0, 3));
            } catch (error) {
                console.error("ERREUR_INDEX_CATALOGUE:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filteredProducts = products.filter(p => {
        const matchesCategory = activeCategory === "Tous" ||
            p.categorie?.nom_categorie === activeCategory ||
            p.nom_categorie === activeCategory;
        const matchesSearch = (p.nom_produit?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
        const matchesPrice = parseFloat(p.prix_unitaire || 0) <= priceRange[1];

        return matchesCategory && matchesSearch && matchesPrice;
    });

    const slide = HERO_SLIDES[currentSlide];

    return (
        <div className="relative bg-card min-h-screen text-foreground font-jakarta selection:bg-[#FFB703] selection:text-background">
            {/* Section Hero Slider */}
            <section className="relative min-h-[60vh] flex items-center overflow-hidden pt-24 pb-16">
                <div className="absolute inset-0 transition-all duration-[3s]">
                    <img src={slide.img} className="w-full h-full object-cover scale-105" alt="" />
                    <div className="absolute inset-0 bg-background/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
                </div>

                <div className="container mx-auto px-8 relative z-10">
                    <div className="max-w-[1200px] space-y-16">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-xs font-bold uppercase tracking-wide text-primary">
                            <Sparkles className="size-4 animate-pulse" />
                            {slide.tag}
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight">
                            {slide.title.split(' ').slice(0, -2).join(' ')} <br />
                            <span className="text-primary">{slide.title.split(' ').slice(-2).join(' ')}</span>
                        </h1>
                        <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl border-l-4 border-primary/40 pl-5">
                            {slide.subtitle}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 pt-6">
                            <Button id="btn-hero-cta" className="h-11 px-7 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl shadow-lg group border-none transition-all">
                                {slide.cta}
                                <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <div className="flex -space-x-3 items-center">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="size-9 rounded-full border-2 border-background overflow-hidden shadow">
                                        <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                                <div className="pl-4">
                                    <p className="text-sm font-semibold text-foreground">+12 000 membres</p>
                                    <p className="text-xs text-muted-foreground">{lang === 'FR' ? 'actifs sur le réseau' : 'active on network'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-16 right-16 flex flex-col gap-8 items-end">
                    <div className="flex items-center gap-6">
                        {HERO_SLIDES.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)}
                                className={cn(
                                    "transition-all duration-1000",
                                    currentSlide === i ? "w-8 h-2 bg-primary rounded-full" : "size-2 bg-foreground/30 rounded-full hover:bg-primary/60"
                                )}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Badges de Confiance */}
            <section className="relative z-20 max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border">
                        {TRUST_BADGES.map((badge, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4 group hover:bg-muted/50 transition-colors cursor-default">
                                <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105",
                                    i % 2 === 1 ? "bg-primary/10 border border-primary/20" : "bg-muted border border-border"
                                )}>
                                    <badge.icon className={cn("size-5", i % 2 === 1 ? "text-primary" : "text-foreground")} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">{badge.title}</p>
                                    <p className="text-xs text-muted-foreground">{badge.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Catalogue Area */}
            <section id="products-section" className="max-w-[1400px] mx-auto px-4 md:px-8 py-10 flex flex-col lg:flex-row gap-6">

                {/* Sidebar Filters */}
                <aside className="lg:w-72 shrink-0 space-y-4">
                    <div className="bg-card border border-border rounded-xl p-5 space-y-5">
                        <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-wide">{t('catSmartFiltering')}</span>
                            <div className="h-0.5 w-10 bg-primary rounded-full mt-1" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                                <Search className="size-4 text-primary" />
                                {t('catKeywords')}
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <input
                                    id="search-input"
                                    className="h-10 w-full pl-9 pr-3 bg-background border border-border focus:border-primary/50 rounded-lg text-sm outline-none transition-all text-foreground placeholder:text-muted-foreground"
                                    placeholder={lang === 'FR' ? "Rechercher..." : "Search..."}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-foreground flex items-center gap-2">
                                    <Tag className="size-4 text-primary" />
                                    {t('catMaxPrice')}
                                </label>
                                <span className="text-xs font-bold text-primary tabular-nums">{priceRange[1].toLocaleString()} GNF</span>
                            </div>
                            <input type="range" min={0} max={50000000} step={1000000}
                                value={priceRange[1]}
                                onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                            />
                        </div>
                    </div>

                    {/* Top Vendors */}
                    <div className="bg-card border border-border rounded-xl p-5">
                        <h5 className="text-xs font-bold text-primary uppercase tracking-wide mb-4">{t('catCertifiedVendors')}</h5>
                        <div className="space-y-3">
                            {realVendors.map(v => (
                                <Link key={v.id} to={`/shop/${v.slug}`} className="flex items-center gap-3 group/v hover:bg-muted/50 rounded-lg p-2 transition-colors">
                                    <div className="size-10 rounded-xl bg-muted border border-border overflow-hidden shrink-0">
                                        <img src={v.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${v.nom_boutique}`} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground group-hover/v:text-primary transition-colors truncate">{v.nom_boutique}</p>
                                        <div className="flex items-center gap-1">
                                            <ShieldCheck className="size-3 text-emerald-500" />
                                            <span className="text-xs text-muted-foreground">{t('catVerifiedEntity')}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        <Link to="/vendors" className="mt-4 flex items-center justify-center gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-semibold transition-colors">
                            {t('catFullDirectory')} <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </aside>

                {/* Products Grid Area */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-3">
                        <div>
                            <p className="text-xs text-muted-foreground">{lang === 'FR' ? 'Résultats' : 'Results'}</p>
                            <h2 className="text-xl font-bold text-foreground">
                                {filteredProducts.length} <span className="text-primary">{t('catResultsFiltered')}</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-muted rounded-xl border border-border">
                            <button id="view-grid" onClick={() => setViewMode('grid')} className={cn("size-9 flex items-center justify-center rounded-lg transition-all", viewMode === 'grid' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
                                <LayoutGrid className="size-4" />
                            </button>
                            <button id="view-list" onClick={() => setViewMode('list')} className={cn("size-9 flex items-center justify-center rounded-lg transition-all", viewMode === 'list' ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}>
                                <List className="size-4" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/5] bg-white/[0.02] rounded-3xl animate-pulse border border-foreground/5" />)}
                        </div>
                    ) : hasError ? (
                        <div className="py-60 text-center bg-rose-500/5 rounded-3xl border-4 border-dashed border-rose-500/20 shadow-inner group">
                            <h3 className="text-2xl md:text-3xl font-semibold text-rose-500  mb-12 tracking-tighter">PROTOCOLE_ERREUR_SYS</h3>
                            <p className="text-muted-foreground text-[11px] font-black uppercase  mb-16 opacity-80 leading-relaxed">LE_RÉSEAU_A_RENCONTRÉ_UNE_INSTABILITÉ_DURING_L'INDEXATION.</p>
                            <Button id="btn-reboot" onClick={() => window.location.reload()} className="h-24 px-16 bg-white text-background hover:bg-rose-500 hover:text-foreground rounded-3xl font-black text-sm uppercase  transition-all shadow-4xl border-none ">REBOOT_COMMAND_CENTER</Button>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={cn(
                            "grid gap-4",
                            viewMode === 'grid' ? "grid-cols-2 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                        )}>
                            {filteredProducts.map(p => <ProductCard key={p.id} product={p} layout={viewMode} />)}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center text-center bg-muted rounded-2xl border border-border">
                            <Search className="size-10 text-muted-foreground/40 mb-3" />
                            <h3 className="text-base font-semibold text-foreground mb-2">{t('catZeroMatch')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">Aucun produit ne correspond à vos critères.</p>
                            <button id="reset-filters" onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }}
                                className="text-sm font-semibold text-primary hover:underline transition-all">
                                {t('catResetFilters')}
                            </button>
                        </div>
                    )}

                    {/* Pagination Sample — Navigation Hub */}
                    {filteredProducts.length > 0 && (
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                            <p className="text-sm text-muted-foreground">Page 1 / 1</p>
                            <div className="flex items-center gap-2">
                                <button id="page-prev" className="size-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground cursor-not-allowed opacity-40"><ChevronLeft className="size-4" /></button>
                                <button id="page-1" className="size-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm">1</button>
                                <button id="page-next" className="size-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground cursor-not-allowed opacity-40"><ChevronRight className="size-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="py-14 bg-primary relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto px-6 text-center space-y-5">
                    <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground tracking-tight">
                        {t('catTakeControl')}
                    </h2>
                    <p className="text-primary-foreground/80 text-base md:text-lg max-w-2xl mx-auto">
                        {t('catTakeControlSub')}
                    </p>
                    <Link to="/register">
                        <Button id="btn-final-register" className="h-11 px-7 bg-background text-foreground hover:bg-foreground hover:text-background font-bold rounded-xl border-none shadow-lg transition-all">
                            {t('catCreateAccount')}
                            <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default ProductCatalogue;
