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
import api from '../services/api';
import socketService from '../services/socketService';
import { toast } from 'sonner';

// ─── Données statiques showcase ───────────────────────────────────────────────

const HERO_SLIDES = [
    {
        tag: "Collection Exclusive 2024",
        title: "L'Innovation\nau Bout des Doigts",
        subtitle: "L'excellence technologique sélectionnée pour le marché Guinéen. Performance, design et garantie certifiée.",
        cta: "Explorer l'Innovation",
        ctaLink: "/marketplace?cat=Électronique",
        img: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30",
    },
    {
        tag: "Artisanat d'Exception",
        title: "L'Élégance\nSans Frontières",
        subtitle: "Le savoir-faire guinéen sublimé par le design contemporain. Bazin, Lépi et créations uniques.",
        cta: "Découvrir la Mode",
        ctaLink: "/marketplace?cat=Mode",
        img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30",
    },
    {
        tag: "Logistique Intelligente",
        title: "Zéro Stress\nZéro Limite",
        subtitle: "Livraison prioritaire sur tout Conakry. Vos commandes chez vous en un temps record.",
        cta: "Commander Maintenant",
        ctaLink: "/marketplace",
        img: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200",
        badge: "bg-[#FF6600]/20 text-[#FF6600] border-[#FF6600]/30",
    },
];

