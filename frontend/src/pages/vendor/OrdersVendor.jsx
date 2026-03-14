import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import DashboardCard from '../../components/ui/DashboardCard';
import {
    Search,
    ListOrdered,
    Clock,
    Wallet,
    SlidersHorizontal,
    MoreHorizontal,
} from 'lucide-react';

const OrdersVendor = () => {
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');

    const STATUS_FILTERS = ['Tous', 'En attente', 'Expédié', 'Livré', 'Annulé'];

    const ordersData = [
        { id: '#CMD-9482', initials: 'JD', client: 'Jean Diallo', date: '12 Mar 2024', amount: 1240000, status: 'En attente', variant: 'warning' },
        { id: '#CMD-9481', initials: 'ML', client: 'Mariama Lamarana', date: '11 Mar 2024', amount: 850000, status: 'Expédié', variant: 'info' },
        { id: '#CMD-9480', initials: 'PM', client: 'Pierre Magassouba', date: '10 Mar 2024', amount: 2410000, status: 'Livré', variant: 'success' },
        { id: '#CMD-9479', initials: 'SB', client: 'Safiatou Barry', date: '10 Mar 2024', amount: 120000, status: 'Annulé', variant: 'danger' },
        { id: '#CMD-9478', initials: 'LR', client: 'Lamine Roger', date: '09 Mar 2024', amount: 540000, status: 'Livré', variant: 'success' },
    ];

    const filtered = ordersData.filter((o) => {
        const matchStatus = activeFilter === 'Tous' || o.status === activeFilter;
        const matchSearch =
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.client.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const columns = [
        {
            label: 'ID Commande',
            render: (row) => <span className="font-black text-primary text-xs italic tracking-widest">{row.id}</span>
        },
        {
            label: 'Client',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20">
                        {row.initials}
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {row.client}
                    </span>
                </div>
            )
        },
        {
            label: 'Date',
            render: (row) => <span className="text-xs font-bold text-slate-500 uppercase">{row.date}</span>
        },
        {
            label: 'Montant',
            render: (row) => <span className="text-sm font-black text-slate-900 dark:text-white">{row.amount.toLocaleString('fr-FR')} GNF</span>
        },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.variant} />
        },
        {
            label: 'Actions',
            render: () => (
                <div className="text-right">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <MoreHorizontal className="size-4 text-slate-400" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Commandes Reçues">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard
                        title="Total Commandes"
                        value="1.284"
                        icon={ListOrdered}
                        trend="up"
                        trendValue="+12.5%"
                    />
                    <DashboardCard
                        title="En attente"
                        value="42"
                        icon={Clock}
                        trend="neutral"
                        trendValue="En hausse"
                    />
                    <DashboardCard
                        title="Revenu Total"
                        value="45.200.000 GNF"
                        icon={Wallet}
                        trend="down"
                        trendValue="-2.4%"
                    />
                </div>

                {/* Filters and Table */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeFilter === f
                                        ? 'bg-white dark:bg-slate-700 shadow-md text-primary ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 w-64 transition-all uppercase tracking-widest"
                                    placeholder="Rechercher..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary transition-colors">
                                <SlidersHorizontal className="size-4" />
                                Filtres
                            </button>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filtered}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrdersVendor;
