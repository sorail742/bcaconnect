import React, { useState, useEffect } from 'react';
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
    ArrowRightLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Returns = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchReturns = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/returns/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReturns(response.data);
        } catch (error) {
            toast.error("Échec de la synchronisation des dossiers retours.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const handleAction = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/returns/${id}/status`, { statut: status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Dossier ${status === 'approuve' ? 'validé' : 'révoqué'}.`);
            fetchReturns();
        } catch (error) {
            toast.error("Échec du changement de protocole.");
        }
    };

    const filtered = returns.filter(r => 
        r.id.toLowerCase().includes(search.toLowerCase()) ||
        r.User?.nom_complet?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout title="GESTION DES FLUX INVERSES">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header Executive ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                            <span className="text-executive-label font-black text-rose-500 uppercase tracking-[0.4em] italic leading-none pt-0.5">Logistique des Réversibilités BCA</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Dossiers de <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Retours.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Audit et validation des demandes de remboursement et retours de marchandises certifiées.</p>
                    </div>
                    <button 
                        onClick={fetchReturns}
                        className="h-24 w-24 bg-background border-4 border-border rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-premium group"
                    >
                        <RefreshCcw className="size-8 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                </div>

                {/* ── Filter Bar ────────────────────────────────────── */}
                <div className="glass-card p-4 rounded-[2.5rem] border-4 border-border flex flex-col md:flex-row gap-4 bg-accent/10">
                    <div className="relative group/search flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-6 group-focus-within/search:text-primary transition-all" />
                        <input
                            className="w-full h-20 pl-16 pr-8 bg-background border-4 border-transparent focus:border-primary/40 rounded-[1.8rem] text-sm font-black italic uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                            placeholder="RECHERCHER DOSSIER OU CLIENT..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="h-20 w-20 bg-background border-4 border-border rounded-[1.8rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-inner group">
                        <Filter className="size-6 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* ── Display Grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {loading ? (
                        [1, 2, 3, 4].map(n => <div key={n} className="h-96 bg-accent/20 rounded-[3rem] animate-pulse border-4 border-border" />)
                    ) : filtered.length === 0 ? (
                        <div className="lg:col-span-2 py-40 flex flex-col items-center gap-8 opacity-20">
                            <ArrowRightLeft className="size-20" />
                            <p className="text-2xl font-black italic tracking-tighter uppercase">Registre de Retour Vierge</p>
                        </div>
                    ) : (
                        filtered.map(item => (
                            <div
                                key={item.id}
                                className="glass-card border-4 border-border rounded-[3rem] p-10 shadow-premium hover:shadow-premium-lg hover:border-primary/20 transition-all duration-500 relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-8">
                                    <div className={cn(
                                        "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic border-2",
                                        item.statut === 'approuve' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                        item.statut === 'rejete' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                        "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
                                    )}>
                                        {item.statut === 'en_attente' ? 'Analyse en Cours' : item.statut.toUpperCase()}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-6">
                                        <div className="size-20 rounded-[2rem] bg-accent border-4 border-border flex items-center justify-center shadow-premium group-hover:rotate-6 transition-transform overflow-hidden">
                                            <Package className="size-10 text-muted-foreground/20" />
                                        </div>
                                        <div>
                                            <p className="text-executive-label font-black text-muted-foreground/20 uppercase tracking-[0.2em] italic mb-1">Dossier Retour</p>
                                            <h4 className="text-3xl font-black text-foreground italic tracking-tighter uppercase leading-none truncate max-w-[250px]">
                                                {item.User?.nom_complet || "Client Inconnu"}
                                            </h4>
                                        </div>
                                    </div>

                                    <div className="p-8 bg-background border-4 border-border rounded-[2rem] shadow-inner space-y-6">
                                        <div className="flex items-start gap-4">
                                            <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-1" />
                                            <div>
                                                <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mb-1 italic">Motif de Réversibilité</p>
                                                <p className="text-sm font-bold text-foreground italic leading-relaxed">"{item.motif || "Non spécifié"}"</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 border-t-2 border-border/50 pt-6">
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1 italic">Commandé le</p>
                                                <div className="flex items-center gap-2 text-xs font-black italic">
                                                    <Calendar className="size-3 opacity-30" />
                                                    {new Date(item.createdAt).toLocaleDateString('fr-GN')}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-[0.2em] mb-1 italic">ID Référence</p>
                                                <p className="text-xs font-black italic text-primary">#{item.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {item.statut === 'en_attente' && (
                                        <div className="flex gap-4 pt-4">
                                            <button
                                                onClick={() => handleAction(item.id, 'rejete')}
                                                className="flex-1 h-20 bg-background border-4 border-border text-rose-500 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all active:scale-95 group/btn"
                                            >
                                                <XCircle className="size-4 group-hover/btn:scale-125 transition-transform" />
                                                RÉVOQUER
                                            </button>
                                            <button
                                                onClick={() => handleAction(item.id, 'approuve')}
                                                className="flex-1 h-20 bg-primary text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-4 shadow-premium-lg shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all group/btn"
                                            >
                                                <CheckCircle className="size-4 group-hover/btn:scale-125 transition-transform" />
                                                APPROUVER
                                            </button>
                                        </div>
                                    )}

                                    {item.statut !== 'en_attente' && (
                                        <div className="pt-4 flex items-center justify-between text-muted-foreground/30">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">Dossier Archivé</p>
                                            <RotateCcw className="size-5 opacity-20" />
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
