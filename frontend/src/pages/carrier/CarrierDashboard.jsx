import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Headset,
    Map as MapIcon,
    Maximize2,
    BookOpen,
    LifeBuoy,
    CheckCircle2,
    ClipboardList,
    Truck,
    Clock,
    Hourglass,
    Navigation,
    Phone,
    Satellite,
    Zap,
    Sparkles,
    Activity
} from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import deliveryService from '../../services/deliveryService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const CarrierDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState([
        { title: "COMMANDES ASSIGNÉES", value: '0', icon: ClipboardList, color: 'primary' },
        { title: 'LIVRAISONS EN COURS', value: '0', icon: Truck, color: 'primary' },
        { title: 'LIVRAISONS TERMINÉES', value: '0', icon: CheckCircle2, color: 'primary' },
        { title: 'FLUX DISPONIBLES', value: '0', icon: Hourglass, color: 'primary' },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');

    const fetchDeliveries = async () => {
        try {
            setIsLoading(true);
            const data = await deliveryService.getAvailableOrders();
            setDeliveries(data);

            setStats([
                { title: "COMMANDES ASSIGNÉES", value: data.filter(d => d.statut === 'expédié').length.toString(), icon: ClipboardList, trend: 'up', trendValue: 'OPTIMAL', color: 'primary' },
                { title: 'LIVRAISONS EN COURS', value: data.filter(d => d.statut_livraison === 'en_cours').length.toString(), icon: Truck, trend: 'up', trendValue: 'ACTIF', color: 'primary' },
                { title: 'LIVRAISONS TERMINÉES', value: data.filter(d => d.statut_livraison === 'livré').length.toString(), icon: CheckCircle2, trend: 'up', trendValue: 'TOTAL', color: 'primary' },
                { title: 'FLUX DISPONIBLES', value: data.length.toString(), icon: Hourglass, trend: 'up', trendValue: 'RÉSEAU', color: 'primary' },
            ]);
        } catch (error) {
            console.error("Erreur chargement livraisons:", error);
            toast.error("Impossible de charger les livraisons.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const handleAction = async (orderId, currentStatus) => {
        let nextStatus = '';
        if (currentStatus === 'payé' || currentStatus === 'expédié') nextStatus = 'en_cours';
        else if (currentStatus === 'en_cours') nextStatus = 'livré';

        if (!nextStatus) return;

        try {
            await deliveryService.updateStatus(orderId, nextStatus);
            toast.success(`STATUT MIS À JOUR : ${nextStatus.toUpperCase()}`);
            fetchDeliveries();
        } catch (err) {
            toast.error("ERREUR LORS DE LA MISE À JOUR.");
        }
    };

    const deliveryColumns = [
        {
            label: 'ID COMMANDE',
            render: (row) => <span className="font-black text-[#FF6600] uppercase text-[10px] tracking-widest italic">#{row.id.slice(0, 8).toUpperCase()}</span>
        },
        {
            label: 'DESTINATAIRE',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-black italic text-white text-[11px] uppercase tracking-wider">{row.nom_destinataire || 'CLIENT PREMIUM'}</span>
                    <span className="text-[9px] text-slate-500 font-black tracking-[0.2em]">{row.telephone_livraison || 'NO SIGNAL'}</span>
                </div>
            )
        },
        {
            label: 'COORDONNÉES LOGISTIQUES',
            render: (row) => (
                <div className="max-w-[200px] truncate font-black text-slate-600 dark:text-slate-500 text-[10px] uppercase italic tracking-widest" title={row.adresse_livraison}>
                    {row.adresse_livraison || 'ADRESSE NON INDEXÉE'}
                </div>
            )
        },
        {
            label: 'STATUT FLUX',
            render: (row) => <StatusBadge status={row.statut_livraison || row.statut} className="text-[9px] font-black italic uppercase tracking-widest border-2" />
        },
        {
            label: 'TIMESTAMP',
            render: (row) => <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{new Date(row.createdAt).toLocaleDateString('fr-FR')}</span>
        },
        {
            label: 'OPÉRATIONS',
            render: (row) => (
                <div className="text-right">
                    {row.statut !== 'livré' ? (
                        <button
                            onClick={() => handleAction(row.id, row.statut_livraison || row.statut)}
                            className="px-6 py-2.5 bg-[#FF6600] text-white text-[10px] font-black rounded-xl transition-all shadow-3xl shadow-[#FF6600]/20 uppercase tracking-[0.3em] hover:scale-110 active:scale-95 italic group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                            <span className="relative z-10">{row.statut === 'payé' ? 'RÉCUPÉRER' : row.statut_livraison === 'en_cours' ? 'TERMINER' : 'ACTUALISER'}</span>
                        </button>
                    ) : (
                        <span className="text-emerald-500 text-[10px] font-black italic uppercase tracking-[0.3em] flex items-center justify-end gap-2 bg-emerald-500/5 px-4 py-2 rounded-xl border-2 border-emerald-500/10">
                            <CheckCircle2 className="size-4" /> MISSION TERMINÉE
                        </span>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE DE COMMANDEMENT LOGISTIQUE">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} className="hover:border-[#FF6600]/40 transition-all duration-700" />
                        ))
                    )}
                </div>

                {/* Main Section: Deliveries */}
                <div className="bg-white/[0.01] rounded-[4rem] border-4 border-white/5 overflow-hidden shadow-3xl">
                    <DataTable
                        title="FLUX DE LIVRAISON EN TEMPS RÉEL"
                        columns={deliveryColumns}
                        data={deliveries}
                        isLoading={isLoading}
                        className="bg-transparent"
                        actions={
                            <div className="flex flex-wrap items-center gap-4">
                                {['TOUS', 'EN ATTENTE', 'EN LIVRAISON', 'LIVRÉ'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f === 'TOUS' ? 'Tous' : f === 'EN ATTENTE' ? 'En attente' : f === 'EN LIVRAISON' ? 'En livraison' : 'Livré')}
                                        className={cn(
                                            "px-6 py-2.5 text-[9px] font-black uppercase tracking-[0.3em] italic rounded-xl transition-all border-2",
                                            filter.toUpperCase() === f
                                                ? 'bg-[#FF6600] text-white border-[#FF6600] shadow-3xl shadow-[#FF6600]/20 scale-110'
                                                : 'text-slate-600 border-white/5 hover:bg-white/5 hover:text-white'
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                                <button onClick={fetchDeliveries} className="p-3 rounded-xl border-2 border-white/5 hover:bg-[#FF6600]/10 hover:text-[#FF6600] transition-all group">
                                    <Activity className="size-5 group-hover:animate-pulse" />
                                </button>
                            </div>
                        }
                    />
                </div>

                {/* Secondary Section: Map & Help */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 bg-white/[0.01] rounded-[4rem] border-4 border-white/5 p-12 shadow-3xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <h3 className="font-black italic flex items-center gap-5 text-white uppercase text-xl tracking-[0.3em] leading-none pt-1">
                                <Satellite className="size-8 text-[#FF6600] animate-pulse" />
                                INDEXATION GÉOSPATIALE (GUINÉE)
                            </h3>
                            <div className="flex items-center gap-3 bg-[#FF6600]/10 border-2 border-[#FF6600]/20 px-4 py-2 rounded-xl">
                                <Activity className="size-4 text-[#FF6600]" />
                                <span className="text-[9px] font-black text-[#FF6600] uppercase tracking-widest italic pt-0.5">SIGNAL RÉSEAU STABLE</span>
                            </div>
                        </div>

                        <div className="aspect-video bg-black/40 rounded-[3rem] overflow-hidden relative border-4 border-white/5 shadow-inner group/map">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-40 grayscale group-hover/map:grayscale-0 transition-all duration-1000"
                                style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Guinea_Map.png/800px-Guinea_Map.png')" }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-transparent to-transparent opacity-80" />

                            {/* Scanning Effect */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="w-full h-1 bg-[#FF6600]/20 absolute top-0 left-0 animate-[scan_4s_infinite]" />
                            </div>

                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 flex flex-col items-center group/marker cursor-pointer text-white">
                                <div className="relative">
                                    <div className="absolute -inset-4 bg-[#FF6600]/20 rounded-full animate-ping" />
                                    <div className="absolute -inset-8 bg-[#FF6600]/10 rounded-full animate-pulse" />
                                    <Navigation className="size-12 text-[#FF6600] drop-shadow-[0_0_15px_rgba(255,102,0,0.6)] relative z-10" />
                                </div>
                                <div className="bg-black/80 backdrop-blur-md px-6 py-2 rounded-full shadow-3xl text-[10px] font-black mt-6 border-2 border-[#FF6600]/40 whitespace-nowrap group-hover/marker:scale-110 group-hover/marker:border-[#FF6600] transition-all uppercase tracking-[0.4em] italic text-white z-20">
                                    POINT DE PRÉSENCE ACTIF
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white group rounded-[4rem] p-12 text-black shadow-3xl flex flex-col justify-between relative overflow-hidden border-x-[16px] border-[#FF6600]">
                        <div className="absolute top-0 right-0 -mr-24 -mt-24 size-[30rem] bg-[#FF6600]/10 rounded-full blur-[100px] transition-transform group-hover:scale-125 duration-[4s]" />

                        <div className="relative z-10">
                            <div className="size-20 rounded-[1.5rem] bg-black text-[#FF6600] flex items-center justify-center mb-10 shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                                <Headset className="size-10" />
                            </div>
                            <h4 className="text-5xl font-black mb-6 italic tracking-tighter uppercase leading-[0.8]">BESOIN <br /> D'APPUI ?</h4>
                            <p className="text-slate-600 text-sm leading-relaxed mb-12 font-extrabold italic uppercase tracking-widest border-l-4 border-[#FF6600]/20 pl-6">
                                NOTRE SUPPORT LOGISTIQUE EST DISPONIBLE 24/7 POUR SÉCURISER VOS OPÉRATIONS SUR TOUT LE TERRITOIRE.
                            </p>
                        </div>

                        <div className="relative z-10 space-y-6">
                            <button className="w-full h-20 bg-black text-white font-black rounded-2xl hover:bg-[#FF6600] transition-all duration-700 flex items-center justify-center gap-6 shadow-3xl uppercase text-[11px] tracking-[0.4em] italic group/btn overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                <LifeBuoy className="size-6 relative z-10" />
                                <span className="relative z-10 pt-1">SUPPORT DIRECT</span>
                            </button>
                            <button className="w-full h-20 bg-white border-4 border-black text-black font-black rounded-2xl hover:bg-black hover:text-white transition-all duration-700 flex items-center justify-center gap-6 shadow-xl uppercase text-[11px] tracking-[0.4em] italic group/guide overflow-hidden">
                                <BookOpen className="size-6 group-hover/guide:scale-110 transition-transform" />
                                <span className="pt-1">GUIDE TACTIQUE</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CarrierDashboard;
