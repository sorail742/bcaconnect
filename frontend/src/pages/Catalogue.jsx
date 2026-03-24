import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Skeleton } from '../components/ui/Loader';
import { cn } from '../lib/utils';
import productService from '../services/productService';
import categoryService from '../services/categoryService';
import {
    Search, ChevronLeft, ChevronRight, Filter, SlidersHorizontal,
    Sparkles, ShoppingBag, LayoutGrid, List, ArrowRight,
    Star, TrendingUp, ShieldCheck, Truck, RotateCcw, Tag,
    Flame, Clock, Award, Store, Users, ChevronDown, X, Zap
} from 'lucide-react';

// ─── Données statiques showcase ───────────────────────────────────────────────

const HERO_SLIDES = [
    {
        tag: "Nouveautés 2024",
        title: "L'Électronique\nde Demain",
        subtitle: "Découvrez les dernières technologies. Smartphones, laptops et accessoires à des prix imbattables.",
        cta: "Voir la collection",
        ctaLink: "/marketplace?cat=Électronique",
        bg: "from-slate-950 via-blue-950 to-slate-900",
        accent: "from-blue-500 to-primary",
        img: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800",
        badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    },
    {
        tag: "Mode Africaine",
        title: "L'Élégance\nGuinéenne",
        subtitle: "Bazin riche, lépi, boubou et tenues modernes. Les créateurs guinéens sublimés.",
        cta: "Explorer la mode",
        ctaLink: "/marketplace?cat=Mode",
        bg: "from-purple-950 via-slate-900 to-slate-950",
        accent: "from-purple-500 to-amber-400",
        img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800",
        badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    {
        tag: "Offre Spéciale",
        title: "Livraison\nGratuite",
        subtitle: "Pour toute commande supérieure à 500.000 GNF partout à Conakry. Offre limitée.",
        cta: "En profiter",
        ctaLink: "/marketplace",
        bg: "from-emerald-950 via-slate-900 to-slate-950",
        accent: "from-emerald-500 to-teal-400",
        img: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&q=80&w=800",
        badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
];

const CATEGORIES = [
    { slug: "Tous", label: "Tout voir", icon: LayoutGrid, count: "1.2k+", color: "from-slate-800 to-slate-700", img: null },
    { slug: "Électronique", label: "Électronique", icon: Zap, count: "340+", color: "from-blue-900 to-slate-800", img: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&q=80&w=200" },
    { slug: "Mode", label: "Mode & Textile", icon: ShoppingBag, count: "280+", color: "from-purple-900 to-slate-800", img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=200" },
    { slug: "Mobilier", label: "Maison & Déco", icon: Store, count: "180+", color: "from-amber-900 to-slate-800", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=200" },
    { slug: "Informatique", label: "Informatique", icon: Award, count: "220+", color: "from-cyan-900 to-slate-800", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=200" },
    { slug: "Alimentaire", label: "Alimentation", icon: Flame, count: "150+", color: "from-orange-900 to-slate-800", img: "https://images.unsplash.com/photo-1506617564039-2f3b650b7010?auto=format&fit=crop&q=80&w=200" },
];

const FEATURED_VENDORS = [
    { id: 1, name: "AudioShop GN", category: "Électronique", rating: 4.9, sales: "2.4k", badge: "Top Vendeur", avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=80", cover: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&q=80&w=400" },
    { id: 2, name: "Mode Africaine Co.", category: "Textile", rating: 4.8, sales: "1.8k", badge: "Certifié BCA", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=80", cover: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400" },
    { id: 3, name: "Atelier Wood GN", category: "Mobilier", rating: 4.7, sales: "890", badge: "Artisan Local", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80", cover: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=400" },
];

const TRUST_BADGES = [
    { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Transactions cryptées SSL 256-bit", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: Truck, title: "Livraison Express", desc: "48h à Conakry, 5 jours en province", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { icon: RotateCcw, title: "Retours Faciles", desc: "30 jours pour changer d'avis", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    { icon: Award, title: "Produits Certifiés", desc: "Chaque marchand est vérifié", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
];

const SORT_OPTIONS = ["Pertinence", "Prix croissant", "Prix décroissant", "Mieux notés", "Plus récents"];

import api from '../services/api';
import socketService from '../services/socketService';
import { toast } from 'sonner';

// ─── Composant Principal ────────────────────────────────────────────────────
const ProductCatalogue = () => {
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeSort, setActiveSort] = useState("Pertinence");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [realCategories, setRealCategories] = useState([]);
    const [realVendors, setRealVendors] = useState([]);
    const [activeFilters, setActiveFilters] = useState([]);
    const slideRef = useRef(null);

    // Temps réel : Écouter l'ajout de produits
    useEffect(() => {
        socketService.connect();

        const handleNewProduct = (newProduct) => {
            setProducts(prev => {
                // Vérifier si déjà présent pour éviter les doublons
                if (prev.find(p => p.id === newProduct.id)) return prev;
                return [newProduct, ...prev];
            });
            toast.info(`🎉 Nouveau produit en ligne : ${newProduct.nom_produit}`, {
                description: "Le catalogue vient d'être mis à jour en temps réel.",
                duration: 5000
            });
        };

        socketService.on('product_added', handleNewProduct);

        return () => {
            socketService.off('product_added', handleNewProduct);
        };
    }, []);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const [prodData, catData, storeData] = await Promise.all([
                    productService.getAll(),
                    categoryService.getAll(),
                    productService.getFeaturedStores ? productService.getFeaturedStores() : (async () => {
                        const stores = await api.get('/stores').then(r => r.data);
                        return stores.slice(0, 3);
                    })()
                ]);
                setProducts(prodData);
                setRealCategories(catData);
                setRealVendors(storeData);
            } catch (error) {
                console.error("Error loading catalogue data:", error);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filteredProducts = products.filter(p =>
        (activeCategory === "Tous" || p.categorie?.nom_categorie === activeCategory || p.nom_categorie === activeCategory) &&
        (p.nom_produit?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getCategoryIcon = (slug) => {
        const icons = {
            'Électronique': Zap,
            'Mode': ShoppingBag,
            'Mobilier': Store,
            'Informatique': Award,
            'Alimentaire': Flame
        };
        return icons[slug] || LayoutGrid;
    };

    const slide = HERO_SLIDES[currentSlide];

    return (
        <PublicLayout>
            <div className="bg-slate-50 dark:bg-[#080c14] min-h-screen font-inter">

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — HERO SLIDER
                ══════════════════════════════════════════════════ */}
                <section className="relative h-[85vh] max-h-[700px] overflow-hidden">
                    {/* Slide Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} transition-all duration-1000`}>
                        <img
                            src={slide.img}
                            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay transition-all duration-1000 scale-105"
                            alt=""
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        {/* Animated mesh */}
                        <div className="absolute top-20 right-20 size-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute bottom-0 left-1/2 size-64 bg-blue-600/5 rounded-full blur-[100px]" />
                    </div>

                    {/* Slide Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex items-center">
                        <div className="max-w-2xl space-y-8 animate-in slide-in-from-left duration-700">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] ${slide.badge}`}>
                                <Sparkles className="size-3" />
                                {slide.tag}
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none uppercase whitespace-pre-line">
                                {slide.title.split('\n')[0]}{'\n'}
                                <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                                    {slide.title.split('\n')[1]}
                                </span>
                            </h1>

                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-lg">
                                {slide.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Link to={slide.ctaLink}>
                                    <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 group">
                                        {slide.cta}
                                        <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => setActiveCategory("Tous")}
                                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-xs text-white/70 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all"
                                >
                                    Explorer tout
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-8 pt-4 border-t border-white/10">
                                {[
                                    { val: "1.200+", label: "Produits" },
                                    { val: "500+", label: "Vendeurs" },
                                    { val: "98%", label: "Satisfaction" },
                                ].map((s, i) => (
                                    <div key={i} className="space-y-0.5">
                                        <p className="text-2xl font-black text-white italic tracking-tighter">{s.val}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right image card */}
                        <div className="hidden lg:block absolute right-8 xl:right-16 top-1/2 -translate-y-1/2">
                            <div className="relative w-72 h-80 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl shadow-black/50 group">
                                <img src={slide.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80">BCA Connect</span>
                                    <p className="text-white font-black text-lg italic tracking-tight">{slide.tag}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Slide Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                        <button onClick={() => setCurrentSlide(p => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                            className="size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <ChevronLeft className="size-4" />
                        </button>
                        {HERO_SLIDES.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)}
                                className={cn("rounded-full transition-all duration-500", currentSlide === i ? "w-8 h-3 bg-primary" : "size-3 bg-white/30 hover:bg-white/50")}
                            />
                        ))}
                        <button onClick={() => setCurrentSlide(p => (p + 1) % HERO_SLIDES.length)}
                            className="size-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 — TRUST BADGES
                ══════════════════════════════════════════════════ */}
                <section className="relative -mt-1 bg-slate-900 border-y border-white/5">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                            {TRUST_BADGES.map((badge, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-6 group hover:bg-white/3 transition-all">
                                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 border ${badge.bg} group-hover:scale-110 transition-transform`}>
                                        <badge.icon className={`size-5 ${badge.color}`} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest">{badge.title}</p>
                                        <p className="text-[10px] text-slate-500 font-medium mt-0.5 leading-snug">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 3 — CATÉGORIES
                ══════════════════════════════════════════════════ */}
                <section className="py-16 max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-end justify-between mb-10">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Parcourir</span>
                            <h2 className="text-3xl md:text-4xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                                Catégories
                            </h2>
                        </div>
                        <Link to="/marketplace" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-3 transition-all">
                            Tout voir <ArrowRight className="size-3" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <button
                            onClick={() => {
                                setActiveCategory("Tous");
                                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={cn(
                                "group relative rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl",
                                activeCategory === "Tous"
                                    ? "border-primary shadow-xl shadow-primary/20 scale-105"
                                    : "border-transparent hover:border-primary/30"
                            )}
                        >
                            <div className="aspect-square bg-gradient-to-br from-slate-900 to-slate-800 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                                    <div className={cn(
                                        "size-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300",
                                        activeCategory === "Tous" ? "bg-primary border-primary" : "group-hover:bg-white/20"
                                    )}>
                                        <LayoutGrid className="size-5 text-white" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-white uppercase tracking-wide leading-tight">Tous</p>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {(realCategories?.length > 0 ? realCategories : CATEGORIES.slice(1)).map((cat) => (
                            <button
                                key={cat.id || cat.slug}
                                onClick={() => {
                                    setActiveCategory(cat.nom_categorie || cat.label);
                                    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={cn(
                                    "group relative rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl",
                                    (activeCategory === cat.nom_categorie || activeCategory === cat.label)
                                        ? "border-primary shadow-xl shadow-primary/20 scale-105"
                                        : "border-transparent hover:border-primary/30"
                                )}
                            >
                                <div className={`aspect-square bg-gradient-to-br from-slate-800 to-slate-900 relative`}>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center border border-white/10 bg-white/10 backdrop-blur-md transition-all duration-300",
                                            (activeCategory === cat.nom_categorie || activeCategory === cat.label) ? "bg-primary border-primary" : "group-hover:bg-white/20"
                                        )}>
                                            {React.createElement(getCategoryIcon(cat.nom_categorie || cat.label), { className: "size-5 text-white" })}
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-white uppercase tracking-wide leading-tight">{cat.nom_categorie || cat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 4 — BANNIÈRE PROMO
                ══════════════════════════════════════════════════ */}
                <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Main Promo */}
                        <div className="md:col-span-2 relative rounded-[2rem] overflow-hidden h-52 group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent" />
                            <div className="absolute inset-0 p-8 flex flex-col justify-center">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full w-fit mb-3">Flash Sale</span>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Tech & Gaming <br /><span className="text-primary">-30% ce week-end</span></h3>
                                <Button className="mt-6 h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] w-fit">
                                    Profiter maintenant
                                </Button>
                            </div>
                        </div>
                        {/* Secondary Promo */}
                        <div className="relative rounded-[2rem] overflow-hidden h-52 group cursor-pointer">
                            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent" />
                            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400">Mode Locale</span>
                                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight">Nouvelle <br />Collection Bazin</h3>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 5 — PRODUITS (Filtres + Grille)
                ══════════════════════════════════════════════════ */}
                <section id="products-section" className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
                    <div className="flex gap-12">

                        {/* ─── Sidebar (Desktop) ─── */}
                        <aside className="hidden lg:flex flex-col gap-8 w-64 shrink-0">
                            {/* Filtres par catégorie */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                    <Filter className="size-3 text-primary" /> Catégories
                                </p>
                                <div className="space-y-1">
                                    <button
                                        onClick={() => setActiveCategory("Tous")}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all text-left",
                                            activeCategory === "Tous"
                                                ? "bg-primary text-white font-black shadow-lg shadow-primary/20"
                                                : "text-muted-foreground hover:bg-muted font-medium hover:text-foreground"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LayoutGrid className="size-4" />
                                            Toutes les catégories
                                        </div>
                                    </button>
                                    {realCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.nom_categorie)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all text-left",
                                                activeCategory === cat.nom_categorie
                                                    ? "bg-primary text-white font-black shadow-lg shadow-primary/20"
                                                    : "text-muted-foreground hover:bg-muted font-medium hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {React.createElement(getCategoryIcon(cat.nom_categorie), { className: "size-4" })}
                                                {cat.nom_categorie}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prix */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                    <Tag className="size-3 text-primary" /> Budget (GNF)
                                </p>
                                <div className="space-y-4 px-1">
                                    <input type="range" min={0} max={50000000} step={500000}
                                        value={priceRange[1]}
                                        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex items-center justify-between text-xs font-black text-foreground">
                                        <span>0 GNF</span>
                                        <span className="text-primary italic">{priceRange[1].toLocaleString('fr-FR')} GNF</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tri */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 flex items-center gap-2">
                                    <SlidersHorizontal className="size-3 text-primary" /> Trier par
                                </p>
                                <div className="space-y-1">
                                    {SORT_OPTIONS.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setActiveSort(opt)}
                                            className={cn(
                                                "w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all font-medium",
                                                activeSort === opt ? "bg-primary/10 text-primary font-black" : "text-muted-foreground hover:bg-muted"
                                            )}
                                        >
                                            {opt}
                                            {activeSort === opt && <span className="ml-2 text-primary">●</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Vendeurs vedettes sidebar */}
                            <div className="p-6 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4">Top Vendeurs</p>
                                <div className="space-y-4">
                                    {FEATURED_VENDORS.slice(0, 2).map(v => (
                                        <Link key={v.id} to="/vendors" className="flex items-center gap-3 group/v">
                                            <img src={v.avatar} className="size-10 rounded-full object-cover border-2 border-primary/20 group-hover/v:border-primary transition-all" alt={v.name} />
                                            <div>
                                                <p className="text-xs font-black text-white group-hover/v:text-primary transition-colors">{v.name}</p>
                                                <div className="flex items-center gap-1">
                                                    <Star className="size-2.5 fill-amber-400 text-amber-400" />
                                                    <span className="text-[10px] text-slate-400 font-medium">{v.rating}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/vendors" className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary hover:gap-2 transition-all">
                                    Tous les vendeurs <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </aside>

                        {/* ─── Contenu Principal ─── */}
                        <div className="flex-1 min-w-0 space-y-8">

                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-4 py-4 border-b border-border">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="relative flex-1 max-w-sm group/s">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within/s:text-primary transition-colors" />
                                        <Input
                                            className="pl-10 h-11 rounded-2xl border-border bg-card focus:border-primary/40 text-sm"
                                            placeholder="Rechercher dans les produits..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Filter Button */}
                                    <Button variant="outline" className="lg:hidden h-11 px-4 rounded-2xl font-black text-[10px] uppercase gap-2" onClick={() => setIsSidebarOpen(true)}>
                                        <SlidersHorizontal className="size-4" /> Filtres
                                    </Button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <p className="text-xs font-bold text-muted-foreground hidden md:block whitespace-nowrap">
                                        <span className="text-foreground font-black italic">{filteredProducts.length}</span> résultats
                                    </p>
                                    <div className="flex items-center gap-0.5 p-1 bg-muted rounded-xl border border-border">
                                        <button onClick={() => setViewMode('grid')} className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
                                            <LayoutGrid className="size-4" />
                                        </button>
                                        <button onClick={() => setViewMode('list')} className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>
                                            <List className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filters Tags */}
                            {(activeCategory !== "Tous" || searchQuery) && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    {activeCategory !== "Tous" && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                            {activeCategory}
                                            <button onClick={() => setActiveCategory("Tous")}><X className="size-3" /></button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground text-[10px] font-black uppercase tracking-widest rounded-full border border-border">
                                            "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')}><X className="size-3" /></button>
                                        </span>
                                    )}
                                    <button onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest underline">
                                        Tout effacer
                                    </button>
                                </div>
                            )}

                            {/* Products Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="rounded-[2rem] bg-slate-200 dark:bg-slate-800/50 animate-pulse" style={{ height: 380 }} />
                                    ))}
                                </div>
                            ) : hasError ? (
                                <div className="py-20 text-center space-y-4">
                                    <p className="text-2xl font-black text-foreground italic uppercase">Erreur de chargement</p>
                                    <p className="text-muted-foreground text-sm">Impossible de récupérer les produits.</p>
                                    <Button onClick={() => window.location.reload()}>Réessayer</Button>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                                    : "flex flex-col gap-4"
                                }>
                                    {filteredProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 flex flex-col items-center gap-6 text-center">
                                    <div className="size-28 rounded-full bg-muted/50 flex items-center justify-center border-4 border-dashed border-border">
                                        <Search className="size-10 text-muted-foreground/30" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-foreground italic tracking-tighter uppercase">Aucun résultat</p>
                                        <p className="text-muted-foreground text-sm mt-2 font-medium max-w-sm">
                                            Aucun produit ne correspond à votre recherche dans la catégorie <strong>{activeCategory}</strong>.
                                        </p>
                                    </div>
                                    <Button variant="outline" onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                                        Réinitialiser les filtres
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredProducts.length > 0 && (
                                <div className="flex items-center justify-between pt-8 border-t border-border">
                                    <p className="text-xs font-bold text-muted-foreground">
                                        Affichage de <span className="text-foreground font-black">{Math.min(filteredProducts.length, 12)}</span> sur <span className="text-foreground font-black">{filteredProducts.length}</span> produits
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button className="size-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        {[1, 2, 3].map(n => (
                                            <button key={n} className={cn("size-10 rounded-xl font-black text-sm transition-all",
                                                n === 1 ? "bg-primary text-white shadow-lg shadow-primary/20" : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                                            )}>{n}</button>
                                        ))}
                                        <span className="text-muted-foreground px-1 font-bold">…</span>
                                        <button className="size-10 rounded-xl border border-border text-muted-foreground hover:border-primary hover:text-primary transition-all font-black text-sm">10</button>
                                        <button className="size-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-all">
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 6 — VENDEURS VEDETTES
                ══════════════════════════════════════════════════ */}
                <section className="bg-card border-t border-border py-20">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex items-end justify-between mb-12">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Partenaires Certifiés</span>
                                <h2 className="text-3xl md:text-4xl font-black text-foreground italic tracking-tighter uppercase leading-none mt-1">
                                    Vendeurs Vedettes
                                </h2>
                            </div>
                            <Link to="/vendors" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-3 transition-all">
                                Annuaire complet <ArrowRight className="size-3" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {(realVendors?.length > 0 ? realVendors : FEATURED_VENDORS).map((vendor, i) => (
                                <Link key={vendor.id} to={`/store/${vendor.slug}`} className="group block rounded-[2rem] overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 bg-card">
                                    <div className="relative h-32 overflow-hidden">
                                        <img
                                            src={vendor.cover_url || `https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&q=80&w=400`}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            alt={vendor.nom_boutique}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                                    </div>
                                    <div className="relative px-6 pb-6">
                                        <div className="-mt-8 flex items-end justify-between mb-4">
                                            <div className="size-16 rounded-2xl bg-muted border-4 border-card shadow-xl group-hover:border-primary/30 transition-all flex items-center justify-center overflow-hidden">
                                                {vendor.logo_url ? (
                                                    <img src={vendor.logo_url} className="w-full h-full object-cover" />
                                                ) : <Store className="size-8 text-muted-foreground" />}
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-primary/10 text-primary border-primary/20"
                                            )}>
                                                Certifié BCA
                                            </span>
                                        </div>
                                        <h3 className="font-black text-lg text-foreground italic tracking-tight group-hover:text-primary transition-colors">{vendor.nom_boutique}</h3>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{vendor.description?.slice(0, 40) || 'Marchand Partenaire'}...</p>
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center gap-1">
                                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                <span className="text-sm font-black italic">{vendor.rating || '0.0'}</span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {vendor.statut || 'Premium'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 7 — CTA FINAL
                ══════════════════════════════════════════════════ */}
                <section className="relative bg-slate-950 py-28 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-1/4 size-80 bg-primary/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-0 right-1/4 size-64 bg-blue-600/5 rounded-full blur-[100px]" />
                        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    </div>
                    <div className="relative z-10 max-w-3xl mx-auto px-4 text-center space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/20">
                            <Store className="size-3" /> Rejoindre la plateforme
                        </div>
                        <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Vous avez des produits<br />
                            <span className="text-primary not-italic">à vendre ?</span>
                        </h2>
                        <p className="text-slate-400 font-medium text-lg leading-relaxed">
                            Rejoignez 500+ marchands guinéens. Créez votre boutique en 5 minutes, gérez vos ventes et développez votre activité.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/register">
                                <Button className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 group w-full sm:w-auto">
                                    Ouvrir ma boutique
                                    <ArrowRight className="size-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link to="/vendors">
                                <Button variant="outline" className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs border-white/10 text-white hover:bg-white/10 w-full sm:w-auto">
                                    Voir les vendeurs
                                </Button>
                            </Link>
                        </div>
                        <div className="flex items-center justify-center gap-8 pt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><ShieldCheck className="size-3 text-emerald-500" /> Gratuit</span>
                            <span className="flex items-center gap-2"><Zap className="size-3 text-primary" /> En 5 minutes</span>
                            <span className="flex items-center gap-2"><Users className="size-3 text-blue-400" /> Support 24/7</span>
                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
};

export default ProductCatalogue;
