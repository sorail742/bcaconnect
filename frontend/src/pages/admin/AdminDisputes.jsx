import React, { useState } from 'react';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Gavel, MessageSquare, ShieldCheck, Scale, RefreshCcw,
    AlertTriangle, Zap, Filter, Info, ShieldAlert,
    ChevronDown, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdminDisputes } from '../../hooks/useDomainData';
import useApiMutation from '../../hooks/useApiMutation';
import Modal from '../../components/ui/Modal';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
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
            <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {value}
                </h3>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
    </motion.div>
);

const AdminDisputes = () => {
    const { data: disputes = [], loading, refetch: fetchDisputes } = useAdminDisputes();
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [decision, setDecision] = useState('');
    const [filterStatus, setFilterStatus] = useState('TOUS');

    const { mutate: resolveMutation, isPending: resolving } = useApiMutation(
        ({ id, decision_finale }) => api.put(`/disputes/${id}/resolve`, {
            decision_finale,
            statut: 'resolu'
        }),
        {
            invalidateKeys: [['admin-disputes']],
            successMessage: "DÉCISION APPLIQUÉE. LITIGE RÉSOLU.",
            onSuccess: () => {
                setSelectedDispute(null);
                setDecision('');
            }
        }
    );

    const handleResolve = (id) => {
        if (!decision.trim()) return toast.error("VEUILLEZ FORMULER UN DÉCRET FINAL.");
        resolveMutation({ id, decision_finale: decision });
    };

    const filteredDisputes = disputes.filter(d => 
        filterStatus === 'TOUS' ? true : d.statut === filterStatus.toLowerCase()
    );

    const pendingDisputes = disputes.filter(d => d.statut === 'en_attente').length;
    const resolvedDisputes = disputes.filter(d => d.statut === 'resolu').length;

    return (
        <DashboardLayout title="MÉDIATION & ARBITRAGE" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Gavel className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Haute <span className="text-primary">Médiation</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    {pendingDisputes} CAS EN ATTENTE • ARBITRAGE ACTIF
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => fetchDisputes()} 
                        className="h-12 px-6 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all text-slate-600"
                    >
                        <RefreshCcw className={cn("size-4", loading && "animate-spin")} />
                        Synchro Hub
                    </button>
                </div>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard title="Dossiers Ouverts" value={pendingDisputes.toString()} icon={Scale} color="text-primary" subtitle="Critical Disputes" />
                    <StatCard title="Cas Résolus" value={resolvedDisputes.toString()} icon={ShieldCheck} color="text-emerald-500" subtitle="Archived Ledger" />
                    <StatCard title="Médiation IA" value="94%" icon={Zap} color="text-blue-500" subtitle="Auto-Audit Accuracy" />
                </div>

                {/* Workspace */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    
                    {/* List Column */}
                    <div className="xl:col-span-7 space-y-6">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                            <div className="flex items-center gap-3">
                                <Filter className="size-4 text-slate-300" />
                                <div className="flex items-center gap-2">
                                    {['TOUS', 'EN_ATTENTE', 'RESOLU'].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setFilterStatus(s)}
                                            className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-4 h-8 rounded-lg transition-all",
                                                filterStatus === s ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {s === 'EN_ATTENTE' ? 'À TRAITER' : s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">Alpha-1 Ledger</span>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="h-44 rounded-3xl bg-white border border-slate-100 animate-pulse" />
                                    ))
                                ) : filteredDisputes.length === 0 ? (
                                    <div className="py-32 flex flex-col items-center gap-6 opacity-20 text-slate-400">
                                        <ShieldCheck className="size-20" />
                                        <p className="text-xl font-black uppercase tracking-widest">Écosystème Sain</p>
                                    </div>
                                ) : (
                                    filteredDisputes.map((dispute, idx) => (
                                        <motion.div
                                            key={dispute.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            onClick={() => setSelectedDispute(dispute)}
                                            className={cn(
                                                "bg-white p-6 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden",
                                                selectedDispute?.id === dispute.id ? 'border-primary shadow-xl shadow-primary/5' : 'border-slate-100 hover:border-slate-200 shadow-sm'
                                            )}
                                        >
                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="space-y-4 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-lg">
                                                            {dispute.type || 'LITIGE'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-300 uppercase">#{dispute.id?.slice(0, 8).toUpperCase()}</span>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {dispute.titre}
                                                    </h3>
                                                    <p className="text-xs font-bold text-slate-400 leading-relaxed line-clamp-2 italic">
                                                        "{dispute.description}"
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-black text-slate-900">
                                                        {parseFloat(dispute.Order?.total_ttc || 0).toLocaleString()} <span className="text-primary">GNF</span>
                                                    </p>
                                                    <div className="mt-2 text-[8px] font-black text-slate-300 uppercase">Valuation</div>
                                                </div>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                            {dispute.demandeur?.nom_complet?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[100px]">{dispute.demandeur?.nom_complet}</span>
                                                    </div>
                                                    <ArrowRight className="size-3 text-slate-200" />
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                                                            {dispute.defenseur?.nom_complet?.[0] || '?'}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-800 uppercase truncate max-w-[100px]">{dispute.defenseur?.nom_complet || 'System'}</span>
                                                    </div>
                                                </div>
                                                <ChevronDown className={cn("size-5 text-slate-200 transition-transform duration-500", selectedDispute?.id === dispute.id && "rotate-180 text-primary")} />
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Panel Column */}
                    <div className="xl:col-span-5">
                        <div className="sticky top-10">
                            <AnimatePresence mode="wait">
                                {selectedDispute ? (
                                    <motion.div 
                                        key={selectedDispute.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white p-10 rounded-[2.5rem] border border-primary/20 shadow-2xl shadow-primary/5 space-y-8 overflow-hidden relative"
                                    >
                                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                                            <Gavel className="size-48" />
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                                                    <Scale className="size-6 text-white" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>Décret d'Arbitrage</h3>
                                                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none">BCA Governance • SID-{selectedDispute.id?.slice(0, 4)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-3xl bg-primary/[0.03] border border-primary/10 space-y-3 relative z-10 overflow-hidden">
                                            <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest">
                                                <Zap className="size-3 fill-current" /> Analyse Prédictive IA
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed italic border-l-2 border-primary/30 pl-4">
                                                "{selectedDispute.solution_proposee_ia || "Analyse multicritère terminée. Conciliation recommandée sur la base de l'historique de confiance."}"
                                            </p>
                                        </div>

                                        <div className="space-y-6 relative z-10">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Jugement Final</label>
                                                <textarea
                                                    className="w-full h-40 bg-slate-50 border border-slate-100 rounded-[1.5rem] p-6 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:opacity-40 uppercase"
                                                    placeholder="DÉFINIR LE DÉCRET DE MÉDIATION..."
                                                    value={decision}
                                                    onChange={e => setDecision(e.target.value)}
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleResolve(selectedDispute.id)}
                                                disabled={resolving}
                                                className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                                            >
                                                {resolving ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-6" />}
                                                Prononcer le Jugement
                                            </button>
                                        </div>

                                        <div className="pt-8 border-t border-slate-50 flex gap-3 relative z-10">
                                            <button className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">
                                                <MessageSquare className="size-4" /> Media History
                                            </button>
                                            <button className="flex-1 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">
                                                <Info className="size-4" /> Order Feed
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-[600px] border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12 gap-6 opacity-30 text-slate-300">
                                        <div className="size-20 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center">
                                            <Gavel className="size-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-black uppercase tracking-widest text-slate-500">Node Inactif</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Sélectionnez un litige pour<br/>ouvrir le panel d'arbitrage</p>
                                        </div>
                                    </div>
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
