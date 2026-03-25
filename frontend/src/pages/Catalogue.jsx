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
            <div className="bg-slate-50 dark:bg-[#080c14] min-h-screen font-inter">

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — HERO SLIDER (Immersive)
                ══════════════════════════════════════════════════ */}
                <section className="relative h-[95vh] max-h-[850px] overflow-hidden group/hero">
                    {/* Slide Background Overlay */}
                    <div className={cn("absolute inset-0 bg-gradient-to-br transition-all duration-1000 ease-in-out", slide.bg)}>
                        <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                            <img
                                src={slide.img}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[3s] group-hover/hero:scale-110"
                                alt=""
                            />
                        </div>
                        {/* Dramatic Vignette */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#080c14] via-[#080c14]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
                        
                        {/* Dynamic Light Blobs */}
                        <div className="absolute top-[10%] right-[10%] size-[500px] bg-primary/20 rounded-full blur-[150px] animate-pulse" />
                        <div className="absolute bottom-[-10%] left-[20%] size-[400px] bg-blue-600/10 rounded-full blur-[120px]" />
                    </div>

                    {/* Slide Content */}
                    <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-10 flex items-center">
                        <div className="max-w-3xl space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
                            <div className={cn("inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl", slide.badge)}>
                                <Sparkles className="size-3.5" />
                                {slide.tag}
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] italic">
                                {slide.title.split('\n')[0]}<br />
                                <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                                    {slide.title.split('\n')[1]}
                                </span>
                            </h1>

                            <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-xl opacity-90 border-l-2 border-primary/30 pl-6">
                                {slide.subtitle}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                                <Link to={slide.ctaLink}>
                                    <Button size="lg" className="h-16 rounded-[1.25rem] px-10 shadow-2xl shadow-primary/30 text-base font-black uppercase tracking-widest hover:scale-105 transition-all">
                                        {slide.cta}
                                        <ArrowRight className="size-5 ml-3" />
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => setActiveCategory("Tous")}
                                    className="h-16 px-10 rounded-[1.25rem] font-black text-sm text-white border border-white/10 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest"
                                >
                                    Collection Complète
                                </button>
                            </div>

                            {/* Trust Signals Hero */}
                            <div className="flex items-center gap-10 pt-12 border-t border-white/5 opacity-50">
                                {[
                                    { val: "1.2k+", label: "Produits Premium" },
                                    { val: "500+", label: "Vendeurs Certifiés" },
                                    { val: "24h", label: "Livraison Express" },
                                ].map((s, i) => (
                                    <div key={i} className="flex flex-col">
                                        <span className="text-2xl font-black text-white tracking-tighter italic">{s.val}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Immersive Floating Card */}
                        <div className="hidden xl:block absolute right-10 top-1/2 -translate-y-1/2">
                            <div className="relative w-96 h-[500px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl shadow-black/80 group/card">
                                <img src={slide.img} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-[2s]" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-10 left-10 right-10 space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">BCA Platinum</span>
                                    <p className="text-white font-black text-3xl italic tracking-tighter leading-none">{slide.tag.split(' ')[0]} <br /> Exclusive</p>
                                    <div className="w-12 h-1 bg-primary mt-4 rounded-full" />
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
                <section className="relative z-20 -mt-10 max-w-7xl mx-auto px-6 md:px-10">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-black/10 overflow-hidden">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800/50">
                            {TRUST_BADGES.map((badge, i) => (
                                <div key={i} className="flex items-center gap-5 px-8 py-10 group transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                    <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3", badge.bg)}>
                                        <badge.icon className={cn("size-7", badge.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{badge.title.split(' ')[0]}</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">{badge.title}</p>
                                        <p className="text-[10px] text-slate-500 font-bold mt-1 leading-relaxed opacity-70">{badge.desc}</p>
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
                        <div className="space-y-3">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Découverte</span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                                Parcourir par <span className="text-primary">Univers</span>
                            </h2>
                            <p className="text-slate-500 text-sm font-bold max-w-md">Une sélection rigoureuse des meilleurs produits par thématiques pour faciliter vos recherches.</p>
                        </div>
                        <Link to="/marketplace" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                            Voir le catalogue complet 
                            <div className="size-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:border-primary group-hover:translate-x-2 transition-all">
                                <ChevronRight className="size-4" />
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
                                "group relative h-64 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all duration-500 border overflow-hidden",
                                activeCategory === "Tous"
                                    ? "bg-primary border-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl"
                            )}
                        >
                            <div className={cn(
                                "size-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                                activeCategory === "Tous" ? "bg-white text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white"
                            )}>
                                <LayoutGrid className="size-8" />
                            </div>
                            <div className="text-center">
                                <span className={cn("text-xs font-black uppercase tracking-[0.2em] block", activeCategory === "Tous" ? "text-white/70" : "text-slate-400")}>Explorer</span>
                                <span className={cn("text-lg font-black italic block mt-1", activeCategory === "Tous" ? "text-white" : "text-slate-900 dark:text-white")}>Tout Voir</span>
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
                                        "group relative h-64 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 transition-all duration-500 border overflow-hidden",
                                        isActive
                                            ? "bg-primary border-primary shadow-2xl shadow-primary/20 scale-105 z-10"
                                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl"
                                    )}
                                >
                                    <div className={cn(
                                        "size-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500",
                                        isActive ? "bg-white text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white"
                                    )}>
                                        <Icon className="size-8" />
                                    </div>
                                    <div className="text-center px-4">
                                        <span className={cn("text-[9px] font-black uppercase tracking-[0.2em] block", isActive ? "text-white/70" : "text-slate-400")}>Catégorie</span>
                                        <span className={cn("text-base font-black italic block mt-1 leading-tight", isActive ? "text-white" : "text-slate-900 dark:text-white")}>
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
                <section className="max-w-7xl mx-auto px-6 md:px-10 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {/* Main Promo */}
                        <div className="md:col-span-2 relative rounded-[3rem] overflow-hidden h-[350px] group cursor-pointer shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/40 to-transparent" />
                            <div className="absolute inset-0 p-12 flex flex-col justify-center max-w-lg">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-300 mb-4 block">Événement Tech</span>
                                <h3 className="text-4xl md:text-5xl font-black text-white leading-[0.9] mb-8 italic tracking-tighter">High-Tech & <br /><span className="text-blue-400">Next-Gen Gaming</span></h3>
                                <div className="flex items-center gap-6">
                                    <Button className="h-14 rounded-2xl px-10 bg-white text-blue-900 hover:bg-blue-50 border-transparent text-xs font-black uppercase tracking-widest shadow-xl">
                                        Voir l'offre
                                    </Button>
                                    <span className="text-white font-black italic text-xl">-30% <span className="text-[10px] not-italic font-bold uppercase tracking-widest text-blue-200">Offerts</span></span>
                                </div>
                            </div>
                        </div>
                        {/* Secondary Promo */}
                        <div className="relative rounded-[3rem] overflow-hidden h-[350px] group cursor-pointer shadow-2xl">
                            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt="" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                            <div className="absolute inset-0 p-10 flex flex-col justify-end">
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400 mb-2">Culture Locale</span>
                                <h3 className="text-3xl font-black text-white mb-6 leading-none italic tracking-tighter">Textiles de <br /> Prestige</h3>
                                <button className="group/btn flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                    Découvrir la collection 
                                    <div className="size-8 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-slate-900 transition-all">
                                        <ArrowRight className="size-3" />
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
                        <aside className="hidden lg:flex flex-col gap-12 w-72 shrink-0">
                            {/* Filtres par catégorie */}
                            <div className="space-y-8">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <Filter className="size-3.5 text-primary" /> Catégories
                                    </h3>
                                    <button onClick={() => setActiveCategory("Tous")} className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">Reset</button>
                                </div>
                                <div className="space-y-1.5">
                                    <button
                                        onClick={() => setActiveCategory("Tous")}
                                        className={cn(
                                            "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] transition-all text-left group",
                                            activeCategory === "Tous"
                                                ? "bg-primary text-white font-black shadow-xl shadow-primary/20 scale-[1.02]"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary font-bold"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LayoutGrid className={cn("size-4 transition-transform group-hover:rotate-12", activeCategory === "Tous" ? "text-white" : "text-primary")} />
                                            Toutes les offres
                                        </div>
                                        <div className={cn("size-2 rounded-full transition-all", activeCategory === "Tous" ? "bg-white scale-100" : "bg-primary opacity-0 scale-0")} />
                                    </button>
                                    {realCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setActiveCategory(cat.nom_categorie)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-[13px] transition-all text-left group",
                                                activeCategory === cat.nom_categorie
                                                    ? "bg-primary text-white font-black shadow-xl shadow-primary/20 scale-[1.02]"
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-primary font-bold"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {React.createElement(getCategoryIcon(cat.nom_categorie), { className: cn("size-4 transition-transform group-hover:rotate-12", activeCategory === cat.nom_categorie ? "text-white" : "text-primary") })}
                                                {cat.nom_categorie}
                                            </div>
                                            <div className={cn("size-2 rounded-full transition-all", activeCategory === cat.nom_categorie ? "bg-white scale-100" : "bg-primary opacity-0 scale-0")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Budget Zone */}
                            <div className="space-y-8">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <Tag className="size-3.5 text-primary" /> Budget GNF
                                </h3>
                                <div className="space-y-6 px-1">
                                    <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-primary transition-all duration-500" 
                                            style={{ width: `${(priceRange[1] / 50000000) * 100}%` }}
                                        />
                                    </div>
                                    <input type="range" min={0} max={50000000} step={500000}
                                        value={priceRange[1]}
                                        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-primary -mt-8 relative z-10"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Maximum</span>
                                            <span className="text-sm font-black text-slate-900 dark:text-white italic">{priceRange[1].toLocaleString('fr-FR')} <span className="text-[10px] not-italic text-primary font-bold">GNF</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Merchants Sidebar */}
                            <div className="p-8 rounded-[2rem] bg-slate-950 border border-white/5 shadow-2xl relative overflow-hidden group/merchant">
                                <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-[60px] -mr-16 -mt-16" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
                                    <Award className="size-3" /> Élite BCA
                                </h4>
                                <div className="space-y-6">
                                    {FEATURED_VENDORS.slice(0, 2).map(v => (
                                        <Link key={v.id} to="/vendors" className="flex items-center gap-4 group/v">
                                            <div className="size-12 rounded-2xl border-2 border-white/5 overflow-hidden shrink-0 group-hover/v:border-primary/50 transition-all shadow-xl">
                                                <img src={v.avatar} className="w-full h-full object-cover" alt={v.name} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-white group-hover/v:text-primary transition-colors truncate">{v.name}</p>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <Star className="size-2.5 fill-amber-500 text-amber-500" />
                                                    <span className="text-[10px] text-slate-400 font-black">{v.rating}</span>
                                                    <span className="size-1 rounded-full bg-slate-700" />
                                                    <span className="text-[10px] text-primary font-black uppercase">{v.sales}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link to="/vendors" className="mt-8 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all border border-white/5">
                                    Annuaire Vendeurs <ArrowRight className="size-3" />
                                </Link>
                            </div>
                        </aside>

                        {/* ─── Contenu Principal (Discover Zone) ─── */}
                        <div className="flex-1 min-w-0 space-y-12">

                            {/* Toolbar Executive */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <div className="relative flex-1 sm:w-96 group">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary group-focus-within:scale-110 transition-all" />
                                        <Input
                                            className="pl-12 h-14 rounded-[1.25rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 text-sm font-bold shadow-sm"
                                            placeholder="Rechercher une pépite..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                                <X className="size-4 text-slate-400 hover:text-slate-900 dark:hover:text-white" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Mobile Filter Button (Premium) */}
                                    <Button variant="outline" size="lg" className="lg:hidden h-14 rounded-[1.25rem] gap-2 font-black uppercase tracking-widest text-[10px] border-slate-200" onClick={() => setIsSidebarOpen(true)}>
                                        <SlidersHorizontal className="size-4" /> Filtres
                                    </Button>
                                </div>

                                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Résultats</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white italic">
                                            {filteredProducts.length} <span className="text-primary not-italic tracking-normal">articles</span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                                        <button onClick={() => setViewMode('grid')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-800 shadow-xl text-primary scale-105" : "text-slate-400 hover:text-slate-600")}>
                                            <LayoutGrid className="size-4" />
                                        </button>
                                        <button onClick={() => setViewMode('list')} className={cn("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-800 shadow-xl text-primary scale-105" : "text-slate-400 hover:text-slate-600")}>
                                            <List className="size-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Active Filter Tags (Premium) */}
                            {(activeCategory !== "Tous" || searchQuery) && (
                                <div className="flex items-center gap-3 flex-wrap animate-in fade-in slide-in-from-top-4">
                                    {activeCategory !== "Tous" && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-widest rounded-xl border border-primary/10 shadow-sm">
                                            {activeCategory}
                                            <button onClick={() => setActiveCategory("Tous")} className="hover:scale-125 transition-transform"><X className="size-3.5" /></button>
                                        </span>
                                    )}
                                    {searchQuery && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                            "{searchQuery}"
                                            <button onClick={() => setSearchQuery('')} className="hover:scale-125 transition-transform"><X className="size-3.5" /></button>
                                        </span>
                                    )}
                                    <button onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors ml-2">
                                        Vider tout
                                    </button>
                                </div>
                            )}

                            {/* Products Grid */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="aspect-[3/4] rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700" />
                                    ))}
                                </div>
                            ) : hasError ? (
                                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">Oups ! Une erreur est survenue.</p>
                                    <p className="text-slate-500 text-sm mt-2 mb-6">Impossible de charger les produits du catalogue.</p>
                                    <Button onClick={() => window.location.reload()}>Réessayer le chargement</Button>
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                                    : "flex flex-col gap-6"
                                }>
                                    {filteredProducts.map(p => (
                                        <ProductCard key={p.id} product={p} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <div className="size-20 rounded-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-6">
                                        <Search className="size-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Aucun produit trouvé</h3>
                                    <p className="text-slate-500 text-sm mt-3 max-w-sm px-4">
                                        Nous n'avons trouvé aucun résultat pour votre recherche. Essayez d'élargir vos critères ou de changer de catégorie.
                                    </p>
                                    <Button variant="outline" onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="mt-8 rounded-xl font-bold">
                                        Réinitialiser les filtres
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
                <section className="bg-white dark:bg-[#06080e] border-t border-slate-100 dark:border-slate-800/50 py-32 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    
                    <div className="max-w-7xl mx-auto px-6 md:px-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                            <div className="space-y-4">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">Partenaires de Confiance</span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic mt-2">
                                    Vendeurs <span className="text-primary italic">Certifiés</span>
                                </h2>
                                <p className="text-slate-500 text-sm font-bold max-w-lg">Des marchands audités et validés par BCA Connect pour vous garantir une expérience d'achat sans compromis.</p>
                            </div>
                            <Link to="/vendors" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all">
                                Découvrir tous les marchands 
                                <div className="size-12 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:translate-x-3 transition-all">
                                    <ArrowRight className="size-5" />
                                </div>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {(realVendors?.length > 0 ? realVendors : FEATURED_VENDORS).map((vendor, i) => (
                                <Link key={vendor.id} to={`/store/${vendor.slug || vendor.id}`} className="group block rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800/50 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] bg-white dark:bg-slate-900/50 relative">
                                    <div className="relative h-44 overflow-hidden bg-slate-50">
                                        <img
                                            src={vendor.cover_url || vendor.cover || `https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&q=80&w=600`}
                                            className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                                            alt={vendor.nom_boutique}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                                        
                                        {/* Floating Badge */}
                                        <div className="absolute top-6 left-6 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Élite Vendor</span>
                                        </div>
                                    </div>
                                    
                                    <div className="relative px-8 pb-10">
                                        <div className="-mt-12 flex items-end justify-between mb-6">
                                            <div className="size-24 rounded-[2rem] bg-white dark:bg-slate-900 border-[6px] border-white dark:border-[#06080e] shadow-2xl group-hover:border-primary group-hover:scale-105 transition-all flex items-center justify-center overflow-hidden">
                                                {vendor.logo_url || vendor.avatar ? (
                                                    <img src={vendor.logo_url || vendor.avatar} className="w-full h-full object-cover" />
                                                ) : <Store className="size-10 text-slate-200" />}
                                            </div>
                                            <div className="flex flex-col items-end gap-1 mb-2">
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 rounded-full border border-amber-500/10">
                                                    <Star className="size-3 fill-amber-500 text-amber-500" />
                                                    <span className="text-xs font-black text-amber-600">{vendor.rating || '4.9'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h3 className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tighter italic italic">
                                            {vendor.nom_boutique || vendor.name}
                                        </h3>
                                        <p className="text-xs font-bold text-slate-500 mt-2 line-clamp-1 opacity-80">{vendor.description || 'Marchand Partenaire BCA Connect - Excellence & Qualité'}</p>
                                        
                                        <div className="flex items-center gap-6 mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ventes</span>
                                                <span className="text-sm font-black text-slate-800 dark:text-slate-300 italic">2.4k+</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statut</span>
                                                <span className="text-[10px] font-black text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-lg mt-1">Vérifié</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Interaction Icon */}
                                    <div className="absolute bottom-8 right-8 size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                         <ArrowRight className="size-5" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ══════════════════════════════════════════════════
                    SECTION 7 — IMPERIAL CTA
                ══════════════════════════════════════════════════ */}
                <section className="relative py-40 overflow-hidden bg-[#080c14]">
                    {/* Background Visuals */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 size-[600px] bg-primary/10 rounded-full blur-[150px] -mr-64 -mt-64 animate-pulse" />
                        <div className="absolute bottom-0 left-0 size-[500px] bg-blue-600/5 rounded-full blur-[120px] -ml-40 -mb-40" />
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    </div>

                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-4 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl mb-12 shadow-2xl">
                             <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">Rejoignez l'élite digitale</span>
                        </div>
                        
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] italic mb-10">
                            Propulsez votre <br />
                            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Business en 2024</span>
                        </h2>
                        
                        <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto mb-16 leading-relaxed">
                            Plus de 500 entreprises guinéennes ont déjà transformé leur modèle avec <span className="text-white font-black italic">BCA Connect</span>. Et vous ?
                        </p>
                        
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="h-20 w-full sm:w-80 rounded-[1.5rem] px-12 shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] text-lg font-black uppercase tracking-widest hover:scale-105 transition-all">
                                    Devenir Marchand
                                </Button>
                            </Link>
                            <Link to="/about" className="w-full sm:w-auto">
                                <button className="h-20 w-full sm:w-80 rounded-[1.5rem] px-12 font-black text-sm text-white border border-white/10 backdrop-blur-md bg-white/5 hover:bg-white/10 transition-all uppercase tracking-widest hover:border-white/20">
                                    Explorer le concept
                                </button>
                            </Link>
                        </div>
                        
                        {/* Final Stats Line */}
                        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-3xl mx-auto opacity-30">
                             {[
                                { val: "500+", lbl: "Partenaires" },
                                { val: "10M+", lbl: "Volume GNF" },
                                { val: "24/7", lbl: "Full Support" },
                                { val: "100%", lbl: "Sécurisé" }
                             ].map((s, i) => (
                                 <div key={i} className="text-center">
                                      <p className="text-xl font-black text-white italic leading-none">{s.val}</p>
                                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{s.lbl}</p>
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
