import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Modal from '../../components/ui/Modal';
import {
    Search,
    SlidersHorizontal,
    Plus,
    TrendingUp,
    TrendingDown,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Edit2,
    Trash2,
    Shield,
    Mail,
    User as UserIcon,
    AlertCircle
} from 'lucide-react';
import userService from '../../services/userService';
import { toast } from 'sonner';

const ROLES = ['Tous les rôles', 'client', 'fournisseur', 'transporteur', 'admin'];

const STATUS_DOT = {
    'actif': 'bg-emerald-500',
    'suspendu': 'bg-slate-300',
    'banni': 'bg-rose-500',
};

const STATUS_TEXT = {
    'actif': 'text-emerald-600',
    'suspendu': 'text-slate-500',
    'banni': 'text-rose-500',
};

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        newMonth: 0,
        active: 0,
        reports: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('Tous les rôles');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nom_complet: '',
        email: '',
        telephone: '',
        role: 'client',
        statut: 'actif',
        mot_de_passe: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [page, search, selectedRole]);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const roleFilter = selectedRole === 'Tous les rôles' ? '' : selectedRole;
            const data = await userService.getAll(page, 10, search, roleFilter);
            setUsers(data.users || []);
            setTotalPages(data.pages || 1);
            setStats({
                total: data.total || 0,
                newMonth: Math.floor(data.total * 0.05), // Simulation
                active: Math.floor(data.total * 0.8), // Simulation
                reports: 2 // Simulation
            });
        } catch (error) {
            console.error("Erreur chargement utilisateurs:", error);
            toast.error("Impossible de charger les utilisateurs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

        try {
            await userService.delete(id);
            toast.success("Utilisateur supprimé avec succès.");
            fetchUsers();
        } catch (error) {
            toast.error("Erreur lors de la suppression.");
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                nom_complet: user.nom_complet || '',
                email: user.email || '',
                telephone: user.telephone || '',
                role: user.role || 'client',
                statut: user.statut || 'actif',
                mot_de_passe: '' // On ne montre pas le mot de passe
            });
        } else {
            setEditingUser(null);
            setFormData({
                nom_complet: '',
                email: '',
                telephone: '',
                role: 'client',
                statut: 'actif',
                mot_de_passe: ''
            });
        }
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Remove password from payload if empty
                const payload = { ...formData };
                if (!payload.mot_de_passe) delete payload.mot_de_passe;

                await userService.update(editingUser.id, payload);
                toast.success("Utilisateur mis à jour !");
            } else {
                if (!formData.mot_de_passe) {
                    return toast.error("Le mot de passe est obligatoire pour un nouvel utilisateur.");
                }
                await userService.create(formData);
                toast.success("Utilisateur créé avec succès !");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement.");
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
                <div className="max-w-6xl mx-auto p-8">

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 italic uppercase underline decoration-primary/30 decoration-4 underline-offset-8">
                                Gestion Membres
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-4">
                                Contrôle total sur la communauté BCA Connect.
                            </p>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="group flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                        >
                            <Plus className="size-4 group-hover:rotate-90 transition-transform duration-300" />
                            Nouveau Membre
                        </button>
                    </div>

                    {/* ── Stats ──────────────────────────────────────────── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Utilisateurs', value: stats.total, trend: '+5%', up: true },
                            { label: 'Nouveaux ce mois', value: stats.newMonth, trend: '+12%', up: true },
                            { label: 'Utilisateurs Actifs', value: stats.active, trend: '-2%', up: false },
                            { label: 'Signalements', value: stats.reports, trend: '+1%', up: true },
                        ].map((s) => (
                            <div
                                key={s.label}
                                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                            >
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
                                    {s.label}
                                </p>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">
                                        {s.value.toLocaleString()}
                                    </span>
                                    <span
                                        className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}
                                    >
                                        {s.up ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                                        {s.trend}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Table section ──────────────────────────────────── */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">

                        {/* Filters */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-6 bg-slate-50/50 dark:bg-slate-800/20">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                                <input
                                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                                    placeholder="Nom, email ou ID..."
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 items-center">
                                <select
                                    className="text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl py-3 pl-4 pr-10 focus:ring-4 focus:ring-primary/10 cursor-pointer text-slate-600 dark:text-slate-200"
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>

                                <button className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-600 dark:text-slate-200">
                                    <SlidersHorizontal className="size-4" />
                                    Filtres
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto overflow-y-visible">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 uppercase tracking-[0.1em] text-[10px] font-black text-slate-400">
                                        <th className="px-8 py-5">Membre</th>
                                        <th className="px-8 py-5">Rôle & Privilèges</th>
                                        <th className="px-8 py-5">Inscription</th>
                                        <th className="px-8 py-5">Statut</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                                    {isLoading ? (
                                        [1, 2, 3].map(n => (
                                            <tr key={n} className="animate-pulse">
                                                <td colSpan={5} className="px-8 py-6 h-20 bg-slate-50/20"></td>
                                            </tr>
                                        ))
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-16 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <AlertCircle className="size-10 text-slate-300" />
                                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aucun membre trouvé.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr
                                                key={u.id}
                                                className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-default"
                                            >
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center font-black text-primary text-xs shadow-sm group-hover:scale-110 transition-transform">
                                                            {u.nom_complet.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                                                                {u.nom_complet}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 font-medium lowercase tracking-tight">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 w-fit border border-slate-200/50 dark:border-slate-700/50">
                                                        {u.role === 'admin' ? <Shield className="size-3.5 text-primary" /> : <UserIcon className="size-3.5 text-slate-400" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                                                            {u.role}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                    {new Date(u.createdAt).toLocaleDateString('fr-GN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </td>

                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`size-2 rounded-full ring-4 ring-opacity-20 ${u.statut === 'actif' ? 'bg-emerald-500 ring-emerald-500' : 'bg-slate-400 ring-slate-400'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${u.statut === 'actif' ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                            {u.statut}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenModal(u)}
                                                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-primary transition-all hover:shadow-lg shadow-sm"
                                                        >
                                                            <Edit2 className="size-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(u.id)}
                                                            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all hover:shadow-lg shadow-sm"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10 flex items-center justify-between">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                PAGE {page} SUR {totalPages} • TOTAL {stats.total} MEMBRES
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-all disabled:opacity-30 shadow-sm"
                                >
                                    <ChevronLeft className="size-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-900 transition-all disabled:opacity-30 shadow-sm"
                                >
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Modal de Création / Édition */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? "Éditer le membre" : "Ajout Nouveau Membre"}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <UserIcon className="size-3" /> Nom Complet
                        </label>
                        <input
                            name="nom_complet"
                            required
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="Ex: Jean Paul Diallo"
                            value={formData.nom_complet}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Mail className="size-3" /> Email
                            </label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleFormChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                Role système
                            </label>
                            <select
                                name="role"
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-bold uppercase tracking-widest focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                value={formData.role}
                                onChange={handleFormChange}
                            >
                                <option value="client">Client</option>
                                <option value="fournisseur">Fournisseur</option>
                                <option value="transporteur">Transporteur</option>
                                <option value="admin">Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            {editingUser ? "Nouveau Mot de passe (Laisser vide pour garder)" : "Mot de passe initial"}
                        </label>
                        <input
                            name="mot_de_passe"
                            type="password"
                            required={!editingUser}
                            className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                            placeholder="••••••••"
                            value={formData.mot_de_passe}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {editingUser ? "Confirmer Modification" : "Créer le compte"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminUsers;
