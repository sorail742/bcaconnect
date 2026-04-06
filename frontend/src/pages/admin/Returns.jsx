import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchReturns = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/returns/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReturns(response.data || []);
        } catch (error) {
            toast.error("Impossible d'auditer les dossiers retours.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReturns();
    }, [fetchReturns]);

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/returns/${id}/status`, { statut: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Dossier ${status === 'approuve' ? 'validé' : 'révoqué'}.`);
            fetchReturns();
        } catch (error) {
            toast.error("Échec de la validation de protocole.");
        }
    };

    const filtered = returns.filter(r =>
        (r.id || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.User?.nom_complet || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="CONTRÔLE_FLUX_INVERSÉS_ALPHA">
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
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5">
                                    GESTION_<span className="text-[#FFB703]">RETOURS</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-[#FFB703] animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground/80 uppercase  opacity-80 pt-0.5">
                                        REVERSE_FLOW SYNC — AUDIT_LIVE_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            id="btn-refresh-returns-hub"
                            onClick={fetchReturns} 
                            className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-[#FFB703] hover:border-[#FFB703]/20 transition-all  shadow-sm"
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
                            placeholder="IDENTIFIER_UNITÉ_RETOUR_OU_CLIENT..."
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
                            <p className="text-[14px] font-black uppercase  text-foreground">REGISTRE_FLUX_INVERSÉ_VIERGE</p>
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
                                        item.statut === 'approuve' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            item.statut === 'rejete' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    )}>
                                        {item.statut === 'en_attente' ? 'ANALYSE_PULSE' : item.statut === 'approuve' ? 'PROTOCOLE_VALIDÉ' : 'RECOUVREMENT_REJETÉ'}
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
                                                {item.User?.nom_complet || "ACTEUR_INCONNU"}
                                            </p>
                                            <p className="text-[10px] font-black text-muted-foreground uppercase  leading-none">ID_LOGS: #{item.id?.slice(0, 8).toUpperCase()}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-background/40 rounded-2xl border border-foreground/5 space-y-4 group-hover:border-[#FFB703]/10 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <ShieldAlert className="size-6 text-[#FFB703] shrink-0 mt-1" />
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black text-slate-600 uppercase  leading-none pt-1">MOTIF_DÉCLARÉ_UNITÉ</p>
                                                <p className="text-[13px] text-foreground font-black uppercase leading-relaxed tracking-tight group-hover:text-[#FFB703] transition-colors">"{item.motif || "AUCUNE_INDEXATION_DÉTAILLÉE_ASSET."}"</p>
                                            </div>
                                        </div>
                                        <div className="pt-8 border-t border-foreground/5 grid grid-cols-2 gap-3">
                                            <div className="flex items-center gap-4">
                                                <Calendar className="size-5 text-slate-700" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight tabular-nums">{new Date(item.createdAt).toLocaleDateString('fr-GN')}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <History className="size-5 text-slate-700" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tight">CANAL_ACTIF</span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.statut === 'en_attente' && (
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                id={`btn-reject-return-${item.id}`}
                                                onClick={() => handleAction(item.id, 'rejete')}
                                                className="flex-1 h-12 bg-white/[0.03] border border-foreground/10 text-rose-500 rounded-2xl text-[10px] font-black uppercase  hover:bg-rose-500/10 hover:border-rose-500/30 transition-all flex items-center justify-center gap-4  shadow-sm"
                                            >
                                                <XCircle className="size-5" /> REJETER_UNITÉ
                                            </button>
                                            <button
                                                id={`btn-approve-return-${item.id}`}
                                                onClick={() => handleAction(item.id, 'approuve')}
                                                className="flex-1 h-12 bg-white text-background rounded-2xl text-[10px] font-black uppercase  hover:bg-[#FFB703] transition-all flex items-center justify-center gap-4  shadow-2xl shadow-white/5 border-0"
                                            >
                                                <CheckCircle2 className="size-5" /> VALIDER_FLUX
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
