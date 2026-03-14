import React, { useState } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import {
    Search,
    SlidersHorizontal,
    Plus,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

// ── Données fictives ──────────────────────────────────────────────────────────
const USERS = [
    {
        initials: 'ML',
        avatarBg: 'bg-primary/10 text-primary',
        name: 'Marie Lefebvre',
        email: 'marie.l@example.com',
        role: 'Client',
        roleBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
        date: '12 Mai 2023',
        status: 'Actif',
    },
    {
        initials: 'JD',
        avatarBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
        name: 'Jean Diallo',
        email: 'j.diallo@logistique.gn',
        role: 'Fournisseur',
        roleBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
        date: '08 Juin 2023',
        status: 'Actif',
    },
    {
        initials: 'TM',
        avatarBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
        name: 'Thomas Magassouba',
        email: 't.magassouba@transports.gn',
        role: 'Transporteur',
        roleBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
        date: '24 Août 2023',
        status: 'Suspendu',
    },
    {
        initials: 'CC',
        avatarBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600',
        name: 'Chambre de Commerce',
        email: 'admin@cc-conakry.gn',
        role: 'Institution',
        roleBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
        date: '02 Sept 2023',
        status: 'Actif',
    },
];

const ROLES = ['Tous les rôles', 'Client', 'Fournisseur', 'Transporteur', 'Institution'];

const STATUS_DOT = {
    Actif: 'bg-emerald-500',
    Suspendu: 'bg-slate-300',
};
const STATUS_TEXT = {
    Actif: 'text-emerald-600',
    Suspendu: 'text-slate-500',
};

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = [
    { label: 'Total Utilisateurs', value: '12 840', trend: '+5%', up: true },
    { label: 'Nouveaux ce mois', value: '450', trend: '+12%', up: true },
    { label: 'Utilisateurs Actifs', value: '8 920', trend: '-2%', up: false },
    { label: 'Signalements', value: '12', trend: '+1%', up: true },
];

// ── Composant ─────────────────────────────────────────────────────────────────
const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('Tous les rôles');

    const filtered = USERS.filter((u) => {
        const matchRole = role === 'Tous les rôles' || u.role === role;
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase());
        return matchRole && matchSearch;
    });

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                <div className="max-w-6xl mx-auto p-8">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                Gestion des Utilisateurs
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Gérez et suivez les comptes membres de la plateforme.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm">
                            <Plus className="size-5" />
                            Ajouter un utilisateur
                        </button>
                    </div>

                    {/* ── Stats ──────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {STATS.map((s) => (
                            <div
                                key={s.label}
                                className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                            >
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                                    {s.label}
                                </p>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {s.value}
                                    </span>
                                    <span
                                        className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-emerald-500' : 'text-rose-500'
                                            }`}
                                    >
                                        {s.up
                                            ? <TrendingUp className="size-3.5" />
                                            : <TrendingDown className="size-3.5" />}
                                        {s.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Table section ──────────────────────────────────── */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">

                        {/* Filters */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Rechercher par nom ou email..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Role filter */}
                                <select
                                    className="text-sm border-none bg-slate-50 dark:bg-slate-800 rounded-lg py-2 pl-4 pr-10 focus:ring-2 focus:ring-primary/20 cursor-pointer text-slate-700 dark:text-slate-300"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r}>{r}</option>
                                    ))}
                                </select>

                                <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
                                    <SlidersHorizontal className="size-4" />
                                    Filtres
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        {['Nom', 'Rôle', "Date d'inscription", 'Statut', 'Actions'].map((h) => (
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
                                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                                                Aucun utilisateur trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((u) => (
                                            <tr
                                                key={u.email}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                            >
                                                {/* Nom */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`size-9 rounded-full flex items-center justify-center font-bold text-sm ${u.avatarBg}`}
                                                        >
                                                            {u.initials}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                                {u.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Rôle */}
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${u.roleBg}`}
                                                    >
                                                        {u.role}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {u.date}
                                                </td>

                                                {/* Statut */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className={`size-2 rounded-full ${STATUS_DOT[u.status]}`}
                                                        />
                                                        <span
                                                            className={`text-sm font-medium ${STATUS_TEXT[u.status]}`}
                                                        >
                                                            {u.status}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <button className="text-slate-400 hover:text-primary transition-colors">
                                                        <MoreHorizontal className="size-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <p className="text-sm text-slate-500">
                                Affichage de 1 à {filtered.length} sur 12 840 utilisateurs
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled
                                    className="px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 text-slate-700 dark:text-slate-300"
                                >
                                    Précédent
                                </button>
                                {[1, 2, 3].map((n) => (
                                    <button
                                        key={n}
                                        className={`px-3 py-1 rounded-md text-sm border transition-colors ${n === 1
                                                ? 'border-primary bg-primary text-white hover:bg-primary/90'
                                                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                    >
                                        {n}
                                    </button>
                                ))}
                                <button className="px-3 py-1 border border-slate-200 dark:border-slate-800 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300">
                                    Suivant
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default AdminUsers;
