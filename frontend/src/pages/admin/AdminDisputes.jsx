import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Gavel, MessageSquare, CheckCircle, AlertCircle,
    ExternalLink, ShieldCheck, Scale, Zap, RefreshCcw,
    AlertTriangle, History, ArrowRight, User, MoreVertical
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/Button';

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
            toast.error("Échec de la synchronisation des litiges.");
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
            toast.success("Décision appliquée. Litige résolu.");
            setSelectedDispute(null);
            setDecision('');
            fetchDisputes();
        } catch (error) {
            toast.error("Échec de l'application du jugement.");
        }
    };

    return (
        <DashboardLayout title="Médiation & Arbitrage">
            <div className="max-w-7xl mx-auto space-y-10 animate-fade-in pb-24 px-6 md:px-10 pt-10">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Contrôle de Conformité</span>
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Centre <span className="text-primary italic">Litiges.</span></h2>
                    </div>
                    <button onClick={fetchDisputes} className="size-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all shadow-sm">
                        <RefreshCcw className={cn("size-5", loading && "animate-spin")} />
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                    <div className="xl:col-span-7 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3 text-slate-500">
                                <History className="size-4" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Dossiers en File</span>
                            </div>
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest">{disputes.length} CAS</span>
                        </div>

                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] animate-pulse border border-slate-200 dark:border-slate-700" />)}
                            </div>
                        ) : disputes.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center gap-6 shadow-sm">
                                <ShieldCheck className="size-16 text-emerald-500/20" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Réseau Intègre — Aucun Litige.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {disputes.map(dispute => (
                                    <div
                                        key={dispute.id}
                                        onClick={() => setSelectedDispute(dispute)}
                                        className={cn(
                                            "bg-white dark:bg-slate-900 border-2 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden",
                                            selectedDispute?.id === dispute.id ? 'border-primary' : 'border-slate-100 dark:border-slate-800'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <span className="px-3 py-1 bg-primary text-white rounded-lg text-[9px] font-bold uppercase tracking-widest">
                                                    {dispute.type || 'LITIGE'}
                                                </span>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">#{dispute.id?.slice(0, 8)}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Gravité IA</p>
                                                <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-1000", (dispute.ia_score_gravite || 0) > 0.6 ? 'bg-red-500' : 'bg-amber-500')}
                                                        style={{ width: `${(dispute.ia_score_gravite || 0.5) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase truncate group-hover:text-primary transition-colors">
                                                {dispute.titre || "Litige Standard"}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-medium italic border-l-2 border-primary/20 pl-6 line-clamp-2 leading-relaxed">
                                                "{dispute.description}"
                                            </p>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                                            <div className="flex items-center gap-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {dispute.demandeur?.nom_complet?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Requérant</p>
                                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase truncate max-w-[100px]">{dispute.demandeur?.nom_complet}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        {dispute.defenseur?.nom_complet?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Défendeur</p>
                                                        <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase truncate max-w-[100px]">{dispute.defenseur?.nom_complet || 'System'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="size-10 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                                <ArrowRight className="size-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="xl:col-span-5 h-full">
                        <div className="sticky top-28 space-y-8 animate-fade-in">
                            {selectedDispute ? (
                                <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-xl border border-slate-800 space-y-10 group/panel relative overflow-hidden">
                                    <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[80px]" />

                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                            <Gavel className="size-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white uppercase italic tracking-tight">Rendu <br /> <span className="text-primary not-italic">Justice.</span></h3>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Audit Arbitrage v4.5</p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 space-y-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <Zap className="size-4 text-primary animate-pulse" />
                                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Conseil Stratégique IA</h4>
                                        </div>
                                        <p className="text-[11px] font-bold italic text-slate-300 leading-relaxed border-l-2 border-primary/40 pl-6">
                                            "{selectedDispute.solution_proposee_ia || "Analyse en temps réel effectuée. Préconisation : Conciliation immédiate."}"
                                        </p>
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-2">Décret Final & Sanctions</label>
                                        <textarea
                                            className="w-full h-40 bg-slate-800 border border-slate-700 rounded-2xl p-6 text-xs font-bold italic uppercase tracking-widest text-white focus:border-primary outline-none transition-all resize-none placeholder:text-slate-600 leading-relaxed"
                                            placeholder="PROTOCOLE DE RÉSOLUTION..."
                                            value={decision}
                                            onChange={e => setDecision(e.target.value)}
                                        />
                                        <Button
                                            onClick={() => handleResolve(selectedDispute.id)}
                                            className="w-full h-16 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl"
                                        >
                                            Proclamer le Jugement <CheckCircle className="size-5" />
                                        </Button>
                                    </div>

                                    <div className="pt-6 border-t border-slate-800 flex gap-4 relative z-10">
                                        <button className="flex-1 h-12 flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-slate-800/50 rounded-xl border border-slate-700">
                                            <MessageSquare className="size-4" /> Canal Direct
                                        </button>
                                        <button className="flex-1 h-12 flex items-center justify-center gap-3 text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all bg-slate-800/50 rounded-xl border border-slate-700">
                                            <ExternalLink className="size-4" /> Audit Detail
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-dashed rounded-[3rem] h-[400px] flex flex-col items-center justify-center text-center p-12 gap-6 shadow-sm">
                                    <div className="size-20 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                        <Scale className="size-10 text-slate-200" />
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest max-w-[200px]">
                                        Sélectionnez un dossier pour engager l'arbitrage.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
