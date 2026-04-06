import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Package, Truck, CheckCircle2, Clock, MapPin, Radar, Activity, Inbox } from 'lucide-react';
import { cn } from '../lib/utils';
import orderService from '../services/orderService';
import { toast } from 'sonner';

const DeliveryTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!trackingNumber.trim()) return;
        setIsLoading(true);
        try {
            const data = await orderService.getById(trackingNumber.trim());
            setOrder(data);
            toast.success('Commande trouvée.');
        } catch {
            setOrder(null);
            toast.error('Commande introuvable.');
        } finally {
            setIsLoading(false);
        }
    };

    const getTimeline = (order) => {
        if (!order) return [];
        return [
            { label: 'Commande confirmée', desc: 'Paiement validé', date: new Date(order.createdAt).toLocaleDateString('fr-GN'), done: true, active: order.statut === 'payé' },
            { label: 'En préparation', desc: 'Emballage en cours', date: '', done: order.statut !== 'payé' && order.statut !== 'en_attente_paiement', active: false },
            { label: 'En transit', desc: 'Prise en charge par le livreur', date: '', done: !!order.statut_livraison, active: order.statut_livraison === 'en_cours' },
            { label: 'Livré', desc: 'Remis au destinataire', date: order.statut_livraison === 'livré' ? 'Terminé' : '—', done: order.statut_livraison === 'livré', active: false },
        ];
    };

    return (
        <DashboardLayout title="Suivi de livraison">
            <div className="max-w-5xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Radar className="size-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-foreground">Suivi de commande</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Activity className="size-3 text-primary animate-pulse" />
                            <p className="text-xs text-muted-foreground">Terminal de suivi actif</p>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-foreground">Entrez votre numéro de commande</h3>
                        <p className="text-xs text-muted-foreground mt-1">Retrouvez votre numéro dans l'historique de vos commandes.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                className="w-full h-10 pl-10 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                                placeholder="Ex: ORD-1234-ABCD..."
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="h-10 px-5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-60"
                        >
                            {isLoading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Radar className="size-4" />}
                            {isLoading ? 'Recherche...' : 'Suivre'}
                        </button>
                    </div>
                </div>

                {/* Results */}
                {order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Info card */}
                        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
                            <h4 className="text-sm font-bold text-foreground pb-3 border-b border-border">Informations colis</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <MapPin className="size-4 text-primary mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Destinataire</p>
                                        <p className="text-sm font-semibold text-foreground">{order.nom_destinataire}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{order.adresse_livraison}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Truck className="size-4 text-emerald-500 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Transporteur</p>
                                        <p className="text-sm font-semibold text-foreground">BCA Express</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-muted rounded-xl border border-border text-center">
                                <p className="text-xs text-muted-foreground">Référence</p>
                                <p className="text-sm font-bold text-foreground font-mono mt-1">#{(order.id || '').slice(0, 12).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
                            <h4 className="text-sm font-bold text-foreground pb-4 border-b border-border mb-5">Progression de la livraison</h4>
                            <div className="relative space-y-6">
                                <div className="absolute left-5 top-2 bottom-2 w-px bg-border" />
                                {getTimeline(order).map((step, idx) => (
                                    <div key={idx} className={cn("relative flex items-start gap-4 transition-opacity", !step.done && !step.active && "opacity-40")}>
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center border-2 shrink-0 relative z-10",
                                            step.active ? "bg-primary border-primary text-primary-foreground" :
                                            step.done ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" :
                                            "bg-muted border-border text-muted-foreground"
                                        )}>
                                            {step.done ? <CheckCircle2 className="size-4" /> : <Clock className="size-4" />}
                                            {step.active && <div className="absolute inset-0 bg-primary rounded-xl animate-ping opacity-20" />}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className={cn("text-sm font-semibold", step.active ? "text-primary" : "text-foreground")}>{step.label}</p>
                                                {step.date && step.date !== '—' && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">{step.date}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : !isLoading && (
                    <div className="py-16 flex flex-col items-center text-center gap-4 bg-card rounded-2xl border border-border opacity-50">
                        <Inbox className="size-10 text-muted-foreground/40" />
                        <div>
                            <h3 className="text-sm font-bold text-foreground">En attente de recherche</h3>
                            <p className="text-xs text-muted-foreground mt-1">Entrez un numéro de commande pour commencer le suivi.</p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DeliveryTracking;