const TRUST_BADGES = [
    { icon: ShieldCheck, title: "Paiement Sécurisé", desc: "Transactions cryptées SSL 256-bit", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { icon: Truck, title: "Livraison Express", desc: "48h à Conakry, 5 jours en province", color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
    { icon: RotateCcw, title: "Retours Faciles", desc: "30 jours pour changer d'avis", color: "text-slate-400", bg: "bg-slate-400/10" },
    { icon: Award, title: "Produits Certifiés", desc: "Chaque marchand est vérifié", color: "text-[#FF6600]", bg: "bg-[#FF6600]/10" },
];

const ProductCatalogue = () => {
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

    // WebSocket Listeners
    useEffect(() => {
        socketService.connect();
        const handleNewProduct = (newProduct) => {
            setProducts(prev => [newProduct, ...prev]);
            toast.info(`🎉 Nouveau produit : ${newProduct.nom_produit}`, {
                description: "Le catalogue a été mis à jour en temps réel.",
                duration: 5000
            });
        };
        socketService.on('product_added', handleNewProduct);
        return () => socketService.off('product_added', handleNewProduct);
    }, []);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

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
                console.error("Error loading catalogue data:", error);
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

    const getCategoryIcon = (slug) => {
        const icons = {
            'Électronique': Zap, 'Mode': ShoppingBag, 'Mobilier': Store,
            'Informatique': Award, 'Alimentaire': Flame
        };
        return icons[slug] || LayoutGrid;
    };

    const slide = HERO_SLIDES[currentSlide];

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter">

                {/* Section Hero Slider Premium */}
                <section className="relative min-h-[85vh] flex items-center overflow-hidden">
                    <div className="absolute inset-0 transition-opacity duration-1000">
                        <img src={slide.img} className="w-full h-full object-cover scale-105" alt="" />
                        <div className="absolute inset-0 bg-[#0A0D14]/70 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14] via-[#0A0D14]/50 to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-20">
                        <div className="max-w-2xl space-y-8 animate-fade-in">
                            <div className={cn("inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest backdrop-blur-md", slide.badge)}>
                                <Sparkles className="size-4" />
                                {slide.tag}
                            </div>
                            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[1] uppercase italic">
                                {slide.title.split('\n')[0]}<br />
                                <span className="text-[#FF6600]">{slide.title.split('\n')[1]}</span>
                            </h1>
                            <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-lg opacity-80 italic">
                                {slide.subtitle}
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Link to={slide.ctaLink} className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full h-16 rounded-2xl px-10 bg-[#FF6600] text-white shadow-xl shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest border-0">
                                        {slide.cta}
                                        <ArrowRight className="size-5 ml-2" />
                                    </Button>
                                </Link>
                                <button
                                    onClick={() => setActiveCategory("Tous")}
                                    className="w-full sm:w-auto h-16 px-10 rounded-2xl font-black text-xs uppercase tracking-widest text-white border border-white/10 hover:bg-white/5 transition-all active:scale-95"
                                >
                                    Explorer Tout
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-10 left-12 flex items-center gap-4">
                        {HERO_SLIDES.map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)}
                                className={cn(
                                    "transition-all duration-500",
                                    currentSlide === i ? "w-12 h-2 bg-[#FF6600] rounded-full" : "size-2 bg-white/20 rounded-full hover:bg-white/40"
                                )}
                            />
                        ))}
                    </div>
                </section>

                {/* Badges de Confiance Re-Styled */}
                <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6">
                    <div className="bg-[#0F1219] rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl overflow-hidden">
                        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x border-white/5">
                            {TRUST_BADGES.map((badge, i) => (
                                <div key={i} className="flex items-center gap-5 px-8 py-10 group hover:bg-white/[0.02] transition-all">
                                    <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110 shadow-lg", badge.bg)}>
                                        <badge.icon className={cn("size-7", badge.color)} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-wider">{badge.title}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest opacity-80">{badge.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Univers / Catégories */}
                <section className="py-32 max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.3em] px-4 py-1.5 bg-[#FF6600]/10 rounded-xl border border-[#FF6600]/20 italic">Navigation</span>
                            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none italic">
                                Catégories <span className="text-[#FF6600]">Élite.</span>
                            </h2>
                        </div>
                        <button onClick={() => setActiveCategory("Tous")} className="text-[10px] font-black text-slate-500 hover:text-[#FF6600] uppercase tracking-[0.2em] flex items-center gap-3 group transition-colors">
                            TOUT LE CATALOGUE <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                        <button
                            onClick={() => setActiveCategory("Tous")}
                            className={cn(
                                "group h-56 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 transition-all duration-500 border-2",
                                activeCategory === "Tous"
                                    ? "bg-[#FF6600] border-[#FF6600] text-white scale-105 shadow-2xl shadow-[#FF6600]/20"
                                    : "bg-white/[0.02] border-white/5 hover:border-[#FF6600]/50 hover:bg-white/[0.04] text-slate-400"
                            )}
                        >
                            <LayoutGrid className={cn("size-12", activeCategory === "Tous" ? "text-white" : "text-[#FF6600]")} />
                            <span className="text-xs font-black uppercase tracking-widest">Tous</span>
                        </button>
                        {realCategories.map(cat => {
                            const Icon = getCategoryIcon(cat.nom_categorie);
                            const isActive = activeCategory === cat.nom_categorie;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.nom_categorie)}
                                    className={cn(
                                        "group h-56 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 transition-all duration-500 border-2",
                                        isActive
                                            ? "bg-[#FF6600] border-[#FF6600] text-white scale-105 shadow-2xl shadow-[#FF6600]/20"
                                            : "bg-white/[0.02] border-white/5 hover:border-[#FF6600]/50 hover:bg-white/[0.04] text-slate-400 hover:text-white"
                                    )}
                                >
                                    <Icon className={cn("size-12", isActive ? "text-white" : "text-[#FF6600]")} />
                                    <span className="text-[11px] font-black uppercase tracking-widest px-4 text-center">{cat.nom_categorie}</span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Main Catalogue Area */}
                <section id="products-section" className="max-w-7xl mx-auto px-6 pb-40 flex flex-col lg:flex-row gap-16">

                    {/* Sidebar Filters */}
                    <aside className="lg:w-80 shrink-0 space-y-12">
                        <div className="space-y-10 p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-4">Filtrage Intelligent</h4>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-white">
                                    <Search className="size-4 text-[#FF6600]" />
                                    <span className="text-[11px] font-black uppercase tracking-widest">Mots clés</span>
                                </div>
                                <input
                                    className="h-14 w-full px-5 border-white/5 rounded-2xl bg-white/[0.03] focus:border-[#FF6600]/50 outline-none text-xs font-bold transition-all text-white placeholder:text-slate-700"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-white">
                                        <Tag className="size-4 text-[#FF6600]" />
                                        <span className="text-[11px] font-black uppercase tracking-widest">Prix Max</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#FF6600]">{priceRange[1].toLocaleString('fr-GN')} GNF</span>
                                </div>
                                <div className="space-y-4">
                                    <input type="range" min={0} max={50000000} step={1000000}
                                        value={priceRange[1]}
                                        onChange={e => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-[#FF6600]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Top Vendors Spotlight */}
                        <div className="bg-[#FF6600] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 size-48 bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                            <h5 className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] mb-10">Marchands Certifiés</h5>
                            <div className="space-y-8">
                                {realVendors.map(v => (
                                    <Link key={v.id} to={`/shop/${v.slug}`} className="flex items-center gap-4 group/v">
                                        <div className="size-14 rounded-2xl bg-white/20 p-0.5 overflow-hidden border border-white/20 group-hover/v:scale-105 transition-transform">
                                            <img src={v.logo_url || `https://api.dicebear.com/7.x/initials/svg?seed=${v.nom_boutique}`} className="w-full h-full object-cover rounded-xl" alt="" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black truncate">{v.nom_boutique}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Star className="size-3 fill-white text-white" />
                                                <span className="text-[10px] opacity-80 font-black">ENTREPRISE VÉRIFIÉE</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <Link to="/vendors" className="mt-10 flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10">
                                RÉPERTOIRE COMPLET <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    </aside>

                    {/* Products Grid Area */}
                    <div className="flex-1 space-y-12">
                        <div className="flex items-center justify-between border-b border-white/5 pb-8">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">Index Catalogue</p>
                                <p className="text-3xl font-black text-white uppercase italic">{filteredProducts.length} <span className="text-slate-500 tracking-tighter text-sm font-bold opacity-60">RÉSULTATS FILTRÉS</span></p>
                            </div>
                            <div className="flex items-center gap-3 p-2 bg-white/[0.03] rounded-2xl border border-white/5">
                                <button onClick={() => setViewMode('grid')} className={cn("size-11 flex items-center justify-center rounded-xl transition-all", viewMode === 'grid' ? "bg-[#FF6600] text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                                    <LayoutGrid className="size-5" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={cn("size-11 flex items-center justify-center rounded-xl transition-all", viewMode === 'list' ? "bg-[#FF6600] text-white shadow-lg" : "text-slate-500 hover:text-white")}>
                                    <List className="size-5" />
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[4/5] bg-white/[0.02] border border-white/5 rounded-[3rem] animate-pulse" />)}
                            </div>
                        ) : hasError ? (
                            <div className="py-32 text-center bg-white/[0.02] rounded-[3rem] border-2 border-dashed border-red-500/20">
                                <p className="text-lg font-black text-white uppercase mb-6 italic">Erreur de Flux</p>
                                <Button onClick={() => window.location.reload()} className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase rounded-2xl h-14 px-10">RECHARGER LE SYSTÈME</Button>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className={cn(
                                "grid gap-10",
                                viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col"
                            )}>
                                {filteredProducts.map(p => <ProductCard key={p.id} product={p} layout={viewMode} />)}
                            </div>
                        ) : (
                            <div className="py-40 flex flex-col items-center text-center bg-white/[0.02] rounded-[3rem] border border-white/5">
                                <div className="size-24 rounded-full bg-white/[0.03] flex items-center justify-center text-slate-700 mb-8 border border-white/5">
                                    <Search className="size-10" />
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase italic">Zéro Correspondance</h3>
                                <p className="text-slate-500 text-sm mt-3 max-w-xs font-bold leading-relaxed">Aucun actif ne correspond à vos critères d'indexation actuels.</p>
                                <button onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="mt-10 text-[10px] font-black text-[#FF6600] hover:underline uppercase tracking-[0.3em]">RÉINITIALISER LES PARAMÈTRES</button>
                            </div>
                        )}

                        {/* Pagination Sample */}
                        {filteredProducts.length > 0 && (
                            <div className="flex items-center justify-between pt-16 border-t border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">PAGE 01 / 12 • BCA CONNECT ENGINE</p>
                                <div className="flex items-center gap-3">
                                    <button className="size-14 rounded-2xl border border-white/10 flex items-center justify-center hover:border-[#FF6600] transition-colors text-slate-500 hover:text-white"><ChevronLeft className="size-5" /></button>
                                    <button className="size-14 rounded-2xl bg-[#FF6600] text-white font-black text-sm shadow-lg shadow-[#FF6600]/20">01</button>
                                    <button className="size-14 rounded-2xl border border-white/10 flex items-center justify-center hover:border-[#FF6600] transition-colors text-slate-400 font-black text-sm">02</button>
                                    <button className="size-14 rounded-2xl border border-white/10 flex items-center justify-center hover:border-[#FF6600] transition-colors text-slate-500 hover:text-white"><ChevronRight className="size-5" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Final CTA Imperial Re-Styled */}
                <section className="py-44 bg-[#FF6600] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute top-0 right-0 size-[600px] bg-white/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-12">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                            <span className="size-2 rounded-full bg-white animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">REJOINDRE L'ÉCOSYSTÈME</span>
                        </div>
                        <h2 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase leading-[0.8] italic">
                            Prenez <br />Le Contrôle.
                        </h2>
                        <p className="text-white/80 text-xl font-bold max-w-2xl mx-auto italic leading-relaxed">
                            BCA Connect n'est pas qu'une marketplace. C'est l'infrastructure qui propulse votre business vers de nouveaux sommets.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                            <Link to="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-24 rounded-[2rem] px-16 bg-white text-[#FF6600] font-black text-lg uppercase tracking-widest border-0 shadow-2xl hover:scale-105 active:scale-95 transition-all">
                                    CRÉER MON COMPTE
                                    <ArrowRight className="size-7 ml-6" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </PublicLayout>
    );
};

export default ProductCatalogue;
