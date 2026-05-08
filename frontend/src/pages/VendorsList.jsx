import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, Users, Star, Store, ArrowRight, ShieldCheck, 
    MapPin, Globe, Filter, ChevronDown, CheckCircle2, 
    MessageSquare, Package, Award, Zap, Building2, BarChart3,
    ArrowUpRight, Info, Mail, Phone, HelpCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { cn, getImageUrl } from '../lib/utils';
import { useVendors } from '../hooks/useDomainData';
import LazyImage from '../components/ui/LazyImage';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import PrefetchLink from '../components/ui/PrefetchLink';
import Skeleton from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';

const FALLBACK_LOGO = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=200';
const FALLBACK_PRODUCT = 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=300';

const VendorsList = () => {
    const { t } = useLanguage();
    const { data: vendorsData, loading: isLoading, error: fetchError } = useVendors();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [filterVerified, setFilterVerified] = useState(false);

    const vendors = useMemo(() => Array.isArray(vendorsData) ? vendorsData : [], [vendorsData]);

    const stats = useMemo(() => {
        if (!vendors.length) return { total: 0, verified: 0, verifiedPct: 0 };
        const verified = vendors.filter(v => v.is_verified).length;
        return {
            total: vendors.length,
            verified,
            verifiedPct: Math.round((verified / vendors.length) * 100)
        };
    }, [vendors]);

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = (v.nom_boutique?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
                                (v.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || v.categorie_principale === selectedCategory;
            const matchesVerified = !filterVerified || v.is_verified === true;
            return matchesSearch && matchesCategory && matchesVerified;
        });
    }, [vendors, searchQuery, selectedCategory, filterVerified]);

    const categories = useMemo(() => {
        const cats = vendors.map(v => v.categorie_principale).filter(Boolean);
        return ['all', ...new Set(cats)];
    }, [vendors]);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-20">
            {/* 1. Mega Header — Inspired by Alibaba Global Sources */}
            <div className="relative bg-slate-900 pt-32 pb-24 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent" />
                
                <div className="container px-6 relative z-10">
                    <div className="flex flex-col lg:flex-row items-end justify-between gap-8">
                        <div className="space-y-6 max-w-2xl">
                            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
                                <span className="opacity-30">/</span>
                                <span className="text-white/60">Annuaire Fournisseurs</span>
                            </nav>
                            <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none">
                                TROUVEZ VOS <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">PARTENAIRES</span>
                            </h1>
                            <p className="text-slate-400 text-lg font-medium max-w-lg leading-relaxed">
                                Accédez au plus grand réseau de fabricants et distributeurs certifiés en Guinée ({stats.total} entreprises). 
                                Qualité garantie, prix directs usine et logistique intégrée.
                            </p>
                            
                            {/* Search bar inside header */}
                            <div className="flex items-center gap-2 max-w-xl">
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Rechercher un fournisseur ou un secteur..."
                                        className="w-full h-14 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:bg-white/10 focus:border-primary outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <button className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
                                    Filtrer
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                            {[
                                { label: 'Fournisseurs', val: stats.total, sub: 'Vérifiés' },
                                { label: 'Confiance', val: stats.verifiedPct + '%', sub: 'Certifiés' },
                                { label: 'Logistique', val: '24h', sub: 'Livraison' },
                            ].map((s, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] min-w-[160px]">
                                    <p className="text-3xl font-black text-white tracking-tighter">
                                        <AnimatedCounter value={s.val} />
                                    </p>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">{s.label}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Main Layout */}
            <div className="container px-6 -mt-10 relative z-20">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Sidebar — Filters */}
                    <aside className="w-full lg:w-72 shrink-0 space-y-6">
                        <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-28">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">Exploration</h3>
                                <Filter className="size-4 text-primary" />
                            </div>

                            <div className="space-y-8">
                                {/* Categories */}
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Secteurs Clés</label>
                                    <div className="space-y-1">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all capitalize flex items-center justify-between group",
                                                    selectedCategory === cat 
                                                        ? "bg-slate-900 text-white dark:bg-primary" 
                                                        : "text-slate-600 dark:text-muted-foreground hover:bg-slate-100 dark:hover:bg-muted/50"
                                                )}
                                            >
                                                {cat === 'all' ? 'Tous les secteurs' : cat}
                                                {selectedCategory === cat && <CheckCircle2 className="size-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Verified Toggle */}
                                <div className="pt-6 border-t border-slate-100 dark:border-border">
                                    <label 
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all group",
                                            filterVerified ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-transparent hover:border-slate-200"
                                        )}
                                        onClick={() => setFilterVerified(!filterVerified)}
                                    >
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-colors",
                                            filterVerified ? "bg-emerald-500 text-white" : "bg-white text-slate-400"
                                        )}>
                                            <ShieldCheck className="size-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase">Vérifié</p>
                                            <p className="text-[10px] font-bold text-slate-500">Protection Max</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Help Box */}
                        <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8">
                            <HelpCircle className="size-8 text-primary mb-4" />
                            <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase mb-2">Besoin d'aide ?</h4>
                            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-4">Laissez nos agents IA trouver le fournisseur idéal pour votre projet.</p>
                            <button className="w-full h-10 bg-white border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Consulter l'IA</button>
                        </div>
                    </aside>

                    {/* Main Content — Supplier Cards (Alibaba Style) */}
                    <div className="flex-1 space-y-6">
                        
                        {/* Toolbar */}
                        <div className="flex items-center justify-between bg-white dark:bg-card border border-slate-200 dark:border-border px-8 py-5 rounded-[2.5rem] shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                <p className="text-xs font-bold text-slate-500">
                                    <span className="text-slate-900 dark:text-white">{filteredVendors.length}</span> fournisseurs disponibles actuellement
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                Trier : <span className="text-slate-900 dark:text-white flex items-center gap-1 cursor-pointer">Recommandé <ChevronDown className="size-4" /></span>
                            </div>
                        </div>

                        {/* Supplier Grid (High Density) */}
                        <div className="space-y-6">
                            <AnimatePresence mode="popLayout">
                                {isLoading ? (
                                    [1,2,3].map(i => <Skeleton key={i} className="h-80 rounded-[2.5rem]" />)
                                ) : filteredVendors.length > 0 ? (
                                    filteredVendors.map((vendor, idx) => (
                                        <motion.div
                                            key={vendor.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group bg-white dark:bg-card border border-slate-200 dark:border-border rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:border-primary/40 transition-all duration-500"
                                        >
                                            <div className="flex flex-col xl:flex-row min-h-[320px]">
                                                {/* 1. Vendor Identity (Left) */}
                                                <div className="p-8 xl:w-96 shrink-0 bg-slate-50/50 dark:bg-muted/10 border-r border-slate-200 dark:border-border flex flex-col justify-between">
                                                    <div>
                                                        <div className="flex items-start justify-between mb-6">
                                                            <div className="size-20 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border p-2 shadow-sm group-hover:scale-105 transition-transform">
                                                                <LazyImage 
                                                                    src={getImageUrl(vendor.logo_url) || FALLBACK_LOGO} 
                                                                    className="w-full h-full object-contain" 
                                                                />
                                                            </div>
                                                            {vendor.is_verified && (
                                                                <div className="px-3 py-1 bg-emerald-500 text-white rounded-full flex items-center gap-1.5 shadow-lg shadow-emerald-500/20">
                                                                    <ShieldCheck className="size-3.5" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Vérifié</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase group-hover:text-primary transition-colors">
                                                            {vendor.nom_boutique}
                                                        </h3>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <div className="flex items-center gap-1 text-amber-500">
                                                                <Star className="size-4 fill-current" />
                                                                <span className="text-sm font-black">4.9</span>
                                                            </div>
                                                            <div className="h-4 w-px bg-slate-200" />
                                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                                                <MapPin className="size-3.5" /> {vendor.localisation || 'Guinée'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pt-8 space-y-4">
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span>Ancienneté</span>
                                                            <span className="text-slate-900 dark:text-white">
                                                                {Math.max(1, new Date().getFullYear() - new Date(vendor.createdAt).getFullYear())}+ ans
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            <span>Temps Réponse</span>
                                                            <span className="text-emerald-500">{'< 2h'}</span>
                                                        </div>
                                                        <div className="flex gap-2 pt-2">
                                                            <button className="flex-1 h-10 bg-slate-900 dark:bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                                <MessageSquare className="size-3.5" /> Chat
                                                            </button>
                                                            <PrefetchLink 
                                                                to={`/shop/${vendor.slug}`}
                                                                className="size-10 bg-white border border-slate-200 dark:border-border rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                                                            >
                                                                <ArrowUpRight className="size-4" />
                                                            </PrefetchLink>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 2. Products Showcase (Right - Alibaba Style) */}
                                                <div className="flex-1 p-8 bg-white dark:bg-card">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Échantillons de produits</h4>
                                                        <Link to={`/shop/${vendor.slug}`} className="text-[10px] font-black text-primary uppercase hover:underline">Voir les {vendor.produits?.length || 0} produits</Link>
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                        {vendor.produits && vendor.produits.length > 0 ? (
                                                            vendor.produits.map((p, i) => (
                                                                <Link key={p.id} to={`/product/${p.id}`} className="group/item space-y-3">
                                                                    <div className="aspect-square rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 group-hover/item:border-primary/30 transition-all relative">
                                                                        <LazyImage 
                                                                            src={getImageUrl(p.image_url) || FALLBACK_PRODUCT} 
                                                                            className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                                                        />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover/item:bg-black/5 transition-colors" />
                                                                    </div>
                                                                    <div className="space-y-0.5">
                                                                        <p className="text-[10px] font-bold text-slate-800 line-clamp-1 group-hover/item:text-primary transition-colors">{p.nom_produit}</p>
                                                                        <p className="text-xs font-black text-slate-900 tabular-nums">
                                                                            {parseFloat(p.prix_unitaire).toLocaleString()} <span className="text-[9px] text-slate-400">GNF</span>
                                                                        </p>
                                                                    </div>
                                                                </Link>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-4 flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                                                <Package className="size-8 text-slate-300 mb-2" />
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Aucun produit listé</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Company description snippet */}
                                                    <div className="mt-8 pt-8 border-t border-slate-50 dark:border-border">
                                                        <p className="text-sm text-slate-500 font-medium italic leading-relaxed line-clamp-2">
                                                            "{vendor.description || "Leader de la distribution spécialisée en Guinée. Nous offrons des produits certifiés avec un support logistique complet pour les professionnels."}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-32 text-center bg-white dark:bg-card border border-slate-200 rounded-[3rem] shadow-sm">
                                        <Globe className="size-20 text-slate-200 mx-auto mb-8 animate-pulse" />
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Aucun Partenaire Trouvé</h3>
                                        <p className="text-slate-400 text-sm mt-3 max-w-sm mx-auto">Nous n'avons pas trouvé de fournisseur correspondant à vos critères de recherche.</p>
                                        <button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="mt-8 h-12 px-8 border-2 border-primary text-primary font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all">Réinitialiser les filtres</button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Professional Pagination */}
                        {filteredVendors.length > 0 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-12 border-t border-slate-200">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    PAGE <span className="text-slate-900 dark:text-white">01</span> SUR <span className="text-slate-900 dark:text-white">12</span>
                                </p>
                                <div className="flex items-center gap-3">
                                    <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all disabled:opacity-50">Précédent</button>
                                    <div className="flex items-center gap-2">
                                        {[1,2,3].map(p => (
                                            <div key={p} className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center text-xs font-black cursor-pointer transition-all",
                                                p === 1 ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20" : "bg-white border border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
                                            )}>
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="h-12 px-6 rounded-2xl bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest hover:border-primary transition-all">Suivant</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorsList;

