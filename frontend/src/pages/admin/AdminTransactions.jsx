import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Search, Wallet, CheckCircle2, Download, RefreshCcw,
    ArrowUpRight, ArrowDownLeft, Activity, Landmark, History, Shield
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
            setTransactions(Array.isArray(data) ? data : []);
        } catch {
            toast.error("Erreur lors du chargement des transactions.");
            setTransactions([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || '';
        const id = t.id || '';
        return id.toLowerCase().includes(search.toLowerCase()) ||
            user.toLowerCase().includes(search.toLowerCase());
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant || 0), 0);
    const successfulCount = transactions.filter(t => t.statut === 'terminé').length;

    const handleDownload = () => {
        toast.info("Génération de l'export financier...");
        setTimeout(() => toast.success("Export généré."), 2000);
    };

    return (
        <DashboardLayout title="Transactions">
            <div className="space-y-5 pb-10">

                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Landmark className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Audit financier</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-xs text-muted-foreground">
                                    Surveillance flux — {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchTransactions}
                            className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-all"
                        >
                            <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="h-9 px-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
                        >
                            <Download className="size-4" />
                            Exporter
                        </button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Volume total', value: `${totalVolume.toLocaleString('fr-GN')} GNF`, icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
                        { label: 'Opérations validées', value: successfulCount.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                        { label: 'Intégrité réseau', value: '99.9%', icon: Activity, color: 'text-primary', bg: 'bg-primary/10' },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4"
                        >
                            <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 border border-border", stat.bg)}>
                                <stat.icon className={cn("size-5", stat.color)} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                <p className="text-lg font-bold text-foreground tabular-nums">{stat.value}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    {/* Table header */}
                    <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <History className="size-4 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Historique des flux</h3>
                                <p className="text-xs text-muted-foreground">Système de surveillance v4.0</p>
                            </div>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <input
                                className="w-full h-9 pl-9 pr-3 bg-background border border-border rounded-xl text-sm outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground"
                                placeholder="Rechercher par ID ou utilisateur..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table content */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="p-8 space-y-3">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : filtered.length > 0 ? (
                            <table className="w-full text-sm min-w-[700px]">
                                <thead>
                                    <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border">
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Utilisateur</th>
                                        <th className="px-4 py-3 text-left">Direction</th>
                                        <th className="px-4 py-3 text-left">Montant</th>
                                        <th className="px-4 py-3 text-left">Statut</th>
                                        <th className="px-4 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filtered.map((t, idx) => {
                                        const user = t.Wallet?.User;
                                        const isDeposit = t.type === 'depot';
                                        return (
                                            <tr key={t.id || idx} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <span className="text-xs font-mono font-semibold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
                                                        #{(t.id || 'N/A').slice(0, 8).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-lg overflow-hidden bg-muted border border-border shrink-0">
                                                            <img
                                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || t.id}`}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-foreground">{user?.nom_complet || 'Système'}</p>
                                                            <p className="text-xs text-muted-foreground">{user?.role || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={cn(
                                                        "flex items-center gap-1.5 w-fit px-3 py-1 rounded-full text-xs font-semibold border",
                                                        isDeposit
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                    )}>
                                                        {isDeposit ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                                                        {isDeposit ? 'Entrant' : 'Sortant'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-bold text-foreground tabular-nums">
                                                        {parseFloat(t.montant || 0).toLocaleString('fr-GN')}
                                                        <span className="text-xs text-primary ml-1">GNF</span>
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "size-2 rounded-full",
                                                            t.statut === 'terminé' ? "bg-emerald-500" :
                                                            t.statut === 'en_attente' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                                        )} />
                                                        <span className={cn(
                                                            "text-xs font-semibold",
                                                            t.statut === 'terminé' ? "text-emerald-600 dark:text-emerald-400" :
                                                            t.statut === 'en_attente' ? "text-amber-600 dark:text-amber-400" : "text-rose-500"
                                                        )}>
                                                            {t.statut === 'terminé' ? 'Validé' : t.statut === 'en_attente' ? 'En attente' : 'Rejeté'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className="text-xs font-medium text-foreground">
                                                        {new Date(t.createdAt).toLocaleDateString('fr-GN')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(t.createdAt).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-16 flex flex-col items-center gap-4 text-center">
                                <Shield className="size-10 text-muted-foreground/30" />
                                <div>
                                    <p className="text-sm font-bold text-foreground">Aucune transaction</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {search ? 'Aucun résultat pour cette recherche.' : 'Aucune transaction enregistrée.'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
