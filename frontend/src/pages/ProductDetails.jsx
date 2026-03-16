import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import { Button } from '../components/ui/Button';
import {
    ShoppingCart,
    Star,
    Minus,
    Plus,
    ShieldCheck,
    Truck,
    ArrowRight,
    CheckCircle2,
    Calendar,
    Award,
    Clock,
    Share2,
    Heart
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';

const ProductDetail = () => {
    const { id } = useParams();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('desc');

    const product = {
        id: id,
        sku: 'BCA-CON-2024-X1',
        name: 'Routeur Haute Performance Pro BCA-X1',
        price: 8490000,
        oldPrice: 9990000,
        discount: '-15%',
        rating: 4.8,
        reviewsCount: 124,
        isNew: true,
        stockStatus: 'En stock - Livraison sous 48h à Conakry',
        description: "Le routeur BCA-X1 est la solution ultime pour les entreprises exigeantes en Guinée. Technologie Wi-Fi 6E de pointe et sécurité multicouche intégrée.",
        fullDescription: "Le Routeur BCA Haute Performance Pro est conçu pour redéfinir la connectivité en milieu professionnel. Wi-Fi 6E Triple-Band ultra-rapide jusqu'à 11000 Mbps, Port WAN/LAN 10 Gbps, Sécurité WPA3 et VPN matériel intégré. Spécifiquement optimisé pour les réseaux locaux guinéens.",
        images: [
            'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=600',
            'https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=200',
            'https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80&w=200',
        ],
        specs: [
            { label: 'Marque', value: 'BCA Connect' },
            { label: 'Standard Wi-Fi', value: '802.11ax (Wi-Fi 6E)' },
            { label: 'Nombre de ports', value: '8x RJ45, 1x SFP+' },
            { label: 'Fréquences', value: '2.4 GHz, 5 GHz, 6 GHz' },
            { label: 'Garantie', value: '2 ans BCA Care' },
        ]
    };

    const increment = () => setQuantity(prev => prev + 1);
    const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    return (
        <PublicLayout>
            <div className="w-full space-y-12 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-10">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <Link to="/marketplace" className="hover:text-primary transition-colors">Marketplace</Link>
                    <ArrowRight className="size-3" />
                    <span className="text-foreground italic">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left: Gallery */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="relative aspect-[4/3] rounded-[2.5rem] bg-card border border-border overflow-hidden group shadow-2xl">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-6 right-6 flex flex-col gap-3">
                                <button className="size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-all shadow-lg">
                                    <Heart className="size-5" />
                                </button>
                                <button className="size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-lg">
                                    <Share2 className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    className={cn(
                                        "aspect-square rounded-2xl border-2 overflow-hidden bg-card transition-all",
                                        idx === 0 ? "border-primary scale-105 shadow-lg shadow-primary/10" : "border-border hover:border-primary/40"
                                    )}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Vue ${idx + 1}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info & CTA */}
                    <div className="lg:col-span-5 flex flex-col gap-8">
                        <div className="space-y-4">
                            <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                                {product.isNew ? 'Innovation 2024' : 'Stock Limité'}
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">{product.name}</h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-1 text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("size-4", i < 4 ? "fill-current" : "opacity-30")} />
                                    ))}
                                    <span className="text-xs font-black ml-2 text-foreground italic">{product.rating}</span>
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-l border-border pl-6">{product.reviewsCount} Avis clients</span>
                            </div>
                        </div>

                        <div className="p-8 rounded-[2rem] bg-muted/20 border border-border space-y-6">
                            <div className="flex items-end gap-4">
                                <div className="flex flex-col leading-none">
                                    <span className="text-4xl font-black italic tracking-tighter text-foreground">{product.price.toLocaleString('fr-FR')} GNF</span>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-2">Prix unitaire TTC</span>
                                </div>
                                {product.oldPrice && <span className="text-lg text-muted-foreground line-through decoration-primary decoration-2 pb-1 font-medium italic">{product.oldPrice.toLocaleString('fr-FR')}</span>}
                            </div>

                            <p className="text-sm text-foreground/70 font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                "{product.description}"
                            </p>

                            <div className="space-y-4 pt-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantité à commander</p>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center bg-card border border-border rounded-xl px-2 h-14">
                                        <button onClick={decrement} className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Minus className="size-4" /></button>
                                        <span className="w-12 text-center text-sm font-black italic">{quantity}</span>
                                        <button onClick={increment} className="size-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"><Plus className="size-4" /></button>
                                    </div>
                                    <div className="flex flex-col leading-none">
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 className="size-3" /> Dispo immédiate
                                        </span>
                                        <span className="text-[9px] text-muted-foreground font-medium mt-1">Livraison Hub Conakry</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <Button className="h-16 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary/30 group">
                                    <ShoppingCart className="size-5 mr-2 group-hover:rotate-12 transition-transform" />
                                    Ajouter au panier
                                </Button>
                                <Button variant="outline" className="h-16 rounded-2xl border-border bg-card font-black uppercase tracking-widest text-[11px] hover:bg-muted transition-all">
                                    Acheter maintenant
                                </Button>
                            </div>
                        </div>

                        {/* Quick Specs Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                                <Truck className="size-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Livraison</span>
                                    <span className="text-xs font-bold text-foreground mt-1">48h (Guinée)</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3">
                                <ShieldCheck className="size-5 text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Garantie</span>
                                    <span className="text-xs font-bold text-foreground mt-1">2 ans (Constructeur)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs / Detailed Specs */}
                <div className="space-y-8">
                    <div className="flex items-center gap-8 border-b border-border font-inter">
                        <button
                            onClick={() => setActiveTab('desc')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative",
                                activeTab === 'desc' ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Description Complète
                        </button>
                        <button
                            onClick={() => setActiveTab('tech')}
                            className={cn(
                                "pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative",
                                activeTab === 'tech' ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            Détails Techniques
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        <div className="lg:col-span-8">
                            {activeTab === 'desc' ? (
                                <div className="space-y-6 text-foreground/80 leading-relaxed font-medium italic italic">
                                    <h3 className="text-2xl font-black text-foreground not-italic tracking-tight mb-4">La robustesse au service du digital</h3>
                                    <p>{product.fullDescription}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        {['Triple antenne directionnelle', 'Refroidissement passif alu', 'Chiffrement AES-256 bits'].map((f, i) => (
                                            <div key={i} className="flex items-center gap-3 p-4 bg-muted/10 rounded-xl border border-border">
                                                <Award className="size-4 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-widest">{f}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted shadow-inner rounded-[2rem] overflow-hidden">
                                    <table className="w-full">
                                        <tbody>
                                            {product.specs.map((spec, i) => (
                                                <tr key={i} className="border-b border-slate-200/50 dark:border-slate-800/50 last:border-0">
                                                    <td className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-slate-50 dark:bg-slate-900/50 w-1/3">{spec.label}</td>
                                                    <td className="p-6 text-sm font-bold text-foreground italic">{spec.value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default ProductDetail;
