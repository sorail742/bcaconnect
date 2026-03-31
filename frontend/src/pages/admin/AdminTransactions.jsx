import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Search,
    Filter,
    Wallet,
    CheckCircle2,
    TrendingUp,
    AlertCircle,
    Download,
    RefreshCcw,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';
import walletService from '../../services/walletService';
import { Skeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const STATUS_CONFIG = {
    'terminé': { dot: 'bg-emerald-500', text: 'text-emerald-500', label: 'COMPLÉTÉ' },
    'en_attente': { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-500', label: 'EN COURS' },
    'échoué': { dot: 'bg-rose-500', text: 'text-rose-500', label: 'ÉCHOUÉ' },
};

const formatGNF = (n) => parseFloat(n).toLocaleString('fr-GN') + ' GNF';

const AdminTransactions = () => {
    const [search, setSearch] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            setIsLoading(true);
            const data = await walletService.getAllTransactions();
            setTransactions(data);
        } catch (err) {
            toast.error("Échec de la synchronisation des flux.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filtered = transactions.filter(t => {
        const user = t.Wallet?.User?.nom_complet || "";
        return t.id.toLowerCase().includes(search.toLowerCase()) ||
            user.toLowerCase().includes(search.toLowerCase());
    });

    const totalVolume = transactions.reduce((acc, t) => acc + parseFloat(t.montant), 0);
    const successfulCount = transactions.filter(t => t.statut === 'terminé').length;

    return (
        <DashboardLayout title="AUDIT DES FLUX FINANCIERS">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header ────────────────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Surveillance des Capitaux v2.4</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Audit des <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Transactions.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Analyse en temps réel de tous les mouvements financiers au sein de l'écosystème BCA Connect.</p>
                    </div>
                    <button 
                        onClick={fetchTransactions}
                        className="h-20 px-10 bg-background border-4 border-border text-foreground rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-4 hover:border-primary/40 transition-all shadow-premium active:scale-95 group"
                    >
                        <RefreshCcw className="size-4 group-hover:rotate-180 transition-transform duration-700" />
                        SYNCHRONISER LES LOGS
                    </button>
                </div>

                {/* ── Dashboard Stats ───────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="glass-card p-10 rounded-[3rem] border-4 border-border shadow-premium hover:shadow-premium-lg transition-all group">
                        <div className="flex justify-between items-start mb-8">
                            <p className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Volume Cumulé</p>
                            <Wallet className="size-6 text-primary group-hover:scale-125 transition-transform" />
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter text-foreground text-executive-data">
                            {formatGNF(totalVolume)}
                        </h3>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">
                            <ArrowUpRight className="size-3" />
                            Progression Optimale
                        </div>
                    </div>

                    <div className="glass-card p-10 rounded-[3rem] border-4 border-border shadow-premium hover:shadow-premium-lg transition-all group">
                        <div className="flex justify-between items-start mb-8">
                            <p className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">Opérations Certifiées</p>
                            <CheckCircle2 className="size-6 text-emerald-500 group-hover:scale-125 transition-transform" />
                        </div>
                        <h3 className="text-4xl font-black italic tracking-tighter text-foreground text-executive-data">
                            {successfulCount.toLocaleString()}
                        </h3>
                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">
                            Transaction moyenne: {formatGNF(totalVolume / (transactions.length || 1))}
                        </div>
                    </div>

                    <div className="bg-primary p-10 rounded-[3rem] text-white shadow-premium-lg shadow-primary/30 relative overflow-hidden group">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <p className="text-executive-label font-black text-white/40 uppercase tracking-[0.3em] italic">Indice de Santé</p>
                                <TrendingUp className="size-6 text-white/60 group-hover:scale-125 transition-transform" />
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Réseau<br />Stable.</h3>
                            <p className="mt-6 text-[10px] font-black text-white/60 uppercase tracking-widest italic border-l-2 border-white/20 pl-4">Audit complet effectué avec succès</p>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                        <TrendingUp className="absolute -right-6 -bottom-6 size-48 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </div>
                </div>

                {/* ── Transactions Ledger ───────────────────────────── */}
                <div className="glass-card rounded-[3.5rem] border-4 border-border shadow-premium-lg overflow-hidden">
                    
                    {/* Toolbar Executive */}
                    <div className="p-10 border-b-4 border-border flex flex-col xl:flex-row gap-10 bg-accent/20">
                        <div className="relative group/search flex-1">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground/30 size-6 group-focus-within/search:text-primary transition-all" />
                            <input
                                className="w-full h-20 pl-16 pr-8 bg-background border-4 border-transparent focus:border-primary/40 rounded-[1.5rem] text-sm font-black italic uppercase tracking-widest placeholder:text-muted-foreground/20 shadow-inner outline-none transition-all"
                                placeholder="RECHERCHER TRX_ID OU ACTEUR..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <button className="h-20 w-20 bg-background border-4 border-border rounded-[1.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-inner group">
                                <Filter className="size-6 group-hover:scale-110 transition-transform" />
                            </button>
                            <button className="h-20 px-8 bg-foreground text-background border-4 border-foreground rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-primary hover:border-primary transition-all flex items-center gap-4">
                                <Download className="size-4" />
                                EXPORTER LOGS
                            </button>
                        </div>
                    </div>

                    {/* Table Ledger */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-accent/40 border-b-4 border-border">
                                    {['Identifiant', 'Horodatage', 'Acteur Certifié', 'Nature', 'Volume', 'Statut'].map((h) => (
                                        <th key={h} className="px-10 py-8 text-executive-label italic text-muted-foreground/40 font-black uppercase tracking-[0.2em]">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y-4 divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)
                                ) : filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-8 opacity-20">
                                                <AlertCircle className="size-20" />
                                                <p className="text-2xl font-black italic tracking-tighter uppercase">Aucun Flux Détecté</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((t) => {
                                        const config = STATUS_CONFIG[t.statut] || STATUS_CONFIG['en_attente'];
                                        const user = t.Wallet?.User;
                                        return (
                                            <tr key={t.id} className="group hover:bg-primary/5 transition-all duration-500 cursor-default">
                                                <td className="px-10 py-8">
                                                    <span className="text-[11px] font-black text-primary uppercase tracking-[0.2em] italic border-b-2 border-primary/20 pb-1">
                                                        #{t.id.slice(0, 8)}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-8 text-sm font-bold text-muted-foreground italic uppercase">
                                                    {new Date(t.createdAt).toLocaleString('fr-GN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="size-14 rounded-[1.2rem] bg-background border-4 border-border flex items-center justify-center font-black text-primary text-xs shadow-premium group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 overflow-hidden shrink-0">
                                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || t.id}`} alt="avatar" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="leading-tight">
                                                            <p className="text-lg font-black italic text-foreground uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">
                                                                {user?.nom_complet || "Anonyme"}
                                                            </p>
                                                            <p className="text-executive-label text-muted-foreground/30 font-black uppercase tracking-widest mt-1 italic">{user?.role || "Membre"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-3 px-4 py-2 bg-background border-2 border-border rounded-xl w-fit shadow-inner">
                                                        {t.type === 'depot' ? <ArrowDownLeft className="size-3 text-emerald-500" /> : <ArrowUpRight className="size-3 text-rose-500" />}
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground italic">
                                                            {t.type.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <p className="text-lg font-black italic text-foreground tracking-tighter text-executive-data">
                                                        {formatGNF(t.montant)}
                                                    </p>
                                                </td>
                                                <td className="px-10 py-8 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] italic px-5 py-2 rounded-full border-2",
                                                        config.text === "text-emerald-500" ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500" :
                                                        config.text === "text-amber-500" ? "bg-amber-500/5 border-amber-500/10 text-amber-500" :
                                                        "bg-rose-500/5 border-rose-500/10 text-rose-500"
                                                    )}>
                                                        <span className={cn("size-2 rounded-full", config.dot)} />
                                                        {config.label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Ledger */}
                    <div className="p-12 border-t-4 border-border bg-accent/10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <p className="text-executive-label font-black text-muted-foreground/30 italic tracking-[0.3em] uppercase">
                            FLUX DÉTECTÉS : {filtered.length} ENTRÉES CERTIFIÉES
                        </p>
                        <div className="flex gap-4">
                            <button className="h-16 px-10 border-4 border-border rounded-2xl bg-background font-black uppercase tracking-widest text-[10px] italic hover:border-primary/40 transition-all shadow-premium active:scale-95">
                                Page Suivante
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTransactions;
