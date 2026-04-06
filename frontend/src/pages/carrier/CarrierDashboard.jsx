import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import {
    Headset,
    BookOpen,
    LifeBuoy,
    CheckCircle2,
    ClipboardList,
    Truck,
    Hourglass,
    Navigation,
    Activity,
    Zap,
    Box,
    RefreshCcw,
    Shield,
    Globe,
    MapPin
} from 'lucide-react';
import deliveryService from '../../services/deliveryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const CarrierDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState({ 
        assigned: '0', 
        inProgress: '0', 
        completed: '0', 
        available: '0' 
    });
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');

    const fetchDeliveries = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await deliveryService.getAvailableOrders();
            setDeliveries(data || []);

            setStats({
                assigned: (data || []).filter(d => d.statut === 'expédié').length.toString(),
                inProgress: (data || []).filter(d => d.statut_livraison === 'en_cours').length.toString(),
                completed: (data || []).filter(d => d.statut_livraison === 'livré').length.toString(),
                available: (data || []).length.toString(),
            });
        } catch (error) {
            console.error("Erreur chargement livraisons:", error);
            toast.error("ÉCHEC DE LA SYNCHRONISATION LOGISTIQUE.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDeliveries();
    }, [fetchDeliveries]);

    const handleAction = async (orderId, currentStatus) => {
        let nextStatus = '';
        if (currentStatus === 'payé' || currentStatus === 'expédié') nextStatus = 'en_cours';
        else if (currentStatus === 'en_cours') nextStatus = 'livré';

        if (!nextStatus) return;

        try {
            await deliveryService.updateStatus(orderId, nextStatus);
            toast.success(`STATUT RÉSEAU ACTUALISÉ : ${nextStatus.toUpperCase()}`);
            fetchDeliveries();
        } catch (err) {
            toast.error("ERREUR DE COMMANDE TACTIQUE.");
        }
    };

    const deliveryColumns = [
        {
            label: 'ORD-ID SOURCE',
            render: (row) => (
                <span className="font-black text-[#FF6600] uppercase text-[9px] tracking-widest bg-[#FF6600]/5 px-2 py-1 rounded-lg border border-[#FF6600]/10 shadow-sm">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: 'DESTINATAIRE ALPHA',
            render: (row) => (
                <div className="flex flex-col gap-1 py-1">
                    <span className="font-black text-slate-800 dark:text-foreground text-[11px] uppercase tracking-tight leading-none pt-0.5">{row.nom_destinataire || 'CLIENT RÉSEAU'}</span>
                    <span className="text-[8px] text-muted-foreground/80 font-black tracking-widest uppercase opacity-70 leading-none">TEL: {row.telephone_livraison || 'NON INDEXÉ'}</span>
                </div>
            )
        },
        {
            label: 'COORDONNÉES TERMINAL',
            render: (row) => (
                <div className="max-w-[220px] truncate font-black text-muted-foreground dark:text-muted-foreground/80 text-[9px] uppercase tracking-widest leading-relaxed pt-0.5" title={row.adresse_livraison}>
                    {row.adresse_livraison || 'ZONE NON RÉPERTORIÉE'}
                </div>
            )
        },
        {
            label: 'STATUT FLUX',
            render: (row) => {
                const status = row.statut_livraison || row.statut;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'livré' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                status === 'en_cours' ? "bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-slate-300 dark:bg-foreground/10"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'livré' ? "text-emerald-500" :
                                status === 'en_cours' ? "text-amber-500" : "text-muted-foreground/80"
                        )}>
                            {status?.toUpperCase() || 'IDLE'}
                        </span>
                    </div>
                );
            }
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="text-right pr-4">
                    {row.statut !== 'livré' ? (
                        <button
                            onClick={() => handleAction(row.id, row.statut_livraison || row.statut)}
                            className="h-8 px-6 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 text-[9px] font-black rounded-xl transition-all shadow-md active:scale-95 uppercase tracking-widest hover:bg-[#FF6600] hover:text-foreground border-0"
                        >
                            {row.statut === 'payé' ? 'RÉCUPÉRER' : row.statut_livraison === 'en_cours' ? 'TERMINER' : 'ACTUALISER'}
                        </button>
                    ) : (
                        <div className="flex items-center justify-end gap-2 text-emerald-500 text-[8px] font-black uppercase tracking-widest opacity-80 decoration-emerald-500/20 underline underline-offset-4">
                            <CheckCircle2 className="size-3" /> FLUX TERMINÉ
                        </div>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE LOGISTIQUE">
            <div className="space-y-8 animate-in fade-in duration-700 pb-24">

                {/* Compact Command Bar */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white dark:bg-[#0F1219] p-6 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/[0.01] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="size-12 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border border-[#FF6600]/5 group-hover:rotate-6 transition-transform">
                            <Truck className="size-6 shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-slate-900 dark:text-foreground uppercase tracking-tight leading-none pt-0.5">
                                OPS <span className="text-[#FF6600]">LOGISTIQUE</span>.
                            </h2>
                            <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest opacity-80 decoration-[#FF6600]/20 underline underline-offset-4">
                                TERMINAL CARRIER — SYNC : {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button onClick={fetchDeliveries} className="size-10 rounded-xl bg-slate-50 dark:bg-foreground/5 border border-slate-100 dark:border-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-[#FF6600] transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                        <div className="flex items-center gap-3 px-5 h-10 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pt-0.5">RÉSEAU OPTIMAL</span>
                        </div>
                    </div>
                </div>

                {/* KPI Area — Strategic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard title="ASSIGNÉES" value={stats.assigned} icon={ClipboardList} trend="up" trendValue="SYNC" className="h-32" />
                    <DashboardCard title="TRANSIT" value={stats.inProgress} icon={Truck} trend="up" trendValue="LIVE" className="h-32" />
                    <DashboardCard title="TERMINÉES" value={stats.completed} icon={CheckCircle2} trend="up" trendValue="TOTAL" className="h-32" />
                    <DashboardCard title="FLUX LIBRES" value={stats.available} icon={Hourglass} trend="up" trendValue="QUEUE" className="h-32" />
                </div>

                {/* Main Content: Tracking Terminal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Live Tracking List */}
                    <div className="lg:col-span-8 bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden flex flex-col h-fit">
                        <div className="p-6 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                             <div className="flex items-center gap-3 text-muted-foreground/80">
                                 <Activity className="size-4" />
                                 <span className="text-[9px] font-semibold pt-0.5">FLUX DE LIVRAISON RÉEL</span>
                             </div>
                             <div className="flex items-center gap-2 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                                {['TOUS', 'LIVRÉ'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f === 'TOUS' ? 'Tous' : 'Livré')}
                                        className={cn(
                                            "px-4 h-8 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all",
                                            filter.toUpperCase() === f
                                                ? 'bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 border-transparent shadow-md'
                                                : 'text-muted-foreground/80 border-slate-200 dark:border-foreground/10 hover:text-slate-900 dark:hover:text-foreground'
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                             </div>
                        </div>

                        <div className="p-2">
                             <DataTable
                                columns={deliveryColumns}
                                data={deliveries}
                                isLoading={isLoading}
                                className="bg-transparent border-0"
                            />
                            {!isLoading && deliveries.length === 0 && (
                                <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
                                     <Box className="size-8" />
                                     <p className="text-[9px] font-black uppercase ">AUCUN FLUX ACTIF IDENTIFIÉ</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Secondary Hub: Map & Support */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Compact Location Card */}
                        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl relative overflow-hidden group/map">
                            <div className="flex items-center justify-between relative z-10">
                                <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                                    <Globe className="size-5" />
                                </div>
                                <div className="flex items-center gap-2 px-3 h-6 bg-emerald-500/20 rounded-full border border-emerald-500/30">
                                     <div className="size-1 bg-emerald-500 rounded-full animate-pulse" />
                                     <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">SIGNAL ALPHA</span>
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="text-sm font-black text-foreground uppercase tracking-tight">INDEXATION GÉOSPATIALE</h4>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">STATION LOGISTIQUE CONAKRY</p>
                            </div>
                            <div className="aspect-square bg-black rounded-xl overflow-hidden relative border border-foreground/5 opacity-40 grayscale group-hover/map:grayscale-0 transition-all duration-700 group-hover/map:opacity-80">
                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Guinea_Map.png/800px-Guinea_Map.png')" }} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                     <div className="size-2 bg-[#FF6600] rounded-full shadow-[0_0_15px_#FF6600] animate-ping" />
                                </div>
                            </div>
                        </div>

                        {/* Support Console */}
                        <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl p-6 space-y-6 shadow-sm group">
                             <div className="flex items-center gap-4">
                                 <div className="size-9 rounded-xl bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                    <Headset className="size-4" />
                                 </div>
                                 <p className="text-[10px] font-black text-slate-800 dark:text-foreground uppercase tracking-widest">UNITÉ DE SUPPORT SYNC</p>
                             </div>
                             <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest leading-relaxed border-l-2 border-[#FF6600]/20 pl-4">INTERVENTION RÉSEAU PRIORITAIRE 24/7 SUR TOUT LE TERRITOIRE ALPHA_GUINÉE.</p>
                             <div className="space-y-2 pt-2">
                                 <button className="w-full h-10 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-[#FF6600] hover:text-foreground shadow-md active:scale-95 flex items-center justify-center gap-3">
                                     <LifeBuoy className="size-4" />
                                     <span>SUPPORT DIRECT</span>
                                 </button>
                                 <button className="w-full h-10 bg-transparent border border-slate-200 dark:border-foreground/10 text-muted-foreground/80 font-black rounded-xl text-[9px] uppercase tracking-widest hover:border-[#FF6600] hover:text-[#FF6600] transition-colors flex items-center justify-center gap-3">
                                     <BookOpen className="size-4" />
                                     <span>GUIDE OPÉ</span>
                                 </button>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CarrierDashboard;
