import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Search,
    ListOrdered,
    Clock,
    Wallet,
    Package,
    CheckCircle2,
    XCircle,
    RotateCcw,
    RefreshCw,
    Activity,
    ChevronRight,
    ArrowUpRight,
    Filter,
    Zap,
    Truck,
    CircleDashed
} from 'lucide-react';
import orderService from '../../services/orderService';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import { DashboardAlerts } from '../../components/dashboard/DashboardAlerts';
import { formatGrowthCurrency, getLogisticsRisk } from '../../lib/GrowthMetrics';

const OrdersVendor = () => {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const STATUS_FILTERS = [
        { key: 'Tous', label: 'Global' },
        { key: 'en_attente', label: 'Attente' },
        { key: 'confirme', label: 'Confirmé' },
        { key: 'prepare', label: 'Préparé' },
        { key: 'expedie', label: 'Expédié' },
        { key: 'livre', label: 'Livré' },
        { key: 'annule', label: 'Annulé' }
    ];

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getVendorOrders();
            setOrders(data.orders || []);
        } catch (err) {
            toast.error("Échec de la synchronisation logistique.");
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
            toast.success(`Flux mis à jour : ${newStatus.toUpperCase()}`);
            fetchOrders();
        } catch (err) {
            toast.error("Échec de la transition de statut.");
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
            o.Order?.User?.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
            o.produit?.nom_produit.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const columns = [
        {
            label: 'Désignation Actif',
            render: (row) => (
                <div className="flex items-center gap-6">
                    <div className="size-16 rounded-[1.2rem] bg-accent/20 border-2 border-border flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner overflow-hidden">
                        {row.produit?.image_url ? (
                            <img src={row.produit.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <Package className="size-8 text-muted-foreground/20" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-black text-foreground italic uppercase tracking-tighter leading-none mb-2 truncate max-w-[200px]">
                            {row.produit?.nom_produit}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-muted-foreground/30 italic tracking-widest bg-accent/30 px-2 py-0.5 rounded-md border border-border">
                                ID: {row.commande_id.slice(0, 8)}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            label: 'Entité Client',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground uppercase tracking-widest italic group-hover:text-primary transition-colors">
                        {row.Order?.User?.nom_complet}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 font-bold mt-1 uppercase tracking-[0.2em]">
                        {row.Order?.User?.telephone}
                    </span>
                </div>
            )
        },
        {
            label: 'Volume',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black italic tracking-tighter text-executive-data">
                        x{row.quantite}
                    </span>
                    <span className="text-[9px] font-black text-muted-foreground/20 uppercase italic mt-1">UNITÉS</span>
                </div>
            )
        },
        {
            label: 'Cotation',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm font-black text-foreground tracking-tight">
                        {(row.prix_unitaire_achat * row.quantite).toLocaleString()} <small className="text-[9px] font-bold opacity-30">GNF</small>
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-md mt-1 w-fit">PRÊT MOBILE MONEY</span>
                </div>
            )
        },
        {
            label: 'Lieu / Flux',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <StatusBadge status={row.statut} variant={getStatusVariant(row.statut)} />
                </div>
            )
        },
        {
            label: 'Actions Logistiques',
            render: (row) => (
                <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                    {row.statut === 'en_attente' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'confirme')} 
                            className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-emerald-500 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all shadow-sm active:scale-95 group/btn" 
                            title="Confirmer Protocoles">
                            <CheckCircle2 className="size-4" />
                        </button>
                    )}
                    {row.statut === 'confirme' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'prepare')} 
                            className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-indigo-500 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all shadow-sm active:scale-95 group/btn" 
                            title="Prêt Logistique">
                            <Package className="size-4" />
                        </button>
                    )}
                    {['en_attente', 'confirme', 'prepare'].includes(row.statut) && (
                        <button onClick={() => handleStatusUpdate(row.id, 'annule')} 
                            className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all shadow-sm active:scale-95 group/btn" 
                            title="Révoquer Commande">
                            <XCircle className="size-4" />
                        </button>
                    )}
                    {row.statut === 'livre' && (
                        <button onClick={() => handleStatusUpdate(row.id, 'retourne')} 
                            className="size-10 bg-background border border-border rounded-lg flex items-center justify-center text-amber-500 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all shadow-sm active:scale-95 group/btn" 
                            title="Procéder au Retour">
                            <RotateCcw className="size-4" />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const stats = [
        { label: 'Flux Total', val: orders.length, icon: ListOrdered, color: 'text-primary' },
        { label: 'Attente Action', val: orders.filter(o => o.statut === 'en_attente').length, icon: Clock, color: 'text-amber-500' },
        { label: 'C.A. Réalisé', val: `${orders.filter(o => o.statut === 'livre').reduce((acc, o) => acc + (o.prix_unitaire_achat * o.quantite), 0).toLocaleString()} GNF`, icon: Wallet, color: 'text-emerald-500' },
    ];

    return (
        <DashboardLayout title="LOGISTIQUE DES VENTES">
            <div className="space-y-8 p-6 animate-in fade-in duration-500 pb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-border pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="size-2 bg-primary rounded-full shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none pt-0.5">Surveillance Logistique</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight uppercase leading-[0.85]">Gestion des <span className="text-primary">Commandes.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-sm border-l-2 border-primary/20 pl-4 max-w-lg italic">Fulfillment haute-vitesse et supervision des transactions.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={fetchOrders}
                            className="h-16 w-16 bg-background border border-border rounded-2xl flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-sm group"
                        >
                            <RefreshCw className={cn("size-6 group-hover:rotate-180 transition-transform duration-700", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Priority Alert System */}
                {orders.filter(o => o.statut === 'en_attente').length > 5 && (
                    <DashboardAlerts 
                        alerts={[{
                            type: 'warning',
                            label: 'Saturation Logistique',
                            message: `Vous avez un volume anormal de commandes (${orders.filter(o => o.statut === 'en_attente').length}) en attente de validation.`,
                            icon: <Truck className="size-5" />
                        }]}
                    />
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl border border-border flex flex-col justify-between h-44 shadow-sm group hover:border-primary/20 transition-all duration-300">
                            <div className="flex justify-between items-start">
                                <div className={cn("size-12 rounded-xl flex items-center justify-center bg-accent/20 border border-border shadow-inner group-hover:scale-110 transition-transform", s.color)}>
                                    <s.icon className="size-6" />
                                </div>
                                <Zap className="size-3 text-muted-foreground/10" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">{s.label}</p>
                                <p className={cn("text-3xl font-black tracking-tight leading-none text-executive-data truncate", s.color)}>{s.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logistics Velocity Pulse */}
                <div className="p-8 rounded-[2rem] bg-indigo-500/5 border-2 border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex items-center gap-8">
                        <div className="size-20 rounded-[2rem] bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Truck className="size-10" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none">Logistics Pulse — <span className="text-indigo-500">Flux Optimal.</span></h4>
                            <p className="text-muted-foreground/60 text-sm font-medium italic">Vitesse moyenne de livraison : <span className="text-foreground font-black">2.4h</span>. Aucun goulot d'étranglement détecté sur le segment mobile.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-3 bg-white dark:bg-white/5 border border-indigo-500/20 rounded-2xl flex flex-col items-center">
                            <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mb-1">Délai Sync</span>
                            <span className="text-xl font-black text-indigo-500 italic leading-none">0.8s</span>
                        </div>
                        <div className="px-6 py-3 bg-indigo-500 text-white rounded-2xl flex flex-col items-center shadow-lg shadow-indigo-500/20">
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Capacité MM</span>
                            <span className="text-xl font-black italic leading-none">100%</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between">
                    <div className="relative group/search flex-1 max-w-2xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-5 group-focus-within/search:text-primary transition-all" />
                        <input
                            className="w-full h-16 pl-14 pr-8 bg-background border border-border focus:border-primary/40 rounded-2xl text-xs font-bold uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                            placeholder="RECHERCHER CLIENT, PRODUIT OU ID COMMANDE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-3 animate-in slide-in-from-right-4 duration-300">
                             <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-2">{selectedIds.length} SÉLECTIONNÉES</span>
                            <button 
                                onClick={() => {
                                    selectedIds.forEach(id => handleStatusUpdate(id, 'confirme'));
                                    setSelectedIds([]);
                                }}
                                className="h-10 px-6 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                <CheckCircle2 className="size-4" /> Bulk Confirm
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-accent/10 p-1.5 rounded-2xl border border-border shadow-inner min-w-fit overflow-x-auto scroller-hide">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                                    activeFilter === f.key
                                        ? "bg-primary text-white shadow-lg"
                                        : "text-muted-foreground/40 hover:text-foreground"
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card rounded-[2rem] border border-border overflow-hidden shadow-sm">
                    <DataTable
                        selectable
                        selectedIds={selectedIds}
                        onSelectionChange={setSelectedIds}
                        columns={columns}
                        data={filtered}
                        isLoading={isLoading}
                    />
                </div>

                {/* Empty State Mock */}
                {!isLoading && filtered.length === 0 && (
                    <div className="py-40 text-center glass-card rounded-[4rem] border-4 border-border border-dashed">
                        <div className="flex flex-col items-center gap-10 opacity-20 group">
                            <CircleDashed className="size-24 animate-[spin_10s_linear_infinite]" />
                            <div className="space-y-4">
                                <p className="text-2xl font-black italic tracking-tighter uppercase">Aucun Flux Identifié</p>
                                <p className="text-sm font-bold uppercase tracking-widest">Les transactions apparaîtront ici dès validation client.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrdersVendor;
