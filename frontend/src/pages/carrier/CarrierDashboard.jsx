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
    Phone
} from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import deliveryService from '../../services/deliveryService';
import { toast } from 'sonner';

const CarrierDashboard = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [stats, setStats] = useState([
        { title: "Commandes assignées", value: '0', icon: ClipboardList },
        { title: 'Livraisons en cours', value: '0', icon: Truck },
        { title: 'Livraisons terminées', value: '0', icon: CheckCircle2 },
        { title: 'Livraisons en attente', value: '0', icon: Hourglass },
    ]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('Tous');

    const fetchDeliveries = async () => {
        try {
            setIsLoading(true);
            const data = await deliveryService.getAvailableOrders();
            // Note: En prod, on filtrerait entre 'disponibles' et 'assignées à moi'
            setDeliveries(data);

            // Calcul simplifié des stats
            setStats([
                { title: "Commandes assignées", value: data.filter(d => d.statut === 'expédié').length.toString(), icon: ClipboardList },
                { title: 'Livraisons en cours', value: data.filter(d => d.statut_livraison === 'en_cours').length.toString(), icon: Truck },
                { title: 'Livraisons terminées', value: data.filter(d => d.statut_livraison === 'livré').length.toString(), icon: CheckCircle2 },
                { title: 'Disponibles', value: data.length.toString(), icon: Hourglass },
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
            toast.success(`Statut mis à jour : ${nextStatus}`);
            fetchDeliveries();
        } catch (err) {
            toast.error("Erreur lors de la mise à jour.");
        }
    };

    const deliveryColumns = [
        {
            label: 'ID Commande',
            render: (row) => <span className="font-bold text-primary uppercase text-xs tracking-tighter">#{row.id.slice(0, 8)}</span>
        },
        {
            label: 'Client / Destinataire',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black italic text-foreground text-xs">{row.nom_destinataire || 'Client anonyme'}</span>
                    <span className="text-[10px] text-muted-foreground font-bold tracking-widest">{row.telephone_livraison || 'Pas de tel'}</span>
                </div>
            )
        },
        {
            label: 'Adresse Livraison',
            render: (row) => (
                <div className="max-w-[200px] truncate font-medium text-slate-600 dark:text-slate-400 text-xs" title={row.adresse_livraison}>
                    {row.adresse_livraison || 'Adresse non spécifiée'}
                </div>
            )
        },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.statut_livraison || row.statut} />
        },
        {
            label: 'Date',
            render: (row) => <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(row.createdAt).toLocaleDateString('fr-FR')}</span>
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="text-right">
                    {row.statut !== 'livré' ? (
                        <button
                            onClick={() => handleAction(row.id, row.statut_livraison || row.statut)}
                            className="px-4 py-1.5 bg-primary text-white text-[10px] font-black rounded-xl transition-all shadow-md shadow-primary/20 uppercase tracking-widest hover:scale-105"
                        >
                            {row.statut === 'payé' ? 'Récupérer' : row.statut_livraison === 'en_cours' ? 'Terminer' : 'Mettre à jour'}
                        </button>
                    ) : (
                        <span className="text-emerald-500 text-[10px] font-black italic uppercase tracking-widest flex items-center justify-end gap-1">
                            <CheckCircle2 className="size-3" /> Terminée
                        </span>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Tableau de bord Transporteur">
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
                    )}
                </div>

                {/* Main Section: Deliveries */}
                <div className="bg-card rounded-[2rem] border border-border overflow-hidden shadow-xl">
                    <DataTable
                        title="Gestion des Livraisons en Temps Réel"
                        columns={deliveryColumns}
                        data={deliveries}
                        isLoading={isLoading}
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                {['Tous', 'En attente', 'En livraison', 'Livré'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                            }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                                <button onClick={fetchDeliveries} className="p-2 rounded-xl border border-border hover:bg-muted transition-colors">
                                    <Clock className="size-4" />
                                </button>
                            </div>
                        }
                    />
                </div>

                {/* Secondary Section: Map & Help */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-black italic flex items-center gap-3 text-slate-900 dark:text-white uppercase text-[10px] tracking-[0.2em]">
                                <MapIcon className="size-5 text-primary" />
                                Localisation en temps réel (Guinée)
                            </h3>
                        </div>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-inner group">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-80"
                                style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Guinea_Map.png/800px-Guinea_Map.png')" }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 flex flex-col items-center group cursor-pointer text-slate-900 dark:text-white">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
                                    <Navigation className="size-10 text-primary drop-shadow-lg" />
                                </div>
                                <div className="bg-white dark:bg-slate-900 px-4 py-1 rounded-full shadow-2xl text-[8px] font-black mt-2 border border-primary/20 whitespace-nowrap group-hover:scale-110 transition-transform uppercase tracking-widest">
                                    MA POSITION
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary via-indigo-600 to-blue-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/30 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-80 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
                                <Headset className="size-8" />
                            </div>
                            <h4 className="text-3xl font-black mb-4 italic tracking-tight uppercase leading-none">Besoin <br /> d'aide ?</h4>
                            <p className="text-white/80 text-xs leading-relaxed mb-8 font-medium">
                                Notre support dédié aux transporteurs est disponible 24/7 pour vous assister dans vos tournées en Guinée.
                            </p>
                        </div>
                        <div className="relative z-10 space-y-4">
                            <button className="w-full py-4 bg-white text-primary font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg uppercase text-[10px] tracking-widest text-center">
                                <LifeBuoy className="size-4" />
                                Contacter le support
                            </button>
                            <button className="w-full py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/20 uppercase text-[10px] tracking-widest text-center">
                                <BookOpen className="size-4" />
                                Guide transporteur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CarrierDashboard;
