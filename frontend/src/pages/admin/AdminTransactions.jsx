import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Search, Wallet, CheckCircle2, Download, RefreshCcw,
    ArrowUpRight, ArrowDownLeft, Activity, Filter,
    Clock, CreditCard, ShieldCheck, History
} from 'lucide-react';
import { useAllTransactions } from '../../hooks/useDomainData';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                {title}
            </p>
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter tabular-nums leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-tight">{subtitle}</p>
            </div>
        </div>
    </motion.div>
);

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const { data, loading: isLoading, refetch: fetchTransactions } = useAllTransactions();
    const transactions = data?.transactions || [];

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || '';
        const id = t.id || '';
        const matchesSearch = id.toLowerCase().includes(search.toLowerCase()) || user.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || (filterStatus === 'SUCCESS' && t.statut === 'terminé') || (filterStatus === 'PENDING' && t.statut === 'en_attente');
        return matchesSearch && matchesStatus;
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant || 0), 0);
    const successfulCount = transactions.filter(t => t.statut === 'terminé').length;
    const pendingCount = transactions.filter(t => t.statut === 'en_attente').length;

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(filtered.map(t => ({
            ID: t.id,
            USER: t.Wallet?.User?.nom_complet,
            ROLE: t.Wallet?.User?.role,
            TYPE: t.type,
            MONTANT: t.montant,
            STATUT: t.statut,
            DATE: new Date(t.createdAt).toLocaleString()
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
        XLSX.writeFile(workbook, `BCA_Ledger_${Date.now()}.xlsx`);
        toast.success("EXPORT EXCEL RÉUSSI.");
    };

    return (
        <DashboardLayout title="TRANSACTIONAL AUDIT" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Activity className="size-7 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Audit <span className="text-primary">Flux</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    {transactions.length} ENTRÉES INDEXÉES • SYNC_MASTER
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="IDENTIFIER USER / ID..."
                                className="h-12 w-64 bg-white border border-slate-100 rounded-2xl pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none transition-all placeholder:text-slate-200"
                            />
                        </div>
                        <button onClick={handleExportExcel} className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 hover:opacity-90 active:scale-95 transition-all">
                            <Download className="size-4" />
                            Export Ledger
                        </button>
                        <button onClick={fetchTransactions} className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Volume Global" value={`${totalVolume.toLocaleString()} GNF`} icon={Wallet} color="text-primary" subtitle="Liquidity Flow" />
                    <StatCard title="Succès Réseau" value={successfulCount.toString()} icon={ShieldCheck} color="text-emerald-500" subtitle="Validated TX" />
                    <StatCard title="En Attente" value={pendingCount.toString()} icon={Clock} color="text-amber-500" subtitle="Pending Reconciliation" />
                    <StatCard title="Santé Satellite" value="100%" icon={History} color="text-blue-500" subtitle="Uptime Integrity" />
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Filter HUD */}
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Filter className="size-4 text-slate-300" />
                            <div className="flex items-center gap-2">
                                {['ALL', 'SUCCESS', 'PENDING'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFilterStatus(s)}
                                        className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-6 h-9 rounded-xl transition-all",
                                            filterStatus === s ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        )}
                                    >
                                        {s === 'ALL' ? 'TOUS' : s === 'SUCCESS' ? 'VALIDÉS' : 'EN ATTENTE'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] italic">Master Ledger V4.0.2</span>
                    </div>

                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-50">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité / Node</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type / Rôle</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Flux</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Quantum (GNF)</th>
                                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Horodatage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-8 py-10" />
                                        </tr>
                                    ))
                                ) : filtered.map((tx, idx) => {
                                    const user = tx.Wallet?.User;
                                    const isDeposit = tx.type === 'depot';
                                    return (
                                        <motion.tr 
                                            key={tx.id || idx}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                        <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.id || idx}`} alt="" className="size-full opacity-60" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate">{user?.nom_complet || 'System Root'}</p>
                                                        <p className="text-[9px] font-bold text-slate-300 uppercase truncate">ID: {tx.id?.slice(0, 10).toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <span className={cn(
                                                        "px-2 py-0.5 w-fit rounded-lg text-[8px] font-black uppercase tracking-widest",
                                                        user?.role === 'banque' ? "bg-amber-50 text-amber-500 border border-amber-100" : "bg-slate-50 text-slate-400 border border-slate-100"
                                                    )}>
                                                        {user?.role || 'CLIENT'}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[8px] font-bold text-slate-300 uppercase">
                                                        <CreditCard className="size-2.5" /> {tx.type?.toUpperCase() || 'TX'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                                                    isDeposit ? "bg-emerald-50 text-emerald-500 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"
                                                )}>
                                                    {isDeposit ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                                                    {isDeposit ? 'Crédit' : 'Débit'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-slate-900 tabular-nums">
                                                    {parseFloat(tx.montant || 0).toLocaleString()}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "size-1.5 rounded-full",
                                                        tx.statut === 'terminé' ? "bg-emerald-500" : tx.statut === 'en_attente' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        tx.statut === 'terminé' ? "text-emerald-500" : tx.statut === 'en_attente' ? "text-amber-500" : "text-rose-500"
                                                    )}>
                                                        {tx.statut === 'terminé' ? 'Validé' : tx.statut === 'en_attente' ? 'Revue' : 'Échoué'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[9px] font-bold text-slate-300 uppercase italic opacity-60">
                                                    {new Date(tx.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
