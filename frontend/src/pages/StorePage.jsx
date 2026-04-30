import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import { Store, Star, ShieldCheck, Package, ArrowRight, MapPin, Phone, Mail, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import storeService from '../services/storeService';
import { cn } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';
import { ProductSkeleton } from '../components/ui/Loader';
import { useVendorBySlug } from '../hooks/useDomainData';
import LazyImage from '../components/ui/LazyImage';

const StorePage = () => {
    const { slug } = useParams();
    const { t } = useLanguage();
    const { data: store, loading: isLoading, error } = useVendorBySlug(slug);
    const products = store?.produits || [];
    const notFound = !!error || (!isLoading && !store);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [activeTab, setActiveTab] = useState('produits');

    // Calcul dynamique des notes de la boutique basé sur ses produits
    const totalReviews = products.reduce((acc, p) => acc + parseInt(p.reviews_count || 0), 0);
    const averageRating = totalReviews > 0 
        ? (products.reduce((acc, p) => acc + (parseFloat(p.rating || 0) * parseInt(p.reviews_count || 0)), 0) / totalReviews).toFixed(1)
        : '0.0';

    useEffect(() => {
        if (store?.use_carousel && store?.banner_images?.length > 1) {
            const interval = setInterval(() => {
                setCurrentSlide(prev => (prev + 1) % store.banner_images.length);
            }, 6000);
            return () => clearInterval(interval);
        }
    }, [store]);

    if (isLoading) {
        return (
            <div className="bg-background min-h-screen pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-12">
                     <div className="h-56 md:h-80 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={i} />)}
                     </div>
                </div>
            </div>
        );
    }

    if (notFound || !store) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 text-center px-6">
                    <div className="size-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <AlertCircle className="size-7 text-rose-500" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-bold text-foreground">{t('spUnavailable') || 'Boutique introuvable'}</h1>
                        <p className="text-sm text-muted-foreground max-w-sm">{t('spUnavailableDesc') || 'Cette boutique n\'existe pas ou a été supprimée.'}</p>
                    </div>
                    <Link to="/vendors">
                        <Button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm border-none hover:bg-primary/90">
                            {t('spSeeAllStores') || 'Voir toutes les boutiques'} <ArrowRight className="size-4 ml-2" />
                        </Button>
                    </Link>
                </div>
        );
    }

    const hasBanners = store.banner_images?.length > 0;

    return (
        <div className="bg-background min-h-screen text-foreground pb-16">

                {/* Banner */}
                <div className="relative h-56 md:h-80 overflow-hidden bg-muted">
                    {hasBanners ? (
                        <>
                            {store.banner_images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "absolute inset-0 transition-opacity duration-1000",
                                        idx === currentSlide ? "opacity-100" : "opacity-0"
                                    )}
                                >
                                    <LazyImage src={img} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-background/40" />
                                </div>
                            ))}
                            {store.banner_images.length > 1 && (
                                <>
                                    <button onClick={() => setCurrentSlide(p => (p - 1 + store.banner_images.length) % store.banner_images.length)}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10">
                                        <ChevronLeft className="size-4" />
                                    </button>
                                    <button onClick={() => setCurrentSlide(p => (p + 1) % store.banner_images.length)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors z-10">
                                        <ChevronRight className="size-4" />
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                        {store.banner_images.map((_, i) => (
                                            <button key={i} onClick={() => setCurrentSlide(i)}
                                                className={cn("h-1.5 rounded-full transition-all", i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-white/50")} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-muted">
                            {store.logo_url && (
                                <LazyImage src={store.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-5 blur-2xl scale-150" />
                            )}
                        </div>
                    )}
                </div>

                {/* Store info */}
                <div className="max-w-6xl mx-auto px-6 md:px-12">
                    <div className="relative -mt-10 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                            {/* Logo */}
                            <div className="size-20 rounded-2xl border-4 border-background bg-card shadow-lg flex items-center justify-center overflow-hidden shrink-0">
                                {store.logo_url
                                    ? <LazyImage src={store.logo_url} alt={store.nom_boutique} className="w-full h-full object-contain p-2" />
                                    : <Store className="size-8 text-muted-foreground" />
                                }
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{store.nom_boutique}</h1>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                        <ShieldCheck className="size-3" /> {t('spAccredited') || 'Accrédité'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                    {store.description || 'Boutique certifiée pour l\'excellence produit et la rigueur logistique.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    {store.email_boutique && (
                                        <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                            <Mail className="size-3.5" /> {store.email_boutique}
                                        </span>
                                    )}
                                    {store.telephone_boutique && (
                                        <span className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer">
                                            <Phone className="size-3.5" /> {store.telephone_boutique}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5 text-primary" /> Conakry, Guinée
                                    </span>
                                </div>
                            </div>
                            {/* Stats */}
                            <div className="flex gap-3 shrink-0">
                                <div className="text-center px-5 py-3 bg-card border border-border rounded-xl shadow-sm">
                                    <p className="text-2xl font-bold text-foreground tabular-nums">{products.length}</p>
                                    <p className="text-xs text-muted-foreground">{t('spProducts') || 'Produits'}</p>
                                </div>
                                <div className="text-center px-5 py-3 bg-card border border-border rounded-xl shadow-sm">
                                    <div className="flex items-center gap-1 justify-center">
                                        <Star className="size-4 fill-[#FF6600] text-[#FF6600]" />
                                        <p className="text-2xl font-bold text-foreground">{averageRating}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{t('spReviews') || 'Avis'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-6 border border-border">
                        {[
                            { key: 'produits', label: `${t('spProducts') || 'Produits'} (${products.length})`, icon: Package },
                            { key: 'avis', label: `${t('spReviews') || 'Avis'} (${totalReviews})`, icon: Star },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                                    activeTab === tab.key
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <tab.icon className="size-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab content */}
                    {activeTab === 'produits' && (
                        products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {products.map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                        ) : (
                            <div className="py-16 flex flex-col items-center gap-4 text-center bg-card rounded-2xl border border-border">
                                <Package className="size-10 text-muted-foreground/30" />
                                <h3 className="text-base font-bold text-foreground">{t('spCatalogSoon') || 'Catalogue bientôt disponible'}</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">{t('spCatalogSoonDesc') || 'Cette boutique n\'a pas encore ajouté de produits.'}</p>
                                <Link to="/marketplace">
                                    <Button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm border-none hover:bg-primary/90">
                                        {t('spExploreHub') || 'Explorer le marché'} <ArrowRight className="size-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>
                        )
                    )}

                    {activeTab === 'avis' && (
                        <div className="py-16 flex flex-col items-center gap-4 text-center bg-card rounded-2xl border border-border">
                            <Star className="size-10 text-[#FF6600]/30" />
                            <h3 className="text-base font-bold text-foreground">{totalReviews > 0 ? `${totalReviews} avis laissés` : (t('spPerformance') || 'Aucun avis pour le moment')}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">{totalReviews > 0 ? 'Les clients sont satisfaits des services de cette boutique.' : (t('spPerformanceDesc') || 'Les avis clients apparaîtront ici après les premières commandes.')}</p>
                        </div>
                    )}
                </div>
            </div>
    );
};

export default StorePage;
