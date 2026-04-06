import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/ui/Modal';
import DataTable from '../../components/ui/DataTable';
import {
    Search,
    Plus,
    TrendingUp,
    Edit2,
    Trash2,
    Shield,
    Users as UsersIcon,
    Activity,
    CheckCircle2,
    Zap,
    RefreshCcw,
    ShieldCheck,
    Lock,
    UserCircle,
    Fingerprint,
    ChevronDown
} from 'lucide-react';
import userService from '../../services/userService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import Button from '../../components/ui/Button';

const ROLES = ['TOUS', 'client', 'fournisseur', 'transporteur', 'admin'];

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        growth: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedRole, setSelectedRole] = useState('TOUS');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            const roleFilter = selectedRole === 'TOUS' ? '' : selectedRole;
            const data = await userService.getAll(page, 15, search, roleFilter);
            setUsers(data.users || []);
            setTotalPages(data.pages || 1);
            setStats({
                total: data.total || 0,
                active: Math.floor(data.total * 0.85) || 0,
                growth: 12
            });
        } catch (error) {
            console.error(error);
            toast.error("ÉCHEC DE LA SYNCHRONISATION DU REGISTRE.");
        } finally {
            setIsLoading(false);
        }
    }, [page, search, selectedRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id) => {
        if (!window.confirm("RÉVOQUER DÉFINITIVEMENT L'ACCÈS ?")) return;
        try {
            await userService.delete(id);
            toast.success("ACCÈS RÉVOQUÉ.");
            fetchUsers();
        } catch (error) {
            toast.error("ÉCHEC DE LA RÉVOCATION.");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingUser) {
                const payload = { ...formData };
                if (!payload.mot_de_passe) delete payload.mot_de_passe;
                await userService.update(editingUser.id, payload);
                toast.success("INDEX MIS À JOUR.");
            } else {
                await userService.create(formData);
                toast.success("NOUVEAU NOEUD ACCRÉDITÉ.");
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            toast.error("ERREUR D'ENREGISTREMENT.");
        } finally {
            setIsSaving(false);
        }
    };

    const columns = [
        {
            label: 'IDENTITÉ_NOEUD',
            render: (u) => (
                <div className="flex items-center gap-4 py-2 group/u">
                    <div className="size-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-foreground/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.id}`} alt="" className="size-full object-cover relative z-10 group-hover/u:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/10 to-transparent" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-800 dark:text-foreground uppercase truncate tracking-tight leading-none pt-0.5">{u.nom_complet}</p>
                        <p className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest leading-none mt-1 opacity-70">{u.email}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'PRIVILÈGES',
            render: (u) => (
                <div className={cn(
                    "px-3 h-7 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border w-fit",
                    u.role === 'admin' ? "bg-[#FF6600]/5 border-[#FF6600]/10 text-[#FF6600]" : "bg-slate-50 dark:bg-foreground/5 border-slate-200 dark:border-foreground/5 text-muted-foreground/80"
                )}>
                    {u.role === 'admin' ? <Shield className="size-3" /> : <UserCircle className="size-3" />}
                    {u.role?.toUpperCase()}
                </div>
            )
        },
        {
            label: 'INDEXATION',
            render: (u) => (
                <span className="text-[9px] font-black text-muted-foreground dark:text-muted-foreground/80 uppercase tracking-widest pt-0.5">
                    {new Date(u.createdAt).toLocaleDateString('fr-GN')}
                </span>
            )
        },
        {
            label: 'SIGNAL_STATUT',
            render: (u) => (
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "size-1.5 rounded-full",
                        u.statut === 'actif' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300"
                    )} />
                    <span className={cn(
                        "text-[8px] font-black uppercase tracking-widest pt-0.5",
                        u.statut === 'actif' ? "text-emerald-500" : "text-muted-foreground/80"
                    )}>
                        {u.statut?.toUpperCase()}
                    </span>
                </div>
            )
        },
        {
            label: 'GOUVERNANCE',
            render: (u) => (
                <div className="flex items-center justify-end gap-3 pr-4">
                    <button onClick={() => handleOpenModal(u)} className="size-6 rounded-lg bg-slate-50 dark:bg-foreground/5 border border-slate-200 dark:border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FF6600] transition-all"><Edit2 className="size-4" /></button>
                    <button onClick={() => handleDelete(u.id)} className="size-6 rounded-lg bg-slate-50 dark:bg-foreground/5 border border-slate-200 dark:border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-rose-500 transition-all"><Trash2 className="size-4" /></button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="ALPHA_REGISTRE_NODAL">
            <div className="space-y-4 animate-in pb-16">

                {/* Registry Command Infrastructure — Executive Control v4 */}
                <div className="executive-card !p-4 group overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-2xl bg-gradient-to-br from-[#FFB703] to-[#FB8500] flex items-center justify-center shadow-[0_20px_60px_rgba(255,183,3,0.2)] group-hover:rotate-6 transition-transform duration-700 ">
                                <UsersIcon className="size-6 text-background drop-shadow-xl" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    GOUVERNANCE_<span className="text-[#FFB703]">RÉSEAU</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-[#FFB703] animate-ping" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                        ID_REGISTRY: ALPHA_SEC_01 — STATUS: LIVE_SYNC
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                id="btn-users-refresh-signal"
                                onClick={fetchUsers} 
                                className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all "
                            >
                                <RefreshCcw className={cn("size-5 transition-all duration-700", isLoading && "animate-spin")} />
                            </button>
                            <button
                                id="btn-users-add-accreditation"
                                onClick={() => handleOpenModal()} 
                                className="h-11 px-6 bg-white text-background hover:bg-[#FFB703] rounded-2xl font-medium text-sm text-muted-foreground transition-all shadow-[0_30px_90px_rgba(0,0,0,0.5)]  flex items-center gap-3 group/btn border-0"
                            >
                                <Plus className="size-5 transition-transform group-hover/btn:rotate-90 group-hover/btn:scale-125" />
                                <span>NOUVELLE_ACCRÉDITATION</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Macro Node Indicators — HUD Node 03 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="executive-card group ">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Fingerprint className="size-6" />
                         </div>
                         <div className="relative z-10 space-y-4">
                             <p className="text-premium-label group-hover:text-foreground transition-colors uppercase ">NOEUDS_INDEXÉS</p>
                             <h3 className="text-sm font-black text-foreground uppercase tracking-tighter tabular-nums leading-none">{stats.total}</h3>
                         </div>
                    </div>
                    <div className="executive-card group  border-l-4 border-l-emerald-500/30">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="size-6" />
                         </div>
                         <div className="relative z-10 space-y-4">
                             <p className="text-premium-label group-hover:text-emerald-400 transition-colors uppercase ">SIGNALS_ACTIFS</p>
                             <div className="flex items-end justify-between">
                                <h3 className="text-sm font-black text-emerald-500 uppercase tracking-tighter tabular-nums leading-none">{stats.active}</h3>
                                <div className="text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    OPTIMAL
                                </div>
                             </div>
                         </div>
                    </div>
                    <div className="executive-card group  border-l-4 border-l-[#FFB703]/30">
                         <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrendingUp className="size-6" />
                         </div>
                         <div className="relative z-10 space-y-4">
                             <p className="text-premium-label group-hover:text-[#FFB703] transition-colors uppercase ">CROISSANCE_EXP</p>
                             <div className="flex items-end justify-between">
                                <h3 className="text-sm font-black text-[#FFB703] uppercase tracking-tighter tabular-nums leading-none">+{stats.growth}%</h3>
                                <div className="text-[10px] font-black tracking-widest px-4 py-1.5 rounded-full bg-[#FFB703]/10 text-[#FFB703] border border-[#FFB703]/20">
                                    UPWARD
                                </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Primary Registry Ledger — HUD Table */}
                <div className="executive-card !p-0 overflow-hidden border-t-8 border-t-[#FFB703]">
                    <div className="p-4 border-b border-white/[0.03] bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                         <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                            {ROLES.map(r => (
                                <button
                                    id={`tab-role-node-${r.toLowerCase()}`}
                                    key={r}
                                    onClick={() => { setSelectedRole(r); setPage(1); }}
                                    className={cn(
                                        "px-10 h-11 rounded-2xl text-[10px] font-black uppercase  transition-all border ",
                                        selectedRole === r 
                                            ? "bg-[#FFB703] text-background border-transparent shadow-[0_20px_40px_rgba(255,183,3,0.15)]" 
                                            : "bg-white/[0.03] border-foreground/5 text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    {r}
                                </button>
                            ))}
                         </div>
                         <div className="relative group w-full xl:w-[40rem]">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground size-6 group-focus-within:text-[#FFB703] transition-colors" />
                            <input
                                id="input-search-registry"
                                className="w-full pl-16 pr-8 h-12 bg-white/[0.02] border border-foreground/10 rounded-2xl text-[12px] font-black tracking-widest placeholder:text-slate-600 outline-none focus:border-[#FFB703]/30 transition-all text-foreground uppercase"
                                placeholder="IDENTIFIER_UNITÉ_RÉSEAU..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                         </div>
                    </div>

                    <div className="p-4">
                        <DataTable
                            columns={columns}
                            data={users}
                            isLoading={isLoading}
                        />
                        {!isLoading && users.length === 0 && (
                            <div className="py-60 text-center opacity-40 flex flex-col items-center gap-3">
                                 <Fingerprint className="size-6 animate-pulse text-muted-foreground" />
                                 <div className="space-y-4">
                                     <p className="text-sm font-black uppercase  text-muted-foreground/80">REGISTRY_EMPTY</p>
                                     <p className="text-[10px] font-black uppercase  text-[#FFB703]">SYSTEM_PENDING_NODES</p>
                                 </div>
                            </div>
                        )}
                        {!isLoading && users.length > 0 && (
                            <div className="p-4 border-t border-white/[0.02] flex items-center justify-between bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                     <div className="size-3 rounded-full bg-[#FFB703] animate-ping shadow-[0_0_15px_#FFB703]" />
                                     <p className="text-[12px] font-black text-muted-foreground/80 uppercase  pt-0.5">SEGMENT_{page}_OF_{totalPages}</p>
                                </div>
                                <div className="flex gap-3">
                                     <button 
                                        id="btn-registry-prev"
                                        onClick={() => setPage(p => Math.max(1, p - 1))} 
                                        disabled={page === 1} 
                                        className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-[#FFB703] disabled:opacity-10 transition-all "
                                     >
                                         <Zap className="size-6 -rotate-90" />
                                     </button>
                                     <button 
                                        id="btn-registry-next"
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={page === totalPages} 
                                        className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground hover:text-[#FFB703] disabled:opacity-10 transition-all "
                                     >
                                         <Zap className="size-6 rotate-90" />
                                     </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Terminal Accréditation — Alpha Console Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingUser ? "RÉVISION_UNITÉ_RÉSEAU" : "PROTOCOLE_ACCRÉDITATION_ALPHA"}
                className="max-w-4xl"
            >
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="space-y-6">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground px-2 leading-none pt-0.5">DÉSIGNATION_IDENTITY_ALPHA</label>
                            <div className="relative group/field">
                                <UserCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#FFB703] size-5 z-20 transition-colors" />
                                <input 
                                    id="modal-node-identity"
                                    name="nom_complet" 
                                    required 
                                    value={formData.nom_complet} 
                                    onChange={(e) => setFormData({...formData, nom_complet: e.target.value})} 
                                    placeholder="DESIGNATION_PERSONNELLE_..." 
                                    className="w-full h-11 pl-16 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[16px] font-black uppercase tracking-tight focus:border-[#FFB703]/30 outline-none transition-all text-foreground shadow-inner" 
                                />
                            </div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase  text-muted-foreground px-2 leading-none pt-0.5">CANAL_E-MAIL_ROUTING</label>
                                <div className="relative group/field">
                                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#FFB703] size-6 z-20 transition-colors" />
                                    <input 
                                        id="modal-node-email"
                                        name="email" 
                                        type="email" 
                                        required 
                                        value={formData.email} 
                                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                                        placeholder="IDENT_ALPHA@NODE.GN" 
                                        className="w-full h-11 pl-16 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[13px] font-black uppercase tracking-widest focus:border-[#FFB703]/30 outline-none transition-all text-foreground shadow-inner" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase  text-muted-foreground px-2 leading-none pt-0.5">HIÉRARCHIE_PRIVILÈGES</label>
                                <div className="relative group/field">
                                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#FFB703] size-6 z-20 pointer-events-none" />
                                    <select 
                                        id="modal-node-role"
                                        name="role" 
                                        value={formData.role} 
                                        onChange={(e) => setFormData({...formData, role: e.target.value})} 
                                        className="w-full h-11 pl-16 pr-12 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[12px] font-black uppercase  focus:border-[#FFB703]/30 outline-none transition-all text-foreground appearance-none"
                                    >
                                        <option value="client" className="bg-card">Client (NODE)</option>
                                        <option value="fournisseur" className="bg-card">Fournisseur (VENDOR)</option>
                                        <option value="transporteur" className="bg-card">Transporteur (HUB)</option>
                                        <option value="admin" className="bg-card">Administrateur (ROOT)</option>
                                    </select>
                                    <ChevronDown className="absolute right-8 top-1/2 -translate-y-1/2 size-6 text-slate-600 pointer-events-none group-focus-within/field:rotate-180 transition-transform duration-500" />
                                </div>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase  text-muted-foreground px-2 leading-none pt-0.5">INITIALISATION_CRYPT_KEY</label>
                            <div className="relative group/field">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/field:text-[#FFB703] size-5 z-20 transition-colors" />
                                <input 
                                    id="modal-node-pass"
                                    name="mot_de_passe" 
                                    type="password" 
                                    required={!editingUser} 
                                    value={formData.mot_de_passe} 
                                    onChange={(e) => setFormData({...formData, mot_de_passe: e.target.value})} 
                                    placeholder="••••••••••••••••" 
                                    className="w-full h-11 pl-16 pr-8 bg-white/[0.01] border border-foreground/10 rounded-2xl text-[16px] font-black  focus:border-[#FFB703]/30 outline-none transition-all text-foreground shadow-inner" 
                                />
                            </div>
                         </div>
                    </div>
                    <div className="pt-10">
                        <button 
                            id="btn-modal-node-execute"
                            type="submit" 
                            disabled={isSaving} 
                            className="w-full h-12 rounded-2xl bg-white text-background font-black text-[14px] uppercase  flex items-center justify-center gap-3 shadow-[0_40px_100px_rgba(0,0,0,0.5)] hover:bg-[#FFB703] hover:text-background transition-all  border-0 group/submit"
                        >
                            {isSaving ? <RefreshCcw className="size-6 animate-spin" /> : <ShieldCheck className="size-6 transition-all group-hover/submit:scale-125" />}
                            <span>{editingUser ? "TERMINER_RÉVISION_INDEX" : "EXÉCUTER_L'ACCRÉDITATION"}</span>
                        </button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export default AdminUsers;
