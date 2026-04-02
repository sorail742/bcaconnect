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
        <DashboardLayout title="Logistique Retours">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Contrôle de Flux Inversés</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Gestion des <span className="text-primary italic">Retours.</span></h2>
                    </div>
                    <button onClick={fetchReturns} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                        <RefreshCcw className={cn("size-5", loading && "animate-spin")} />
                    </button>
                </div>

                {/* Filter Surface */}
                <div className="p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] flex items-center shadow-sm">
                    <div className="relative group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 size-5 group-focus-within:text-primary transition-colors" />
                        <input
                            className="w-full pl-16 pr-8 h-14 bg-transparent text-sm font-bold uppercase tracking-widest placeholder:text-slate-300 outline-none"
                            placeholder="RECHERCHER DOSSIER, CLIENT..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* List Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {loading ? (
                        [1, 2, 3, 4].map(n => <div key={n} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse border border-slate-200 dark:border-slate-700" />)
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-2 py-32 flex flex-col items-center justify-center gap-6 opacity-30 text-center">
                            <ArrowRightLeft className="size-16" />
                            <p className="text-xs font-bold uppercase tracking-widest">Registre de Retour Vierge</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                        item.statut === 'approuve' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            item.statut === 'rejete' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse"
                                    )}>
                                        {item.statut === 'en_attente' ? 'ANALYSIS' : item.statut === 'approuve' ? 'VALIDÉ' : 'REJETÉ'}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                                            <Package className="size-8 text-slate-200" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase truncate max-w-[200px]">
                                                {item.User?.nom_complet || "Client Inconnu"}
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">REF: #{item.id?.slice(0, 8)}</p>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex items-start gap-4">
                                            <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Motif Déclaré</p>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium italic leading-relaxed">"{item.motif || "Non spécifié"}"</p>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="size-3 text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(item.createdAt).toLocaleDateString('fr-GN')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <History className="size-3 text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-400 uppercase italic">Protocole Actif</span>
                                            </div>
                                        </div>
                                    </div>

                                    {item.statut === 'en_attente' && (
                                        <div className="flex gap-4 pt-2">
                                            <button
                                                onClick={() => handleAction(item.id, 'rejete')}
                                                className="flex-1 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-500 rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <XCircle className="size-3" /> Rejeter
                                            </button>
                                            <Button
                                                onClick={() => handleAction(item.id, 'approuve')}
                                                className="flex-1 h-12 rounded-xl text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                                            >
                                                <CheckCircle2 className="size-3" /> Valider
                                            </Button>
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
