import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Radar, Activity, ShieldCheck, ArrowRight } from 'lucide-react';
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
    const [liveLocation, setLiveLocation] = useState({ lat: 9.5350, lng: -13.6773 }); // Conakry coords
    const [distance, setDistance] = useState(4.2);

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

    // Socket real-time updates
    useEffect(() => {
        if (!on || !order?.id) return;
        const handleRealTimeUpdate = (notif) => {
            if (notif.type === 'order' || notif.message.includes(order.id.slice(0, 8))) {
                handleSearch(order.id);
            }
        };
        on('notification_received', handleRealTimeUpdate);
        return () => off('notification_received', handleRealTimeUpdate);
    }, [on, off, order?.id]);

    // Simulate Live GPS Movement when in transit
    useEffect(() => {
        const isEnCours = order?.statut_livraison === 'en_cours' || order?.statut === 'en_cours';
        if (!isEnCours) return;

        const interval = setInterval(() => {
            setLiveLocation(prev => ({
                lat: prev.lat + (Math.random() - 0.3) * 0.0005,
                lng: prev.lng + (Math.random() - 0.5) * 0.0005
            }));
            setDistance(prev => Math.max(0.1, prev - 0.05));
        }, 3000);

        return () => clearInterval(interval);
    }, [order]);

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
            toast.success("Livraison confirmée avec succès !");
        } catch (err) {}
    };

    useEffect(() => {
        if (urlOrderId) handleSearch(urlOrderId);
    }, [urlOrderId]);

    const getTimeline = () => {
        if (!order) return [];
        const baseTimeline = [
            { label: 'Paiement Validé', desc: 'Commande confirmée', key: 'payé', color: 'primary' },
            { label: 'En Préparation', desc: 'Préparation par le vendeur', key: 'en_préparation', color: 'primary' },
            { label: 'En Transit', desc: 'Pris en charge par BCA Logistics', key: 'en_cours', color: 'primary' },
            { label: 'Livré', desc: 'Colis remis au destinataire', key: 'livré', color: 'emerald' },
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
        <DashboardLayout title="Suivi Logistique">
            <div className="max-w-5xl mx-auto space-y-6 pb-20 font-jakarta">

                {/* Header Context */}
                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="size-16 rounded-2xl bg-[#FF6600]/10 border border-[#FF6600]/20 flex items-center justify-center text-[#FF6600]">
                            <Radar className="size-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground leading-tight tracking-tighter uppercase">Terminal de Suivi Logistique</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Activity className="size-4 text-emerald-500 animate-pulse" />
                                <p className="text-[11px] text-muted-foreground font-black uppercase tracking-widest">Synchronisation active (Temps réel)</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Engine */}
                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Localiser un colis</h3>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Saisissez votre matricule de commande pour obtenir les informations de transit.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-[#FF6600] transition-colors" />
                            <input
                                className="w-full h-16 pl-14 pr-6 bg-muted/50 border-2 border-border rounded-2xl text-base outline-none focus:border-[#FF6600] transition-all text-foreground font-black tracking-widest uppercase placeholder:normal-case placeholder:font-medium placeholder:tracking-normal"
                                placeholder="Numéro de suivi (ex: ORD-XXXX)"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={() => handleSearch()}
                            disabled={isSearching}
                            className="h-16 px-10 bg-[#FF6600] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 disabled:opacity-60 hover:scale-[1.02] active:scale-95"
                        >
                            {isSearching ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Radar className="size-6" />}
                            Rechercher
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="min-h-[400px]">
                {order ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Info Column */}
                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 size-32 bg-[#FF6600]/5 rounded-full -mr-16 -mt-16" />
                                <div className="flex items-center justify-between pb-6 border-b border-border">
                                    <h4 className="text-lg font-black text-foreground uppercase tracking-tighter">Statut Actuel</h4>
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md",
                                        order.statut_livraison === 'livré' ? "bg-emerald-500 text-white" : "bg-[#FF6600] text-white"
                                    )}>
                                        {(order.statut_livraison || order.statut).replace(/_/g, ' ')}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border">
                                            <MapPin className="size-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Destinataire</p>
                                            <p className="text-base font-black text-foreground leading-tight">{order.nom_destinataire}</p>
                                            <p className="text-sm text-muted-foreground mt-1 font-medium">{order.adresse_livraison}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                            <Truck className="size-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Transporteur</p>
                                            <p className="text-base font-black text-foreground">BCA Logistics Hub</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-5 bg-muted/50 rounded-2xl border border-border text-center space-y-2">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Référence Unique</p>
                                    <p className="text-lg font-black text-foreground uppercase tracking-widest">#{order.id.slice(0, 8)}</p>
                                </div>
                            </div>

                            {/* OTP form if out for delivery */}
                            {order.statut_livraison && order.statut_livraison !== 'livré' && (
                                <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-[2rem] p-8 shadow-xl space-y-6">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="size-6 text-[#FF6600]" />
                                        <h4 className="text-base font-black text-foreground uppercase tracking-tighter">Validation de réception</h4>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                        Remettez ce code OTP au livreur uniquement lorsque vous recevez la commande physiquement.
                                    </p>
                                    <div className="flex gap-3">
                                        <input 
                                            maxLength={6}
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Code OTP"
                                            className="w-full h-14 px-4 bg-card border-2 border-[#FF6600]/30 rounded-2xl text-center font-black tracking-[0.5em] text-xl outline-none focus:border-[#FF6600] transition-colors"
                                        />
                                        <button 
                                            onClick={handleVerifyOtp}
                                            disabled={loadingHistory || otp.length < 6}
                                            className="h-14 w-16 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center shadow-xl disabled:opacity-50 hover:bg-[#FF6600]/90 hover:scale-105 transition-all"
                                        >
                                            <ArrowRight className="size-6" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Live Tracking Radar (En cours) */}
                            {(order.statut_livraison === 'en_cours' || order.statut === 'en_cours') && (
                                <div className="bg-card border border-border rounded-[2rem] p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
                                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50" />
                                    <div className="flex items-center gap-2">
                                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h4 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Localisation GPS Active</h4>
                                    </div>
                                    
                                    <div className="relative size-32 my-4">
                                        <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_3s_ease-in-out_infinite]" />
                                        <div className="absolute inset-4 rounded-full border border-emerald-500/30 animate-[ping_3s_ease-in-out_infinite_1s]" />
                                        <div className="absolute inset-8 rounded-full border border-emerald-500/30 animate-[ping_3s_ease-in-out_infinite_2s]" />
                                        
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                                                <Truck className="size-5 text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 w-full">
                                        <div className="bg-muted/50 rounded-xl p-3 border border-border">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Coordonnées</p>
                                            <p className="text-xs font-black text-foreground font-mono">{liveLocation.lat.toFixed(4)}, {liveLocation.lng.toFixed(4)}</p>
                                        </div>
                                        <div className="bg-muted/50 rounded-xl p-3 border border-border">
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Distance Est.</p>
                                            <p className="text-xs font-black text-foreground font-mono">{distance.toFixed(1)} km</p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium">Mise à jour en direct du véhicule...</p>
                                </div>
                            )}
                        </div>

                        {/* Progression Column */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
                                <h4 className="text-xl font-black text-foreground uppercase tracking-tighter pb-6 border-b border-border mb-8">Flux d'Acheminement</h4>
                                <div className="relative space-y-10 pl-2">
                                    <div className="absolute left-[29px] top-6 bottom-6 w-1 bg-muted rounded-full" />
                                    {getTimeline().map((step, idx) => (
                                        <div key={idx} className={cn("relative flex items-start gap-6 transition-all duration-500", !step.done && !step.active && "opacity-40")}>
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center border-4 relative z-10 shrink-0 shadow-lg",
                                                step.active ? "bg-[#FF6600] border-[#FF6600]/20 text-white scale-110" :
                                                step.done ? "bg-emerald-500 text-white border-transparent" :
                                                "bg-muted border-transparent text-muted-foreground"
                                            )}>
                                                {step.done ? <CheckCircle2 className="size-6" /> : <Clock className="size-5" />}
                                            </div>
                                            <div className="flex-1 pt-1.5">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div>
                                                        <p className={cn("text-lg font-black uppercase tracking-tighter", step.active ? "text-[#FF6600]" : "text-foreground")}>{step.label}</p>
                                                        <p className="text-sm text-muted-foreground mt-1 font-medium">{step.desc}</p>
                                                    </div>
                                                    {step.date && (
                                                        <span className="text-[10px] font-black text-muted-foreground bg-muted px-4 py-2 rounded-xl whitespace-nowrap uppercase tracking-widest">
                                                            {step.date}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Detailed History Log */}
                            {history.length > 0 && (
                                <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl">
                                    <h4 className="text-xl font-black text-foreground uppercase tracking-tighter pb-4 border-b border-border mb-6">Logs du Système</h4>
                                    <div className="space-y-4">
                                        {[...history].reverse().map((log, idx) => (
                                            <div key={idx} className="flex gap-5 p-5 rounded-2xl bg-muted/30 border border-border">
                                                <div className="text-sm font-black text-[#FF6600] pt-0.5 w-14 shrink-0">
                                                    {new Date(log.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-foreground uppercase tracking-widest">{log.statut.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium">{log.commentaire || "Mise à jour automatique du point de contrôle."}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : !isSearching && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-24 flex flex-col items-center text-center gap-6 bg-card rounded-[3rem] border border-dashed border-border shadow-2xl"
                    >
                        <div className="size-24 rounded-[2rem] bg-muted flex items-center justify-center text-muted-foreground mb-4">
                            <Package className="size-12" />
                        </div>
                        <div className="max-w-md px-6">
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter">Plateforme de Suivi</h3>
                            <p className="text-sm text-muted-foreground mt-4 font-medium leading-relaxed">Saisissez un numéro de commande ci-dessus pour consulter en temps réel l'avancement de votre expédition au sein du réseau BCA Connect.</p>
                        </div>
                    </motion.div>
                )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DeliveryTracking;
