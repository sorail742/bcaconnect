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
            // On accepte soit l'ID complet soit un ID sans tirets
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
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-10">
                {/* Header */}
                <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Logistique Temps Réel</span>
                    <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                        Suivi de <span className="text-primary not-italic">Livraison.</span>
                    </h2>
                </div>

                {/* Search Bar */}
                <div className="relative py-12 px-10 rounded-[2.5rem] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl group">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
                        <div className="flex-1 space-y-6 w-full">
                            <div className="relative group/input">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 size-5" />
                                <Input
                                    className="w-full pl-14 pr-8 h-16 bg-white/5 border-white/10 text-white text-lg rounded-2xl placeholder:text-slate-600 focus:ring-0 font-black tracking-widest italic"
                                    placeholder="N° DE COMMANDE (UUID)"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <div className="absolute right-3 top-3 bottom-3">
                                    <Button onClick={handleSearch} disabled={isLoading} className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[11px]">
                                        {isLoading ? "Recherche..." : "Localiser"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {order ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Info Card */}
                        <Card className="lg:col-span-1 p-8 rounded-[2rem] border-2 border-primary/20 bg-card shadow-xl h-fit">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Réf: {order.id.slice(0, 8)}</p>
                                        <h4 className="text-xl font-black italic text-foreground tracking-tight">Votre Colis</h4>
                                    </div>
                                    <StatusBadge status={order.statut_livraison || order.statut} />
                                </div>

                                <div className="py-6 border-y border-border/50 space-y-4">
                                    <div className="flex items-center gap-4 text-sm">
                                        <MapPin className="size-5 text-primary" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Destinataire</p>
                                            <p className="font-bold text-foreground">{order.nom_destinataire}</p>
                                            <p className="text-xs text-muted-foreground">{order.adresse_livraison}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <Truck className="size-5 text-primary" />
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Transporteur</p>
                                            <p className="font-bold text-foreground">BCA Express GN</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Timeline */}
                        <Card className="lg:col-span-2 rounded-[2.5rem] border-border bg-card shadow-xl p-10">
                            <div className="relative space-y-10">
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-muted rounded-full"></div>
                                {timeline.map((step, idx) => (
                                    <div key={idx} className={cn("relative flex items-start gap-8", !step.completed && "opacity-40")}>
                                        <div className={cn(
                                            "z-10 size-10 rounded-full flex items-center justify-center border-[3px] transition-all",
                                            step.current ? "bg-primary border-primary shadow-lg shadow-primary/20 scale-110" :
                                                step.completed ? "bg-card border-emerald-500 text-emerald-500" : "bg-card border-muted"
                                        )}>
                                            {step.completed ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                                        </div>
                                        <div>
                                            <p className={cn("text-lg font-black italic tracking-tight leading-none", step.current ? "text-primary" : "text-foreground")}>{step.status}</p>
                                            <p className="text-xs text-muted-foreground mt-1 font-medium">{step.desc}</p>
                                            {step.date !== '---' && <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-2 block">{step.date}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                ) : (
                    !isLoading && !hasError && (
                        <div className="py-20 text-center space-y-6">
                            <Package className="size-20 mx-auto text-muted/20" />
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black italic">Prêt à localiser ?</h3>
                                <p className="text-muted-foreground">Utilisez le numéro reçu par SMS ou dans votre historique.</p>
                            </div>
                        </div>
                    )
                )}
            </div>
        </PublicLayout>
    );
};

export default DeliveryTracking;
