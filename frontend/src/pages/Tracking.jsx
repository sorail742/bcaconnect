import React, { useState, useEffect } from 'react';
import PublicLayout from '../components/layout/PublicLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import {
    Search,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    MapPin,
    Navigation,
    Phone,
    ShieldCheck,
    ChevronDown,
    ExternalLink,
    Sparkles,
    Satellite,
    Activity,
    Zap,
    Fingerprint,
    ShieldAlert,
    Radar
} from 'lucide-react';
import { cn } from '../lib/utils';
import orderService from '../services/orderService';
import { toast } from 'sonner';

const DeliveryTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleSearch = async () => {
        if (!trackingNumber.trim()) return;

        setIsLoading(true);
        setHasError(false);
        try {
            const data = await orderService.getById(trackingNumber.trim());
            setOrder(data);
            toast.success("CONNEXION ÉTABLIE. FLUX DÉTECTÉ.");
        } catch (err) {
            console.error("Erreur tracking:", err);
            setOrder(null);
            setHasError(true);
            toast.error("UNITÉ DE TRAÇAGE INTROUVABLE. CODE D'EXPERTISE INVALIDE.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeline = (order) => {
        if (!order) return [];

        const steps = [
            { status: 'ORDRE CONFIRMÉ', date: new Date(order.createdAt).toLocaleDateString(), desc: 'PROTOCOLE DE PAIEMENT VALIDÉ ET CHIFFRÉ.', completed: true, current: order.statut === 'payé' },
            { status: 'PRÉPARATION STRATÉGIQUE', date: (order.statut === 'expédié' || order.statut_livraison) ? 'SCELLÉ' : 'EN COURS', desc: 'LE CENTRE LOGISTIQUE PRÉPARE VOS ACTIFS POUR LE TRANSIT.', completed: order.statut !== 'payé' && order.statut !== 'en_attente_paiement', current: false },
            { status: 'TRANSIT OPÉRATIONNEL', date: order.statut_livraison ? 'EN ROUTE' : 'EN ATTENTE', desc: 'TRANSFERT SÉCURISÉ VERS LE POINT DE CHUTE FINAL.', completed: !!order.statut_livraison, current: order.statut_livraison === 'en_cours' },
            { status: 'TERMINAISON / LIVRÉ', date: order.statut_livraison === 'livré' ? 'LIVRÉ' : '---', desc: 'REMISE EN MAIN PROPRE EFFECTUÉE. DOSSIER CLOS.', completed: order.statut_livraison === 'livré', current: false },
        ];
        return steps;
    };

    const timeline = getTimeline(order);

    return (
        <PublicLayout>
            <div className="bg-[#0A0D14] min-h-screen text-white font-inter relative overflow-hidden">
                <div className="absolute top-0 right-0 size-[80rem] bg-[#FF6600]/5 rounded-full blur-[200px] -mr-96 -mt-96 pointer-events-none" />
                <div className="absolute bottom-0 left-0 size-[60rem] bg-blue-500/5 rounded-full blur-[200px] -ml-96 -mb-96 pointer-events-none opacity-20" />

                <div className="w-full space-y-32 animate-in fade-in duration-1000 pb-64 px-8 md:px-16 max-w-7xl mx-auto pt-48 relative z-10">

                    {/* Section 1: Strategic Header */}
                    <div className="flex flex-col gap-16 border-b-4 border-white/5 pb-24 group">
                        <div className="flex items-center gap-6">
                            <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.6)]" />
                            <span className="text-[12px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-1">HUB LOGISTIQUE EXÉCUTIF v3.0 // ALPHA</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-end">
                            <div className="space-y-12">
                                <h1 className="text-8xl md:text-[12rem] font-black tracking-tighter leading-[0.8] uppercase italic text-white group-hover:scale-105 transition-transform duration-1000">
                                    LOCALISER <br />
                                    <span className="text-[#FF6600] not-italic drop-shadow-[0_0_50px_rgba(255,102,0,0.3)]">ACTIFS.</span>
                                </h1>
                                <p className="text-slate-500 text-lg md:text-xl font-black uppercase tracking-[0.4em] max-w-2xl leading-relaxed italic border-l-[16px] border-[#FF6600] pl-16 text-left">
                                    SYNCHRONISATION EN TEMPS RÉEL AVEC LE RÉSEAU DE DISTRIBUTION BCA. TRANSPARENCE ABSOLUE DE L'ENTREPÔT À VOTRE TERMINAL.
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border-4 border-white/5 flex flex-col items-center gap-4 shadow-3xl group/box hover:border-[#FF6600]/40 transition-all duration-700">
                                        <Radar className="size-8 text-[#FF6600] group-hover/box:rotate-180 transition-transform duration-1000" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.5em] italic">GÉO-SCANNAGE</span>
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border-4 border-white/5 flex flex-col items-center gap-4 shadow-3xl group/box hover:border-[#FF6600]/40 transition-all duration-700">
                                        <Zap className="size-8 text-emerald-500" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.5em] italic">TRAITEMENT PRO</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Search Terminal */}
                    <div className="relative p-16 md:p-32 rounded-[5rem] bg-black border-[12px] border-[#FF6600]/10 overflow-hidden shadow-[0_0_100px_rgba(255,102,0,0.1)] group/search">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 group-hover/search:opacity-20 transition-opacity duration-1000" />
                        <div className="absolute top-0 right-0 size-[60rem] bg-[#FF6600]/10 rounded-full blur-[200px] -mr-64 -mt-64 group-hover/search:scale-125 transition-transform duration-[4s]" />

                        <div className="relative z-10 flex flex-col items-center text-center gap-24 max-w-5xl mx-auto">
                            <div className="space-y-8">
                                <h3 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">TERMINAL DE LOCALISATION <br /> <span className="text-[#FF6600] not-italic">STRATÉGIQUE.</span></h3>
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] italic">SYSTÈME D'INDEXATION QUANTIQUE BCA EXÉCUTIF</p>
                            </div>

                            <div className="w-full group/input relative">
                                <div className="absolute inset-0 bg-[#FF6600]/10 blur-3xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-1000" />
                                <Search className="absolute left-12 top-1/2 -translate-y-1/2 text-slate-900 size-14 group-focus-within/input:text-[#FF6600] group-focus-within/input:scale-125 transition-all duration-700 relative z-10" />
                                <input
                                    className="w-full pl-36 pr-24 h-36 bg-white/[0.02] border-8 border-white/5 text-white text-3xl md:text-5xl rounded-[3.5rem] placeholder:text-slate-900 focus:outline-none focus:border-[#FF6600]/60 focus:bg-black/50 focus:ring-0 transition-all font-black tracking-[0.2em] italic uppercase shadow-3xl relative z-10"
                                    placeholder="UUID D'EXPERTISE..."
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <div className="absolute right-10 top-1/2 -translate-y-1/2 z-20">
                                    <button
                                        onClick={handleSearch}
                                        disabled={isLoading}
                                        className="h-24 px-16 rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm shadow-3xl bg-[#FF6600] hover:bg-black text-white border-0 group/btn relative overflow-hidden transition-all duration-700 hover:scale-105 active:scale-95 italic flex items-center justify-center gap-8"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                        {isLoading ? (
                                            <div className="size-10 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Radar className="size-10 group-hover/btn:rotate-180 transition-transform duration-1000" />
                                        )}
                                        <span className="leading-none pt-1">{isLoading ? 'SCANNAGE...' : 'LOCALISER'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {order ? (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start animate-in slide-in-from-bottom-16 duration-1000">
                            {/* Section 3: Asset Information Card */}
                            <div className="lg:col-span-4 p-16 rounded-[4.5rem] bg-white/[0.01] border-4 border-white/5 shadow-3xl hover:border-[#FF6600]/20 transition-all duration-1000 relative overflow-hidden group/card h-fit">
                                <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover/card:scale-125 transition-transform duration-[4s]" />

                                <div className="space-y-16 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="size-3 rounded-full bg-[#FF6600] animate-pulse" />
                                                <p className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.6em] italic leading-none pt-1">ACTIF SÉCURISÉ</p>
                                            </div>
                                            <h4 className="text-5xl font-black italic text-white tracking-tighter uppercase leading-none">FLUX <br /> <span className="text-[#FF6600]">INDEXÉ.</span></h4>
                                        </div>
                                        <StatusBadge status={order.statut_livraison || order.statut} className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] border-2 border-white/10 shadow-3xl bg-white/5 text-white italic" />
                                    </div>

                                    <div className="py-16 border-y-4 border-white/5 space-y-16">
                                        <div className="flex items-start gap-10 group/item">
                                            <div className="size-20 rounded-[1.5rem] bg-black border-4 border-white/5 flex items-center justify-center group-hover/item:border-[#FF6600]/40 group-hover/item:rotate-12 transition-all duration-700 shadow-3xl">
                                                <MapPin className="size-10 text-slate-800 group-hover/item:text-[#FF6600] transition-all" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic leading-none pt-1">DESTINATION FINALE</p>
                                                <p className="font-black text-white text-2xl italic tracking-tighter uppercase leading-none">{order.nom_destinataire}</p>
                                                <p className="text-xs text-slate-600 font-extrabold mt-4 line-clamp-2 italic leading-relaxed uppercase tracking-[0.2em] border-l-8 border-[#FF6600]/20 pl-8">{order.adresse_livraison}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-10 group/item">
                                            <div className="size-20 rounded-[1.5rem] bg-black border-4 border-white/5 flex items-center justify-center group-hover/item:border-emerald-500/40 group-hover/item:rotate-12 transition-all duration-700 shadow-3xl">
                                                <Truck className="size-10 text-slate-800 group-hover/item:text-emerald-500 transition-all" />
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 italic leading-none pt-1">LOGISTICIEN ACCRÉDITÉ</p>
                                                <p className="font-black text-white text-2xl italic tracking-tighter uppercase leading-none">BCA EXPRESS ELITE</p>
                                                <div className="flex items-center gap-4 mt-6">
                                                    <div className="size-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.5em] italic leading-none pt-1">INDEXATION ACTIVE H-24</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <div className="p-12 rounded-[3.5rem] bg-black border-4 border-white/5 flex flex-col items-center gap-6 shadow-3xl group/ref hover:border-[#FF6600]/40 transition-all duration-700">
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] italic leading-none pt-1">RÉF. EXPERTISE</span>
                                                <Fingerprint className="size-6 text-[#FF6600] opacity-40 group-hover/ref:opacity-100 transition-opacity" />
                                            </div>
                                            <span className="text-2xl font-black text-white tracking-[0.3em] uppercase group-hover/ref:text-[#FF6600] transition-colors">#{(order.id || '').toUpperCase().slice(0, 12)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Real-time Timeline */}
                            <div className="lg:col-span-8 bg-white/[0.01] border-[16px] border-white/5 rounded-[5rem] shadow-3xl p-16 lg:p-24 relative overflow-hidden group/timeline">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
                                <div className="absolute top-0 left-0 size-[50rem] bg-[#FF6600]/5 rounded-full blur-[150px] -ml-64 -mt-64 transition-all duration-[4s] group-hover/timeline:bg-[#FF6600]/10" />

                                <div className="relative space-y-24">
                                    <div className="absolute left-[46px] top-12 bottom-12 w-2 bg-white/5 rounded-full"></div>

                                    {timeline.map((step, idx) => (
                                        <div key={idx} className={cn("relative flex items-start gap-24 transition-all duration-1000", !step.completed && "opacity-10 grayscale", step.current && "opacity-100 grayscale-0")}>
                                            <div className={cn(
                                                "z-10 size-24 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-1000 shadow-3xl relative",
                                                step.current ? "bg-[#FF6600] border-[#FF6600] shadow-[0_0_60px_rgba(255,102,0,0.5)] scale-125 z-20" :
                                                    step.completed ? "bg-black border-emerald-500/40 text-emerald-500" : "bg-black border-white/5 text-slate-900"
                                            )}>
                                                {step.current && <div className="absolute inset-0 bg-white rounded-[2rem] animate-ping opacity-20 scale-150" />}
                                                {step.completed ? <CheckCircle2 className="size-12 animate-in zoom-in-50 duration-700" /> : <Clock className={cn("size-12", step.current && "animate-spin-slow text-white")} />}
                                            </div>
                                            <div className="flex-1 space-y-10">
                                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10">
                                                    <div className="space-y-6">
                                                        <p className={cn("text-5xl md:text-6xl font-black italic tracking-tighter uppercase leading-none pt-2", step.current ? "text-[#FF6600]" : "text-white")}>
                                                            {step.status}
                                                        </p>
                                                        <p className="text-sm text-slate-600 font-extrabold uppercase tracking-[0.4em] italic max-w-2xl leading-relaxed border-l-8 border-[#FF6600]/20 pl-12">{step.desc}</p>
                                                    </div>
                                                    {step.date !== '---' && (
                                                        <div className={cn(
                                                            "inline-flex items-center gap-8 px-12 py-8 rounded-[2.5rem] border-4 transition-all duration-1000 h-fit shrink-0 font-black italic shadow-3xl",
                                                            step.current ? "bg-white text-black border-white" : "bg-black border-white/5 text-slate-700"
                                                        )}>
                                                            <Activity className={cn("size-6", step.current ? "animate-pulse text-[#FF6600]" : "opacity-20")} />
                                                            <span className="text-xs uppercase tracking-[0.5em] leading-none pt-1">{step.date}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {step.current && (
                                                    <div className="mt-16 p-12 rounded-[3rem] bg-black border-x-[16px] border-[#FF6600] flex items-center gap-10 animate-in slide-in-from-left-16 duration-1000 group/update shadow-3xl">
                                                        <div className="size-6 rounded-full bg-[#FF6600] animate-ping shadow-[0_0_30px_rgba(255,102,0,0.6)]" />
                                                        <div className="space-y-2">
                                                            <p className="text-[11px] font-black text-[#FF6600] uppercase tracking-[0.8em] italic leading-none pt-1">INDEXATION SATELLITE ACTIVE</p>
                                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic">TRANSMISSION VIA BCA NETWORK v5.0.2</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        !isLoading && !hasError && (
                            <div className="py-48 text-center max-w-6xl mx-auto space-y-32 animate-in fade-in zoom-in-95 duration-1000">
                                <div className="relative inline-block group">
                                    <div className="absolute inset-x-0 bottom-0 h-12 mt-32 bg-[#FF6600]/10 rounded-full blur-[120px] scale-150 animate-pulse" />
                                    <div className="relative p-32 bg-white/[0.01] border-[12px] border-white/5 rounded-[6rem] shadow-3xl group-hover:scale-105 group-hover:border-[#FF6600]/20 transition-all duration-1000">
                                        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
                                        <Package className="size-80 mx-auto text-[#0A0D14] group-hover:text-[#FF6600]/20 transition-all duration-1000 relative z-10" />
                                        <div className="absolute -bottom-16 -right-16 size-48 text-[#FF6600] shadow-3xl rounded-[3.5rem] bg-black p-12 border-[12px] border-[#FF6600]/20 group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 z-20">
                                            <Search className="size-full animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-12 animate-in slide-in-from-bottom-20 duration-1000 delay-300">
                                    <h3 className="text-7xl md:text-[10rem] font-black italic text-white tracking-tighter uppercase leading-[0.8]">INITIALISER LE <br /><span className="text-[#FF6600] not-italic">SCANNAGE.</span></h3>
                                    <p className="text-slate-500 font-black uppercase tracking-[0.6em] text-lg max-w-4xl mx-auto leading-relaxed italic border-r-[24px] border-[#FF6600] pr-20 text-right">
                                        UTILISEZ L'IDENTIFIANT D'EXPERTISE UNIQUE SCELLÉ DANS VOTRE CONFIRMATION POUR ACTIVER LE TRAÇAGE SATELLITE DE VOS ACTIFS STRATÉGIQUES.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-12 pt-20">
                                    <div className="flex items-center gap-8 px-16 py-8 bg-black rounded-full border-4 border-white/5 shadow-3xl group/system hover:border-emerald-500/40 transition-all duration-700 cursor-default">
                                        <div className="size-5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_30px_rgba(16,185,129,0.7)]" />
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="text-[11px] font-black text-white uppercase tracking-[0.6em] italic leading-none pt-1">RÉSEAU LOGISTIQUE OPÉRATIONNEL</span>
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] italic leading-none pb-1">INDEXATION 24/7/365 SANS INTERRUPTION</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </PublicLayout>
    );
};

export default DeliveryTracking;
