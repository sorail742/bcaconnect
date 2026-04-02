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
                const data = await storeService.getBySlug(slug);
                if (!data) { setNotFound(true); return; }
                setStore(data);
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
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-12 animate-in fade-in duration-700 bg-[#0A0D14]">
                    <div className="relative">
                        <div className="size-32 rounded-[2rem] border-8 border-[#FF6600]/20 border-t-[#FF6600] animate-spin shadow-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Store className="size-12 text-[#FF6600]/40" />
                        </div>
                    </div>
                    <div className="space-y-4 text-center">
                        <span className="text-[10px] font-black text-[#FF6600] uppercase tracking-[0.5em] italic block">Cryptage Terminal...</span>
                        <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Connexion au Hub Marchand.</h2>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    if (notFound || !store) {
        return (
            <PublicLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center gap-10 text-center px-6 animate-in zoom-in-95 duration-700 bg-[#0A0D14]">
                    <div className="size-32 rounded-[2.5rem] bg-red-500/10 border-4 border-red-500/20 flex items-center justify-center shadow-inner relative group">
                        <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <AlertCircle className="size-16 text-red-500 relative z-10 animate-bounce" />
                    </div>
                    <div className="space-y-6 max-w-2xl">
                        <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">Boutique <span className="text-red-500 not-italic">Introuvable.</span></h1>
                        <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-sm italic leading-relaxed border-r-8 border-red-500/20 pr-10 text-right">
                            Cette entité n'existe pas dans notre registre ou son accréditation a été suspendue. Explorez nos autres partenaires stratégiques.
                        </p>
                    </div>
                    <Link to="/vendors">
                        <Button className="h-20 px-12 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs gap-4 bg-[#FF6600] hover:bg-[#FF6600] text-white shadow-2xl shadow-[#FF6600]/30 transition-all hover:scale-105 active:scale-95 italic leading-none">
                            VOIR TOUS LES MARCHANDS <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter pb-32">
                {/* ══ HERO BOUTIQUE / BANNER ══ */}
                <div className="relative h-96 md:h-[35rem] overflow-hidden group">
                    <div className="absolute inset-0 bg-[#0F1219]">
                        {store.logo_url && (
                            <img src={store.logo_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 blur-2xl scale-110 group-hover:scale-100 transition-transform duration-[4s]" />
                        )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/40 to-transparent" />
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF6600_1.5px,transparent_1.5px)] bg-[size:48px_48px]" />

                    {/* Floating HUD elements */}
                    <div className="absolute top-12 right-12 flex flex-col items-end gap-4 z-20">
                        <div className="px-6 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] font-black italic tracking-[0.3em] uppercase">BCA NETWORK v4.2</div>
                    </div>

                    <div className="absolute -bottom-24 left-8 md:left-24 flex items-end gap-10 z-30">
                        {/* Avatar boutique */}
                        <div className="size-48 md:size-64 rounded-[3rem] border-8 border-[#0A0D14] bg-[#0F1219] shadow-2xl flex items-center justify-center overflow-hidden relative group/avatar transition-all hover:border-[#FF6600]/30">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6600]/20 via-transparent to-[#FF6600]/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                            {store.logo_url
                                ? <img src={store.logo_url} alt={store.nom_boutique} className="w-full h-full object-cover transition-transform duration-[2s] group-hover/avatar:scale-110" />
                                : <Store className="size-24 text-[#FF6600]/20" />
                            }
                        </div>
                    </div>
                </div>

                {/* ══ INFO BOUTIQUE / EXECUTIVE DASH ══ */}
                <div className="max-w-7xl mx-auto px-6 md:px-12 pt-40">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-16 mb-24">
                        <div className="space-y-10 max-w-4xl">
                            <div className="flex items-center gap-6 flex-wrap">
                                <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8] mb-2">
                                    {store.nom_boutique}
                                </h1>
                                <div className="p-1 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 translate-y-2">
                                    <div className="flex items-center gap-3 px-6 py-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-[0.4em] rounded-full italic">
                                        <ShieldCheck className="size-4 animate-pulse" /> ACCRÉDITÉ BCA
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm leading-relaxed italic border-l-8 border-[#FF6600]/20 pl-10 max-w-3xl">
                                {store.description || "Une entité stratégique reconnue pour son excellence opérationnelle et la qualité irréprochable de ses actifs commerciaux."}
                            </p>
                            <div className="flex items-center gap-10 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] italic flex-wrap pt-6">
                                {store.email_boutique && (
                                    <span className="flex items-center gap-4 hover:text-[#FF6600] transition-colors cursor-pointer group/link">
                                        <div className="p-2.5 rounded-xl border-2 border-white/5 bg-white/[0.02] group-hover/link:border-[#FF6600]/40 transition-all"><Mail className="size-4" /></div> {store.email_boutique}
                                    </span>
                                )}
                                {store.telephone_boutique && (
                                    <span className="flex items-center gap-4 hover:text-[#FF6600] transition-colors cursor-pointer group/link">
                                        <div className="p-2.5 rounded-xl border-2 border-white/5 bg-white/[0.02] group-hover/link:border-[#FF6600]/40 transition-all"><Phone className="size-4" /></div> {store.telephone_boutique}
                                    </span>
                                )}
                                <span className="flex items-center gap-4 hover:text-[#FF6600] transition-colors cursor-pointer group/link">
                                    <div className="p-2.5 rounded-xl border-2 border-white/5 bg-white/[0.02] group-hover/link:border-[#FF6600]/40 transition-all"><MapPin className="size-4" /></div> CONAKRY, GUINÉE
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-8 shrink-0 relative lg:pt-0 pt-8">
                            <div className="bg-white/[0.02] backdrop-blur-xl text-center px-10 py-8 rounded-[2.5rem] border-4 border-white/5 shadow-2xl group/stat hover:border-[#FF6600]/40 transition-all">
                                <p className="text-5xl font-black italic tracking-tighter text-white group-hover:scale-110 transition-transform">{products.length}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mt-2 leading-none italic">UNITÉS D'ACTIFS</p>
                            </div>
                            <div className="bg-white/[0.02] backdrop-blur-xl text-center px-10 py-8 rounded-[2.5rem] border-4 border-white/5 shadow-2xl group/stat hover:border-amber-500/40 transition-all">
                                <div className="flex items-center gap-3 justify-center mb-3">
                                    <Star className="size-7 fill-amber-500 text-amber-500 animate-pulse" />
                                    <p className="text-5xl font-black italic tracking-tighter text-white group-hover:scale-110 transition-transform">4.9</p>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none italic">INDICE DE CONFIANCE</p>
                            </div>
                        </div>
                    </div>

                    {/* ══ ONGLETS EXÉCUTIFS ══ */}
                    <div className="border-b-4 border-white/5 flex items-center gap-16 mb-20 relative overflow-x-auto scrollbar-hide">
                        {[
                            { key: 'produits', label: `CATALOGUE D'ACTIFS (${products.length})`, icon: Package },
                            { key: 'avis', label: 'INDEX DE SATISFACTION', icon: Star },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={cn(
                                    'pb-10 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative italic group/tab whitespace-nowrap',
                                    activeTab === tab.key
                                        ? 'text-[#FF6600] scale-110'
                                        : 'text-slate-600 hover:text-white'
                                )}
                            >
                                <tab.icon className={cn("size-5 group-hover/tab:rotate-12 transition-transform", activeTab === tab.key && "animate-pulse")} />
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-2 bg-[#FF6600] rounded-full animate-in slide-in-from-left duration-500" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ══ CONTENU ONGLETS ══ */}
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        {activeTab === 'produits' && (
                            products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                                    {products.map(p => <ProductCard key={p.id} product={p} />)}
                                </div>
                            ) : (
                                <div className="py-48 flex flex-col items-center gap-12 text-center bg-white/[0.02] rounded-[4rem] border-4 border-dashed border-white/5 group">
                                    <div className="size-36 rounded-[3rem] bg-white/5 flex items-center justify-center border-4 border-dashed border-white/5 group-hover:border-[#FF6600]/20 transition-all hover:rotate-12 duration-1000">
                                        <Package className="size-16 text-slate-800 group-hover:text-[#FF6600]/20 transition-colors" />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-5xl font-black italic tracking-tighter text-white uppercase">Catalogue en Déploiement</h3>
                                        <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs italic border-r-8 border-[#FF6600]/20 pr-10 text-right max-w-lg mx-auto leading-relaxed">
                                            Cette entité est actuellement en phase de restructuration stratégique de ses flux d'actifs. Revenez ultérieurement pour les nouvelles acquisitions.
                                        </p>
                                    </div>
                                    <Link to="/marketplace">
                                        <Button className="h-20 px-12 rounded-[1.5rem] bg-transparent border-4 border-white/10 hover:border-[#FF6600] hover:text-[#FF6600] text-white font-black uppercase tracking-[0.3em] text-[10px] italic transition-all shadow-xl">
                                            EXPLORER LE HUB GÉNÉRAL
                                        </Button>
                                    </Link>
                                </div>
                            )
                        )}

                        {activeTab === 'avis' && (
                            <div className="py-48 flex flex-col items-center gap-12 text-center bg-white/[0.02] rounded-[4rem] border-4 border-white/5 shadow-2xl">
                                <div className="size-36 rounded-[3rem] bg-amber-500/10 border-4 border-amber-500/20 flex items-center justify-center animate-bounce shadow-inner">
                                    <Star className="size-16 text-amber-500 fill-amber-500/40" />
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-5xl font-black italic tracking-tighter text-white uppercase">Archives de Satisfaction</h3>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs italic border-l-8 border-amber-500/20 pl-10 max-w-lg mx-auto text-left leading-relaxed">
                                        Aucun rapport de performance critique n'a été émis par les auditeurs externes pour cette période opérationnelle. Excellence par défaut.
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
