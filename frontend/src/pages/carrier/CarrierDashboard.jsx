import React, { useState } from 'react';
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
    Hourglass
} from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';

const STATS = [
    { title: "Commandes assignées", value: '12', icon: ClipboardList },
    { title: 'Livraisons en cours', value: '5', icon: Truck },
    { title: 'Livraisons terminées', value: '148', icon: CheckCircle2 },
    { title: 'Livraisons en attente', value: '3', icon: Hourglass },
];

const DELIVERIES = [
    { id: '#ORD-9823', client: 'Marc Lefebvre', shop: 'Tech Store Paris', address: '15 Rue de la Paix, 75002 Paris', status: 'En attente ramassage', statusType: 'warning', date: "Aujourd'hui, 10:30", action: 'Accepter' },
    { id: '#ORD-9821', client: 'Sophie Martin', shop: 'Mode & Co Lyon', address: '42 Avenue Foch, 69006 Lyon', status: 'En livraison', statusType: 'info', date: "Aujourd'hui, 09:15", action: 'Livré' },
    { id: '#ORD-9799', client: 'Lucas Bernard', shop: 'Brico Dépôt Nice', address: '8 Promenade des Anglais, 06000 Nice', status: 'Assignée', statusType: 'info', date: 'Hier, 17:45', action: 'Démarrer' },
    { id: '#ORD-9750', client: 'Emma Petit', shop: 'Bio Marché Lille', address: '12 Boulevard Vauban, 59000 Lille', status: 'Livré', statusType: 'success', date: 'Hier, 14:20', action: null },
];

const CarrierDashboard = () => {
    const [filter, setFilter] = useState('Tous');
    const isLoading = false;

    const deliveryColumns = [
        {
            label: 'ID Commande',
            render: (row) => <span className="font-bold text-primary">{row.id}</span>
        },
        { label: 'Client', key: 'client' },
        { label: 'Boutique', key: 'shop' },
        {
            label: 'Adresse Livraison',
            render: (row) => (
                <div className="max-w-[200px] truncate font-medium text-slate-600 dark:text-slate-400" title={row.address}>
                    {row.address}
                </div>
            )
        },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusType} />
        },
        { label: 'Date', key: 'date' },
        {
            label: 'Actions',
            render: (row) => (
                <div className="text-right">
                    {row.action ? (
                        <button className={`px-4 py-1.5 text-white text-[11px] font-black rounded-xl transition-all shadow-md uppercase tracking-wider ${row.action === 'Accepter' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' :
                            row.action === 'Livré' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' :
                                'bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 shadow-slate-200'
                            }`}>
                            {row.action}
                        </button>
                    ) : (
                        <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-widest">Terminée</span>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Tableau de bord Transporteur">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        STATS.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
                    )}
                </div>

                {/* Main Section: Deliveries */}
                <div>
                    {isLoading ? (
                        <div className="bg-card rounded-2xl border border-border overflow-hidden p-6 space-y-4">
                            <Skeleton className="h-6 w-1/4" />
                            <div className="divide-y divide-border/50">
                                {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        </div>
                    ) : ( // hasError condition removed as hasError is always false
                        <DataTable
                            title="Gestion des Livraisons"
                            columns={deliveryColumns}
                            data={DELIVERIES}
                            actions={
                                <div className="flex flex-wrap items-center gap-2">
                                    {['Tous', 'En attente', 'En livraison', 'Livré'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${filter === f
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                                                }`}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            }
                        />
                    )}
                </div>

                {/* Secondary Section: Map & Help */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="font-bold flex items-center gap-3 text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                                <span className="material-symbols-outlined text-primary">map</span>
                                Localisation en temps réel
                            </h3>
                            <button className="text-[10px] text-primary font-black hover:underline uppercase tracking-widest">Plein écran</button>
                        </div>
                        <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-inner group">
                            <div
                                className="absolute inset-0 bg-cover bg-center opacity-80"
                                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDjtVLnym32DFkbuccS0pRZ6zWsrhnUvST0yVB1ik9uIHC3h7bEiEJThuo4Fj_cnkdiSrZeHnAotj9zkQp6mxv9d5Eze7-nxDEzW8341DBin6BUOSOhf_9FE9PjKifXJEykAeLoXrxEDTk0hoayveU62RkJpoCGf0cB6X7nYqQqci_H6SoZR_-4b-nqo_857rmNgIy8KdKbZGJdX0EqP6vJqjo8T6dMa3PbXWXs3JyCm3KM8Ig9oBes43bGxXgQH75UQ7r9Joe2mcN4')" }}
                            ></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-16 flex flex-col items-center group cursor-pointer text-slate-900 dark:text-white">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-primary/20 rounded-full animate-ping"></div>
                                    <span className="material-symbols-outlined text-primary fill-1 text-5xl relative drop-shadow-lg">location_on</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-2xl text-[9px] font-black mt-[-8px] border border-primary/20 whitespace-nowrap group-hover:scale-110 transition-transform uppercase tracking-widest">
                                    MA POSITION
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary via-indigo-600 to-blue-800 rounded-2xl p-8 text-white shadow-2xl shadow-primary/30 flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 size-80 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center mb-6">
                                <Headset className="size-6" />
                            </div>
                            <h4 className="text-2xl font-black mb-3 italic tracking-tight uppercase">Besoin d'aide ?</h4>
                            <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                                Notre support dédié aux transporteurs est disponible 24/7 pour vous assister dans vos tournées en Guinée.
                            </p>
                        </div>
                        <div className="relative z-10 space-y-3">
                            <button className="w-full py-4 bg-white text-primary font-black rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg uppercase text-xs tracking-widest text-center">
                                <LifeBuoy className="size-5" />
                                Contacter le support
                            </button>
                            <button className="w-full py-4 bg-white/10 text-white font-black rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-3 border border-white/20 uppercase text-xs tracking-widest text-center">
                                <BookOpen className="size-5" />
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

