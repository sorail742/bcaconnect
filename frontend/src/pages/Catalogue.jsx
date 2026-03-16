import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    Filter,
    Sparkles,
    ShoppingBag,
    LayoutGrid,
    List,
    ArrowUpDown,
    Store,
    Laptop,
    Armchair,
    Smartphone,
    Shirt,
    Heart,
    Zap,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import ProductCard from '../components/produits/ProductCard';
import { Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/StatusStates';
import productService from '../services/productService';
import categoryService from '../services/categoryService';

const ProductCatalogue = () => {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [viewMode, setViewMode] = useState('grid');

    const heroImage = "assets/marketplace_hero_banner.png"; // Placeholder for the generated image if moved to assets, otherwise I'll use a high-end unsplash for now or the actual path if I can

    const categoryIcons = {
        "Tous": LayoutGrid,
        "Électronique": Smartphone,
        "Mobilier": Armchair,
        "Informatique": Laptop,
        "Mode": Shirt,
        "Accessoires": Heart,
        "Papeterie": Zap
    };

    const fetchData = async () => {
        try {
            const [prodData, catData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(prodData);
            setCategories([
                { id: 'all', nom_categorie: 'Tous', icon: LayoutGrid },
                ...catData.map(c => ({
                    ...c,
                    icon: categoryIcons[c.nom_categorie] || Store
                }))
            ]);
        } catch (err) {
            console.error("Erreur chargement catalogue:", err);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = products.filter(p =>
        (activeCategory === "Tous" || p.categorie?.nom_categorie === activeCategory) &&
        (p.nom_produit.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <PublicLayout>
            <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-inter">
                {/* 1. Dynamic Hero Section */}
                <div className="relative h-[500px] w-full overflow-hidden">
                    <div className="absolute inset-0 bg-slate-900">
                        <img
                            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000"
                            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                            alt="Marketplace Hero"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/60 to-slate-950"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/20 to-transparent"></div>
                    </div>

                    <div className="relative z-10 h-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center gap-8">
                        <div className="space-y-4 max-w-2xl animate-in slide-in-from-left duration-1000">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-md text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-primary/30">
                                <Sparkles className="size-3" /> Nouveau Standard de Commerce
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter leading-tight uppercase">
                                Le Marketplace <br />
                                <span className="text-primary not-italic">N°1 en Guinée.</span>
                            </h1>
                            <p className="text-slate-300 font-medium text-lg md:text-xl leading-relaxed">
                                Découvrez une sélection rigoureuse de produits locaux et internationaux,
                                sécurisés par la technologie BCA Connect.
                            </p>
                        </div>

                        <div className="w-full max-w-2xl animate-in slide-in-from-bottom duration-1000 delay-200">
                            <div className="relative group/search p-1 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 size-6 group-focus-within/search:text-primary transition-colors duration-300" />
                                <Input
                                    className="w-full pl-16 pr-40 h-16 bg-white/5 border-none focus:ring-0 text-white text-lg rounded-2xl placeholder:text-slate-500 shadow-none outline-none"
                                    placeholder="Que recherchez-vous aujourd'hui ?"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute right-3 top-3 bottom-3 flex gap-2">
                                    <Button className="h-full px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 bg-primary hover:scale-105 transition-transform">
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Shop Area */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* 2a. Left Sidebar Filters (Desktop) */}
                        <aside className="hidden lg:col-span-3 lg:flex flex-col gap-10">
                            <div className="space-y-6">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground flex items-center gap-2">
                                    <Filter className="size-4 text-primary" /> Catégories
                                </h3>
                                <div className="flex flex-col gap-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.nom_categorie}
                                            onClick={() => setActiveCategory(cat.nom_categorie)}
                                            className={cn(
                                                "group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300",
                                                activeCategory === cat.nom_categorie
                                                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                                    : "text-muted-foreground hover:bg-white dark:hover:bg-white/5 hover:text-foreground"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <cat.icon className={cn("size-5", activeCategory === cat.nom_categorie ? "text-white" : "text-slate-400 group-hover:text-primary")} />
                                                <span className="text-sm font-bold tracking-tight">{cat.nom_categorie}</span>
                                            </div>
                                            <ChevronRight className={cn("size-4 transition-transform group-hover:translate-x-1", activeCategory === cat.nom_categorie ? "text-white/50" : "text-slate-500")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 relative overflow-hidden group shadow-2xl">
                                <div className="absolute -top-4 -right-4 size-24 bg-primary/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <h4 className="text-xl font-black italic tracking-tighter text-white uppercase leading-none mb-2">BCA Trust</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">
                                    Paiement sécurisé et livraison garantie partout en Guinée.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                                        <ShieldCheck className="size-4" /> Vendeurs Certifiés
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest">
                                        <TrendingUp className="size-4" /> Prix Garantis
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* 2b. Content Grid */}
                        <div className="lg:col-span-9 space-y-10">

                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl border border-border">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground")}
                                        >
                                            <LayoutGrid className="size-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-700 shadow-sm text-primary" : "text-muted-foreground")}
                                        >
                                            <List className="size-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                        <span className="text-foreground font-black italic">{filteredProducts.length}</span> produits trouvés
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trier par:</span>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-200/50 dark:bg-slate-800/50 border border-border rounded-xl cursor-pointer group hover:border-primary/50 transition-all">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground">Pertinence</span>
                                            <ArrowUpDown className="size-3 text-primary group-hover:rotate-180 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Layout */}
                            {isLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} className="aspect-[4/5] bg-slate-200 dark:bg-slate-800/50 rounded-[2rem] border border-border animate-pulse"></div>
                                    ))}
                                </div>
                            ) : hasError ? (
                                <ErrorState />
                            ) : filteredProducts.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                                    : "flex flex-col gap-6"
                                }>
                                    {filteredProducts.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 bg-white/50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-border">
                                    <div className="size-24 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                        <Search className="size-10 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Rien trouvé</p>
                                        <p className="text-sm text-muted-foreground font-medium max-w-xs">
                                            Nous n'avons pas d'articles correspondant à "{searchQuery}" dans la catégorie {activeCategory}.
                                        </p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }}
                                        className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Réinitialiser
                                    </Button>
                                </div>
                            )}

                            {/* Pagination */}
                            {filteredProducts.length > 0 && (
                                <div className="pt-12 flex flex-col items-center gap-8">
                                    <div className="flex items-center gap-3">
                                        <Button variant="outline" size="icon" className="rounded-2xl size-14 border-border hover:border-primary transition-all">
                                            <ChevronLeft className="size-6" />
                                        </Button>
                                        <div className="flex items-center gap-2">
                                            <Button className="rounded-2xl size-14 font-black italic shadow-2xl shadow-primary/20">1</Button>
                                            <Button variant="outline" className="rounded-2xl size-14 font-black italic border-border hover:border-primary transition-all">2</Button>
                                            <Button variant="outline" className="rounded-2xl size-14 font-black italic border-border hover:border-primary transition-all hidden sm:flex">3</Button>
                                            <span className="text-muted-foreground px-4 font-black tracking-[0.2em]">...</span>
                                            <Button variant="outline" className="rounded-2xl size-14 font-black italic border-border hover:border-primary transition-all">10</Button>
                                        </div>
                                        <Button variant="outline" size="icon" className="rounded-2xl size-14 border-border hover:border-primary transition-all">
                                            <ChevronRight className="size-6" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                        Page 1 sur 10 • {filteredProducts.length} produits affichés
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Bottom CTA Section */}
                <div className="bg-slate-900 py-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                    <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                                Vous avez des produits <br />
                                <span className="text-primary not-italic">à vendre ?</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg leading-relaxed">
                                Rejoignez plus de 500 marchands guinéens et commencez à vendre <br />
                                vos produits sur la plateforme la plus fiable du pays.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 w-full sm:w-auto">
                                Ouvrir ma boutique
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.2em] text-xs border-white/20 text-white hover:bg-white/10 w-full sm:w-auto">
                                En savoir plus
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductCatalogue;
