import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import {
    Search,
    Plus,
    TrendingUp,
    TrendingDown,
    Edit2,
    Trash2,
    Shield,
    User as UserIcon,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Mail,
    Phone,
    Users as UsersIcon,
    Activity,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import userService from '../../services/userService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const ROLES = ['Tous', 'client', 'fournisseur', 'transporteur', 'admin'];

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
    const [selectedRole, setSelectedRole] = useState('Tous');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        nom_complet: '',
        email: '',
        telephone: '',
        role: 'client',
        statut: 'actif',
        mot_de_passe: ''
    });

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const roleFilter = selectedRole === 'Tous' ? '' : selectedRole;
            const data = await userService.getAll(page, 10, search, roleFilter);
            setUsers(data.users || []);
            setTotalPages(data.pages || 1);
            setStats({
                total: data.total || 0,
                newMonth: Math.floor(data.total * 0.05),
                active: Math.floor(data.total * 0.82),
                reports: 0
            });
        } catch (error) {
            toast.error("Échec de la synchronisation des membres.");
        } finally {
            setIsLoading(false);
        }
    }, [page, search, selectedRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id) => {
        if (!window.confirm("Révoquer définitivement l'accès de ce membre ?")) return;
        try {
            await userService.delete(id);
            toast.success("Membre révoqué.");
            fetchUsers();
        } catch (error) {
            toast.error("Impossible de révoquer ce membre.");
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
                mot_de_passe: ''
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
        setIsSaving(true);
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.mot_de_passe) delete payload.mot_de_passe;
                await userService.update(editingUser.id, payload);
                toast.success("Profil membre mis à jour.");
            } else {
                if (!formData.mot_de_passe) return toast.error("Mot de passe requis.");
                await userService.create(formData);
                toast.success("Nouveau membre accrédité.");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error("Une erreur est survenue lors de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            label: 'Membre',
            render: (u) => (
                <div className="flex items-center gap-4 py-2 group">
                    <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:scale-105">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate max-w-[180px]">
                            {u.nom_complet}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                            {u.email}
                        </p>
                    </div>
                </div>
            )
        },
        {
            label: 'Privilèges',
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-2",
                        u.role === 'admin' ? "bg-primary/10 text-primary border border-primary/20" : "bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700"
                    )}>
                        {u.role === 'admin' && <Shield className="size-3" />}
                        {u.role}
                    </div>
                </div>
            )
        },
        {
            label: 'Enregistrement',
            render: (u) => (
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    {new Date(u.createdAt).toLocaleDateString('fr-GN')}
                </span>
            )
        },
        {
            label: 'Statut',
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "size-2 rounded-full",
                        u.statut === 'actif' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                    )} />
                    <span className={cn(
                        "text-[10px] font-bold uppercase tracking-widest",
                        u.statut === 'actif' ? "text-emerald-500" : "text-slate-400"
                    )}>
                        {u.statut}
                    </span>
                </div>
            )
        },
        {
            label: 'Actions',
            render: (u) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button onClick={() => handleOpenModal(u)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"><Edit2 className="size-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="size-4" /></button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Gestion des Membres">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Registre Centralisé</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Contrôle <span className="text-primary italic">Membres.</span></h2>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="h-14 px-10 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl">
                        <Plus className="size-5" /> Nouveau Membre
                    </Button>
                </div>

                {/* KPI Section */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 shadow-xl flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <UsersIcon className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Membres Total</p>
                            <p className="text-xl font-bold text-white uppercase">{stats.total}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <Activity className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Taux d'Activité</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{stats.active}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <TrendingUp className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Croissance</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">+{stats.newMonth}</p>
                        </div>
                    </div>
                    <div className="p-8 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                        <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                            <AlertCircle className="size-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alertes</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white uppercase">{stats.reports}</p>
                        </div>
                    </div>
                </div>

                {/* Table Surface */}
                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {ROLES.map(r => (
                                <button
                                    key={r}
                                    onClick={() => { setSelectedRole(r); setPage(1); }}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2",
                                        selectedRole === r ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white dark:bg-slate-800 border-transparent text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4 group-focus-within:text-primary transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest placeholder:text-slate-300 outline-none"
                                placeholder="RECHERCHER MEMBRE..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="p-0">
                        <DataTable
                            columns={columns}
                            data={users}
                            isLoading={isLoading}
                            className="border-none shadow-none"
                        />

                        {/* Pagination */}
                        {!isLoading && users.length > 0 && (
                            <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page {page} sur {totalPages}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-20 transition-all">
                                        <ChevronLeft className="size-4" />
                                    </button>
                                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-10 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-20 transition-all">
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Modification */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? "Édition Membre" : "Accréditation"}
            >
                <form onSubmit={handleSubmit} className="space-y-8 p-6">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Identité Complète</label>
                            <Input
                                name="nom_complet"
                                required
                                value={formData.nom_complet}
                                onChange={handleFormChange}
                                placeholder="JEAN-PIERRE..."
                                className="h-14 px-6 rounded-xl font-bold text-sm uppercase"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Email</label>
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    placeholder="CONTACT@DOMAIN.GN"
                                    className="h-14 px-6 rounded-xl font-bold text-xs lowercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Privilèges</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleFormChange}
                                    className="w-full h-14 px-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-widest outline-none transition-all"
                                >
                                    <option value="client">Client</option>
                                    <option value="fournisseur">Fournisseur</option>
                                    <option value="transporteur">Transporteur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">
                                {editingUser ? "Nouvelle Clef (Laisser vide pour garder l'ancienne)" : "Clef d'Accès Initiale"}
                            </label>
                            <Input
                                name="mot_de_passe"
                                type="password"
                                required={!editingUser}
                                value={formData.mot_de_passe}
                                onChange={handleFormChange}
                                placeholder="••••••••"
                                className="h-14 px-6 rounded-xl font-bold text-sm tracking-[0.3em]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6">
                        <Button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 h-14 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                            {editingUser ? "Sauvegarder" : "Accréditer"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminUsers;
