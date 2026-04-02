import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/ui/DataTable';
import {
    Search,
    Filter,
    Wallet,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Download,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft,
    Activity,
    Landmark,
    FileText,
    History
} from 'lucide-react';
import walletService from '../../services/walletService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await walletService.getAllTransactions();
            setTransactions(data || []);
        } catch (err) {
            toast.error("Impossible d'auditer les flux financiers.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || "";
        const id = t.id || "";
        return id.toLowerCase().includes(search.toLowerCase()) ||
            user.toLowerCase().includes(search.toLowerCase());
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant || 0), 0);
    const successfulCount = transactions.filter(t => t.statut === 'terminé').length;

    const columns = [
        {
            label: 'Identifiant',
            render: (t) => (
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                    #{t.id?.slice(0, 8) || 'N/A'}
                </span>
            )
        },
        {
            label: 'Acteur',
            render: (t) => {
                const user = t.Wallet?.User;
                return (
                    <div className="flex items-center gap-3 py-1">
                        <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || t.id}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate tracking-tight">
                                {user?.nom_complet || "Anonyme"}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {user?.role || "Membre"}
                            </p>
                        </div>
                    </div>
                );
            }
        },
        {
            label: 'Type',
            render: (t) => (
                <div className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border",
                    t.type === 'depot' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-rose-500/5 text-rose-500 border-rose-500/20"
                )}>
                    {t.type === 'depot' ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                    {t.type}
                </div>
            )
        },
        {
            label: 'Volume',
            render: (t) => (
                <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                    {parseFloat(t.montant || 0).toLocaleString('fr-GN')} <small className="text-[10px] font-bold text-primary">GNF</small>
                </span>
            )
        },
        {
            label: 'Statut',
            render: (t) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "size-2 rounded-full",
                        t.statut === 'terminé' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                            t.statut === 'en_attente' ? "bg-amber-500 animate-pulse" : "bg-red-500"
                    )} />
                    <span className={cn(
                        "text-[9px] font-bold uppercase tracking-widest",
                        t.statut === 'terminé' ? "text-emerald-500" :
                            t.statut === 'en_attente' ? "text-amber-500" : "text-red-500"
                    )}>
                        {t.statut === 'terminé' ? 'COMPLÉTÉ' : t.statut === 'en_attente' ? 'EN COURS' : 'ÉCHOUÉ'}
                    </span>
                </div>
            )
        },
        {
            label: 'Audit Time',
            render: (t) => (
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                    {new Date(t.createdAt).toLocaleString('fr-GN')}
                </span>
            )
        }
    ];

    return (
        <DashboardLayout title="Audit Financier">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Surveillance des Flux</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Audit des <span className="text-primary italic">Mouvements.</span></h2>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={fetchTransactions} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                        <button className="h-12 px-6 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-lg active:scale-95">
                            <Download className="size-4" /> Exporter Logs
                        </button>
                    </div>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <Landmark className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Volume Cumulé</p>
                            <p className="text-xl font-bold text-white uppercase">{totalVolume.toLocaleString()} <span className="text-[10px] text-primary">GNF</span></p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Opérations Réussies</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{successfulCount}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Activity className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Indice Santé Réseau</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">STABLE</p>
                        </div>
                    </div>
                </div>

                {/* Table Surface */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-2 text-slate-500">
                            <History className="size-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Journal des Opérations</span>
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-slate-300 outline-none"
                                placeholder="TRANS_ID, ACTEUR..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        <DataTable
                            columns={columns}
                            data={filtered}
                            isLoading={isLoading}
                            className="border-none shadow-none"
                        />

                        {!isLoading && filtered.length === 0 && (
                            <div className="py-24 text-center opacity-30">
                                <FileText className="size-16 mx-auto mb-6" />
                                <p className="text-xs font-bold uppercase tracking-widest">Aucun flux identifié</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
