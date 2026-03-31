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
        tag: "Collection Exclusive 2024",
        title: "L'Innovation\nau Bout des Doigts",
        subtitle: "L'excellence technologique sélectionnée pour le marché Guinéen. Performance, design et garantie certifiée.",
        cta: "Explorer l'Innovation",
        ctaLink: "/marketplace?cat=Électronique",
        bg: "from-[#0a0f1d] via-[#111827] to-[#0a0f1d]",
        accent: "from-blue-400 to-indigo-500",
        img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
        tag: "Artisanat d'Exception",
        title: "L'Élégance\nSans Frontières",
        subtitle: "Le savoir-faire guinéen sublimé par le design contemporain. Bazin, Lépi et créations uniques.",
        cta: "Découvrir la Mode",
        ctaLink: "/marketplace?cat=Mode",
        bg: "from-[#1a1212] via-[#2a1a1a] to-[#1a1212]",
        accent: "from-amber-400 to-rose-500",
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
    {
        tag: "Logistique Intelligente",
        title: "Zéro Stress\nZéro Limite",
        subtitle: "Livraison prioritaire sur tout Conakry. Vos commandes chez vous en un temps record.",
        cta: "Commander Maintenant",
        ctaLink: "/marketplace",
        bg: "from-[#0d141e] via-[#1a2533] to-[#0d141e]",
        accent: "from-emerald-400 to-teal-500",
        img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
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
            <div className="bg-transparent min-h-screen font-inter text-foreground">

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — HERO SLIDER (Immersive)
                ══════════════════════════════════════════════════ */}
                <section className="relative min-h-[90vh] py-20 lg:py-0 overflow-visible group/hero">
                    {/* Slide Background Overlay */}
                    <div className="absolute inset-0 transition-all duration-1000 ease-in-out" style={{ background: 'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.25), transparent 40%), radial-gradient(circle at 30% 70%, rgba(99,102,241,0.2), transparent 50%), #020617' }}>
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                            <img
                                src={slide.img}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover/hero:scale-110"
                                alt=""
                            />
                        </div>
                        {/* Dramatic Vignette - strict rule: opacity max = 0.4 */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/40 via-[#020617]/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/40 via-transparent to-transparent" />
                    </div>

                    {/* Slide Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 flex items-center">
                        <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className={cn("inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl", slide.badge)}>
                                <Sparkles className="size-3.5" />
                                {slide.tag}
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                                {slide.title.split('\n')[0]}<br />
                                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                                    {slide.title.split('\n')[1]}
                                </span>
                            </h1>

                            <p className="text-white/80 text-xl font-medium leading-relaxed max-w-xl">
                                {slide.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Link to={slide.ctaLink} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto h-14 rounded-xl px-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg text-base font-bold transition-all hover:scale-105 border-0">
                                        {slide.cta}
                                        <ArrowRight className="size-5 ml-3" />
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => setActiveCategory("Tous")}
                                    className="w-full sm:w-auto h-14 px-8 rounded-xl font-bold text-base text-white border border-white/20 hover:bg-white/10 transition-all"
                                >
                                    Collection Complète
                                </button>
                            </div>

                            <div className="flex flex-wrap items-center gap-8 pt-10 border-t border-white/10">
                                {[
                                    { val: "1.2k+", label: "Produits" },
                                    { val: "500+", label: "Vendeurs Certifiés" },
                                    { val: "24h", label: "Livraison Express" },
                                ].map((s, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <p className="text-2xl font-bold text-white tracking-tight leading-normal pb-1">{s.val}</p>
                                        <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider leading-normal pb-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 size-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

                        {/* Immersive Floating Card */}
                        <div className="hidden xl:block absolute right-16 top-1/2 -translate-y-1/2 scale-110">
                            <div className="relative w-96 h-[550px] rounded-[3.5rem] overflow-hidden border border-white/10 group/card" style={{ boxShadow: '0 0 80px rgba(59,130,246,0.15)' }}>
                                <img src={slide.img} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[2s]" alt="Collection Showcase" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/20 to-transparent" />
                                <div className="absolute bottom-12 left-12 right-12 space-y-4">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-400">BCA PLATINUM</span>
                                    <p className="text-white font-black text-4xl tracking-tighter leading-none uppercase">{slide.tag.split(' ')[0]} <br /> EXCLUSIVE</p>
                                    <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mt-6 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots (Premium) */}
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
                        {HERO_SLIDES.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)}
                                className={cn(
                                    "transition-all duration-700 relative",
                                    currentSlide === i ? "w-16 h-1.5 bg-primary rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]" : "size-1.5 bg-white/20 hover:bg-white/40 rounded-full"
                                )}
                            />
                        ))}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 — TRUST SIGNALS (Glass)
                ══════════════════════════════════════════════════ */}
                <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6 md:px-10">
                    <div className="bg-card/80 backdrop-blur-3xl rounded-[3rem] border-2 border-border shadow-premium overflow-hidden">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x-2 divide-border">
                            {TRUST_BADGES.map((badge, i) => (
                                <div key={i} className="flex items-center gap-6 px-10 py-12 group transition-all hover:bg-accent/50">
                                    <div className={cn("size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-premium group-hover:rotate-3 shadow-inner bg-accent")}>
                                        <badge.icon className={cn("size-8 text-primary")} />
                                    </div>
                                    <div>
                                        <p className="text-executive-label text-muted-foreground mb-2 opacity-50 uppercase tracking-widest">{badge.title.split(' ')[0]}</p>
                                        <p className="text-base font-black text-foreground leading-tight italic uppercase tracking-tight">{badge.title}</p>
                                        <p className="text-executive-label text-muted-foreground mt-2 leading-relaxed opacity-60 lowercase italic">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 3 — EXPLORE CATEGORIES
                ══════════════════════════════════════════════════ */}
                <section className="py-24 max-w-7xl mx-auto px-6 md:px-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <span className="text-executive-label text-primary italic uppercase px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20">DÉCOUVERTE</span>
                            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter italic uppercase">
                                PARCOURIR PAR <span className="text-primary italic underline underline-offset-8 decoration-primary/20">UNIVERS</span>
                            </h2>
                            <p className="text-muted-foreground text-sm font-bold max-w-md italic opacity-60">Une sélection rigoureuse des meilleurs produits par thématiques pour faciliter vos recherches stratégiques.</p>
                        </div>
                        <Link to="/marketplace" className="group flex items-center gap-4 text-executive-label text-muted-foreground hover:text-primary transition-all">
                            VOIR LE CATALOGUE COMPLET 
                            <div className="size-14 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary group-hover:bg-primary group-hover:text-background group-hover:translate-x-3 transition-all shadow-premium">
                                <ChevronRight className="size-6" />
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
                        {/* All Categories Button */}
                        <button
                            onClick={() => {
                                setActiveCategory("Tous");
                                document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={cn(
                                "group relative h-64 rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 border-2 overflow-hidden shadow-premium",
                                activeCategory === "Tous"
                                    ? "bg-primary border-primary scale-105 z-10 shadow-primary/20"
                                    : "bg-card border-border hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl"
                            )}
                        >
                            <div className={cn(
                                "size-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                                activeCategory === "Tous" ? "bg-background text-primary" : "bg-accent text-muted-foreground group-hover:bg-primary group-hover:text-background"
                            )}>
                                <LayoutGrid className="size-10" />
                            </div>
                            <div className="text-center">
                                <span className={cn("text-executive-label italic uppercase block", activeCategory === "Tous" ? "text-background/60" : "text-muted-foreground")}>EXPLORER</span>
                                <span className={cn("text-xl font-black italic block mt-2 uppercase tracking-tighter", activeCategory === "Tous" ? "text-background" : "text-foreground")}>TOUT VOIR</span>
                            </div>
                        </button>

                        {(realCategories?.length > 0 ? realCategories : CATEGORIES.slice(1)).map((cat) => {
                            const Icon = getCategoryIcon(cat.nom_categorie || cat.label);
                            const isActive = activeCategory === (cat.nom_categorie || cat.label);
                            return (
                                <button
                                    key={cat.id || cat.slug}
                                    onClick={() => {
                                        setActiveCategory(cat.nom_categorie || cat.label);
                                        document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={cn(
                                        "group relative h-64 rounded-[3rem] flex flex-col items-center justify-center gap-6 transition-all duration-700 border-2 overflow-hidden shadow-premium",
                                        isActive
                                            ? "bg-primary border-primary scale-105 z-10 shadow-primary/20"
                                            : "bg-card border-border hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl"
                                    )}
                                >
                                    <div className={cn(
                                        "size-20 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner",
                                        isActive ? "bg-background text-primary" : "bg-accent text-muted-foreground group-hover:bg-primary group-hover:text-background"
                                    )}>
                                        <Icon className="size-10" />
                                    </div>
                                    <div className="text-center px-4">
                                        <span className={cn("text-executive-label italic uppercase block", isActive ? "text-background/60" : "text-muted-foreground")}>CATÉGORIE</span>
                                        <span className={cn("text-lg font-black italic block mt-2 leading-tight uppercase tracking-tighter", isActive ? "text-background" : "text-foreground")}>
                                            {cat.nom_categorie || cat.label}
                                        </span>
                                    </div>
                                    {/* Decorator */}
                                    <div className="absolute top-4 right-4 opacity-10">
                                         <Icon className="size-12 rotate-12" />
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 4 — CURATED PROMOS
                ══════════════════════════════════════════════════ */}
                <section className="relative pt-32 max-w-7xl mx-auto px-6 md:px-10 pb-24 dark:bg-[#020617]">
                    {/* Patterns de liaison (Bridge) */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Main Promo */}
                        <div className="md:col-span-2 relative rounded-[3.5rem] overflow-hidden h-[400px] group cursor-pointer shadow-premium border-2 border-border">
                            <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
                            <div className="absolute inset-0 p-16 flex flex-col justify-center max-w-xl">
                                <span className="text-executive-label text-primary italic uppercase mb-6 block">ÉVÉNEMENT TECH BCA</span>
                                <h3 className="text-4xl md:text-6xl font-black text-foreground leading-[0.9] mb-10 italic tracking-tighter uppercase">HIGH-TECH & <br /><span className="text-primary underline underline-offset-8 decoration-primary/20">NEXT-GEN GAMING</span></h3>
                                <div className="flex items-center gap-8">
                                    <Button 
                                        onClick={() => {
                                            const section = document.getElementById('grid-exploration');
                                            if (section) section.scrollIntoView({ behavior: 'smooth' });
                                            setActiveCategory("High-Tech");
                                        }}
                                        className="h-16 rounded-2xl px-12 bg-foreground text-background hover:bg-foreground/90 border-transparent text-sm font-black uppercase tracking-widest shadow-premium"
                                    >
                                        VOIR L'OFFRE
                                    </Button>
                                    <span className="text-foreground font-black italic text-3xl">-30% <span className="text-executive-label not-italic opacity-40 uppercase">OFFERTS</span></span>
                                </div>
                            </div>
                        </div>
                        {/* Secondary Promo */}
                        <div className="relative rounded-[3.5rem] overflow-hidden h-[400px] group cursor-pointer shadow-premium border-2 border-border">
                            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                            <div className="absolute inset-0 p-12 flex flex-col justify-end">
                                <span className="text-executive-label text-primary italic uppercase mb-4">CULTURE LOCALE</span>
                                <h3 className="text-4xl font-black text-foreground mb-8 leading-none italic tracking-tighter uppercase">TEXTILES DE <br /> <span className="text-primary">PRESTIGE</span></h3>
                                <button className="group/btn flex items-center gap-4 text-executive-label text-foreground uppercase italic font-black">
                                    DÉCOUVRIR LA COLLECTION 
                                    <div className="size-12 rounded-2xl border-2 border-border flex items-center justify-center group-hover/btn:bg-primary group-hover/btn:text-background group-hover/btn:border-primary transition-all shadow-premium">
                                        <ArrowRight className="size-5" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 5 — PRODUITS (Filtres + Grille)
                ══════════════════════════════════════════════════ */}
                <section id="products-section" className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
                    <div className="flex gap-12">

                        {/* ─── Sidebar (Premium Desktop) ─── */}
                        <aside className="hidden lg:flex flex-col gap-12 w-80 shrink-0">
                            {/* Filtres par catégorie */}
                            <div className="space-y-10">
                                <div className="flex items-center justify-between border-b-2 border-border pb-6">
                                    <h3 className="text-executive-label text-muted-foreground uppercase flex items-center gap-3 font-black">
                                        <Filter className="size-4 text-primary" /> CATÉGORIES
                                    </h3>
                                    <button onClick={() => setActiveCategory("Tous")} className="text-executive-label text-primary hover:opacity-70 transition-opacity font-black italic uppercase">RESET</button>
                                </div>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setActiveCategory("Tous")}
                                        className={cn(
                                            "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] text-sm transition-all text-left group border-2",
                                            activeCategory === "Tous"
                                                ? "bg-primary border-primary text-background font-black shadow-premium scale-[1.03]"
                                                : "bg-card border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground font-bold italic"
                                        )}
                                    >
                                        <div className="flex items-center gap-4">
                                            <LayoutGrid className={cn("size-5 transition-transform group-hover:rotate-12", activeCategory === "Tous" ? "text-background" : "text-primary")} />
                                            TOUTES LES OFFRES
                                        </div>
                                        <div className={cn("size-2.5 rounded-full transition-all shadow-inner", activeCategory === "Tous" ? "bg-background scale-100" : "bg-primary opacity-0 scale-0")} />
                                    </button>
                                    {realCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.nom_categorie)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-6 py-4 rounded-[1.25rem] text-sm transition-all text-left group border-2",
                                                activeCategory === cat.nom_categorie
                                                    ? "bg-primary border-primary text-background font-black shadow-premium scale-[1.03]"
                                                    : "bg-card border-border text-muted-foreground hover:bg-accent/50 hover:text-foreground font-bold italic uppercase"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                {React.createElement(getCategoryIcon(cat.nom_categorie), { className: cn("size-5 transition-transform group-hover:rotate-12", activeCategory === cat.nom_categorie ? "text-background" : "text-primary") })}
                                                {cat.nom_categorie}
                                            </div>
                                            <div className={cn("size-2.5 rounded-full transition-all shadow-inner", activeCategory === cat.nom_categorie ? "bg-background scale-100" : "bg-primary opacity-0 scale-0")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Zone */}
                            <div className="space-y-10">
                                <h3 className="text-executive-label text-muted-foreground uppercase flex items-center gap-3 font-black border-b-2 border-border pb-6">
                                    <Tag className="size-4 text-primary" /> BUDGET GNF
                                </h3>
                                <div className="space-y-10 px-2">
                                    <div className="relative h-3 w-full bg-accent rounded-full overflow-hidden shadow-inner">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-700 shadow-premium" 
                                            style={{ width: `${(priceRange[1] / 50000000) * 100}%` }}
                                        />
                                    </div>
                                    <input type="range" min={0} max={50000000} step={500000}
                                        value={priceRange[1]}
                                        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-3 bg-transparent appearance-none cursor-pointer accent-primary -mt-13 relative z-10"
                                    />
                                    <div className="flex items-center justify-between p-6 rounded-2xl bg-accent/30 border-2 border-border shadow-inner">
                                        <div className="flex flex-col">
                                            <span className="text-executive-label text-muted-foreground italic uppercase">Plafond</span>
                                            <span className="text-xl font-black text-foreground italic tracking-tighter">{priceRange[1].toLocaleString('fr-FR')} <span className="text-sm not-italic text-primary">GNF</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Merchants Sidebar */}
                            <div className="p-10 rounded-[2.5rem] bg-foreground border-4 border-border shadow-premium relative overflow-hidden group/merchant">
                                <div className="absolute top-0 right-0 size-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20 animate-pulse" />
                                <h4 className="text-executive-label text-primary italic uppercase mb-8 flex items-center gap-4 font-black">
                                    <Award className="size-4" /> ÉLITE BCA CONNECT
                                </h4>
                                <div className="space-y-8">
                                    {FEATURED_VENDORS.slice(0, 2).map(v => (
                                        <Link key={v.id} to="/vendors" className="flex items-center gap-5 group/v">
                                            <div className="size-16 rounded-2xl border-2 border-background shadow-premium overflow-hidden shrink-0 group-hover/v:border-primary group-hover/v:scale-105 transition-all">
                                                <img src={v.avatar} className="w-full h-full object-cover" alt={v.name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black text-background group-hover/v:text-primary transition-colors truncate uppercase italic">{v.name}</p>
                                                <div className="flex items-center gap-2.5 mt-2">
                                                    <Star className="size-3.5 fill-amber-500 text-amber-500" />
                                                    <span className="text-executive-label text-muted-foreground/80 font-black">{v.rating}</span>
                                                    <span className="size-1.5 rounded-full bg-background/20" />
                                                    <span className="text-executive-label text-primary font-black uppercase italic">{v.sales}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/vendors" className="mt-10 flex items-center justify-center gap-3 py-4 bg-background/5 hover:bg-background/10 rounded-2xl text-executive-label italic uppercase font-black text-background transition-all border border-background/20">
                                    ANNUAIRE VENDEURS <ArrowRight className="size-4" />
                                </Link>
                            </div>
                        </aside>

                        {/* ─── Contenu Principal (Discover Zone) ─── */}
                        <div className="flex-1 min-w-0 space-y-12">

                            {/* Toolbar Executive */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pb-10 border-b-2 border-border">
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-96 group">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary group-focus-within:scale-110 transition-all opacity-40" />
                                        <Input
                                            className="pl-14 h-16 rounded-[1.5rem] border-2 border-border bg-card focus:border-primary/50 focus:ring-8 focus:ring-primary/5 text-sm font-black italic uppercase placeholder:opacity-30 shadow-premium"
                                            placeholder="RECHERCHER UNE PÉPITE..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 hover:bg-accent rounded-xl transition-all">
                                                <X className="size-4 text-muted-foreground hover:text-foreground" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Filter Button (Premium) */}
                                    <Button variant="outline" size="lg" className="lg:hidden h-16 rounded-[1.5rem] gap-3 font-black uppercase tracking-widest text-executive-label border-2 border-border shadow-premium" onClick={() => setIsSidebarOpen(true)}>
                                        <SlidersHorizontal className="size-5" /> FILTRES
                                    </Button>
                                </div>

                                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex flex-col items-end">
                                        <p className="text-executive-label text-muted-foreground uppercase opacity-40 mb-1">RÉSULTATS</p>
                                        <p className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-none">
                                            {filteredProducts.length} <span className="text-primary not-italic tracking-normal text-sm opacity-60">articles</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-2xl border-2 border-border shadow-inner">
                                        <button onClick={() => setViewMode('grid')} className={cn("p-3 rounded-xl transition-all shadow-premium", viewMode === 'grid' ? "bg-background text-primary scale-110 border-2 border-primary/20" : "text-muted-foreground hover:text-foreground")}>
                                            <LayoutGrid className="size-5" />
                                        </button>
                                        <button onClick={() => setViewMode('list')} className={cn("p-3 rounded-xl transition-all", viewMode === 'list' ? "bg-background shadow-premium text-primary scale-110 border-2 border-primary/20" : "text-muted-foreground hover:text-foreground")}>
                                            <List className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filter Tags (Premium) */}
                            {(activeCategory !== "Tous" || searchQuery) && (
                                <div className="flex items-center gap-4 flex-wrap animate-in fade-in slide-in-from-top-4">
                                    {activeCategory !== "Tous" && (
                                        <span className="inline-flex items-center gap-3 px-6 py-2.5 bg-primary/10 text-primary text-executive-label font-black uppercase italic rounded-xl border-2 border-primary/20 shadow-premium">
                                            {activeCategory}
                                            <button onClick={() => setActiveCategory("Tous")} className="hover:scale-125 transition-transform"><X className="size-4" /></button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-3 px-6 py-2.5 bg-accent text-foreground text-executive-label font-black uppercase italic rounded-xl border-2 border-border shadow-premium">
                                            "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')} className="hover:scale-125 transition-transform"><X className="size-4" /></button>
                                        </span>
                                    )}
                                    <button onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="text-executive-label font-black uppercase italic text-muted-foreground hover:text-primary transition-colors ml-4 underline underline-offset-4 decoration-current/30">
                                        VIDER TOUT
                                    </button>
                                </div>
                            )}

                            {/* Products Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-accent/40 animate-pulse border-2 border-border shadow-premium" />
                                    ))}
                                </div>
                            ) : hasError ? (
                                <div className="py-32 text-center bg-card rounded-[3.5rem] border-4 border-dashed border-destructive/20 shadow-premium">
                                    <p className="text-2xl font-black text-foreground italic uppercase tracking-tighter">OUPS ! UNE ERREUR EST SURVENUE.</p>
                                    <p className="text-muted-foreground text-sm font-bold mt-4 mb-10 italic opacity-60">Impossible de synchroniser le catalogue en temps réel.</p>
                                    <Button onClick={() => window.location.reload()} className="h-14 rounded-2xl px-10 bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 shadow-premium uppercase font-black tracking-widest text-executive-label">
                                        RÉESSAYER LE CHARGEMENT
                                    </Button>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10"
                                    : "flex flex-col gap-8"
                                }>
                                    {filteredProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 flex flex-col items-center text-center bg-card rounded-[3.5rem] border-4 border-dashed border-border shadow-inner">
                                    <div className="size-32 rounded-full bg-accent flex items-center justify-center mb-8 shadow-premium">
                                        <Search className="size-12 text-muted-foreground opacity-30" />
                                    </div>
                                    <h3 className="text-3xl font-black text-foreground italic uppercase tracking-tighter">AUCUN PRODUIT TROUVÉ</h3>
                                    <p className="text-muted-foreground text-sm mt-4 max-w-sm px-6 italic opacity-60 leading-relaxed">
                                        Votre quête de la pépite parfaite n'a pas abouti. Essayez d'élargir vos horizons ou de changer de catégorie stratégique.
                                     </p>
                                    <Button variant="outline" onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="mt-10 h-16 rounded-2xl px-10 border-2 border-border hover:bg-primary hover:text-background hover:border-primary transition-all font-black uppercase italic tracking-widest text-executive-label shadow-premium">
                                        RÉINITIALISER LES FILTRES
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredProducts.length > 0 && (
                                <div className="flex flex-col sm:flex-row items-center justify-between pt-10 border-t border-slate-200 dark:border-slate-800 gap-6">
                                    <p className="text-xs font-semibold text-slate-500">
                                        Affichage de <span className="text-slate-900 dark:text-white font-bold">{Math.min(filteredProducts.length, 12)}</span> sur <span className="text-slate-900 dark:text-white font-bold">{filteredProducts.length}</span>
                                    </p>
                                    <div className="flex items-center gap-1.5 font-bold">
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                                            <ChevronLeft className="size-4" />
                                        </button>
                                        {[1, 2, 3].map(n => (
                                            <button key={n} className={cn("size-9 rounded-lg text-sm transition-all",
                                                n === 1 ? "bg-primary text-white shadow-md shadow-primary/20" : "border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary"
                                            )}>{n}</button>
                                        ))}
                                        <span className="px-1 text-slate-400">...</span>
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary hover:border-primary transition-all">10</button>
                                        <button className="size-9 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                                            <ChevronRight className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 6 — ELITE MERCHANTS
                ══════════════════════════════════════════════════ */}
                <section className="bg-background border-t-8 border-border py-40 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[6px] bg-gradient-to-r from-transparent via-primary/40 to-transparent shadow-premium" />
                    
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
                            <div className="space-y-6">
                                <span className="text-executive-label text-primary italic uppercase px-6 py-2 bg-primary/10 rounded-full border-2 border-primary/20">PARTENAIRES DE RÉFÉRENCE</span>
                                <h2 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter italic uppercase leading-[0.9]">
                                    VENDEURS <span className="text-primary italic underline underline-offset-8 decoration-primary/20">CERTIFIÉS</span>
                                </h2>
                                <p className="text-muted-foreground text-lg font-bold max-w-2xl italic opacity-60">Des marchands audités et validés par BCA Connect pour vous garantir une expérience d'achat sans compromis sur le prestige.</p>
                            </div>
                            <Link to="/vendors" className="group flex items-center gap-6 text-executive-label text-muted-foreground hover:text-primary transition-all font-black uppercase italic">
                                EXPLORER TOUT L'ANNUAIRE
                                <div className="size-16 rounded-full border-4 border-border flex items-center justify-center group-hover:bg-primary group-hover:text-background group-hover:border-primary group-hover:translate-x-4 transition-all shadow-premium">
                                    <ArrowRight className="size-6" />
                                </div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {(realVendors?.length > 0 ? realVendors : FEATURED_VENDORS).map((vendor, i) => (
                                <Link key={vendor.id} to={`/store/${vendor.slug || vendor.id}`} className="group block rounded-[3rem] overflow-hidden border-2 border-border hover:border-primary/40 transition-all duration-700 hover:shadow-premium bg-card relative">
                                    <div className="relative h-56 overflow-hidden bg-accent">
                                        <img
                                            src={vendor.cover_url || vendor.cover || `https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&q=80&w=600`}
                                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                            alt={vendor.nom_boutique}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent opacity-80" />
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-8 left-8 px-5 py-2 bg-background/20 backdrop-blur-3xl rounded-full border-2 border-white/20 shadow-premium">
                                            <span className="text-executive-label font-black text-white uppercase italic tracking-widest">ÉLITE VENDOR</span>
                                        </div>
                                    </div>
                                    
                                    <div className="relative px-10 pb-12">
                                        <div className="-mt-16 flex items-end justify-between mb-8">
                                            <div className="size-32 rounded-[2.5rem] bg-background border-8 border-background shadow-premium group-hover:border-primary group-hover:scale-105 transition-all flex items-center justify-center overflow-hidden">
                                                {vendor.logo_url || vendor.avatar ? (
                                                    <img src={vendor.logo_url || vendor.avatar} className="w-full h-full object-cover" />
                                                ) : <Store className="size-12 text-muted-foreground/20" />}
                                            </div>
                                            <div className="flex flex-col items-end gap-2 mb-4">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full border-2 border-amber-500/20 shadow-inner">
                                                    <Star className="size-4 fill-amber-500 text-amber-500" />
                                                    <span className="text-sm font-black text-amber-600 italic">{vendor.rating || '4.9'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-black text-3xl text-foreground group-hover:text-primary transition-colors tracking-tighter italic uppercase">
                                            {vendor.nom_boutique || vendor.name}
                                        </h3>
                                        <p className="text-sm font-bold text-muted-foreground mt-3 line-clamp-1 opacity-60 italic">{vendor.description || 'Marchand Partenaire BCA Connect - Excellence & Qualité'}</p>
                                        
                                        <div className="flex items-center gap-10 mt-10 pt-8 border-t-2 border-border/50">
                                            <div className="flex flex-col">
                                                <span className="text-executive-label text-muted-foreground uppercase opacity-40">VENTES</span>
                                                <span className="text-lg font-black text-foreground italic tracking-tighter mt-1 uppercase">2.4k<span className="text-primary">+</span></span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-executive-label text-muted-foreground uppercase opacity-40">STATUT</span>
                                                <span className="text-executive-label font-black text-emerald-500 px-3 py-1 bg-emerald-500/10 rounded-xl mt-2 border border-emerald-500/20 italic">CERTIFIÉ</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Interaction Icon */}
                                    <div className="absolute bottom-10 right-10 size-16 rounded-[1.5rem] bg-accent border-2 border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-background group-hover:border-primary transition-all shadow-premium group-hover:translate-x-2 group-hover:-translate-y-2">
                                         <ArrowRight className="size-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 7 — IMPERIAL CTA
                ══════════════════════════════════════════════════ */}
                <section className="relative py-56 overflow-hidden bg-foreground">
                    {/* Background Visuals */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 size-[800px] bg-primary/20 rounded-full blur-[200px] -mr-96 -mt-96 animate-pulse" />
                        <div className="absolute bottom-0 left-0 size-[700px] bg-blue-600/10 rounded-full blur-[180px] -ml-64 -mb-64" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 text-center">
                        <div className="inline-flex items-center gap-4 px-6 py-2 bg-primary/10 rounded-full border-2 border-primary/20 mb-10">
                             <Sparkles className="size-5 text-primary" />
                             <span className="text-executive-label text-primary font-black uppercase italic">EXPÉRIENCE BCA PRIVILÈGE</span>
                        </div>
                        <h2 className="text-6xl md:text-9xl font-black text-background tracking-tighter leading-[0.85] italic uppercase mb-12">
                            LE FUTUR DU <br /><span className="text-primary underline underline-offset-[20px] decoration-primary/20">COMMERCE</span> <br />EST ICI.
                        </h2>
                        <p className="text-background/60 text-xl md:text-2xl font-bold max-w-3xl mx-auto mb-20 italic leading-relaxed">
                            Rejoignez l'écosystème B2B le plus sécurisé et performant d'Afrique de l'Ouest. Transformez votre vision en transactions concrètes.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
                            <Link to="/register">
                                <Button size="lg" className="h-24 rounded-[2rem] px-16 bg-primary text-background hover:scale-105 transition-all text-xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] border-transparent">
                                    DÉCOLLER MAINTENANT
                                    <ArrowRight className="size-8 ml-6" />
                                </Button>
                            </Link>
                            <Link to="/about">
                                <Button variant="outline" size="lg" className="h-24 rounded-[2rem] px-16 border-4 border-background/20 text-background hover:bg-background/10 transition-all text-xl font-black uppercase tracking-widest italic">
                                    PARLER À UN EXPERT
                                </Button>
                            </Link>
                        </div>
                        
                        {/* Final Stats Line */}
                        <div className="mt-32 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto opacity-40">
                             {[
                                { val: "500+", lbl: "PARTENAIRES ELITE" },
                                { val: "10M+", lbl: "VOLUME GNF MENSUEL" },
                                { val: "24/7", lbl: "CONCIERGERIE SUPPORT" },
                                { val: "100%", lbl: "TRANSACTIONS SÉCURISÉES" }
                             ].map((s, i) => (
                                 <div key={i} className="text-center group hover:opacity-100 transition-opacity">
                                      <p className="text-3xl font-black text-background italic leading-none">{s.val}</p>
                                      <p className="text-executive-label font-black uppercase tracking-widest text-background/60 mt-4 group-hover:text-primary transition-colors">{s.lbl}</p>
                                 </div>
                             ))}
                        </div>
                    </div>
                </section>

            </div>
        </PublicLayout>
    );
};

export default ProductCatalogue;
