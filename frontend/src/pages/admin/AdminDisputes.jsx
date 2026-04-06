import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Gavel, MessageSquare, CheckCircle, AlertCircle,
    ExternalLink, ShieldCheck, Scale, Zap, RefreshCcw,
    AlertTriangle, History, ArrowRight, User, MoreVertical,
    CheckCircle2, ChevronDown, Satellite, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [decision, setDecision] = useState('');

    const fetchDisputes = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/disputes/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(response.data || []);
        } catch (error) {
            toast.error("ÉCHEC DE LA SYNCHRONISATION DES LITIGES.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisputes();
    }, [fetchDisputes]);

    const handleResolve = async (id) => {
        if (!decision.trim()) return toast.error("Veuillez formuler un décret final.");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/disputes/${id}/resolve`, {
                decision_finale: decision,
                statut: 'resolu'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("DÉCISION APPLIQUÉE. LITIGE RÉSOLU.");
            setSelectedDispute(null);
            setDecision('');
            fetchDisputes();
        } catch (error) {
            toast.error("ÉCHEC DE L'APPLICATION DU JUGEMENT.");
        }
    };

    return (
        <DashboardLayout title="MÉDIATION_&_ARBITRAGE_RÉSEAU">
            <div className="space-y-4 animate-in pb-16">

                {/* Executive Command Center — Master Directive */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="executive-card !p-4 group overflow-visible relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent pointer-events-none" />
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="size-6 rounded-[2.2rem] bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:rotate-6 transition-transform duration-700">
                                <Scale className="size-6- shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <h2 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    CENTRE_<span className="text-primary italic">LITIGES</span>.
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-muted-foreground uppercase  opacity-80 pt-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        COMPLIANCE_PROTOCOL — SYNC_{new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}_V6
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button 
                            id="btn-refresh-disputes-hub"
                            onClick={fetchDisputes} 
                            className="size-6 rounded-[2.2rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground/80 hover:text-primary hover:border-primary/20 transition-all "
                        >
                            <RefreshCcw className={cn("size-6 transition-all duration-700", loading && "animate-spin")} />
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
                    <div className="xl:col-span-7 space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-3 text-slate-600">
                                <History className="size-5" />
                                <span className="text-[10px] font-black uppercase  pt-1">DOSSIERS_EN_FILE_AUDIT</span>
                            </div>
                            <span className="px-6 py-2.5 bg-white/[0.02] border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase  shadow-2xl backdrop-blur-3xl">{disputes.length} CAS_NODES_IDENTIFIÉS</span>
                        </div>

                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                <div className="space-y-6">
                                    {[1, 2, 3].map(n => <div key={n} className="h-64 bg-white/[0.01] border border-foreground/5 rounded-2xl animate-pulse" />)}
                                </div>
                            ) : disputes.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="executive-card py-24 flex flex-col items-center justify-center text-center gap-3 border-dashed border-foreground/10 opacity-20"
                                >
                                    <ShieldCheck className="size-6 text-foreground" />
                                    <div className="space-y-4">
                                        <p className="text-sm font-black uppercase  text-foreground">RÉSEAU_INTÈGRE</p>
                                        <p className="text-[12px] font-black uppercase tracking-[1.5em] text-primary">AUCUN_LITIGE_DÉCTECTÉ_V6</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    {disputes.map((dispute, idx) => (
                                        <motion.div
                                            key={dispute.id}
                                            id={`card-dispute-${dispute.id}`}
                                            onClick={() => setSelectedDispute(dispute)}
                                            initial={{ opacity: 0, x: -30 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={cn(
                                                "executive-card !p-4 group relative transition-all duration-700 cursor-pointer overflow-hidden shadow-2xl",
                                                selectedDispute?.id === dispute.id ? 'border-primary/50 bg-white/[0.03] scale-[1.02]' : 'hover:border-primary/20 bg-white/[0.01]'
                                            )}
                                        >
                                            <div className="flex items-center justify-between mb-12 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-5 py-2 bg-primary text-foreground rounded-xl text-[10px] font-black uppercase  shadow-2xl transition-transform group-hover:scale-110">
                                                        {dispute.type || 'LITIGE_UNITAIRE'}
                                                    </span>
                                                    <span className="text-[10px] font-black text-slate-600 uppercase  border-l border-foreground/10 pl-8">SID: #{dispute.id?.slice(0, 8).toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-[10px] font-black text-slate-700 uppercase  pt-1">GRAVITÉ_RÉSEAU</p>
                                                    <div className="w-40 h-1.5 bg-white/[0.03] rounded-full overflow-hidden border border-foreground/5 p-[1px]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${(dispute.ia_score_gravite || 0.5) * 100}%` }}
                                                            transition={{ duration: 2, ease: "easeOut" }}
                                                            className={cn("h-full rounded-full transition-all shadow-2xl", (dispute.ia_score_gravite || 0) > 0.6 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-primary shadow-[0_0_15px_#ff5f00]')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <h4 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none pt-2 group-hover:text-primary transition-all duration-700" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                    {dispute.titre || "LITIGE_NODE_STANDARD"}.
                                                </h4>
                                                <div className="space-y-4">
                                                     <div className="flex items-center gap-4 text-slate-700">
                                                         <Activity className="size-4" />
                                                         <span className="text-[10px] font-black uppercase ">SIGNAL_DÉTAILLÉ</span>
                                                     </div>
                                                     <p className="text-[14px] text-muted-foreground font-bold uppercase border-l-4 border-primary/40 pl-10 line-clamp-3 leading-relaxed tracking-tight group-hover:text-slate-300 transition-colors opacity-80 italic">
                                                        "{dispute.description}"
                                                     </p>
                                                </div>
                                            </div>

                                            <div className="mt-14 flex items-center justify-between border-t border-white/[0.03] pt-12 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-6 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-[12px] font-black text-primary shadow-inner group-hover:bg-primary group-hover:text-foreground transition-all duration-500 uppercase">
                                                            {dispute.demandeur?.nom_complet?.[0] || 'U'}
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <p className="text-[9px] font-black text-slate-700 uppercase  leading-none">REQUÉRANT</p>
                                                            <p className="text-[13px] font-black text-foreground uppercase truncate max-w-[140px] tracking-tight leading-none">{dispute.demandeur?.nom_complet}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-6 rounded-2xl bg-white/[0.03] border border-foreground/5 flex items-center justify-center text-[12px] font-black text-muted-foreground group-hover:border-primary/30 transition-all duration-500 uppercase">
                                                            {dispute.defenseur?.nom_complet?.[0] || '?'}
                                                        </div>
                                                        <div className="min-w-0 space-y-1">
                                                            <p className="text-[9px] font-black text-slate-700 uppercase  leading-none">DÉFENDEUR</p>
                                                            <p className="text-[13px] font-black text-foreground uppercase truncate max-w-[140px] tracking-tight leading-none">{dispute.defenseur?.nom_complet || 'SYSTEM_NODE_ALPHA'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="size-6 rounded-2xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center text-slate-800 shadow-inner group-hover:text-primary group-hover:border-primary/40 transition-all duration-1000 group-hover:rotate-[360deg] ">
                                                    <ArrowRight className="size-6" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="xl:col-span-5 h-full">
                        <div className="sticky top-40 space-y-6">
                            <AnimatePresence mode="wait">
                                {selectedDispute ? (
                                    <motion.div 
                                        key={selectedDispute.id}
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 50 }}
                                        className="executive-card p-14 space-y-14 group/panel relative overflow-hidden border-primary/20 bg-black shadow-[0_50px_120px_rgba(0,0,0,0.9)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
                                        <div className="absolute -top-4 -right-12 size-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                                        <div className="flex items-center gap-3 relative z-10">
                                            <div className="size-6 rounded-2xl bg-primary text-foreground flex items-center justify-center shadow-[0_20px_70px_rgba(255,95,0,0.4)] group-hover/panel:-rotate-6 transition-transform duration-1000">
                                                <Gavel className="size-6 fill-current" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-black text-foreground uppercase tracking-tighter leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>RENDU_<br /><span className="text-primary italic">JUGEMENT</span>.</h3>
                                                <div className="flex items-center gap-3">
                                                     <Satellite className="size-3 text-slate-700" />
                                                     <p className="text-[10px] font-black text-slate-600 uppercase ">ARBITRAGE_CORE_V6.1.4</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-[2.8rem] bg-white/[0.01] border border-foreground/5 space-y-4 relative z-10 hover:border-primary/30 transition-all duration-700 shadow-inner group/ia backdrop-blur-3xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-2 rounded-full bg-primary animate-ping" />
                                                    <h4 className="text-[10px] font-black uppercase  text-muted-foreground">PRÉCONISATION_AI_CORE</h4>
                                                </div>
                                                <div className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary text-[8px] font-black uppercase  border border-primary/20">PREDICTIVE_V2</div>
                                            </div>
                                            <p className="text-[15px] font-black text-foreground uppercase leading-relaxed border-l-4 border-primary pl-10 opacity-90 italic">
                                                "{selectedDispute.solution_proposee_ia || "ANALYSE_TEMPS_RÉEL_V6_EFFECTUÉE — PRÉCONISATION : CONCILIATION_IMMÉDIATE_UNITAIRE_AVEC_SÉQUESTRE."}"
                                            </p>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex justify-between items-center px-4">
                                                <label className="text-[10px] font-black uppercase  text-slate-600">DÉCRET_FINAL_ALPHA</label>
                                                <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">SÉCURISÉ_PGP</span>
                                            </div>
                                            <div className="relative group/field">
                                                <textarea
                                                    id="textarea-arbitrage-decree"
                                                    className="w-full h-64 bg-white/[0.01] border border-foreground/10 rounded-[2.8rem] p-4 text-[15px] font-black uppercase tracking-tight text-foreground focus:border-primary/40 outline-none transition-all resize-none placeholder:text-slate-900 leading-relaxed shadow-inner"
                                                    placeholder="PROTOCOLE_DE_RÉSOLUTION_SCELLÉE_EXÉCUTIF..."
                                                    value={decision}
                                                    onChange={e => setDecision(e.target.value)}
                                                />
                                                <div className="absolute bottom-10 right-10 flex items-center gap-3 opacity-20 group-focus-within/field:opacity-100 transition-opacity">
                                                     <div className="size-2 rounded-full bg-primary animate-pulse" />
                                                     <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">PRÊT_À_SIGNER</span>
                                                </div>
                                            </div>
                                            <button
                                                id="btn-proclaim-judgment"
                                                onClick={() => handleResolve(selectedDispute.id)}
                                                className="w-full h-12 bg-white text-background rounded-2xl font-black uppercase  text-[14px] flex items-center justify-center gap-3 shadow-2xl hover:bg-primary hover:text-foreground transition-all  border-0 transition-all duration-700 active:scale-95 group/execute"
                                            >
                                                PROCLAMER_LE_JUGEMENT <CheckCircle2 className="size-6 transition-transform group-hover/execute:rotate-12" />
                                            </button>
                                        </div>

                                        <div className="pt-10 border-t border-white/[0.03] flex gap-3 relative z-10">
                                            <button 
                                                id="btn-open-dispute-chat"
                                                className="flex-1 h-11 flex items-center justify-center gap-3 text-[10px] font-black uppercase  text-muted-foreground hover:text-primary transition-all bg-white/[0.02] rounded-2xl border border-foreground/5 hover:border-primary/30  hover:shadow-xl"
                                            >
                                                <MessageSquare className="size-6 transition-transform group-hover:scale-125" /> CANAL_UNIT
                                            </button>
                                            <button 
                                                id="btn-open-dispute-audit"
                                                className="flex-1 h-11 flex items-center justify-center gap-3 text-[10px] font-black uppercase  text-muted-foreground hover:text-foreground transition-all bg-white/[0.02] rounded-2xl border border-foreground/5 hover:border-foreground/20  hover:shadow-xl"
                                            >
                                                <ExternalLink className="size-6 transition-transform group-hover:scale-125" /> AUDIT_NODE
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="executive-card border-dashed border-foreground/10 rounded-2xl h-[640px] flex flex-col items-center justify-center text-center p-4 gap-14 opacity-20 group/empty"
                                    >
                                        <div className="size-6 rounded-2xl bg-white/[0.02] flex items-center justify-center border border-foreground/5 group-hover/empty:scale-110 transition-all duration-1000 shadow-2xl">
                                            <Scale className="size-6 text-muted-foreground/80 group-hover/empty:text-primary transition-colors" />
                                        </div>
                                        <div className="space-y-6">
                                            <p className="text-sm font-black text-foreground uppercase  max-w-[320px] leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                SÉLECTIONNEZ_UN_DOSSIER_POUR_ENGAGER_L'ARBITRAGE_NODAL.
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase ">PROTOCOLE_V6_READY</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
