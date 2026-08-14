import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import FilterDropdown from '../../components/ui/FilterDropdown';
import Modal from '../../components/ui/Modal';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import { useQuery } from '@tanstack/react-query';
import useApiMutation from '../../hooks/useApiMutation';
import DataTable from '../../components/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Plus, TrendingUp, Edit2, Trash2, Shield,
    Users as UsersIcon, Activity, CheckCircle2, Zap,
    RefreshCcw, ShieldCheck, Lock, UserCircle,
    Fingerprint, ChevronDown, Filter, Info, Mail, Phone,
    UserPlus, Download, FileText, PieChart, Database, X
} from 'lucide-react';
import userService from '../services/userService';
import { cn } from '../../lib/utils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPdfLetterhead } from '../../lib/pdfBranding';
import { toast } from 'sonner';

const ROLES = ['TOUS', 'client', 'fournisseur', 'transporteur', 'technicien', 'banque', 'admin'];

const ROLE_LABELS = {
    client: 'Client (Acheteur)',
    fournisseur: 'Fournisseur',
    transporteur: 'Livreur / Transport',
    technicien: 'Technicien',
    banque: 'Banque',
    admin: 'Administrateur',
};

const AdminUsers = () => {
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('TOUS');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nom_complet: '',
        email: '',
        telephone: '',
        role: 'client',
        statut: 'actif',
        mot_de_passe: ''
    });

    const roleFilter = selectedRole === 'TOUS' ? '' : selectedRole;
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['admin-users', page, search, roleFilter],
        queryFn: () => userService.getAll(page, 15, search, roleFilter),
    });

    const users = data?.users || [];
    const totalPages = data?.pages || 1;
    
    const stats = [
        { title: "Membres de l'écosystème", value: data?.total || 0, icon: UsersIcon, iconColor: "primary", trend: 'up', trendValue: data?.stats?.growth ? `+${data.stats.growth}%` : undefined },
        { title: "Sécurité & Accès", value: data?.stats?.status || "Actif", icon: ShieldCheck, iconColor: "emerald" },
        { title: "Nouv. Accréditations", value: data?.stats?.newLast7Days || "0", icon: UserPlus, iconColor: "primary", trend: 'up', trendValue: data?.stats?.growth > 0 ? '+5%' : undefined }
    ];

    const [deleteTarget, setDeleteTarget] = useState(null);

    const { mutateAsync: deleteMutation } = useApiMutation(
        ({ id, confirmationText }) => userService.delete(id, confirmationText),
        {
            invalidateKeys: ['admin-users', 'stats'],
            successMessage: 'Utilisateur supprimé définitivement.',
            onSuccess: () => setDeleteTarget(null),
            optimistic: {
                queryKey: ['admin-users', page, search, roleFilter],
                updater: (old, { id: deletedId }) => {
                    if (!old?.users) return old;
                    const nextUsers = old.users.filter((u) => u.id !== deletedId);
                    return {
                        ...old,
                        users: nextUsers,
                        total: Math.max(0, (old.total || nextUsers.length) - 1),
                    };
                },
            },
        }
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

    const handleDelete = (user) => setDeleteTarget(user);

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

    const getExportData = () => {
        return users.map(u => ({
            ID: u.id?.toUpperCase() || 'N/A',
            NOM: u.nom_complet?.toUpperCase() || 'N/A',
            EMAIL: u.email || 'N/A',
            PHONE: u.telephone || 'N/A',
            ROLE: u.role?.toUpperCase() || 'CLIENT',
            STATUT: u.statut?.toUpperCase() || 'N/A',
            JOINT_LE: new Date(u.createdAt).toLocaleDateString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Utilisateurs");
        XLSX.writeFile(workbook, `BCA_Users_Audit_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("EXPORT EXCEL RÉUSSI.");
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Users_${Date.now()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("FICHIER CSV GÉNÉRÉ.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('landscape');
        const headerY = addPdfLetterhead(doc, "AUDIT GOUVERNANCE", `RÉSEAU NODAL • GÉNÉRÉ LE: ${new Date().toLocaleString()} • TOTAL MEMBRES: ${data?.total || 0}`);

        autoTable(doc, {
            startY: headerY,
            head: [["ID", "NOM", "EMAIL", "RÔLE", "STATUT", "INSCRIPTION"]],
            body: getExportData().map(u => [
                u.ID.slice(0, 10),
                u.NOM,
                u.EMAIL,
                u.ROLE,
                u.STATUT,
                u.JOINT_LE
            ]),
            theme: 'grid',
            headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
            margin: { top: headerY }
        });
        
        doc.save(`BCA_Gouvernance_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("AUDIT PDF PRÊT POUR ARCHIVAGE.");
    };

    const columns = [
        {
            label: 'Identité',
            render: (u) => (
                <div className="flex items-center gap-4 py-3">
                    <div className="size-10 rounded-2xl bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black text-foreground uppercase tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {u.nom_complet}
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground lowercase truncate">{u.email}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'Rôle System',
            render: (u) => (
                <div className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-fit",
                    u.role === 'admin' ? "bg-primary/5 border-primary/10 text-primary" : "bg-muted border-border text-muted-foreground"
                )}>
                    {u.role === 'fournisseur' ? 'FOURNISSEUR' : u.role === 'technicien' ? 'TECHNICIEN' : u.role?.toUpperCase()}
                </div>
            )
        },
        {
            label: 'Statut',
            render: (u) => (
                <div className="flex items-center gap-2">
                    <div className={cn("size-1.5 rounded-full", u.statut === 'actif' ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        {u.statut?.toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            label: 'Téléphone',
            render: (u) => <span className="text-[10px] font-bold text-muted-foreground">{u.telephone || 'N/A'}</span>
        },
        {
            label: 'Actions',
            render: (u) => (
                <div className="flex items-center justify-end gap-2 pr-2">
                    <button onClick={() => handleOpenModal(u)} className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-all">
                        <Edit2 className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(u)} className="size-8 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-rose-500 transition-all">
                        <Trash2 className="size-3.5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="ADMINISTRATION UTILISATEURS" noPadding>
            <div className="min-h-screen bg-background p-6 lg:p-12 space-y-12 custom-scrollbar">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-start gap-6">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10">
                            <UsersIcon className="size-8 text-primary shadow-glow" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Gestion des <span className="text-primary">Accès</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse border-2 border-white shadow-sm" />
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                                    {data?.total || 0} NODES INDEXÉS • GOUVERNANCE ACTIVE
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-4 w-full md:w-auto shrink-0">
                        <button 
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-12 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.3)] hover:opacity-90 active:scale-95 transition-all shrink-0"
                        >
                            <Download className="size-5" />
                            Générer Rapport
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOpenModal()}
                            className="h-12 px-10 bg-primary text-primary-foreground rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center gap-4 shrink-0"
                        >
                            <Plus className="size-5" />
                            Accréditer
                        </button>
                        <button onClick={() => refetch()} className="size-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-xl shadow-slate-200/40 shrink-0">
                            <RefreshCcw className={cn("size-6", isLoading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Export HUD - Expanding Area */}
                <AnimatePresence>
                    {showExportMenu && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-primary/[0.03] p-8 rounded-3xl border border-primary/20 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-2xl shadow-primary/5">
                                <button onClick={handleExportExcel} className="p-8 rounded-3xl bg-card border border-border hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="size-7 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Microsoft Excel</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Audit Ledgers .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-card border border-border hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Gouvernance .pdf</p>
                                    </div>
                                </button>
                                <button onClick={handleExportCSV} className="p-8 rounded-3xl bg-card border border-border hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Database className="size-7 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">CSV Archive</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Raw Node Data .csv</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-card border border-border hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-11 rounded-2xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <X className="size-7 text-muted-foreground" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-muted-foreground mt-1">Fermer Panel</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {stats.map((s, i) => (
                        <DashboardCard key={i} {...s} />
                    ))}
                </div>

                {/* Table HUD */}
                <div className="bg-card rounded-3xl border border-border shadow-xl shadow-slate-200/30 overflow-hidden">
                    <div className="p-10 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-8 bg-muted/10">
                        <FilterDropdown
                            value={selectedRole}
                            onChange={(r) => { setSelectedRole(r); setPage(1); }}
                            defaultValue="TOUS"
                            options={ROLES.map(r => ({ value: r, label: r === 'TOUS' ? 'Tous' : (ROLE_LABELS[r] || r.toUpperCase()) }))}
                        />

                        <div className="relative w-full md:w-[450px] shrink-0">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground size-5" />
                            <input
                                className="w-full pl-16 pr-8 h-12 bg-card border border-border rounded-2xl text-[11px] font-black text-foreground focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-muted-foreground/40 uppercase tracking-widest shadow-sm"
                                placeholder="IDENTIFIER TERMINAL / USER / EMAIL..."
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
                        <div className="p-10 bg-muted/30 border-t border-border flex items-center justify-between">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Module Page {page} / {totalPages}</p>
                            <div className="flex gap-4">
                                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="size-11 rounded-2xl bg-card border border-border flex items-center justify-center disabled:opacity-30 shadow-sm hover:bg-muted transition-all">
                                    <ChevronDown className="size-6 rotate-90" />
                                </button>
                                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="size-11 rounded-2xl bg-card border border-border flex items-center justify-center disabled:opacity-30 shadow-sm hover:bg-muted transition-all">
                                    <ChevronDown className="size-6 -rotate-90" />
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
                <div className="p-4 space-y-10">
                    <form onSubmit={(e) => { e.preventDefault(); crudMutation(formData); }} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Identité Complète</label>
                                <div className="relative group">
                                    <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input 
                                        required 
                                        value={formData.nom_complet} 
                                        onChange={(e) => setFormData({...formData, nom_complet: e.target.value})} 
                                        className="w-full h-12 pl-14 pr-8 bg-muted border border-border rounded-2xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all uppercase placeholder:text-muted-foreground shadow-inner" 
                                        placeholder="NOM & PRÉNOM..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Terminal Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input 
                                        type="email"
                                        required 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                        className="w-full h-12 pl-14 pr-8 bg-muted border border-border rounded-2xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground shadow-inner" 
                                        placeholder="EMAIL@AUTH.GN"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Contact Réseau</label>
                                <div className="relative group">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input 
                                        required 
                                        value={formData.telephone} 
                                        onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                                        className="w-full h-12 pl-14 pr-8 bg-muted border border-border rounded-2xl text-sm font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground shadow-inner" 
                                        placeholder="+224 ..."
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Rôle System (Access Level)</label>
                                <div className="relative group">
                                    <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <select 
                                        value={formData.role} 
                                        onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                        className="w-full h-12 px-14 bg-muted border border-border rounded-2xl text-xs font-black text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer uppercase tracking-[0.1em] shadow-inner"
                                    >
                                        {Object.entries(ROLE_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground px-1">Code d'Accès Sécurisé</label>
                            <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input 
                                    type="password"
                                    required={!editingUser} 
                                    value={formData.mot_de_passe} 
                                    onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} 
                                    className="w-full h-12 pl-14 pr-8 bg-muted border border-border rounded-2xl text-sm font-black tracking-[0.5em] text-foreground outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground placeholder:tracking-normal shadow-inner" 
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="pt-6">
                            <button 
                                type="submit" 
                                disabled={isSaving} 
                                className="w-full h-14 bg-primary text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                            >
                                {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <ShieldCheck className="size-6" />}
                                <span>{editingUser ? "Synchroniser l'Accréditation" : "Déployer l'Accès User"}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.email}
                itemLabel="cet utilisateur"
                description="Suppression définitive : commandes, boutique, produits, messages, litiges et portefeuille de cet utilisateur seront effacés de la plateforme. Une preuve complète (instantané) est conservée dans l'historique admin, mais la restauration automatique n'est pas possible pour un compte — seul le support technique peut intervenir."
                confirmButtonText="Supprimer définitivement"
                onConfirm={(confirmationText) => deleteMutation({ id: deleteTarget.id, confirmationText })}
            />
        </DashboardLayout>
    );
};

export default AdminUsers;
