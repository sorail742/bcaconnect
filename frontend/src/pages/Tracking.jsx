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
            toast.error("Unité de traçage introuvable. Code d'expertise invalide.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeline = (order) => {
        if (!order) return [];

        const steps = [
            { status: 'ORDRE CONFIRMÉ', date: new Date(order.createdAt).toLocaleDateString(), desc: 'Protocole de paiement validé et chiffré.', completed: true, current: order.statut === 'payé' },
            { status: 'PRÉPARATION STRATÉGIQUE', date: order.statut === 'expédié' || order.statut_livraison ? 'SCELLÉ' : 'EN COURS', desc: 'Le centre logistique prépare vos actifs pour le transit.', completed: order.statut !== 'payé', current: false },
            { status: 'TRANSIT OPÉRATIONNEL', date: order.statut_livraison ? 'EN ROUTE' : 'EN ATTENTE', desc: 'Transfert sécurisé vers le point de chute final.', completed: !!order.statut_livraison, current: order.statut_livraison === 'en_cours' },
            { status: 'TERMINAISON / LIVRÉ', date: order.statut_livraison === 'livré' ? 'LIVRÉ' : '---', desc: 'Remise en main propre effectuée. Dossier clos.', completed: order.statut_livraison === 'livré', current: false },
        ];
        return steps;
    };

    const timeline = getTimeline(order);

    return (
        <PublicLayout>
            <div className="w-full space-y-16 animate-in fade-in duration-1000 font-inter pb-40 px-6 md:px-12 max-w-7xl mx-auto pt-24">
                {/* ══════════════════════════════════════════════════
                    SECTION 1 — LOGISTICS HUB HEADER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-8 border-b-4 border-border pb-16">
                    <div className="flex items-center gap-4">
                        <div className="size-3 rounded-full bg-primary animate-ping" />
                        <span className="text-executive-label font-black text-primary uppercase tracking-[0.5em] italic leading-none pt-0.5">HUB LOGISTIQUE EXÉCUTIF v2.1</span>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter italic leading-[0.85] uppercase">
                                Traçage <br /> 
                                <span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">D'Actifs.</span>
                            </h1>
                            <p className="text-muted-foreground/60 text-sm font-black uppercase tracking-[0.4em] max-w-2xl leading-relaxed italic border-l-4 border-primary/20 pl-8">
                                Localisez vos flux BCA en temps réel. Notre infrastructure de distribution chiffrée assure une transparence totale de l'entrepôt à votre terminal.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 2 — SEARCH INTERFACE
                ══════════════════════════════════════════════════ */}
                <div className="relative py-24 px-12 md:px-20 rounded-[4rem] bg-foreground border-4 border-white/5 overflow-hidden shadow-premium-lg group">
                    <div className="absolute top-0 right-0 size-[40rem] bg-primary/10 rounded-full blur-[150px] -mr-64 -mt-64 group-hover:bg-primary/20 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 size-96 bg-white/5 rounded-full blur-[120px] -ml-48 -mb-48 opacity-20" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center gap-16 max-w-5xl mx-auto">
                        <div className="space-y-6">
                             <div className="flex justify-center flex-wrap gap-4 mb-8">
                                 {['AÉRIEN', 'MARITIME', 'TERRESTRE'].map((mod, i) => (
                                     <span key={i} className="text-executive-label font-black text-white/30 uppercase tracking-[0.4em] border-2 border-white/5 px-6 py-2 rounded-full hover:border-white/10 transition-colors cursor-default italic">{mod}</span>
                                 ))}
                             </div>
                             <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Terminal de Localisation Stratégique</h3>
                        </div>
                        
                        <div className="w-full group/input relative">
                            <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-white/20 size-8 group-focus-within/input:text-primary group-focus-within/input:scale-110 transition-all" />
                            <input
                                className="w-full pl-24 pr-12 h-28 bg-white/5 border-4 border-white/5 text-white text-2xl md:text-3xl rounded-[2.5rem] placeholder:text-white/10 focus:outline-none focus:border-primary/50 focus:ring-[12px] focus:ring-primary/5 transition-all font-black tracking-widest italic uppercase shadow-inner"
                                placeholder="IDENTIFIANT D'EXPERTISE (UUID)"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <div className="absolute right-6 top-6 bottom-6">
                                <Button 
                                    onClick={handleSearch} 
                                    disabled={isLoading} 
                                    className="h-full px-16 rounded-[1.5rem] font-black uppercase tracking-[0.4em] text-xs shadow-premium-lg shadow-primary/30 hover:scale-105 transition-all bg-primary hover:bg-primary text-white border-0 group/btn relative overflow-hidden active:scale-95"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    <div className="relative z-10 flex items-center gap-4">
                                        {isLoading ? (
                                            <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <Navigation className="size-6 rotate-45 group-hover/btn:rotate-90 transition-transform" />
                                        )}
                                        <span className="leading-none pt-1">{isLoading ? 'Scanning...' : 'Localiser'}</span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start animate-in slide-in-from-bottom-10 duration-1000">
                        {/* ══════════════════════════════════════════════════
                            ASSET INFORMATION CARD
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-4 p-12 rounded-[3.5rem] border-4 border-border bg-card shadow-premium hover:shadow-premium-lg transition-all duration-700 relative overflow-hidden group/card h-fit">
                            <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover/card:bg-primary/10 transition-colors duration-1000" />
                            
                            <div className="space-y-12 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="size-5 text-primary animate-pulse" />
                                            <p className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Actif Sécurisé v.Alpha</p>
                                        </div>
                                        <h4 className="text-4xl font-black italic text-foreground tracking-tighter uppercase leading-none">Données<br/>De Flux.</h4>
                                    </div>
                                    <StatusBadge status={order.statut_livraison || order.statut} className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border-4 shadow-premium italic" />
                                </div>

                                <div className="py-10 border-y-4 border-border space-y-10">
                                    <div className="flex items-start gap-8 group/item">
                                        <div className="size-16 rounded-[1.5rem] bg-background border-4 border-border flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white group-hover/item:rotate-6 transition-all duration-500 shadow-inner">
                                            <MapPin className="size-8 text-muted-foreground/30 group-hover/item:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none pt-0.5">Point de Terminaison</p>
                                            <p className="font-black text-foreground text-xl italic tracking-tighter uppercase leading-none">{order.nom_destinataire}</p>
                                            <p className="text-sm text-muted-foreground font-black mt-2 line-clamp-2 italic leading-relaxed uppercase tracking-widest">{order.adresse_livraison || 'TRANSIT KALAM / KALIDOU'}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-8 group/item">
                                        <div className="size-16 rounded-[1.5rem] bg-background border-4 border-border flex items-center justify-center group-hover/item:bg-primary group-hover/item:text-white group-hover/item:rotate-6 transition-all duration-500 shadow-inner">
                                            <Truck className="size-8 text-muted-foreground/30 group-hover/item:text-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic leading-none pt-0.5">Opérateur Logistique</p>
                                            <p className="font-black text-foreground text-xl italic tracking-tighter uppercase leading-none">BCA EXPRESS ELITE</p>
                                            <div className="flex items-center gap-3 mt-3">
                                                 <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                                                 <span className="text-executive-label font-black text-emerald-500 uppercase tracking-[0.4em] italic leading-none pt-0.5">Opérationnel H-24</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                     <div className="p-8 rounded-[2rem] bg-background border-4 border-border flex items-center justify-between shadow-inner group/ref hover:border-primary/30 transition-colors">
                                         <span className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic leading-none pt-0.5">Réf. Expertise</span>
                                         <span className="text-sm font-black text-foreground tracking-[0.3em] uppercase group-hover/ref:text-primary transition-colors">#{(order.id || '').toUpperCase().slice(0, 12)}</span>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* ══════════════════════════════════════════════════
                            REAL-TIME TIMELINE
                        ══════════════════════════════════════════════════ */}
                        <div className="lg:col-span-8 glass-card border-4 border-border rounded-[4rem] shadow-premium-lg p-16 lg:p-24 relative overflow-hidden group/timeline">
                            <div className="absolute top-0 left-0 size-96 bg-primary/5 rounded-full blur-[150px] -ml-48 -mt-48 transition-all duration-1000 group-hover/timeline:bg-primary/10" />
                            
                            <div className="relative space-y-16">
                                <div className="absolute left-[34px] top-6 bottom-6 w-2 bg-border rounded-full"></div>
                                
                                {timeline.map((step, idx) => (
                                    <div key={idx} className={cn("relative flex items-start gap-16 transition-all duration-1000", !step.completed && "opacity-20 grayscale", step.current && "opacity-100 grayscale-0")}>
                                        <div className={cn(
                                            "z-10 size-20 rounded-[1.5rem] flex items-center justify-center border-4 transition-all duration-700 shadow-inner",
                                            step.current ? "bg-primary border-primary shadow-[0_0_40px_rgba(37,99,235,0.3)] scale-110" :
                                                step.completed ? "bg-card border-emerald-500/40 text-emerald-500" : "bg-card border-border text-muted-foreground/20"
                                        )}>
                                            {step.completed ? <CheckCircle2 className="size-10" /> : <Clock className={cn("size-10", step.current && "animate-spin-slow text-white")} />}
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                                                <div className="space-y-2">
                                                    <p className={cn("text-3xl font-black italic tracking-tighter uppercase leading-none", step.current ? "text-primary italic animate-out fade-in duration-500" : "text-foreground")}>
                                                        {step.status}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground font-black uppercase tracking-[0.2em] italic max-w-2xl leading-relaxed">{step.desc}</p>
                                                </div>
                                                {step.date !== '---' && (
                                                    <div className={cn(
                                                        "inline-flex items-center gap-4 px-6 py-3 rounded-2xl border-4 transition-all duration-700 h-fit shrink-0",
                                                        step.current ? "bg-primary border-primary text-white shadow-premium" : "bg-background border-border text-muted-foreground/40"
                                                    )}>
                                                        <Clock className={cn("size-4", step.current ? "animate-pulse" : "opacity-30")} />
                                                        <span className="text-executive-label font-black uppercase tracking-[0.3em] leading-none pt-0.5">{step.date}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {step.current && (
                                                <div className="mt-10 p-8 rounded-[2rem] bg-primary/5 border-4 border-primary/10 flex items-center gap-6 animate-in slide-in-from-left-8 duration-700 group/update">
                                                     <div className="size-3 rounded-full bg-primary animate-ping" />
                                                     <p className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5 group-hover/update:translate-x-2 transition-transform">Dernière mise à jour : Transmission satellite active via BCA Network v4</p>
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
                        <div className="py-40 text-center max-w-4xl mx-auto space-y-16 animate-in fade-in zoom-in-95 duration-1000">
                            <div className="relative inline-block group">
                                <div className="absolute inset-0 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000 scale-150" />
                                <Package className="size-48 mx-auto text-muted-foreground/10 group-hover:text-primary/20 transition-all duration-1000 group-hover:scale-110" />
                                <div className="absolute -bottom-8 -right-8 size-28 text-primary shadow-premium-lg rounded-[2rem] bg-card p-6 border-4 border-border group-hover:rotate-12 transition-all">
                                    <Search className="size-full animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                                <h3 className="text-6xl font-black italic text-foreground tracking-tighter uppercase leading-none">Prêt à <span className="text-primary not-italic">Traquer ?</span></h3>
                                <p className="text-muted-foreground/60 font-black uppercase tracking-[0.4em] text-sm max-w-xl mx-auto leading-loose italic border-r-8 border-primary/20 pr-10 text-right">
                                    Utilisez l'identifiant d'expertise unique scellé dans votre confirmation pour activer le traçage satellite de vos actifs stratégiques.
                                </p>
                            </div>
                            <div className="flex justify-center gap-6 pt-8">
                                <div className="flex items-center gap-4 px-10 py-4 bg-card rounded-full border-4 border-border shadow-premium group/system hover:border-emerald-500/40 transition-all cursor-default">
                                    <div className="size-3 rounded-full bg-emerald-500 animate-ping shadow-[0_0_12px_rgba(16,185,129,0.4)]" />
                                    <span className="text-executive-label font-black text-muted-foreground/40 group-hover:text-emerald-500 transition-colors uppercase tracking-[0.4em] italic leading-none pt-0.5">Réseau Logistique BCA Opérationnel</span>
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
