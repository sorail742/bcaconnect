import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, ChevronLeft, ChevronRight, Filter, Sparkles, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import ProductCard from '../components/produits/ProductCard';
import { Skeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/StatusStates';

const ProductCatalogue = () => {
    const categories = ["Tous", "Électronique", "Mobilier", "Informatique", "Accessoires", "Papeterie"];
    const [activeCategory, setActiveCategory] = useState("Tous");
    const [searchQuery, setSearchQuery] = useState("");
    const isLoading = false;
    const hasError = false;

    const products = [
        {
            id: 1,
            name: 'Smartphone Galaxy X-2',
            category: 'Électronique',
            description: 'Écran 6.7" Super Retina, 256GB, Triple capteur photo 108MP.',
            price: 8990000,
            image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=600',
            isNew: true,
            vendor: 'TechStore GN'
        },
        {
            id: 2,
            name: 'Chaise ErgoPro Plus',
            category: 'Mobilier',
            description: 'Support lombaire dynamique, accoudoirs 4D, revêtement mesh respirant.',
            price: 2490000,
            image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&q=80&w=600',
            isNew: false,
            vendor: 'Meubles Confort'
        },
        {
            id: 3,
            name: 'Laptop Pro Air 15"',
            category: 'Informatique',
            description: 'Puce M2 Max, 32GB RAM, SSD 1TB, Écran Liquid Retina XDR.',
            price: 12990000,
            image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=600',
            isNew: false,
            vendor: 'TechStore GN'
        },
        {
            id: 4,
            name: 'Moniteur 27" UHD 4K',
            category: 'Informatique',
            description: 'Dalle IPS, 144Hz, HDR10, Calibration couleur d\'usine ΔE < 2.',
            price: 3990000,
            image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
            isNew: false,
            vendor: 'Univers PC'
        },
        {
            id: 5,
            name: 'Casque Wireless ANC',
            category: 'Électronique',
            description: 'Réduction de bruit active intelligente, Autonomie 40h, Hi-Res Audio.',
            price: 1990000,
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
            isNew: false,
            vendor: 'AudioShop'
        },
        {
            id: 6,
            name: 'Table Executive Oak',
            category: 'Mobilier',
            description: 'Chêne massif, gestion des câbles intégrée, pieds en acier brossé.',
            price: 5500000,
            image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=600',
            isNew: false,
            vendor: 'Atelier Wood'
        }
    ];

    const filteredProducts = products.filter(p =>
        (activeCategory === "Tous" || p.category === activeCategory) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <DashboardLayout title="Marketplace">
            <div className="space-y-10 animate-in fade-in duration-700 pb-20 font-inter px-4 md:px-8">
                {/* Premium Search Hub */}
                <div className="relative py-16 px-10 rounded-[2.5rem] bg-slate-900 border border-white/10 overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] -ml-24 -mb-24 group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-white/10">
                                    <Sparkles className="size-3 text-primary" /> Marketplace Officielle
                                </span>
                            </div>
                            <h2 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
                                Trouvez l'exceptionnel <br />
                                <span className="text-primary not-italic">en direct de Guinée.</span>
                            </h2>
                            <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto">
                                Explorez des milliers de produits certifiés, des artisans locaux aux grandes marques internationales.
                            </p>
                        </div>

                        <div className="w-full max-w-2xl">
                            <div className="relative group/search">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 size-6 group-focus-within/search:text-primary transition-colors duration-300" />
                                <Input
                                    className="w-full pl-16 pr-8 h-16 bg-white/5 backdrop-blur-xl border-white/10 focus:border-primary/50 focus:ring-primary/20 transition-all text-white text-lg rounded-2xl placeholder:text-slate-500 shadow-inner"
                                    placeholder="Un smartphone, un canapé, une robe..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <div className="absolute right-3 top-3 bottom-3">
                                    <Button className="h-full px-6 rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                                        Rechercher
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories & Filter Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 sticky top-0 z-20 bg-background/80 backdrop-blur-md py-4 border-b border-border/50">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide px-2">
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2",
                                    activeCategory === cat
                                        ? "bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105"
                                        : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 px-2">
                        <Button variant="outline" className="rounded-2xl h-11 px-6 border-border font-bold text-[10px] uppercase tracking-widest gap-3 hover:border-primary hover:text-primary">
                            <Filter className="size-4" />
                            Filtrer les produits
                        </Button>
                        <div className="hidden lg:flex items-center gap-1 p-1 bg-muted rounded-2xl border border-border">
                            <button className="p-2 rounded-xl bg-card shadow-sm border border-border"><Filter className="size-4" /></button>
                            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"><ShoppingBag className="size-4" /></button>
                        </div>
                    </div>
                </div>

                {/* Product Section Header */}
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Découverte</h3>
                        <p className="text-2xl font-black italic tracking-tight text-foreground">
                            {activeCategory === "Tous" ? "Tous les produits" : activeCategory} <span className="text-muted-foreground not-italic font-medium text-lg ml-2">({filteredProducts.length})</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-1 px-4 py-2 bg-muted rounded-xl border border-border">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trier par:</span>
                        <select className="bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest text-foreground cursor-pointer">
                            <option>Plus récents</option>
                            <option>Prix croissant</option>
                            <option>Prix décroissant</option>
                        </select>
                    </div>
                </div>

                {/* Product Section Content */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] w-full bg-card rounded-[2.5rem] border border-border p-6 space-y-4">
                                <Skeleton className="w-full h-1/2 rounded-2xl" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-3/4" />
                                <div className="flex justify-between items-center pt-4">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="size-10 rounded-xl" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : hasError ? (
                    <ErrorState />
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="size-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                            <Search className="size-10 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black italic uppercase tracking-widest text-foreground">Aucun produit trouvé</p>
                            <p className="text-sm text-muted-foreground font-medium max-w-xs">Essayez d'ajuster vos filtres ou votre recherche pour trouver ce que vous cherchez.</p>
                        </div>
                        <Button variant="outline" onClick={() => { setActiveCategory("Tous"); setSearchQuery(""); }} className="rounded-xl">Voir tout le catalogue</Button>
                    </div>
                )}

                {/* Premium Pagination */}
                <div className="mt-16 flex flex-col items-center gap-6">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Vous avez vu <span className="text-foreground">6</span> produits sur <span className="text-foreground">150</span></p>
                    <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="w-12 h-full bg-primary shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="icon" className="rounded-2xl size-12 border-border hover:border-primary hover:text-primary transition-all">
                            <ChevronLeft className="size-5" />
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button variant="default" className="rounded-2xl size-12 font-black italic shadow-xl shadow-primary/20">1</Button>
                            <Button variant="outline" className="rounded-2xl size-12 font-black italic border-border hover:border-primary transition-all">2</Button>
                            <Button variant="outline" className="rounded-2xl size-12 font-black italic border-border hover:border-primary transition-all">3</Button>
                            <span className="text-muted-foreground px-2 font-black tracking-widest">...</span>
                            <Button variant="outline" className="rounded-2xl size-12 font-black italic border-border hover:border-primary transition-all">12</Button>
                        </div>
                        <Button variant="outline" size="icon" className="rounded-2xl size-12 border-border hover:border-primary hover:text-primary transition-all">
                            <ChevronRight className="size-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProductCatalogue;
