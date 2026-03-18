import React, { useState, useEffect } from 'react';
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
    Package,
    CheckCircle2,
    Truck,
    XCircle,
    RotateCcw
} from 'lucide-react';
import orderService from '../../services/orderService';

const OrdersVendor = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');

    const STATUS_FILTERS = ['Tous', 'en_attente', 'confirme', 'prepare', 'expedie', 'livre', 'annule'];

    const fetchOrders = async () => {
        try {
            const data = await orderService.getVendorOrders();
            setOrders(data);
        } catch (err) {
            console.error("Erreur chargement commandes:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (itemId, newStatus) => {
        try {
            await orderService.updateItemStatus(itemId, newStatus);
            fetchOrders();
        } catch (err) {
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    const getStatusVariant = (status) => {
        switch (status) {
            case 'en_attente': return 'warning';
            case 'confirme': return 'info';
            case 'prepare': return 'info';
            case 'expedie': return 'secondary';
            case 'livre': return 'success';
            case 'annule': return 'danger';
            case 'retourne': return 'danger';
            default: return 'neutral';
        }
    };

    const filtered = orders.filter((o) => {
        const matchStatus = activeFilter === 'Tous' || o.statut === activeFilter;
        const matchSearch =
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.Order?.User?.nom_complet.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const columns = [
        {
            label: 'Produit',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                        <Package className="size-5 text-slate-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{row.produit?.nom_produit}</p>
                        <p className="text-[10px] text-slate-500 font-mono">CMD-{row.commande_id.slice(0, 8)}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Client',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                        {row.Order?.User?.nom_complet}
                    </span>
                    <span className="text-[10px] text-slate-500">{row.Order?.User?.telephone}</span>
                </div>
            )
        },
        {
            label: 'Quantité',
            render: (row) => <span className="text-sm font-black text-slate-900 dark:text-white">x{row.quantite}</span>
        },
        {
            label: 'Montant',
            render: (row) => <span className="text-sm font-black text-slate-900 dark:text-white">{(row.prix_unitaire_achat * row.quantite).toLocaleString('fr-GN')} GNF</span>
        },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} />
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.statut === 'en_attente' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'confirme')} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Confirmer">
                            <CheckCircle2 className="size-4" />
                        </button>
                    )}
                    {row.statut === 'confirme' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'prepare')} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all" title="Prêt pour ramassage">
                            <Package className="size-4" />
                        </button>
                    )}
                    {['en_attente', 'confirme', 'prepare'].includes(row.statut) && (
                        <button onClick={() => handleStatusUpdate(row.id, 'annule')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Annuler">
                            <XCircle className="size-4" />
                        </button>
                    )}
                    {row.statut === 'livre' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'retourne')} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all" title="Retourner">
                            <RotateCcw className="size-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Commandes Reçues">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DashboardCard title="Total Ventes" value={orders.length.toString()} icon={ListOrdered} />
                    <DashboardCard title="À Traiter" value={orders.filter(o => o.statut === 'en_attente').length.toString()} icon={Clock} />
                    <DashboardCard
                        title="CA Réalisé"
                        value={`${orders.filter(o => o.statut === 'livre').reduce((acc, o) => acc + (o.prix_unitaire_achat * o.quantite), 0).toLocaleString('fr-GN')} GNF`}
                        icon={Wallet}
                    />
                </div>

                {/* Filters and Table */}
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
                            {STATUS_FILTERS.map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-4 py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activeFilter === f
                                        ? 'bg-white dark:bg-slate-700 shadow-md text-primary ring-1 ring-slate-200 dark:ring-slate-600'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {f.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-primary/20 w-64 transition-all uppercase tracking-widest placeholder:text-slate-400"
                                    placeholder="Rechercher un client ou CMD..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default OrdersVendor;
