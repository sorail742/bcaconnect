import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Star, Store, ArrowRight, ShieldCheck, MapPin, Globe } from 'lucide-react';
import storeService from '../services/storeService';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { cn } from '../lib/utils';
const VendorsList = () => {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [vendors, setVendors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const data = await storeService.getAllStores();
                setVendors(Array.isArray(data) ? data : []);
            } catch {
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v =>
        (v.nom_boutique?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (v.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-background min-h-screen text-foreground pb-16">

                {/* Hero */}
                <div className="relative pt-28 pb-12 px-6 md:px-12 max-w-6xl mx-auto">
                    <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10 space-y-4 max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
                            <ShieldCheck className="size-4" /> {t('vlVerifiedBoutiques') || 'Boutiques vérifiées'}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
                            Nos partenaires <span className="text-primary">certifiés</span>
                        </h1>
                        <p className="text-base text-muted-foreground leading-relaxed border-l-4 border-primary/30 pl-4">
                            {t('vlPartnersDesc') || 'Découvrez nos vendeurs vérifiés et faites confiance à leurs produits et services.'}
                        </p>
                    </motion.div>
                </div>

                <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-8">

                    {/* Search + Stats */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder={t('vlSearchBoutique') || 'Rechercher une boutique...'}
                                className="w-full h-11 pl-11 pr-4 bg-card border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-card border border-border rounded-xl shadow-sm">
                                <Users className="size-4 text-primary" />
                                <div>
                                    <p className="text-sm font-bold text-foreground tabular-nums">{vendors.length}</p>
                                    <p className="text-xs text-muted-foreground">{t('vlActors') || 'Vendeurs'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-5 py-2.5 bg-card border border-border rounded-xl shadow-sm">
                                <ShieldCheck className="size-4 text-emerald-500" />
                                <div>
                                    <p className="text-sm font-bold text-foreground">99.8%</p>
                                    <p className="text-xs text-muted-foreground">{t('vlTrustScore') || 'Fiabilité'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {[1,2,3,4,5,6].map(i => (
                                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse border border-border" />
                            ))}
                        </div>
                    ) : hasError ? (
                        <div className="py-16 text-center bg-rose-500/5 rounded-2xl border border-rose-500/20">
                            <h3 className="text-lg font-bold text-rose-500 mb-3">Erreur de chargement</h3>
                            <button
                                className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                                onClick={() => window.location.reload()}
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredVendors.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                        >
                            {filteredVendors.map((vendor, idx) => (
                                <motion.div
                                    key={vendor.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Link
                                        to={`/shop/${vendor.slug}`}
                                        className="group flex flex-col p-5 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-300 h-full overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4 relative z-10">
                                            <div className="size-14 rounded-xl bg-muted border border-border flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors">
                                                {vendor.logo_url ? (
                                                    <img src={vendor.logo_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Store className="size-6 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                                                    <ShieldCheck className="size-3" /> Vérifié
                                                </span>
                                                <span className="flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-semibold">
                                                    <Star className="size-3 fill-current" /> {(4.5 + Math.random() * 0.5).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Body */}
                                        <div className="flex-1 space-y-2 relative z-10">
                                            <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                                {vendor.nom_boutique}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                                                {vendor.description || 'Boutique certifiée BCA Connect, spécialisée dans la vente de produits de qualité.'}
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between relative z-10">
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <MapPin className="size-3.5 text-primary" />
                                                {vendor.localisation || 'Conakry, Guinée'}
                                            </span>
                                            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                                <ArrowRight className="size-4" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <div className="py-16 flex flex-col items-center gap-4 text-center bg-card rounded-2xl border border-border">
                            <Globe className="size-10 text-muted-foreground/30" />
                            <h3 className="text-base font-bold text-foreground">{t('vlSectorSoon') || 'Aucun résultat'}</h3>
                            <p className="text-sm text-muted-foreground max-w-sm">{t('vlNoMatch') || 'Aucune boutique ne correspond à votre recherche.'}</p>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-sm font-semibold text-primary hover:underline"
                            >
                                Réinitialiser
                            </button>
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredVendors.length > 0 && (
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold text-foreground">{filteredVendors.length}</span> {t('vlListedBoutiques') || 'boutiques listées'}
                            </p>
                            <div className="flex items-center gap-2">
                                <button className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">
                                    {t('vlPrevious') || 'Précédent'}
                                </button>
                                <button className="size-9 rounded-lg bg-primary text-primary-foreground font-bold text-sm">1</button>
                                <button className="size-9 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors">2</button>
                                <button className="h-9 px-4 rounded-lg bg-foreground text-background font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
                                    {t('vlNext') || 'Suivant'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
    );
};

export default VendorsList;
