import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import ProductCard from '../components/produits/ProductCard';
import { Button } from '../components/ui/Button';
import {
    Store, Star, ShieldCheck, Package, ArrowRight,
    MapPin, Phone, Mail, AlertCircle, Loader2, ExternalLink, Award
} from 'lucide-react';
import productService from '../services/productService';
import storeService from '../services/storeService';
import { cn } from '../lib/utils';

const StorePage = () => {
    const { slug } = useParams();
    const [store, setStore] = useState(null);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeTab, setActiveTab] = useState('produits');

    useEffect(() => {
        const loadStore = async () => {
            setIsLoading(true);
            try {
                // Charger la boutique directement par son slug
                const data = await storeService.getBySlug(slug);
                if (!data) { setNotFound(true); return; }
                setStore(data);
                // Utiliser les produits déjà inclus dans la réponse du store
                setProducts(data.produits || []);
            } catch (err) {
                console.error("Erreur chargement boutique:", err);
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        loadStore();
    }, [slug]);

    if (isLoading) {
        return (
            <PublicLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="size-12 text-primary animate-spin" />
                </div>
            </PublicLayout>
        );
    }

    if (notFound || !store) {
        return (
            <PublicLayout>
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
                    <div className="size-24 rounded-3xl bg-destructive/10 flex items-center justify-center">
                        <AlertCircle className="size-12 text-destructive" />
                    </div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-foreground">Boutique introuvable</h1>
                    <p className="text-muted-foreground font-medium max-w-md">
                        Cette boutique n'existe pas ou a été désactivée. Découvrez nos autres marchands partenaires.
                    </p>
                    <Link to="/vendors">
                        <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-sm gap-2">
                            Voir tous les marchands <ArrowRight className="size-4" />
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="font-inter pb-20">
                {/* ══ HERO BOUTIQUE ══ */}
                <div className="relative h-64 md:h-80 bg-gradient-to-br from-slate-900 via-primary/20 to-slate-900 overflow-hidden">
                    {store.logo_url && (
                        <img src={store.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-10 blur-sm scale-105" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ea580c_1px,transparent_1px)] bg-[size:32px_32px]" />
                    {/* Avatar boutique */}
                    <div className="absolute -bottom-12 left-8 md:left-16 size-24 rounded-[1.5rem] border-4 border-background bg-card shadow-2xl flex items-center justify-center overflow-hidden">
                        {store.logo_url
                            ? <img src={store.logo_url} alt={store.nom_boutique} className="w-full h-full object-cover" />
                            : <Store className="size-10 text-primary" />
                        }
                    </div>
                </div>

                {/* ══ INFO BOUTIQUE ══ */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">
                                    {store.nom_boutique}
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.25em] rounded-full border border-primary/20">
                                    <ShieldCheck className="size-3" /> Certifié BCA
                                </span>
                            </div>
                            <p className="text-muted-foreground font-medium max-w-lg">
                                {store.description || "Bienvenue dans notre boutique. Qualité et satisfaction garanties."}
                            </p>
                            <div className="flex items-center gap-6 text-xs text-muted-foreground font-bold flex-wrap">
                                {store.email_boutique && (
                                    <span className="flex items-center gap-2">
                                        <Mail className="size-3 text-primary" /> {store.email_boutique}
                                    </span>
                                )}
                                {store.telephone_boutique && (
                                    <span className="flex items-center gap-2">
                                        <Phone className="size-3 text-primary" /> {store.telephone_boutique}
                                    </span>
                                )}
                                <span className="flex items-center gap-2">
                                    <MapPin className="size-3 text-primary" /> Conakry, Guinée
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-center px-6 py-4 rounded-2xl bg-card border border-border">
                                <p className="text-3xl font-black italic tracking-tighter text-foreground">{products.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Produits</p>
                            </div>
                            <div className="text-center px-6 py-4 rounded-2xl bg-card border border-border">
                                <div className="flex items-center gap-1 justify-center">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    <p className="text-2xl font-black italic tracking-tighter text-foreground">4.8</p>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1">Note</p>
                            </div>
                        </div>
                    </div>

                    {/* ══ ONGLETS ══ */}
                    <div className="border-b border-border flex items-center gap-8 mb-10">
                        {[
                            { key: 'produits', label: `Produits (${products.length})`, icon: Package },
                            { key: 'avis', label: 'Avis Clients', icon: Star },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'pb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] transition-all relative',
                                    activeTab === tab.key
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <tab.icon className="size-3.5" /> {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ══ CONTENU ONGLETS ══ */}
                    {activeTab === 'produits' && (
                        products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.map(p => <ProductCard key={p.id} product={p} />)}
                            </div>
                        ) : (
                            <div className="py-24 flex flex-col items-center gap-6 text-center">
                                <div className="size-24 rounded-3xl bg-muted/50 flex items-center justify-center border-4 border-dashed border-border">
                                    <Package className="size-10 text-muted-foreground/30" />
                                </div>
                                <div>
                                    <p className="text-2xl font-black italic tracking-tighter">Catalogue bientôt disponible</p>
                                    <p className="text-muted-foreground mt-2 font-medium">Ce marchand n'a pas encore ajouté de produits.</p>
                                </div>
                                <Link to="/catalog">
                                    <Button variant="outline" className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                                        Explorer le catalogue
                                    </Button>
                                </Link>
                            </div>
                        )
                    )}

                    {activeTab === 'avis' && (
                        <div className="py-16 flex flex-col items-center gap-4 text-center">
                            <div className="size-20 rounded-3xl bg-amber-400/10 flex items-center justify-center">
                                <Star className="size-10 text-amber-400" />
                            </div>
                            <p className="text-xl font-black italic tracking-tighter text-foreground">Aucun avis pour l'instant</p>
                            <p className="text-muted-foreground font-medium">Soyez le premier à laisser un avis après votre achat.</p>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default StorePage;
