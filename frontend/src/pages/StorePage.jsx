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
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700">
                    <div className="relative">
                        <div className="size-32 rounded-[2rem] border-8 border-primary/20 border-t-primary animate-spin shadow-premium-lg" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Store className="size-12 text-primary/40" />
                        </div>
                    </div>
                    <div className="space-y-4 text-center">
                        <span className="text-executive-label font-black text-primary uppercase tracking-[0.5em] italic block">Cryptage Terminal...</span>
                        <h2 className="text-2xl font-black italic tracking-tighter text-foreground uppercase">Connexion au Hub Marchand.</h2>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (notFound || !store) {
        return (
            <PublicLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-10 text-center px-6 animate-in zoom-in-95 duration-700">
                    <div className="size-32 rounded-[2.5rem] bg-destructive/10 border-4 border-destructive/20 flex items-center justify-center shadow-inner relative group">
                        <div className="absolute inset-0 bg-destructive/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <AlertCircle className="size-16 text-destructive relative z-10 animate-bounce" />
                    </div>
                    <div className="space-y-6 max-w-2xl">
                        <h1 className="text-6xl font-black italic tracking-tighter text-foreground uppercase leading-none">Boutique <span className="text-destructive not-italic">Introuvable.</span></h1>
                        <p className="text-muted-foreground/60 font-black uppercase tracking-[0.4em] text-sm italic leading-relaxed border-r-8 border-destructive/20 pr-10 text-right">
                            Cette entité n'existe pas dans notre registre ou son accréditation a été suspendue. Explorez nos autres partenaires stratégiques.
                        </p>
                    </div>
                    <Link to="/vendors">
                        <Button className="h-20 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs gap-4 bg-primary hover:bg-primary text-white shadow-premium-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 italic pt-1 leading-none">
                            VOIR TOUS LES MARCHANDS <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="font-inter pb-32 pt-16">
                {/* ══ HERO BOUTIQUE / BANNER ══ */}
                <div className="relative h-96 md:h-[32rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-slate-950">
                        {store.logo_url && (
                            <img src={store.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-xl scale-110 group-hover:scale-100 transition-transform duration-[3s]" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--primary)_1.5px,transparent_1.5px)] bg-[size:48px_48px]" />
                    
                    {/* Floating HUD elements */}
                    <div className="absolute top-12 right-12 flex flex-col items-end gap-4 z-20">
                         <div className="px-6 py-2 bg-foreground/90 backdrop-blur-md rounded-full border border-white/10 text-background text-[10px] font-black italic tracking-[0.3em] uppercase">BCA NETWORK v4.1</div>
                    </div>

                    <div className="absolute -bottom-20 left-8 md:left-24 flex items-end gap-10 z-30">
                        {/* Avatar boutique */}
                        <div className="size-40 md:size-56 rounded-[2.5rem] border-8 border-background bg-card shadow-premium-lg flex items-center justify-center overflow-hidden relative group/avatar">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                            {store.logo_url
                                ? <img src={store.logo_url} alt={store.nom_boutique} className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                                : <Store className="size-20 text-primary/40" />
                            }
                        </div>
                    </div>
                </div>

                {/* ══ INFO BOUTIQUE / EXECUTIVE DASH ══ */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 mb-20">
                        <div className="space-y-8 max-w-4xl">
                            <div className="flex items-center gap-4 flex-wrap">
                                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-foreground uppercase leading-[0.85]">
                                    {store.nom_boutique}
                                </h1>
                                <div className="p-1 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 translate-y-2">
                                    <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full italic">
                                        <ShieldCheck className="size-4 animate-pulse" /> ACCRÉDITÉ BCA
                                    </div>
                                </div>
                            </div>
                            <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-sm leading-relaxed italic border-l-8 border-primary/20 pl-10 max-w-3xl">
                                {store.description || "Une entité stratégique reconnue pour son excellence opérationnelle et la qualité irréprochable de ses actifs commerciaux."}
                            </p>
                            <div className="flex items-center gap-10 text-[11px] text-muted-foreground font-black uppercase tracking-[0.2em] italic flex-wrap pt-4">
                                {store.email_boutique && (
                                    <span className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group/link">
                                        <div className="p-2 rounded-lg border-2 border-border group-hover/link:border-primary/40"><Mail className="size-4" /></div> {store.email_boutique}
                                    </span>
                                )}
                                {store.telephone_boutique && (
                                    <span className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group/link">
                                        <div className="p-2 rounded-lg border-2 border-border group-hover/link:border-primary/40"><Phone className="size-4" /></div> {store.telephone_boutique}
                                    </span>
                                )}
                                <span className="flex items-center gap-3 hover:text-primary transition-colors cursor-pointer group/link">
                                    <div className="p-2 rounded-lg border-2 border-border group-hover/link:border-primary/40"><MapPin className="size-4" /></div> Conakry, Guinée
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 shrink-0 relative lg:pt-0 pt-8">
                            <div className="glass-card text-center px-10 py-6 rounded-[2rem] border-4 border-border shadow-premium group/stat hover:border-primary/40 transition-all">
                                <p className="text-4xl font-black italic tracking-tighter text-foreground group-hover:scale-110 transition-transform">{products.length}</p>
                                <p className="text-executive-label font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-2 leading-none pt-0.5 italic">UNITÉS D'ACTIFS</p>
                            </div>
                            <div className="glass-card text-center px-10 py-6 rounded-[2rem] border-4 border-border shadow-premium group/stat hover:border-amber-500/40 transition-all">
                                <div className="flex items-center gap-3 justify-center mb-2">
                                    <Star className="size-6 fill-amber-500 text-amber-500 animate-pulse" />
                                    <p className="text-4xl font-black italic tracking-tighter text-foreground group-hover:scale-110 transition-transform">4.8</p>
                                </div>
                                <p className="text-executive-label font-black uppercase tracking-[0.2em] text-muted-foreground/40 leading-none pt-0.5 italic">INDICE DE CONFIANCE</p>
                            </div>
                        </div>
                    </div>

                    {/* ══ ONGLETS EXÉCUTIFS ══ */}
                    <div className="border-b-4 border-border flex items-center gap-12 mb-16 relative">
                        {[
                            { key: 'produits', label: `CATALOGUE D'ACTIFS (${products.length})`, icon: Package },
                            { key: 'avis', label: 'INDICE DE SATISFACTION', icon: Star },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'pb-8 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative italic group/tab',
                                    activeTab === tab.key
                                        ? 'text-primary scale-110'
                                        : 'text-muted-foreground/40 hover:text-foreground'
                                )}
                            >
                                <tab.icon className={cn("size-5 group-hover/tab:rotate-6 transition-transform", activeTab === tab.key && "animate-pulse")} /> 
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-primary rounded-full animate-in slide-in-from-left duration-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ══ CONTENU ONGLETS ══ */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {activeTab === 'produits' && (
                            products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                                </div>
                            ) : (
                                <div className="py-40 flex flex-col items-center gap-10 text-center glass-card rounded-[4rem] border-4 border-dashed border-border group">
                                    <div className="size-32 rounded-[2.5rem] bg-muted/10 flex items-center justify-center border-4 border-dashed border-border group-hover:border-primary/20 transition-all hover:rotate-12 duration-700">
                                        <Package className="size-16 text-muted-foreground/10 group-hover:text-primary/20 transition-colors" />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Catalogue en Déploiement</h3>
                                        <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs italic italic border-r-8 border-primary/20 pr-10 text-right max-w-lg mx-auto">
                                            Cette entité est actuellement en phase de restructuration de stocks. Revenez ultérieurement pour les nouvelles acquisitions.
                                        </p>
                                    </div>
                                    <Link to="/catalog">
                                        <Button variant="outline" className="h-16 px-10 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-[10px] italic border-4 border-border hover:border-primary/50 hover:text-primary transition-all">
                                            EXPLORER LE HUB GÉNÉRAL
                                        </Button>
                                    </Link>
                                </div>
                            )
                        )}

                        {activeTab === 'avis' && (
                            <div className="py-32 flex flex-col items-center gap-10 text-center glass-card rounded-[4rem] border-4 border-border shadow-premium">
                                <div className="size-28 rounded-[2rem] bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center animate-bounce shadow-inner">
                                    <Star className="size-14 text-amber-500 fill-amber-500/40" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black italic tracking-tighter text-foreground uppercase">Archives de Satisfaction en Attente</h3>
                                    <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs italic italic border-l-8 border-amber-500/20 pl-10 max-w-lg mx-auto text-left">
                                        Aucun rapport de performance n'a été émis par les auditeurs externes (clients) pour cette période opérationnelle.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default StorePage;
