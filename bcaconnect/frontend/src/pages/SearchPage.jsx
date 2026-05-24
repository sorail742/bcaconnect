import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
    Search, Loader2, AlertCircle, Zap, Star, SlidersHorizontal, 
    ShoppingCart, CheckCircle2, X, ChevronDown, ArrowUpDown,
    Sparkles, TrendingUp, Package, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import productService from '../services/productService';
import { ProductSkeleton } from '../components/ui/Loader';
import { cn } from '../lib/utils';
import useCart from '../hooks/useCart';
import { toast } from 'sonner';

// ── Constants ──────────────────────────────────────────────────────
const SORT_OPTIONS = [
    { value: 'pertinence', label: 'Pertinence' },
    { value: 'prix-asc', label: 'Prix : Bas → Haut' },
    { value: 'prix-desc', label: 'Prix : Haut → Bas' },
    { value: 'recent', label: 'Plus récents' },
    { value: 'note', label: 'Mieux notés' },
];

const PRICE_RANGES = [
    { label: 'Tous les prix', min: 0, max: Infinity },
    { label: 'Moins de 200K GNF', min: 0, max: 200000 },
    { label: '200K – 500K GNF', min: 200000, max: 500000 },
    { label: '500K – 1M GNF', min: 500000, max: 1000000 },
    { label: 'Plus de 1M GNF', min: 1000000, max: Infinity },
];

const CATEGORIES = [
    'Toutes catégories', 'Agriculture', 'Mode & Habillement', 
    'Technologie', 'Alimentation', 'Beauté', 'Mécanique', 'Santé',
];

// ── Inline Product Card for Search Results ─────────────────────────
const SearchProductCard = ({ product, index }) => {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    
    const name = product.nom_produit || product.name || 'Produit sans nom';
    const price = parseFloat(product.prix_unitaire || product.price || 0);
    const image = product.image_url || product.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=400';
    const stock = parseInt(product.stock_quantite ?? 10);
    const inStock = stock > 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!inStock) return;
        addToCart(product);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        toast.success(`${name} ajouté au panier`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.5 }}
        >
            <Link
                to={`/product/${product.id}`}
                className="group flex flex-col bg-card/50 backdrop-blur-sm rounded-[2rem] border border-border overflow-hidden hover:-translate-y-3 hover:shadow-2xl hover:border-primary/30 transition-all duration-500 w-full"
            >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=400'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Badges */}
                    {!inStock && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/70 backdrop-blur-md rounded-xl">
                            <span className="text-[9px] font-black text-white uppercase tracking-widest">Épuisé</span>
                        </div>
                    )}
                    
                    {/* Wishlist */}
                    <button
                        onClick={e => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
                        className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                        <Heart className={cn("size-4", isWishlisted && "fill-current")} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-1.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={cn("size-3", i < 4 ? "fill-amber-500 text-amber-500" : "text-muted-foreground/20")} />
                        ))}
                        <span className="text-[9px] font-black text-muted-foreground ml-1 uppercase tracking-widest">4.8</span>
                    </div>
                    
                    <h3 className="text-sm font-black text-foreground line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">
                        {name}
                    </h3>

                    <div className="flex items-end justify-between mt-auto pt-4 border-t border-border">
                        <div>
                            <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mb-1">Prix</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    {price.toLocaleString('fr-FR')}
                                </span>
                                <span className="text-[9px] font-black text-primary uppercase">GNF</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock}
                            className={cn(
                                "size-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg shrink-0",
                                !inStock ? "bg-muted cursor-not-allowed text-muted-foreground"
                                : isAdded ? "bg-emerald-500 text-white scale-110"
                                : "bg-primary text-white hover:scale-110 shadow-primary/30"
                            )}
                        >
                            {isAdded ? <CheckCircle2 className="size-5" /> : <ShoppingCart className="size-5" />}
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

