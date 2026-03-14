import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Skeleton, TableRowSkeleton, CardSkeleton } from '../components/ui/Loader';
import { ErrorState, EmptyState } from '../components/ui/StatusStates';
import {
    Calendar,
    Download,
    TrendingUp,
    Clock,
    PackageCheck,
    Search,
    ChevronRight,
    ShoppingBag,
    Filter
} from 'lucide-react';

const UserOrders = () => {
    const [activeFilter, setActiveFilter] = useState('Tout');
    const [searchQuery, setSearchQuery] = useState('');
    const isLoading = false;
    const hasError = false;

    const ordersData = [
        { id: 'ORD-5291', date: '12 Oct 2023, 14:30', total: 12405000, status: 'Livré', variant: 'success', items: 3 },
        { id: 'ORD-5288', date: '10 Oct 2023, 09:15', total: 890000, status: 'En cours', variant: 'primary', items: 1 },
        { id: 'ORD-5282', date: '08 Oct 2023, 11:20', total: 5600000, status: 'Préparation', variant: 'warning', items: 5 },
        { id: 'ORD-5275', date: '05 Oct 2023, 16:45', total: 21000000, status: 'Annulé', variant: 'danger', items: 2 },
        { id: 'ORD-5270', date: '03 Oct 2023, 10:00', total: 4322000, status: 'Livré', variant: 'success', items: 4 },
    ];

    const stats = [
        { title: 'Dépenses Totales', value: '44.217.000 GNF', icon: TrendingUp, trend: 'up', trendValue: '+12%', description: 'vs mois dernier' },
        { title: 'Livraisons Actives', value: '2 colis', icon: PackageCheck, trend: 'neutral', trendValue: 'Stable', description: "En transit vers votre adresse" },
        { title: 'Délai Moyen', value: '3.5 Jours', icon: Clock, trend: 'up', trendValue: '-15%', description: 'plus rapide ce mois' },
    ];

    const filters = ["Tout", "Livré", "En cours", "Préparation", "Annulé"];

    const filteredOrders = ordersData.filter(o =>
        (activeFilter === 'Tout' || o.status === activeFilter) &&
        (o.id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const columns = [
        {
            label: 'Référence',
            render: (row) => (
                <div className="flex items-center gap-3 py-2">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                        <ShoppingBag className="size-5" />
                    </div>
                    <div>
                        <span className="font-black text-foreground italic tracking-tight hover:underline cursor-pointer">{row.id}</span>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{row.items} article{row.items > 1 ? 's' : ''}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Date d\'achat',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground">{row.date.split(',')[0]}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{row.date.split(',')[1].trim()}</span>
                </div>
            )
        },
        {
            label: 'Montant Total',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-foreground italic">{row.total.toLocaleString('fr-FR')} GNF</span>
                    <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">TTC</span>
                </div>
            )
        },
        {
            label: 'État de la Commande',
            render: (row) => <StatusBadge status={row.status} variant={row.variant} />
        },
        {
            label: 'Actions',
            render: () => (
                <div className="text-right">
                    <Button variant="ghost" size="sm" className="h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all flex items-center gap-2">
                        Détails
                        <ChevronRight className="size-3" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Historique des Commandes">
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Gestion des Achats</span>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                            Suivez vos commandes <br />
                            <span className="text-primary not-italic text-3xl md:text-4xl">en toute transparence.</span>
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-xl">Retrouvez l'historique complet, les factures et le suivi en temps réel de tous vos achats sur la plateforme.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" className="h-14 px-6 rounded-2xl font-bold uppercase tracking-widest text-[10px] gap-3 border-border hover:border-primary hover:text-primary transition-all shadow-sm">
                            <Calendar className="size-4" />
                            Période
                        </Button>
                        <Button className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 gap-2">
                            <Download className="size-4" />
                            Exporter
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {isLoading ? (
                        [1, 2, 3].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <div key={idx} className="bg-card p-6 rounded-3xl border border-border group hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="size-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <stat.icon className="size-6" />
                                    </div>
                                    {stat.trend !== 'neutral' && (
                                        <span className={cn(
                                            "text-[10px] font-black px-2 py-1 rounded-lg border",
                                            stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                                        )}>
                                            {stat.trendValue}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                    <h4 className="text-2xl font-black italic tracking-tighter text-foreground">{stat.value}</h4>
                                    <p className="text-[10px] text-muted-foreground font-medium">{stat.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Filter & Search Bar */}
                <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-card">
                    <div className="p-6 border-b border-border bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {filters.map((filter, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveFilter(filter)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                                        activeFilter === filter
                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                            : "bg-card border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>

                        <div className="relative group/search w-full lg:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4 group-focus-within/search:text-primary transition-colors" />
                            <input
                                className="w-full pl-11 pr-4 h-12 bg-background border-border border-2 focus:border-primary/50 focus:ring-primary/20 transition-all rounded-xl text-sm font-bold placeholder:text-muted-foreground/50"
                                placeholder="Rechercher par N° de commande..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="divide-y divide-border/50">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        ) : hasError ? (
                            <div className="p-10 text-center">
                                <ErrorState />
                            </div>
                        ) : filteredOrders.length > 0 ? (
                            <DataTable
                                columns={columns}
                                data={filteredOrders}
                                className="border-none shadow-none"
                            />
                        ) : (
                            <div className="p-10">
                                <EmptyState
                                    title="Aucune commande"
                                    description="Vous n'avez pas encore passé de commande ou aucune ne correspond à votre recherche."
                                    icon={ShoppingBag}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Tip */}
                <div className="flex items-center gap-4 p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                    <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                        <Filter className="size-5" />
                    </div>
                    <p className="text-sm text-foreground font-medium">
                        <span className="font-black italic">Conseil Pro:</span> Vous pouvez cliquer sur une référence de commande pour consulter le bordereau de livraison détaillé et les options de retour sous 14 jours.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserOrders;
