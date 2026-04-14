import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Radar, Activity, Inbox, ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import orderService from '../services/orderService';
import { useDelivery } from '../hooks/useDelivery';
import useSocket from '../hooks/useSocket';
import { toast } from 'sonner';

const DeliveryTracking = () => {
    const [searchParams] = useSearchParams();
    const urlOrderId = searchParams.get('orderId');
    
    const [trackingNumber, setTrackingNumber] = useState(urlOrderId || '');
    const [order, setOrder] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [otp, setOtp] = useState('');

    const { history, loading: loadingHistory, fetchHistory, confirmDelivery } = useDelivery();
    const { on, off } = useSocket();

    const handleSearch = async (id = trackingNumber) => {
        const targetId = id?.trim();
        if (!targetId) return;

        setIsSearching(true);
        try {
            const data = await orderService.getById(targetId);
            setOrder(data);
            await fetchHistory(targetId);
        } catch (err) {
            setOrder(null);
            toast.error('Commande introuvable ou erreur de chargement.');
        } finally {
            setIsSearching(false);
        }
    };

    // ⚡ Mise à jour temps réel
    useEffect(() => {
        if (!on || !order?.id) return;

        const handleRealTimeUpdate = (notif) => {
            // Si la notification concerne une mise à jour de commande
            if (notif.type === 'order' || notif.message.includes(order.id.slice(0, 8))) {
                handleSearch(order.id);
            }
        };

        on('notification_received', handleRealTimeUpdate);
        return () => off('notification_received', handleRealTimeUpdate);
    }, [on, off, order?.id]);

    const handleVerifyOtp = async () => {
        if (!otp || otp.length < 6) {
            toast.error("Veuillez entrer un code OTP valide.");
            return;
        }
        try {
            await confirmDelivery(order.id, otp);
            setOtp('');
            const updatedOrder = await orderService.getById(order.id);
            setOrder(updatedOrder);
        } catch (err) {
            // L'erreur est déjà gérée dans le hook via toast
        }
    };

    // Charger automatiquement si l'ID est dans l'URL
    useEffect(() => {
        if (urlOrderId) {
            handleSearch(urlOrderId);
        }
    }, [urlOrderId]);

    const getTimeline = () => {
        if (!order) return [];
        
        // On fusionne les statuts théoriques avec l'historique réel
        const baseTimeline = [
            { label: 'Commande confirmée', desc: 'Paiement validé', key: 'payé', color: 'primary' },
            { label: 'En préparation', desc: 'Le marchand prépare votre colis', key: 'en_préparation', color: 'primary' },
            { label: 'En transit', desc: 'Prise en charge par le livreur', key: 'en_cours', color: 'primary' },
            { label: 'Livré', desc: 'Remis au destinataire', key: 'livré', color: 'emerald' },
        ];

        return baseTimeline.map(step => {
            const historyLog = history.find(h => h.statut === step.key || (step.key === 'en_cours' && h.statut === 'ramasse'));
            return {
                ...step,
                done: historyLog || (step.key === 'payé' && order.statut !== 'en_attente_paiement'),
                active: order.statut_livraison === step.key || order.statut === step.key,
                date: historyLog ? new Date(historyLog.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : null
            };
        });
    };

    return (
        <DashboardLayout title="Suivi de livraison">
            <div className="max-w-5xl mx-auto space-y-6 pb-20">

                {/* Header Context */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Radar className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-foreground">Terminal de Suivi</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <Activity className="size-3 text-emerald-500 animate-pulse" />
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sync Active • Temps réel</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Engine */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-5">
                    <div>
                        <h3 className="text-base font-bold text-foreground">Localiser votre colis</h3>
                        <p className="text-sm text-muted-foreground mt-1">Saisissez le matricule unique de votre commande pour obtenir les données de transit.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full h-12 pl-12 pr-4 bg-background border border-border rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all text-foreground font-medium"
                                placeholder="Ex: ORD-2024-XXXX"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={isSearching}
                            className="h-12 px-8 bg-primary text-primary-foreground rounded-2xl font-bold text-sm hover:translate-y-[-2px] active:translate-y-0 shadow-lg shadow-primary/20 transition-all flex items-center gap-3 disabled:opacity-60"
                        >
                            {isSearching ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Radar className="size-5" />}
                            LANCER LE SUIVI
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                {order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Info Column */}
                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-24 bg-primary/5 rounded-full -mr-12 -mt-12" />
                                <h4 className="text-sm font-black text-foreground pb-4 border-b border-border uppercase tracking-widest flex items-center justify-between">
                                    Status Commande
                                    <span className={cn(
                                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase text-white",
                                        order.statut_livraison === 'livré' ? "bg-emerald-500" : "bg-primary"
                                    )}>
                                        {order.statut_livraison || order.statut}
                                    </span>
                                </h4>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border">
                                            <MapPin className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">Destinataire</p>
                                            <p className="text-sm font-bold text-foreground leading-tight">{order.nom_destinataire}</p>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{order.adresse_livraison}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                            <Truck className="size-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">Transporteur</p>
                                            <p className="text-sm font-bold text-foreground">BCA Express Logistics</p>
                                            <p className="text-xs text-emerald-500 font-bold mt-1 uppercase tracking-tighter">Certifié BCA</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4 bg-muted/50 rounded-2xl border border-border text-center space-y-1">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">ID Unique d'Acquisition</p>
                                    <p className="text-sm font-black text-foreground font-mono">#{(order.id || '').toUpperCase()}</p>
                                </div>
                            </div>

                            {/* OTP Verification Section - Only show if in progress and not delivered */}
                            {order.statut_livraison && order.statut_livraison !== 'livré' && (
                                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="size-5 text-primary" />
                                        <h4 className="text-sm font-bold text-primary italic uppercase tracking-widest">Validation Client</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                        Veuillez fournir le code OTP envoyé par le livreur pour confirmer la bonne réception de votre colis.
                                    </p>
                                    <div className="flex gap-2">
                                        <input 
                                            maxLength={6}
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Code OTP"
                                            className="w-full h-11 px-4 bg-background border border-primary/20 rounded-xl text-center font-black tracking-[0.5em] text-lg outline-none focus:border-primary shadow-inner"
                                        />
                                        <button 
                                            onClick={handleVerifyOtp}
                                            disabled={loadingHistory || otp.length < 6}
                                            className="size-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                                        >
                                            <ArrowRight className="size-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progression Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                                <h4 className="text-sm font-black text-foreground pb-6 border-b border-border mb-8 uppercase tracking-[0.2em]">Flux Logistique</h4>
                                <div className="relative space-y-10">
                                    <div className="absolute left-6 top-4 bottom-4 w-1 bg-gradient-to-b from-primary via-primary to-emerald-500 rounded-full opacity-20" />
                                    {getTimeline().map((step, idx) => (
                                        <div key={idx} className={cn("relative flex items-start gap-6 transition-all duration-700", !step.done && !step.active && "opacity-30 grayscale")}>
                                            <div className={cn(
                                                "size-12 rounded-[1.2rem] flex items-center justify-center border-4 shrink-0 relative z-10 transition-all duration-500",
                                                step.active ? "bg-primary border-primary/20 text-primary-foreground scale-110 shadow-xl shadow-primary/30" :
                                                step.done ? "bg-emerald-500 text-white border-white dark:border-[#050505] shadow-lg shadow-emerald-500/10" :
                                                "bg-muted border-border text-muted-foreground"
                                            )}>
                                                {step.done ? <CheckCircle2 className="size-6" /> : <Clock className="size-6" />}
                                                {step.active && <div className="absolute inset-[-8px] border-2 border-primary rounded-[1.5rem] animate-pulse opacity-50" />}
                                            </div>
                                            <div className="flex-1 pt-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <div>
                                                        <p className={cn("text-base font-black tracking-tight", step.active ? "text-primary" : "text-foreground")}>{step.label}</p>
                                                        <p className="text-xs text-muted-foreground font-medium mt-1">{step.desc}</p>
                                                    </div>
                                                    {step.date && (
                                                        <div className="px-3 py-1.5 bg-muted rounded-xl border border-border">
                                                            <span className="text-[10px] font-black text-foreground tabular-nums opacity-60 uppercase">{step.date}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed History Log */}
                            {history.length > 0 && (
                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                                    <h4 className="text-sm font-black text-foreground pb-6 border-b border-border mb-8 uppercase tracking-[0.2em]">Historique des Événements</h4>
                                    <div className="space-y-6">
                                        {[...history].reverse().map((log, idx) => (
                                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                                                <div className="text-xs font-black text-primary opacity-40 shrink-0 pt-0.5">
                                                    {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-foreground uppercase tracking-tight">{log.statut}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 italic">{log.commentaire || "Aucun commentaire additionnel."}</p>
                                                    {log.latitude && (
                                                        <div className="mt-3 flex items-center gap-2">
                                                            <div className="px-2 py-0.5 rounded bg-foreground/5 text-[9px] font-mono text-muted-foreground">GPS: {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : !isSearching && (
                    <div className="py-24 flex flex-col items-center text-center gap-6 bg-card rounded-[3rem] border border-border/50 border-dashed backdrop-blur-sm">
                        <div className="size-24 rounded-[2.5rem] bg-muted/50 flex items-center justify-center text-muted-foreground/20 border border-border">
                            <Package className="size-12" />
                        </div>
                        <div className="max-w-xs">
                            <h3 className="text-lg font-bold text-foreground uppercase tracking-[0.1em]">En Attente de Matricule</h3>
                            <p className="text-xs text-muted-foreground mt-2 leading-relaxed font-medium">Connectez le module de suivi en saisissant un numéro de commande valide ci-dessus.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DeliveryTracking;
