import React, { useState } from 'react';
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
import DataTable from '../components/ui/DataTable';
import { Skeleton, CardSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';

const DeliveryTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const isLoading = false;
    const hasError = false;

    const activeDeliveries = [
        {
            id: 'TRK-982345',
            product: 'Smartphone Galaxy X-2',
            status: 'En route',
            statusVariant: 'primary',
            eta: 'Aujourd\'hui, 16:30',
            location: 'Dixinn, Conakry',
            courier: { name: 'Ibrahim Diallo', phone: '+224 620 00 00 00', rating: 4.9 }
        }
    ];

    const timeline = [
        { status: 'Livré', date: '---', desc: 'Le colis vous sera remis en main propre.', current: false, completed: false },
        { status: 'En cours de livraison', date: '12 Oct, 14:05', desc: 'Le livreur est en route vers votre destination.', current: true, completed: true },
        { status: 'Arrivé au centre de tri', date: '12 Oct, 08:30', desc: 'Traitement effectué au hub de Conakry.', current: false, completed: true },
        { status: 'Expédié', date: '11 Oct, 16:20', desc: 'Le colis a quitté l\'entrepôt du vendeur.', current: false, completed: true },
        { status: 'Commande confirmée', date: '11 Oct, 10:00', desc: 'Le vendeur prépare votre commande.', current: false, completed: true },
    ];

    return (
        <PublicLayout>
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8 max-w-7xl mx-auto pt-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Logistique Intégrée</span>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                            Gardez un œil <br />
                            <span className="text-primary not-italic text-3xl md:text-4xl">sur vos acquisitions.</span>
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-xl">Suivez l'acheminement de vos produits en temps réel, de l'entrepôt jusqu'à votre porte, partout en Guinée.</p>
                    </div>
                </div>

                {/* Tracking Search Hub */}
                <div className="relative py-12 px-10 rounded-[2.5rem] bg-slate-900 border border-white/10 overflow-hidden shadow-2xl group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-24 -mt-24 group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto">
                        <div className="size-20 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                            <Navigation className="size-10" />
                        </div>
                        <div className="flex-1 space-y-6 w-full text-center md:text-left">
                            <div>
                                <h3 className="text-2xl font-black text-white italic tracking-tight">Recherche de Colis</h3>
                                <p className="text-slate-400 text-sm font-medium">Entrez votre numéro de suivi pour voir les détails de livraison.</p>
                            </div>
                            <div className="relative group/input">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 size-5 group-focus-within/input:text-primary transition-colors" />
                                <Input
                                    className="w-full pl-14 pr-8 h-16 bg-white/5 border-white/10 focus:border-primary/50 text-white text-lg rounded-2xl placeholder:text-slate-600 shadow-none border-none outline-none focus:ring-0 font-black tracking-widest italic"
                                    placeholder="N° DE SUIVI (EX: TRK-000...)"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                />
                                <div className="absolute right-3 top-3 bottom-3">
                                    <Button className="h-full px-8 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-primary/20">
                                        Localiser
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Deliveries List */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <Truck className="size-5 text-primary" />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Livraisons Actives</h3>
                        </div>
                        {isLoading ? (
                            <CardSkeleton />
                        ) : activeDeliveries.length > 0 ? (
                            activeDeliveries.map((delivery, idx) => (
                                <Card key={idx} className="p-8 rounded-[2rem] border-border bg-card shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary/30 transition-all group cursor-pointer border-2">
                                    <div className="space-y-8">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{delivery.id}</p>
                                                <h4 className="text-xl font-black italic tracking-tighter text-foreground group-hover:text-primary transition-colors">{delivery.product}</h4>
                                            </div>
                                            <StatusBadge status={delivery.status} variant={delivery.statusVariant} />
                                        </div>

                                        <div className="space-y-4 py-6 border-y border-border/50">
                                            <div className="flex items-center gap-4">
                                                <Clock className="size-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arrivée estimée</p>
                                                    <p className="text-sm font-black italic text-foreground tracking-tight">{delivery.eta}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <MapPin className="size-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Localisation actuelle</p>
                                                    <p className="text-sm font-black italic text-foreground tracking-tight">{delivery.location}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-border">
                                                    <Phone className="size-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coursier</p>
                                                    <p className="text-xs font-black italic text-foreground tracking-tight">{delivery.courier.name}</p>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="icon" className="rounded-xl border-border hover:border-primary hover:text-primary transition-all">
                                                <Phone className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <EmptyState
                                title="Aucun colis"
                                description="Vous n'avez pas de livraison en cours actuellement."
                                icon={Package}
                            />
                        )}
                    </div>

                    {/* Timeline & Detailed View */}
                    <Card className="lg:col-span-2 rounded-[2.5rem] border-border bg-card shadow-xl overflow-hidden self-start">
                        <CardHeader className="p-8 border-b border-border bg-muted/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                    <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Détails de l'acheminement</CardTitle>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                                    <ShieldCheck className="size-3" /> Certifié BCA
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            {isLoading ? (
                                <div className="space-y-8">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex gap-8">
                                            <Skeleton className="size-10 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-1/4" />
                                                <Skeleton className="h-3 w-3/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : hasError ? (
                                <ErrorState />
                            ) : (
                                <div className="relative space-y-12">
                                    {/* Vertical Line */}
                                    <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-muted rounded-full"></div>

                                    {timeline.map((step, idx) => (
                                        <div key={idx} className={cn(
                                            "relative flex items-start gap-8 group/item transition-all",
                                            !step.completed && "opacity-40"
                                        )}>
                                            <div className={cn(
                                                "z-10 size-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500",
                                                step.current ? "bg-primary border-primary shadow-xl shadow-primary/30 scale-110" :
                                                    step.completed ? "bg-card border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/10" :
                                                        "bg-card border-muted text-muted"
                                            )}>
                                                {step.completed ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                                            </div>

                                            <div className="flex-1 space-y-2 group-hover/item:translate-x-1 transition-transform">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                    <p className={cn(
                                                        "text-base font-black italic tracking-tight",
                                                        step.current ? "text-primary" : "text-foreground"
                                                    )}>{step.status}</p>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{step.date}</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground font-medium max-w-lg leading-relaxed">{step.desc}</p>

                                                {step.current && (
                                                    <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-4 animate-pulse">
                                                        <div className="flex items-center gap-3">
                                                            <Navigation className="size-4 text-primary" />
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">En mouvement • 1.2km de vous</span>
                                                        </div>
                                                        <Button variant="link" className="text-[10px] font-black text-primary p-0 h-auto uppercase tracking-widest">Voir carte <ExternalLink className="size-3 ml-1" /></Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tracking Info Alert */}
                <div className="flex items-center gap-4 p-6 bg-muted/50 rounded-[2rem] border border-border">
                    <div className="size-10 rounded-full bg-slate-900 flex items-center justify-center text-white shrink-0">
                        <Package className="size-5" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                        <span className="font-black italic text-foreground uppercase tracking-widest text-xs mr-2">Info Livraison:</span> Nos livreurs BCA Connect opèrent de 08:00 à 19:00 du Lundi au Samedi. Une signature ou un code de vérification SMS est requis pour chaque réception de colis.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default DeliveryTracking;
