import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import { useQuery } from '@tanstack/react-query';
import useApiMutation from '../../hooks/useApiMutation';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, TrendingUp, Edit2, Trash2, Shield,
    Users as UsersIcon, Activity, CheckCircle2, Zap,
    RefreshCcw, ShieldCheck, Lock, UserCircle,
    Fingerprint, ChevronDown, Filter, Info, Mail, Phone,
    UserPlus
} from 'lucide-react';
import userService from '../../services/userService';
import { cn } from '../../lib/utils';

const ROLES = ['TOUS', 'client', 'vendeur', 'transporteur', 'banque', 'admin'];

const StatCard = ({ title, value, icon: Icon, color, growth }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {title}
            </p>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                {growth && (
                    <div className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                        +{growth}%
                    </div>
                )}
            </div>
        </div>
    </motion.div>
);

const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('TOUS');
    const [page, setPage] = useState(1);
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

    const roleFilter = selectedRole === 'TOUS' ? '' : (selectedRole === 'vendeur' ? 'fournisseur' : selectedRole);
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-users', page, search, roleFilter],
        queryFn: () => userService.getAll(page, 15, search, roleFilter),
    });

    const users = data?.users || [];
    const totalPages = data?.pages || 1;
    
    const stats = [
        { title: "Membres de l'écosystème", value: data?.total || 0, icon: UsersIcon, color: "text-primary", growth: 12 },
        { title: "Sécurité & Accès", value: "Actif", icon: ShieldCheck, color: "text-emerald-500" },
        { title: "Nouv. Accréditations", value: "24", icon: UserPlus, color: "text-blue-500", growth: 5 }
    ];

    const { mutate: deleteMutation } = useApiMutation(
        (id) => userService.delete(id),
        { invalidateKeys: ['admin-users'], successMessage: "Accès révoqué avec succès." }
    );

    const { mutate: crudMutation, isPending: isSaving } = useApiMutation(
        async (payload) => {
            if (editingUser) {
                if (!payload.mot_de_passe) delete payload.mot_de_passe;
                return userService.update(editingUser.id, payload);
            }
            return userService.create(payload);
        },
        {
            invalidateKeys: ['admin-users'],
            successMessage: editingUser ? "Accréditation mise à jour." : "Nouvelle accréditation créée.",
            onSuccess: () => setShowModal(false)
        }
    );

    const handleDelete = (id) => {
        if (!window.confirm("CONFIRMER LA RÉVOCATION DE CET ACCÈS ?")) return;
        deleteMutation(id);
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
            setFormData({ nom_complet: '', email: '', telephone: '', role: 'client', statut: 'actif', mot_de_passe: '' });
        }
        setShowModal(true);
    };

    const columns = [
        {
            label: 'Identité',
            render: (u) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="size-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {u.nom_complet}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 lowercase truncate">{u.email}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Rôle System',
            render: (u) => (
                <div className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit",
                    u.role === 'admin' ? "bg-primary/5 border-primary/10 text-primary" : "bg-slate-50 border-slate-100 text-slate-500"
                )}>
                    {u.role === 'fournisseur' ? 'VENDEUR' : u.role?.toUpperCase()}
                </div>
            )
        },
        {
            label: 'Statut',
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className={cn("size-1.5 rounded-full", u.statut === 'actif' ? "bg-emerald-500" : "bg-slate-300")} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                        {u.statut?.toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            label: 'Téléphone',
            render: (u) => <span className="text-[10px] font-bold text-slate-500">{u.telephone || 'N/A'}</span>
        },
        {
            label: 'Actions',
            render: (u) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button onClick={() => handleOpenModal(u)} className="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary transition-all">
                        <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="size-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all">
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="ADMINISTRATION UTILISATEURS" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Gestion des <span className="text-primary">Accès</span>
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            Contrôle de sécurité & Gouvernance du réseau
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => refetch()} className="h-12 px-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-2 text-slate-600 hover:bg-slate-50 transition-all">
                            <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
                        </button>
                        <button onClick={() => handleOpenModal()} className="h-12 px-8 bg-primary text-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-3">
                            <Plus className="size-4" />
                            Accréditer
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} />
                    ))}
                </div>

                {/* Table HUD */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                            {ROLES.map(r => (
                                <button
                                    key={r}
                                    onClick={() => { setSelectedRole(r); setPage(1); }}
                                    className={cn(
                                        "px-5 h-9 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                        selectedRole === r ? "bg-slate-900 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
                            <input
                                className="w-full pl-12 pr-4 h-11 bg-slate-50 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="RECHERCHE..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={users}
                        isLoading={isLoading}
                    />

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Page {page} / {totalPages}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center disabled:opacity-30">
                                    <ChevronDown className="size-5 rotate-90" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center disabled:opacity-30">
                                    <ChevronDown className="size-5 -rotate-90" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <Modal 
                isOpen={showModal} 
                onClose={() => setShowModal(false)}
                title={editingUser ? "ÉDITION ACCRÉDITATION" : "NOUVELLE ACCRÉDITATION"}
                glass
            >
                <form onSubmit={(e) => { e.preventDefault(); crudMutation(formData); }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Nom complet</label>
                            <input 
                                required 
                                value={formData.nom_complet} 
                                onChange={(e) => setFormData({...formData, nom_complet: e.target.value})} 
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="EX: KEITH..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Email</label>
                            <input 
                                type="email"
                                required 
                                value={formData.email} 
                                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="EMAIL@AUTH.GN"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Téléphone</label>
                            <input 
                                required 
                                value={formData.telephone} 
                                onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                                placeholder="+224 ..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Rôle System</label>
                            <select 
                                value={formData.role} 
                                onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                            >
                                <option value="client">Access Client</option>
                                <option value="fournisseur">Access Vendeur</option>
                                <option value="transporteur">Access Transporteur</option>
                                <option value="banque">Access Banque</option>
                                <option value="admin">Access Administrateur</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Code d'accès</label>
                        <input 
                            type="password"
                            required={!editingUser} 
                            value={formData.mot_de_passe} 
                            onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} 
                            className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex gap-4 pt-10">
                        <button type="submit" disabled={isSaving} className="flex-1 h-14 bg-primary text-foreground rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3">
                            {isSaving ? <RefreshCcw className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                            {editingUser ? "Confirmer la Mise à Jour" : "Valider l'Accréditation"}
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminUsers;
