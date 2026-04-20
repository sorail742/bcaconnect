import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    RotateCcw,
    CheckCircle,
    XCircle,
    Package,
    Calendar,
    AlertTriangle,
    Search,
    Filter,
    RefreshCcw,
    ChevronRight,
    ArrowRightLeft,
    CheckCircle2,
    ShieldAlert,
    History
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { useAdminDisputes } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import api from '../../services/api';

const Returns = () => {
    const [search, setSearch] = useState('');
    const { data: disputes = [], loading, refetch } = useAdminDisputes();

    const { mutate: resolveMutation, isPending: isResolving } = useApiMutation(
        ({ id, status, decision }) => api.put(`/disputes/${id}/resolve`, { statut: status, decision_finale: decision }),
        {
            onSuccess: () => {
                refetch();
            },
            successMessage: "Protocole de litige mis à jour avec succès.",
            errorMessage: "Échec de la mise à jour du protocole."
        }
    );

    const handleAction = (id, status) => {
        const decision = status === 'resolu' ? "Retour approuvé par l'administration." : "Retour rejeté par l'administration.";
        resolveMutation({ id, status, decision });
    };

    const filtered = disputes.filter(r =>
        (r.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.demandeur?.nom_complet || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="Gestion des Retours">
            <div className="space-y-4 animate-in pb-16">

                {/* Executive Command Center — Master Directive */}
                <div className="executive-card !p-4 group overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FFB703]/[0.02] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-[2.2rem] bg-[#FFB703]/10 flex items-center justify-center text-[#FFB703] border border-[#FFB703]/20 shadow-inner group-hover:rotate-6 transition-transform">
                                <ArrowRightLeft className="size-6 shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5" translate="no">
                                    GESTION_<span className="text-[#FFB703]">RETOURS</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-[#FFB703] animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                        Retours synchronisés à {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            id="btn-refresh-returns-hub"
                            onClick={() => refetch()} 
                            disabled={loading || isResolving}
                            className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all  shadow-sm disabled:opacity-50"
                        >
                            <RefreshCcw className={cn("size-6", loading && "animate-spin")} />
                        </button>
                    </div>
                </div>

                {/* Search Surface — Precision Filtering */}
                <div className="executive-card !p-4 flex items-center bg-background/40 border-[#FFB703]/10">
                    <div className="relative group w-full">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 size-5 group-focus-within:text-[#FFB703] transition-colors relative z-10" />
                        <input
                            id="input-search-returns-ledger"
                            className="w-full pl-20 pr-8 h-11 bg-transparent text-[16px] font-black uppercase tracking-widest placeholder:text-slate-800 text-foreground outline-none"
                            placeholder="Rechercher par ID ou nom du client..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Registry Ledger — Nodal Data Hub */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {loading ? (
                        [1, 2, 3, 4].map(n => <div key={n} className="h-80 bg-white/[0.02] border border-foreground/5 rounded-2xl animate-pulse" />)
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-2 py-24 executive-card flex flex-col items-center justify-center gap-3 opacity-20 text-center border-dashed border-foreground/10">
                            <ArrowRightLeft className="size-6 text-foreground" />
                            <p className="text-[14px] font-black uppercase  text-foreground">Aucun retour en cours</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <div
                                key={item.id}
                                className="executive-card p-4 group relative overflow-hidden transition-all duration-500 hover:border-[#FFB703]/30"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <div className={cn(
                                        "px-6 py-2 rounded-2xl text-[10px] font-black uppercase  border backdrop-blur-2xl transition-all duration-500",
                                        item.statut === 'resolu' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            item.statut === 'rejete' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    )}>
                                        {item.statut === 'ouvert' ? 'En attente' : item.statut === 'resolu' ? 'Approuvé' : 'Rejeté'}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/10 flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-110 transition-transform duration-700">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB703]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                            <Package className="size-6 text-slate-700 group-hover:text-[#FFB703] transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black text-foreground uppercase truncate max-w-[280px] tracking-tight pt-1 leading-none">
                                                {item.demandeur?.nom_complet || "Client inconnu"}
                                            </p>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase  leading-none">ID Demande: #{item.id?.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background/40 rounded-2xl border border-foreground/5 space-y-4 group-hover:border-[#FFB703]/10 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <ShieldAlert className="size-6 text-[#FFB703] shrink-0 mt-1" />
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-600 uppercase  leading-none pt-1">Motif Déclaré</p>
                                                <p className="text-[13px] text-foreground font-black uppercase leading-relaxed tracking-tight group-hover:text-[#FFB703] transition-colors">"{item.description || "Aucun détail fourni."}"</p>
                                            </div>
                                        </div>
                                        <div className="pt-8 border-t border-foreground/5 grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="size-5 text-slate-700" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight tabular-nums">{new Date(item.createdAt).toLocaleDateString('fr-GN')}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <History className="size-5 text-slate-700" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">Canal actif</span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.statut === 'ouvert' && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                id={`btn-reject-return-${item.id}`}
                                                onClick={() => handleAction(item.id, 'rejete')}
                                                disabled={isResolving}
                                                className="flex-1 h-12 bg-white/[0.03] border border-foreground/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase  hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center gap-4  shadow-sm disabled:opacity-50"
                                            >
                                                <XCircle className="size-5" /> Rejeter
                                            </button>
                                            <button
                                                id={`btn-approve-return-${item.id}`}
                                                onClick={() => handleAction(item.id, 'resolu')}
                                                disabled={isResolving}
                                                className="flex-1 h-12 bg-white text-background rounded-2xl text-[10px] font-black uppercase  hover:bg-[#FFB703] transition-all flex items-center justify-center gap-4  shadow-2xl shadow-white/5 border-0 disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="size-5" /> Approuver
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Returns;
