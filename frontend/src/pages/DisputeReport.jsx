import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    AlertTriangle, Send, ChevronLeft, ShieldCheck,
    Clock, ChevronDown, Activity, Zap, Sparkles,
    ShieldAlert, Fingerprint, Satellite, Scale
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DisputeReport = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [disputeData, setDisputeData] = useState({
        type: 'qualite',
        description: '',
        defenseur_id: ''
    });
    const [mediationResult, setMediationResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/disputes`, {
                commande_id: orderId,
                ...disputeData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMediationResult(response.data);
            toast.success("PROTOCOLE DE MÉDIATION IA BCA ACTIVÉ AVEC SUCCÈS.");
        } catch (error) {
            toast.error("ÉCHEC DE L'OUVERTURE DU DOSSIER DE LITIGE.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="CENTRE DE RÉSOLUTION EXÉCUTIF">
            <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 pb-32">

                {/* Tactical Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-6 text-slate-600 hover:text-[#FF6600] transition-all duration-700 group font-black uppercase tracking-[0.5em] text-[10px] italic pt-1 border-b-2 border-transparent hover:border-[#FF6600] pb-2"
                >
                    <div className="p-3 rounded-2xl bg-white/5 border-2 border-white/5 group-hover:border-[#FF6600]/40 group-hover:rotate-12 transition-all">
                        <ChevronLeft className="size-5" />
                    </div>
                    TERMINER L'ANALYSE DE FLUX
                </button>

                {!mediationResult ? (
                    <div className="bg-white/[0.01] border-[12px] border-white/5 rounded-[5rem] p-16 md:p-24 shadow-3xl relative overflow-hidden group/form">
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6600]/20 blur-2xl opacity-0 group-hover/form:opacity-100 transition-opacity duration-1000" />
                        <div className="absolute top-0 right-0 size-96 bg-rose-500/5 rounded-full blur-[150px] -mr-48 -mt-48 transition-all duration-[4s]" />

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 mb-20 border-b-4 border-white/5 pb-16">
                            <div className="size-28 rounded-[2.5rem] bg-rose-500/10 border-4 border-rose-500/20 flex items-center justify-center text-rose-500 shadow-3xl group-hover/form:rotate-12 transition-transform duration-1000">
                                <AlertTriangle className="size-14" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-3 rounded-full bg-rose-500 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.5)]" />
                                    <span className="text-[12px] font-black text-rose-500 uppercase tracking-[0.6em] italic leading-none pt-1">ALERTE DE CONFORMITÉ ALPHA v4.0</span>
                                </div>
                                <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">DOSSIER DE <br /><span className="text-rose-500 not-italic">LITIGE.</span></h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-16 relative z-10">
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700 ml-8 italic leading-none pt-1 flex items-center gap-4">
                                    <Fingerprint className="size-4" />
                                    CLASSIFICATION DE L'INCIDENT RÉSEAU *
                                </label>
                                <div className="relative group/select">
                                    <div className="absolute inset-0 bg-[#FF6600]/5 blur-xl opacity-0 group-focus-within/select:opacity-100 transition-opacity" />
                                    <select
                                        className="w-full h-24 bg-black border-4 border-white/5 rounded-[2.5rem] px-12 text-xl font-black italic focus:outline-none focus:border-[#FF6600]/40 focus:ring-8 focus:ring-[#FF6600]/5 shadow-3xl appearance-none uppercase tracking-widest text-white transition-all duration-700 relative z-10"
                                        value={disputeData.type}
                                        onChange={e => setDisputeData({ ...disputeData, type: e.target.value })}
                                    >
                                        <option value="qualite">UNITÉ NON CONFORME AUX STANDARDS BCA</option>
                                        <option value="livraison">DÉFAILLANCE LOGISTIQUE / RUPTURE DE FLUX</option>
                                        <option value="paiement">ANOMALIE DE FACTURATION / PROTOCOLE GNF</option>
                                        <option value="autre">INCIDENT CRITIQUE NON RÉPERTORIÉ</option>
                                    </select>
                                    <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none text-[#FF6600] group-hover/select:scale-125 transition-transform z-20">
                                        <ChevronDown className="size-10" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-700 ml-8 italic leading-none pt-1 flex items-center gap-4">
                                    <Activity className="size-4" />
                                    EXPOSÉ DES MOTIFS / PREUVES LITTÉRALES *
                                </label>
                                <div className="relative group/text">
                                    <div className="absolute inset-0 bg-[#FF6600]/5 blur-xl opacity-0 group-focus-within/text:opacity-100 transition-opacity" />
                                    <textarea
                                        className="w-full h-80 bg-black border-4 border-white/5 rounded-[3rem] p-12 text-xl font-black italic focus:outline-none focus:border-[#FF6600]/40 focus:ring-8 focus:ring-[#FF6600]/5 shadow-3xl resize-none placeholder:text-slate-800 uppercase tracking-widest leading-relaxed scrollbar-hide relative z-10 text-white transition-all duration-700"
                                        placeholder="DÉTAILLEZ PRÉCISÉMENT L'ANOMALIE POUR L'ARBITRAGE IA..."
                                        value={disputeData.description}
                                        onChange={e => setDisputeData({ ...disputeData, description: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-28 bg-[#FF6600] text-white rounded-[3rem] font-black uppercase tracking-[0.6em] text-sm flex items-center justify-center gap-10 hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 disabled:opacity-20 shadow-3xl group/btn relative overflow-hidden italic shadow-[#FF6600]/20"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                <div className="relative z-10 flex items-center gap-8">
                                    {loading ? (
                                        <div className="size-10 border-[6px] border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Scale className="size-10 group-hover/btn:-rotate-12 transition-transform duration-700" />
                                    )}
                                    <span className="leading-none pt-1">{loading ? "CHIFFREMENT DU DOSSIER..." : "ENGAGER L'ARBITRAGE IA"}</span>
                                </div>
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white border-[12px] border-emerald-500/20 rounded-[5rem] p-20 lg:p-32 shadow-3xl animate-in zoom-in-95 duration-1000 relative overflow-hidden group/success">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

                        <div className="flex flex-col items-center text-center space-y-16 relative z-10">
                            <div className="size-48 rounded-[4rem] bg-emerald-500 border-[10px] border-emerald-500/20 text-white flex items-center justify-center shadow-3xl animate-bounce">
                                <ShieldCheck className="size-24" />
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center justify-center gap-6">
                                    <div className="h-1 w-20 bg-emerald-500/20 rounded-full" />
                                    <span className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.6em] italic block pt-1">PROTOCOLE SÉCURISÉ v5.1</span>
                                    <div className="h-1 w-20 bg-emerald-500/20 rounded-full" />
                                </div>
                                <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-black uppercase leading-[0.85]">INCIDENT <br /> <span className="text-emerald-500 not-italic">RÉPERTORIÉ.</span></h2>
                                <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm mt-8 max-w-2xl mx-auto leading-relaxed border-l-[16px] border-emerald-500 pl-12 text-left italic">
                                    NOTRE MOTEUR DE MÉDIATION NEURONALE BCA A ANALYSÉ VOTRE REQUÊTE INSTANTANÉMENT. LE DOSSIER EST SCÉLLÉ ET PRÊT POUR L'ARBITRAGE FINAL.
                                </p>
                            </div>

                            <div className="w-full p-16 bg-black rounded-[4rem] text-left relative overflow-hidden group/verdict shadow-3xl">
                                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/verdict:opacity-30 transition-opacity">
                                    <div className="p-4 bg-[#FF6600] rounded-2xl font-black text-white text-[12px] tracking-[0.4em] uppercase italic">NOYAU ALPHA IA v6.0</div>
                                </div>

                                <div className="flex items-center gap-6 mb-12 border-b-4 border-white/5 pb-8">
                                    <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                                    <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-[#FF6600] italic leading-none pt-1">
                                        VERDICT PRÉLIMINAIRE BCA EXECUTIF
                                    </h4>
                                </div>

                                <div className="p-10 bg-white/[0.03] backdrop-blur-3xl rounded-[2.5rem] border-4 border-white/5 shadow-inner group-hover/verdict:border-[#FF6600]/20 transition-all duration-700">
                                    <p className="text-2xl md:text-3xl font-black italic tracking-tight text-white leading-relaxed uppercase">"{mediationResult.solution_proposee_ia}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 px-12 py-6 rounded-full bg-slate-50 border-4 border-black/5 italic text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                                <Clock className="size-6 text-[#FF6600] animate-pulse" />
                                VALIDATION FINALE PAR LE CONSEIL D'ADMINISTRATION SOUS 24H
                            </div>

                            <button
                                onClick={() => navigate('/orders')}
                                className="h-28 px-24 bg-black text-white hover:bg-[#FF6600] rounded-[2.5rem] font-black uppercase tracking-[0.5em] text-sm hover:scale-105 active:scale-95 transition-all duration-700 shadow-3xl italic leading-none pt-1 flex items-center gap-8 group/back"
                            >
                                <ChevronLeft className="size-8 group-hover/back:-translate-x-3 transition-transform" />
                                RETOUR AU CENTRE D'OPÉRATIONS
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DisputeReport;
