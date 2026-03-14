import React, { useState } from 'react';
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
} from 'lucide-react';

// ── Données fictives ──────────────────────────────────────────────────────────
const TRANSACTIONS = [
    {
        id: '#TRX-9482',
        date: '12 Oct 2023, 14:30',
        initials: 'JD',
        user: 'Jean Diallo',
        role: 'Client',
        type: 'Achat',
        typeBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        amount: 1240000,
        status: 'Complété',
    },
    {
        id: '#TRX-9481',
        date: '12 Oct 2023, 11:15',
        initials: 'MS',
        user: 'MultiService SARL',
        role: 'Fournisseur',
        type: 'Retrait',
        typeBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
        amount: 3500000,
        status: 'En cours',
    },
    {
        id: '#TRX-9480',
        date: '11 Oct 2023, 17:45',
        initials: 'AL',
        user: 'Aïssatou Lamarana',
        role: 'Client',
        type: 'Remboursement',
        typeBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
        amount: 45000,
        status: 'Échoué',
    },
    {
        id: '#TRX-9479',
        date: '11 Oct 2023, 09:20',
        initials: 'BT',
        user: 'BTP Expert Guinée',
        role: 'Fournisseur',
        type: 'Achat',
        typeBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        amount: 12000000,
        status: 'Complété',
    },
];

const STATUS_CONFIG = {
    Complété: {
        dot: 'bg-emerald-600',
        text: 'text-emerald-600',
        pulse: false,
    },
    'En cours': {
        dot: 'bg-amber-600 animate-pulse',
        text: 'text-amber-600',
        pulse: true,
    },
    Échoué: {
        dot: 'bg-rose-600',
        text: 'text-rose-600',
        pulse: false,
    },
};

const formatGNF = (n) => n.toLocaleString('fr-FR') + ' GNF';

// ── Composant ─────────────────────────────────────────────────────────────────
const AdminTransactions = () => {
    const [search, setSearch] = useState('');

    const filtered = TRANSACTIONS.filter(
        (t) =>
            t.id.toLowerCase().includes(search.toLowerCase()) ||
            t.user.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-8">
                {/* ── Header ───────────────────────────────────────────── */}
                <header className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Transactions Financières
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Suivi en temps réel des mouvements financiers de la plateforme BCA Connect.
                    </p>
                </header>

                {/* ── Stats ────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Volume total */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Volume Total
                            </p>
                            <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Wallet className="size-5" />
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            452 890 000 GNF
                        </h3>
                        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <TrendingUp className="size-4" />
                            +12.5% vs mois dernier
                        </p>
                    </div>

                    {/* Transactions réussies */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Transactions Réussies
                            </p>
                            <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                <CheckCircle2 className="size-5" />
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">1 240</h3>
                        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-600">
                            <TrendingUp className="size-4" />
                            +5.2% vs mois dernier
                        </p>
                    </div>

                    {/* Retraits en attente */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Retraits en Attente
                            </p>
                            <span className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Clock className="size-5" />
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                            12 450 000 GNF
                        </h3>
                        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-rose-600">
                            <TrendingDown className="size-4" />
                            -2.1% vs mois dernier
                        </p>
                    </div>
                </div>

                {/* ── Table section ─────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            Historique des Transactions
                        </h2>

                        <div className="flex flex-wrap gap-3">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                                    placeholder="Rechercher ID, utilisateur..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                                <Filter className="size-4" />
                                Filtres
                            </button>

                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                                <CalendarDays className="size-4" />
                                Date
                            </button>

                            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
                                <Download className="size-4" />
                                Exporter
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50">
                                    {[
                                        'ID Transaction',
                                        'Date',
                                        'Utilisateur',
                                        'Type',
                                        'Montant',
                                        'Statut',
                                        'Actions',
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''
                                                }`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-400">
                                            Aucune transaction trouvée.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((t) => {
                                        const sc = STATUS_CONFIG[t.status];
                                        return (
                                            <tr
                                                key={t.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                {/* ID */}
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                                    {t.id}
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-sm text-slate-500">
                                                    {t.date}
                                                </td>

                                                {/* Utilisateur */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 text-xs font-bold">
                                                            {t.initials}
                                                        </div>
                                                        <div className="text-sm">
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {t.user}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{t.role}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Type */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded-md text-xs font-medium ${t.typeBg}`}
                                                    >
                                                        {t.type}
                                                    </span>
                                                </td>

                                                {/* Montant */}
                                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                                    {formatGNF(t.amount)}
                                                </td>

                                                {/* Statut */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`flex items-center gap-1.5 text-xs font-medium ${sc.text}`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                                                        />
                                                        {t.status}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                                                        <MoreVertical className="size-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Affichage de 1-{filtered.length} sur 1 240 transactions
                        </p>
                        <div className="flex gap-2">
                            <button
                                disabled
                                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium disabled:opacity-50 text-slate-700 dark:text-slate-300"
                            >
                                Précédent
                            </button>
                            {[1, 2, 3].map((n) => (
                                <button
                                    key={n}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${n === 1
                                            ? 'bg-primary text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {n}
                                </button>
                            ))}
                            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300">
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminTransactions;
