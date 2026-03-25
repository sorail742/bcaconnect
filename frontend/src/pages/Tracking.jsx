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
    ExternalLink
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
        } catch (err) {
            console.error("Erreur tracking:", err);
            setOrder(null);
            setHasError(true);
            toast.error("Commande introuvable. Vérifiez votre numéro.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeline = (order) => {
        if (!order) return [];

        const steps = [
            { status: 'Commande confirmée', date: new Date(order.createdAt).toLocaleDateString(), desc: 'Paiement reçu et validé.', completed: true, current: order.statut === 'payé' },
            { status: 'Préparation', date: order.statut === 'expédié' || order.statut_livraison ? 'Terminé' : 'En cours', desc: 'Le vendeur rassemble vos articles.', completed: order.statut !== 'payé', current: false },
            { status: 'Expédié / Ramassé', date: order.statut_livraison ? 'En route' : '---', desc: 'Le colis a été remis au transporteur.', completed: !!order.statut_livraison, current: order.statut_livraison === 'en_cours' },
            { status: 'Livré', date: order.statut_livraison === 'livré' ? 'Finalisé' : '---', desc: 'Le colis vous a été remis.', completed: order.statut_livraison === 'livré', current: false },
        ];
        return steps;
    };

    const timeline = getTimeline(order);

    return (
        <PublicLayout>
            <div className="w-full space-y-12 animate-in fade-in duration-1000 font-inter pb-24 px-6 md:px-10 max-w-7xl mx-auto pt-16">
                {/* ══════════════════════════════════════════════════
                    SECTION 1 — LOGISTICS HUB HEADER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-5 border-b border-slate-100 dark:border-slate-800 pb-12">
                    <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Dispatch & Logistics Center</span>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.9]">
                                Suivi de <span className="text-primary italic">Livraison.</span>
                            </h1>
                            <p className="text-slate-500 text-sm font-bold max-w-2xl leading-relaxed">
                                Localisez vos actifs BCA en temps réel. Notre réseau de distribution sécurisé assure une transparence totale de l'entrepôt à votre point de chute.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 — SEARCH INTERFACE
                ══════════════════════════════════════════════════ */}
                <div className="relative py-16 px-12 rounded-[3.5rem] bg-slate-950 border border-white/10 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] group">
                    <div className="absolute top-0 right-0 size-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48 group-hover:bg-primary/20 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 size-64 bg-slate-500/5 rounded-full blur-[80px] -ml-32 -mb-32" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-10 max-w-4xl mx-auto">
                        <div className="space-y-3">
                             <div className="flex justify-center flex-wrap gap-2 mb-4">
                                 {['Aérien', 'Maritime', 'Terrestre'].map((mod, i) => (
                                     <span key={i} className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em] border border-white/10 px-3 py-1 rounded-full">{mod}</span>
                                 ))}
                             </div>
                             <h3 className="text-2xl font-black text-white italic tracking-tight">Activez votre terminal de suivi</h3>
                        </div>
                        
                        <div className="w-full group/input relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 size-6 group-focus-within/input:text-primary transition-colors" />
                            <input
                                className="w-full pl-16 pr-10 h-20 bg-white/5 border border-white/10 text-white text-xl rounded-[2rem] placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-black tracking-widest italic uppercase shadow-inner"
                                placeholder="SAISISSEZ LE N° D'EXPERTISE (ID)"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute right-4 top-4 bottom-4">
                                <Button 
                                    onClick={handleSearch} 
                                    disabled={isLoading} 
                                    className="h-full px-12 rounded-[1.2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-105 transition-transform bg-primary hover:bg-primary/90 text-white border-0"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Scanning...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Navigation className="size-4 rotate-45" />
                                            <span>Localiser</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start animate-in slide-in-from-bottom-5 duration-700">
                        {/* ══════════════════════════════════════════════════
                            ASSET INFORMATION CARD
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-1 p-10 rounded-[2.5rem] border-2 border-primary/20 bg-white dark:bg-slate-900 shadow-2xl relative overflow-hidden group/card h-fit">
                            <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/card:bg-primary/10 transition-colors" />
                            
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="size-4 text-primary" />
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Actif Sécurisé</p>
                                        </div>
                                        <h4 className="text-2xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Votre Colis</h4>
                                    </div>
                                    <StatusBadge status={order.statut_livraison || order.statut} className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 shadow-lg" />
                                </div>

                                <div className="py-8 border-y border-slate-100 dark:border-slate-800 space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                            <MapPin className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Point de Terminaison</p>
                                            <p className="font-black text-slate-900 dark:text-white text-sm italic tracking-tight uppercase leading-tight">{order.nom_destinataire}</p>
                                            <p className="text-xs text-slate-500 font-bold mt-1 line-clamp-2">{order.adresse_livraison || 'Lieu-dit non spécifié'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-5">
                                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                            <Truck className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Opérateur Logistique</p>
                                            <p className="font-black text-slate-900 dark:text-white text-sm italic tracking-tight uppercase">BCA Express (Elite Division)</p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                 <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Opérationnel</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                     <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Réf. Expertise</span>
                                         <span className="text-[11px] font-black text-slate-900 dark:text-white tracking-widest">#{(order.id || '').toUpperCase().slice(0, 12)}</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════
                            REAL-TIME TIMELINE
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-2 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl p-12 lg:p-16 relative overflow-hidden">
                            <div className="absolute top-0 left-0 size-64 bg-slate-500/5 rounded-full blur-[100px] -ml-32 -mt-32" />
                            
                            <div className="relative space-y-12">
                                <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                                
                                {timeline.map((step, idx) => (
                                    <div key={idx} className={cn("relative flex items-start gap-10 transition-all duration-700", !step.completed && "opacity-30")}>
                                        <div className={cn(
                                            "z-10 size-12 rounded-full flex items-center justify-center border-[4px] transition-all duration-500",
                                            step.current ? "bg-primary border-primary shadow-[0_0_30px_rgba(234,88,12,0.4)] scale-125" :
                                                step.completed ? "bg-white dark:bg-slate-900 border-emerald-500 text-emerald-500" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300"
                                        )}>
                                            {step.completed ? <CheckCircle2 className="size-6" /> : <Clock className={cn("size-6", step.current && "animate-spin-slow text-white")} />}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <p className={cn("text-xl font-black italic tracking-tighter uppercase", step.current ? "text-primary italic animate-out fade-in duration-500" : "text-slate-900 dark:text-white")}>
                                                    {step.status}
                                                </p>
                                                {step.date !== '---' && (
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800",
                                                        step.current ? "bg-primary text-white border-primary" : "text-slate-400"
                                                    )}>
                                                        {step.date}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 font-bold leading-relaxed max-w-xl italic">{step.desc}</p>
                                            
                                            {step.current && (
                                                <div className="mt-6 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4 animate-in slide-in-from-left-4">
                                                     <div className="size-2 rounded-full bg-primary animate-ping" />
                                                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Dernière mise à jour : Transmission satellite en cours</p>
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
                        <div className="py-24 text-center max-w-2xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-1000">
                            <div className="relative inline-block">
                                <Package className="size-32 mx-auto text-slate-200 dark:text-slate-800" />
                                <Search className="absolute -bottom-4 -right-4 size-16 text-primary animate-bounce shadow-2xl rounded-full bg-white dark:bg-slate-950 p-3 border border-slate-100 dark:border-slate-800" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-4xl font-black italic text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Prêt à localiser ?</h3>
                                <p className="text-slate-500 font-bold text-sm max-w-md mx-auto leading-relaxed">
                                    Utilisez le numéro d'expertise unique reçu lors de votre confirmation pour activer le suivi en direct de vos actifs.
                                </p>
                            </div>
                            <div className="flex justify-center gap-4 pt-4">
                                <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 dark:bg-slate-900 rounded-full border border-slate-100 dark:border-slate-800">
                                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Système Opérationnel</span>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </PublicLayout>
    );
};

export default DeliveryTracking;