// ══════════════════════════════════════════════════════════════════════
// ██ SEARCH PAGE
// ══════════════════════════════════════════════════════════════════════
export default function SearchPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const searchType = searchParams.get('type') || 'text';

    const [results, setResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [aiSuggestion, setAiSuggestion] = useState(null);

    // Filters
    const [sortBy, setSortBy] = useState('pertinence');
    const [selectedCategory, setSelectedCategory] = useState('Toutes catégories');
    const [selectedPriceRange, setSelectedPriceRange] = useState(0);
    const [showFilters, setShowFilters] = useState(true);

    // Fetch
    useEffect(() => {
        if (!query) { setIsLoading(false); return; }
        performSearch();
    }, [query, searchType]);

    // Apply filters 
    useEffect(() => {
        let data = [...results];
        const range = PRICE_RANGES[selectedPriceRange];

        if (range) {
            data = data.filter(p => {
                const price = parseFloat(p.prix_unitaire || p.price || 0);
                return price >= range.min && price <= range.max;
            });
        }

        switch (sortBy) {
            case 'prix-asc': data.sort((a, b) => parseFloat(a.prix_unitaire) - parseFloat(b.prix_unitaire)); break;
            case 'prix-desc': data.sort((a, b) => parseFloat(b.prix_unitaire) - parseFloat(a.prix_unitaire)); break;
            default: break;
        }

        setFilteredResults(data);
    }, [results, sortBy, selectedCategory, selectedPriceRange]);

    const performSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        setAiSuggestion(null);

        try {
            let directResults = [];
            try {
                const response = await productService.searchProducts(query);
                directResults = Array.isArray(response) ? response : (response.products || response.data || []);
            } catch (err) { /* silent */ }

            if (directResults.length < 3) {
                try {
                    const aiResponse = await aiService.interpretSearch(query);
                    if (aiResponse.data) {
                        setAiSuggestion({
                            interpretation: aiResponse.data.interpretation,
                            keywords: aiResponse.data.keywords,
                            category: aiResponse.data.category
                        });
                        const aiResults = await productService.searchProducts(aiResponse.data.keywords.join(' '));
                        const aiProducts = Array.isArray(aiResults) ? aiResults : (aiResults.products || aiResults.data || []);
                        directResults = [...directResults, ...aiProducts];
                    }
                } catch (aiErr) { /* silent */ }
            }

            const uniqueResults = Array.from(
                new Map(directResults.map(item => [item.id, item])).values()
            ).slice(0, 20);

            setResults(uniqueResults);
            if (uniqueResults.length === 0) setError('no_results');
        } catch (err) {
            setError('search_error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background font-jakarta">
            
            {/* ── Page Header ───────────────────────────────────── */}
            <div className="border-b border-border bg-card/30 backdrop-blur-md sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Search className="size-5 text-primary" />
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Résultats
                                </h1>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                Recherche pour <span className="text-foreground font-black italic">"{query}"</span>
                                {!isLoading && <span className="ml-3 text-primary font-black">{filteredResults.length} résultats trouvés</span>}
                            </p>
                        </div>

                        {/* Sort */}
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn(
                                    "h-11 px-5 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all",
                                    showFilters ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"
                                )}
                            >
                                <SlidersHorizontal className="size-4" />
                                Filtres
                            </button>
                            
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                    className="h-11 pl-4 pr-10 rounded-2xl border border-border bg-card text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:border-primary focus:outline-none transition-all"
                                >
                                    {SORT_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                
                {/* ── AI Suggestion Banner ──────────────────────── */}
                <AnimatePresence>
                    {aiSuggestion && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-10 p-6 rounded-[2rem] bg-primary/5 border border-primary/15 flex items-start gap-6"
                        >
                            <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                                <Sparkles className="size-6 fill-current" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Intelligence Artificielle</p>
                                <h3 className="text-base font-black text-foreground mb-1 uppercase tracking-tight">{aiSuggestion.interpretation}</h3>
                                <p className="text-xs text-muted-foreground font-medium mb-4">Catégorie identifiée : <span className="text-foreground font-black">{aiSuggestion.category}</span></p>
                                <div className="flex flex-wrap gap-2">
                                    {aiSuggestion.keywords.map((kw, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-primary/15 text-primary rounded-xl text-[10px] font-black uppercase tracking-wider border border-primary/20">{kw}</span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-12">
                    
                    {/* ── Sidebar Filters ───────────────────────── */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.aside
                                initial={{ opacity: 0, x: -30, width: 0 }}
                                animate={{ opacity: 1, x: 0, width: 280 }}
                                exit={{ opacity: 0, x: -30, width: 0 }}
                                className="shrink-0 space-y-8 overflow-hidden"
                            >
                                {/* Tranche de prix */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Tranche de Prix</h3>
                                    <div className="space-y-2">
                                        {PRICE_RANGES.map((range, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedPriceRange(idx)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-2xl transition-all text-xs font-bold border",
                                                    selectedPriceRange === idx
                                                        ? "bg-primary/10 border-primary/20 text-primary"
                                                        : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"
                                                )}
                                            >
                                                {range.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border" />

                                {/* Catégories */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Catégories</h3>
                                    <div className="space-y-2">
                                        {CATEGORIES.map((cat, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedCategory(cat)}
                                                className={cn(
                                                    "w-full text-left px-4 py-3 rounded-2xl transition-all text-xs font-bold border",
                                                    selectedCategory === cat
                                                        ? "bg-primary/10 border-primary/20 text-primary"
                                                        : "border-transparent hover:border-border hover:bg-muted/50 text-muted-foreground"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-border" />
                                
                                {/* Eval Min */}
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Évaluation min.</h3>
                                    <div className="flex gap-2">
                                        {[4, 3, 2].map(n => (
                                            <button
                                                key={n}
                                                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border hover:border-primary/30 text-[10px] font-black transition-all"
                                            >
                                                <Star className="size-3 fill-amber-500 text-amber-500" />
                                                {n}+
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    {/* ── Results Area ──────────────────────────── */}
                    <div className="flex-1 min-w-0">
                        
                        {/* Loading */}
                        {isLoading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
                            </div>
                        )}

                        {/* Error States */}
                        {!isLoading && error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-24 text-center space-y-8"
                            >
                                <div className="size-24 rounded-[2.5rem] bg-muted mx-auto flex items-center justify-center">
                                    <Package className="size-12 text-muted-foreground" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Aucun résultat
                                    </h2>
                                    <p className="text-muted-foreground font-medium">
                                        Votre recherche <span className="text-foreground font-black">"{query}"</span> n'a retourné aucun actif.
                                    </p>
                                    <p className="text-sm text-muted-foreground/60 mt-2">Essayez des termes plus généraux ou explorez nos catégories.</p>
                                </div>
                                <div className="flex justify-center gap-4 flex-wrap">
                                    {['Alimentation', 'Mode', 'Technologie', 'Agriculture'].map(cat => (
                                        <Link
                                            key={cat}
                                            to={`/marketplace?category=${cat}`}
                                            className="h-11 px-6 rounded-2xl border border-border font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all flex items-center"
                                        >
                                            {cat}
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Results */}
                        {!isLoading && filteredResults.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredResults.map((product, idx) => (
                                    <SearchProductCard key={product.id} product={product} index={idx} />
                                ))}
                            </div>
                        )}

                        {/* No match after filter */}
                        {!isLoading && results.length > 0 && filteredResults.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 space-y-4">
                                <TrendingUp className="size-12 text-muted-foreground mx-auto" />
                                <p className="text-lg font-black uppercase tracking-tighter">Aucun résultat pour ces filtres</p>
                                <button onClick={() => { setSelectedPriceRange(0); setSelectedCategory('Toutes catégories'); }} className="px-6 py-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 font-black text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all">
                                    Réinitialiser les filtres
                                </button>
                            </motion.div>
                        )}
                        
                        {/* Empty State (no query) */}
                        {!isLoading && !query && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32 space-y-6">
                                <Search className="size-24 text-muted-foreground/20 mx-auto" />
                                <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Rechercher
                                </h2>
                                <p className="text-muted-foreground font-medium">Utilisez la barre de recherche pour trouver vos produits.</p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
