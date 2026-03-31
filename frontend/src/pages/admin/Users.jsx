import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
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
    Mail
} from 'lucide-react';
import userService from '../../services/userService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const ROLES = ['Tous les rôles', 'client', 'fournisseur', 'transporteur', 'admin'];

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
                newMonth: Math.floor(data.total * 0.05),
                active: Math.floor(data.total * 0.8),
                reports: 2
            });
        } catch (error) {
            console.error("Erreur chargement utilisateurs:", error);
            toast.error("Impossible de charger les utilisateurs.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer définitivement ce membre du réseau ?")) return;
        try {
            await userService.delete(id);
            toast.success("Membre révoqué avec succès.");
            fetchUsers();
        } catch (error) {
            toast.error("Échec de la révocation.");
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
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.mot_de_passe) delete payload.mot_de_passe;
                await userService.update(editingUser.id, payload);
                toast.success("Profil mis à jour.");
            } else {
                if (!formData.mot_de_passe) return toast.error("Clef d'accès requise.");
                await userService.create(formData);
                toast.success("Nouveau membre accrédité.");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error("Erreur lors de l'enregistrement.");
        }
    };

    return (
        <DashboardLayout title="GESTION DES ACCRÉDITATIONS">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header & Action ────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Registre de Sécurité BCA</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Contrôle des <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Membres.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Supervision globale et gestion des privilèges d'accès au réseau BCA Connect pour tous les acteurs certifiés.</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="h-24 px-12 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-xs flex items-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                        <Plus className="size-6 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="leading-none pt-1">Nouveau Membre</span>
                    </button>
                </div>

                {/* ── Key Performance Indicators ────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { label: 'Total Membres', value: stats.total, trend: '+5.2%', up: true },
                        { label: 'Nouveaux Acteurs', value: stats.newMonth, trend: '+12.8%', up: true },
                        { label: 'Taux d\'Activité', value: `${((stats.active/stats.total || 0)*100).toFixed(1)}%`, trend: '-0.4%', up: false },
                        { label: 'Signalements', value: stats.reports, trend: 'Critique', up: false },
                    ].map((s) => (
                        <div
                            key={s.label}
                            className="glass-card p-10 rounded-[2.5rem] border-4 border-border shadow-premium hover:shadow-premium-lg group transition-all"
                        >
                            <p className="text-executive-label font-black uppercase tracking-[0.3em] mb-6 italic opacity-40 group-hover:opacity-100 transition-opacity">
                                {s.label}
                            </p>
                            <div className="flex items-baseline justify-between gap-4">
                                <span className="text-4xl font-black text-foreground tracking-tighter italic text-executive-data">
                                    {s.value.toLocaleString()}
                                </span>
                                <div className={cn(
                                    "px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 border-2",
                                    s.up ? "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" : "text-rose-500 bg-rose-500/5 border-rose-500/10"
                                )}>
                                    {s.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                                    {s.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── Table & Navigation ───────────────────────────── */}
                <div className="glass-card rounded-[3.5rem] border-4 border-border shadow-premium-lg overflow-hidden">
                    
                    {/* Filtres Avancés */}
                    <div className="p-10 border-b-4 border-border flex flex-col xl:flex-row gap-10 bg-accent/20">
                        <div className="relative group/search flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-6 group-focus-within/search:text-primary transition-all" />
                            <input
                                className="w-full pl-16 pr-8 h-20 bg-background border-4 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black italic uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                                placeholder="RECHERCHER DANS LE REGISTRE..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4 items-center">
                            <div className="relative group/select">
                                <select
                                    className="h-20 bg-background border-4 border-border rounded-[1.5rem] pl-8 pr-16 text-[10px] font-black uppercase tracking-[0.3em] italic focus:outline-none focus:border-primary/40 appearance-none cursor-pointer transition-all shadow-inner"
                                    value={selectedRole}
                                    onChange={(e) => {
                                        setSelectedRole(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r.toUpperCase()}</option>
                                    ))}
                                </select>
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground/30 group-focus-within/select:text-primary transition-all">
                                    <SlidersHorizontal className="size-4" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Registre Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-accent/40 border-b-4 border-border">
                                    <th className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black">MEMBRE ACCRÉDITÉ</th>
                                    <th className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black">PRIVILÈGES</th>
                                    <th className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black">PROTOCOLE ENTRÉE</th>
                                    <th className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black">STATUT</th>
                                    <th className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black text-right">OPÉRATIONS</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4].map(n => (
                                        <tr key={n} className="animate-pulse">
                                            <td colSpan={5} className="px-10 py-12 h-32 bg-accent/5"></td>
                                        </tr>
                                    ))
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-8 opacity-20">
                                                <AlertCircle className="size-20" />
                                                <p className="text-2xl font-black italic tracking-tighter uppercase">Registre Vierge</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="group hover:bg-primary/5 transition-all duration-500 cursor-default"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-16 rounded-[1.5rem] bg-background border-4 border-border flex items-center justify-center font-black text-primary text-sm shadow-premium group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="avatar" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-xl font-black text-foreground italic tracking-tighter uppercase leading-none truncate max-w-[200px]">
                                                            {u.nom_complet}
                                                        </p>
                                                        <p className="text-executive-label opacity-30 italic leading-none">{u.email.toLowerCase()}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4 px-5 py-3 rounded-2xl bg-background border-2 border-border w-fit shadow-inner group-hover:border-primary/20 transition-colors">
                                                    {u.role === 'admin' ? <Shield className="size-4 text-primary" /> : <UserIcon className="size-4 text-muted-foreground/30" />}
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground italic">
                                                        {u.role}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8 text-executive-data text-sm opacity-40 italic uppercase tracking-widest">
                                                {new Date(u.createdAt).toLocaleDateString('fr-GN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>

                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "size-3 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]",
                                                        u.statut === 'actif' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/20"
                                                    )} />
                                                    <span className={cn(
                                                        "text-executive-label font-black italic tracking-widest",
                                                        u.statut === 'actif' ? "text-emerald-500" : "text-muted-foreground/30"
                                                    )}>
                                                        {u.statut.toUpperCase()}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleOpenModal(u)}
                                                        className="size-14 bg-background border-4 border-border rounded-[1.2rem] text-muted-foreground/40 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                                                    >
                                                        <Edit2 className="size-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="size-14 bg-background border-4 border-border rounded-[1.2rem] text-muted-foreground/40 hover:text-rose-500 hover:border-rose-500/40 transition-all flex items-center justify-center shadow-premium active:scale-95"
                                                    >
                                                        <Trash2 className="size-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Executive */}
                    <div className="p-12 border-t-4 border-border bg-accent/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <p className="text-executive-label font-black text-muted-foreground/30 italic tracking-[0.3em] uppercase">
                            ACCROISSEMENT : PAGE {page} / {totalPages} — REGISTRE : {stats.total} ENTRÉES
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="size-16 border-4 border-border rounded-2xl flex items-center justify-center bg-background hover:border-primary/40 transition-all disabled:opacity-20 shadow-premium group"
                            >
                                <ChevronLeft className="size-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="size-16 border-4 border-border rounded-2xl flex items-center justify-center bg-background hover:border-primary/40 transition-all disabled:opacity-20 shadow-premium group"
                            >
                                <ChevronRight className="size-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Modal de Modification (Premium Style) */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? "MODIFICATION DE PROFIL" : "ACCRÉDITATION MEMBRE"}
            >
                <form onSubmit={handleSubmit} className="space-y-10 p-4">
                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Identité Légale</label>
                        <div className="relative group">
                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                            <input
                                name="nom_complet"
                                required
                                className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic uppercase tracking-widest outline-none transition-all shadow-inner"
                                placeholder="EX: JEAN PAUL DIALLO"
                                value={formData.nom_complet}
                                onChange={handleFormChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Canal Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full h-16 pl-16 pr-6 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black italic lowercase tracking-tight outline-none transition-all shadow-inner"
                                    placeholder="EX@BCA.GN"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">Privilèges Réseau</label>
                            <select
                                name="role"
                                className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-[10px] font-black uppercase tracking-widest italic outline-none transition-all shadow-inner appearance-none"
                                value={formData.role}
                                onChange={handleFormChange}
                            >
                                <option value="client">Rôle : Client</option>
                                <option value="fournisseur">Rôle : Fournisseur</option>
                                <option value="transporteur">Rôle : Transporteur</option>
                                <option value="admin">Rôle : Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/40 ml-2 italic">
                            {editingUser ? "Nouvelle Clef d'Accès (Optionnel)" : "Clef d'Accès Initiale *"}
                        </label>
                        <input
                            name="mot_de_passe"
                            type="password"
                            required={!editingUser}
                            className="w-full h-16 px-8 rounded-[1.5rem] border-4 border-border bg-background/50 focus:border-primary/40 text-sm font-black outline-none transition-all shadow-inner tracking-[0.4em]"
                            placeholder="••••••••"
                            value={formData.mot_de_passe}
                            onChange={handleFormChange}
                        />
                    </div>

                    <div className="flex gap-6 pt-10">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 hover:text-foreground hover:bg-accent transition-all italic underline decoration-4 underline-offset-8 decoration-transparent hover:decoration-border"
                        >
                            Annuler l'Opération
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white h-20 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] shadow-premium-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all italic leading-none"
                        >
                            {editingUser ? "CONFIRMER LES ÉVOLUTIONS" : "SCELLER L'ACCRÉDITATION"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminUsers;
