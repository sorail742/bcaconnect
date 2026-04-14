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
    MapPin,
    PackageSearch,
    UserCheck,
    Play,
    Flag
} from 'lucide-react';
import deliveryService from '../../services/deliveryService';
import useSocket from '../../hooks/useSocket';
import OtpVerificationModal from '../../components/carrier/OtpVerificationModal';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const CarrierDashboard = () => {
    // États de données
    const [availableDeliveries, setAvailableDeliveries] = useState([]);
    const [myDeliveries, setMyDeliveries] = useState([]);
    const [stats, setStats] = useState({ 
        assigned: '0', 
        inProgress: '0', 
        completed: '0', 
        available: '0' 
    });
    
    // États UI
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('AVAILABLE'); // AVAILABLE | MINE
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    const { on, off } = useSocket();

    // Récupération des données
    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [available, mine] = await Promise.all([
                deliveryService.getAvailableOrders(),
                deliveryService.getMyDeliveries()
            ]);
            
            setAvailableDeliveries(available || []);
            setMyDeliveries(mine || []);

            setStats({
                assigned: (mine || []).length.toString(),
                inProgress: (mine || []).filter(d => d.statut_livraison === 'en_route').length.toString(),
                completed: '0', // Nécessiterait un endpoint history propre
                available: (available || []).length.toString(),
            });
        } catch (error) {
            console.error("Erreur chargement logistique:", error);
            toast.error("ERREUR DE SYNCHRONISATION RÉSEAU.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Temps réel
    useEffect(() => {
        if (!on) return;
        
        const handleUpdate = () => {
            fetchData();
        };

        on('notification_received', handleUpdate);
        return () => off('notification_received', handleUpdate);
    }, [on, off, fetchData]);

    // Actions
    const handleAssign = async (orderId) => {
        try {
            await deliveryService.assignOrder(orderId);
            toast.success("MISSION ASSIGNÉE. VEUILLEZ RAMASSER LE COLIS.");
            fetchData();
            setActiveTab('MINE');
        } catch (err) {
            toast.error("ERREUR D'ASSIGNATION TACTIQUE.");
        }
    };

    const handleStartJourney = async (orderId) => {
        try {
            await deliveryService.updateTracking({
                orderId,
                status: 'en_route',
                commentaire: 'Transporteur en route vers la destination'
            });
            toast.success("MISSION EN COURS : SIGNAL GPS ACTIVÉ.");
            fetchData();
        } catch (err) {
            toast.error("ERREUR DE DÉMARRAGE DU FLUX.");
        }
    };

    const openOtpModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsOtpModalOpen(true);
    };

    // Colonnes pour "DISPONIBLES"
    const availableColumns = [
        {
            label: 'UNITÉ SOURCE',
            render: (row) => (
                <span className="font-black text-[#FF6600] uppercase text-[9px] tracking-widest bg-[#FF6600]/5 px-2 py-1 rounded-lg border border-[#FF6600]/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: 'ZONE DE RAMASSAGE',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className="font-black text-slate-800 dark:text-foreground text-[10px] uppercase">BOUTIQUE SOURCE</span>
                    <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest truncate max-w-[150px]">
                        CONAKRY / {row.adresse_livraison.split(',')[0]}
                    </span>
                </div>
            )
        },
        {
            label: 'PÉRIMÈTRE CIBLE',
            render: (row) => (
                <div className="max-w-[200px] truncate font-black text-muted-foreground text-[9px] uppercase tracking-widest" title={row.adresse_livraison}>
                    {row.adresse_livraison}
                </div>
            )
        },
        {
            label: 'ACTION',
            render: (row) => (
                <div className="text-right">
                    <button
                        onClick={() => handleAssign(row.id)}
                        className="h-8 px-4 bg-[#FF6600] text-foreground text-[9px] font-black rounded-lg transition-all shadow-md active:scale-95 uppercase tracking-widest hover:brightness-110 flex items-center gap-2 ml-auto"
                    >
                        <UserCheck className="size-3" /> ACCEPTER
                    </button>
                </div>
            )
        }
    ];

    // Colonnes pour "MES MISSIONS"
    const myMissionsColumns = [
        {
            label: 'ID MISSION',
            render: (row) => (
                <span className="font-black text-emerald-500 uppercase text-[9px] tracking-widest bg-emerald-500/5 px-2 py-1 rounded-lg border border-emerald-500/10">
                    #{row.id.slice(0, 8).toUpperCase()}
                </span>
            )
        },
        {
            label: 'STATUT OPÉRATIONNEL',
            render: (row) => {
                const status = row.statut_livraison;
                return (
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'livre' ? "bg-emerald-500" :
                            status === 'en_route' ? "bg-amber-500 animate-pulse" : "bg-blue-500"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'livre' ? "text-emerald-500" :
                            status === 'en_route' ? "text-amber-500" : "text-blue-500"
                        )}>
                            {status === 'ramasse' ? 'COLIS RÉCUPÉRÉ' : status === 'en_route' ? 'EN TRANSIT' : status?.toUpperCase() || 'ASSIGNÉ'}
                        </span>
                    </div>
                );
            }
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    {row.statut_livraison !== 'en_route' && row.statut_livraison !== 'livre' ? (
                        <button
                            onClick={() => handleStartJourney(row.id)}
                            className="h-8 px-4 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2"
                        >
                            <Play className="size-3" /> DÉMARRER
                        </button>
                    ) : row.statut_livraison === 'en_route' ? (
                        <button
                            onClick={() => openOtpModal(row.id)}
                            className="h-8 px-4 bg-emerald-500 text-slate-900 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/10"
                        >
                            <Flag className="size-3" /> TERMINER
                        </button>
                    ) : (
                        <span className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">FLUX TERMINÉ</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE LOGISTIQUE">
            <div className="space-y-8 animate-in fade-in duration-700 pb-24">

                {/* KPI Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard title="MY ASSIGNATIONS" value={stats.assigned} icon={ClipboardList} className="h-32 border-[#FF6600]/10" />
                    <DashboardCard title="EN TRANSIT" value={stats.inProgress} icon={Truck} className="h-32" />
                    <DashboardCard title="HISTORIQUE" value={stats.completed} icon={CheckCircle2} className="h-32" />
                    <DashboardCard title="OFFRES LIBRES" value={stats.available} icon={Hourglass} className="h-32" />
                </div>

                {/* Main Control Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Mission Terminal */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-4 bg-white dark:bg-[#0F1219] p-2 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm">
                            <button
                                onClick={() => setActiveTab('AVAILABLE')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'AVAILABLE' 
                                        ? "bg-[#FF6600] text-foreground shadow-lg shadow-[#FF6600]/20" 
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <PackageSearch className="size-4" /> MISSIONS DISPONIBLES
                            </button>
                            <button
                                onClick={() => setActiveTab('MINE')}
                                className={cn(
                                    "flex-1 h-12 rounded-xl flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all",
                                    activeTab === 'MINE' 
                                        ? "bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 shadow-xl shadow-black/10" 
                                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-foreground/5"
                                )}
                            >
                                <UserCheck className="size-4" /> MON JOURNAL DE BORD
                            </button>
                        </div>

                        {/* List Area */}
                        <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-3xl shadow-sm overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-slate-100 dark:border-foreground/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Activity className="size-4 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {activeTab === 'AVAILABLE' ? 'MARCHÉ DES FLUX LOGISTIQUES' : 'SUIVI DES OPÉRATIONS'}
                                    </span>
                                </div>
                                <button onClick={fetchData} className="size-8 rounded-lg bg-slate-50 dark:bg-foreground/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                                    <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                                </button>
                            </div>

                            <div className="p-4">
                                <DataTable
                                    columns={activeTab === 'AVAILABLE' ? availableColumns : myMissionsColumns}
                                    data={activeTab === 'AVAILABLE' ? availableDeliveries : myDeliveries}
                                    isLoading={isLoading}
                                    className="bg-transparent border-0"
                                />
                                {!isLoading && (activeTab === 'AVAILABLE' ? availableDeliveries.length === 0 : myDeliveries.length === 0) && (
                                    <div className="py-24 text-center opacity-30 flex flex-col items-center gap-6">
                                         <Box className="size-12" />
                                         <div className="space-y-2">
                                             <p className="text-[10px] font-black uppercase tracking-widest">TERMINAL VIDE</p>
                                             <p className="text-[8px] font-black opacity-60">AUCUNE DONNÉE RÉPERTORIÉE DANS CE CANAL</p>
                                         </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Side Info Panel */}
                    <div className="lg:col-span-4 space-y-6">
                         {/* Map Hub - Placeholder */}
                         <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden group/map">
                            <div className="flex items-center justify-between relative z-10">
                                <Globe className="size-6 text-emerald-500" />
                                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">GPS ACTIVE</span>
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10">
                                <h4 className="text-sm font-black text-white uppercase">ZONE CONAKRY ALPHA</h4>
                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">STATION TERMINAL 01</p>
                            </div>
                            <div className="aspect-[4/3] bg-black rounded-2xl border border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 hover:opacity-80">
                                <div className="w-full h-full bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Guinea_Map.png/800px-Guinea_Map.png')] bg-cover bg-center" />
                            </div>
                        </div>

                        {/* Status Console */}
                        <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-3xl p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <Shield className="size-5 text-[#FF6600]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#FF6600]">STATUT CARRIER</span>
                            </div>
                            <p className="text-[9px] font-black leading-relaxed text-muted-foreground uppercase opacity-80">
                                VOTRE COMPTE EST ACTUELLEMENT EN RÈGLE. VOUS POUVEZ ACCEPTER JUSQU'À 5 MISSIONS SIMULTANÉES.
                            </p>
                            <div className="pt-2">
                                <button className="w-full h-12 bg-slate-900 dark:bg-white text-foreground dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#FF6600] hover:text-foreground">
                                    CONTACTER LE HUB
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de vérification OTP */}
            <OtpVerificationModal
                isOpen={isOtpModalOpen}
                onClose={() => setIsOtpModalOpen(false)}
                orderId={selectedOrderId}
                onSuccess={fetchData}
            />
        </DashboardLayout>
    );
};

export default CarrierDashboard;
