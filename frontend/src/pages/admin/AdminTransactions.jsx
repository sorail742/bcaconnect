import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
    Search,
    Filter,
    CalendarDays,
    Download,
    Wallet,
    CheckCircle2,
    Clock,
    TrendingUp,
    TrendingDown,
    MoreVertical,
    AlertCircle
} from 'lucide-react';
import walletService from '../../services/walletService';
import { Skeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { toast } from 'sonner';

const STATUS_CONFIG = {
    'terminé': { dot: 'bg-emerald-600', text: 'text-emerald-600', label: 'Complété' },
    'en_attente': { dot: 'bg-amber-600 animate-pulse', text: 'text-amber-600', label: 'En cours' },
    'échoué': { dot: 'bg-rose-600', text: 'text-rose-600', label: 'Échoué' },
};

const formatGNF = (n) => parseFloat(n).toLocaleString('fr-GN') + ' GNF';

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const data = await walletService.getAllTransactions();
            setTransactions(data);
        } catch (err) {
            toast.error("Erreur lors du chargement des transactions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || "";
        return t.id.toLowerCase().includes(search.toLowerCase()) ||
            user.toLowerCase().includes(search.toLowerCase());
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant), 0);
    const successfulCount = transactions.filter(t => t.statut === 'terminé').length;

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-8 font-inter">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic">
                            Flux <span className="text-primary not-italic">Financiers.</span>
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">Audit complet des mouvements de capitaux sur BCA Connect.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume Global</p>
                            <Wallet className="size-5 text-primary" />
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">
                            {formatGNF(totalVolume)}
                        </h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                        <div className="flex justify-between items-start mb-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tx Réussies</p>
                            <CheckCircle2 className="size-5 text-emerald-500" />
                        </div>
                        <h3 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">{successfulCount}</h3>
                    </div>

                    <div className="bg-primary p-8 rounded-[2rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-6">Santé Financière</p>
                            <h3 className="text-3xl font-black italic tracking-tighter">Optimal</h3>
                            <p className="mt-2 text-xs font-medium text-white/80 italic">Système audité aujourd'hui.</p>
                        </div>
                        <TrendingUp className="absolute -right-4 -bottom-4 size-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-900/50">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white italic">
                            Logs de Transactions
                        </h2>

                        <div className="flex flex-wrap gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="pl-12 pr-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary/20 w-72 transition-all outline-none"
                                    placeholder="RECHERCHER TRX, NOM..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <button className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 transition-colors">
                                <Filter className="size-4 text-slate-600" />
                            </button>
                            <button onClick={fetchTransactions} className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-lg active:scale-95">
                                Actualiser
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto px-4 pb-4">
                        <table className="w-full text-left">
                            <thead>
                                <tr>
                                    {['ID', 'Date', 'Acteur', 'Type', 'Montant', 'Statut'].map((h) => (
                                        <th key={h} className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-20 text-center">
                                            <AlertCircle className="size-12 text-slate-200 mx-auto mb-4" />
                                            <p className="text-sm font-black italic text-slate-400 uppercase tracking-widest">Aucune donnée</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((t) => {
                                        const config = STATUS_CONFIG[t.statut] || STATUS_CONFIG['en_attente'];
                                        const user = t.Wallet?.User;
                                        return (
                                            <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <span className="text-[11px] font-black text-primary uppercase tracking-tighter">#{t.id.slice(0, 8)}</span>
                                                </td>
                                                <td className="px-6 py-5 text-xs font-bold text-slate-500 whitespace-nowrap">
                                                    {new Date(t.createdAt).toLocaleString('fr-GN')}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black text-xs uppercase italic border border-slate-200 dark:border-slate-700">
                                                            {user?.nom_complet[0] || '?'}
                                                        </div>
                                                        <div className="leading-tight">
                                                            <p className="text-sm font-black italic text-slate-900 dark:text-white uppercase tracking-tighter">{user?.nom_complet || "Anonyme"}</p>
                                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">{user?.role || "Inconnu"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        {t.type}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-black italic text-slate-900 dark:text-white">{formatGNF(t.montant)}</p>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${config.text}`}>
                                                        <span className={`size-1.5 rounded-full ${config.dot}`} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminTransactions;
