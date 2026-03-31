import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AlertTriangle, Send, ChevronLeft, ShieldCheck, Clock, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DisputeReport = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [disputeData, setDisputeData] = useState({
        type: 'qualite',
        description: '',
        defenseur_id: '' // Dans un cas réel, on le récupèrerait de la commande
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
            toast.success("Protocole de médiation IA activé.");
        } catch (error) {
            toast.error("Échec de l'ouverture du litige.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="CENTRE DE RÉSOLUTION EXÉCUTIF">
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-700">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-muted-foreground/40 hover:text-primary transition-all group font-black uppercase tracking-[0.3em] text-[10px] italic"
                >
                    <div className="p-2 rounded-xl border-2 border-border group-hover:border-primary/40 transition-colors">
                        <ChevronLeft className="size-4" />
                    </div>
                    Retour à l'Analyse de Commande
                </button>

                {!mediationResult ? (
                    <div className="glass-card border-4 border-border rounded-[3rem] p-12 shadow-premium hover:shadow-premium-lg transition-all duration-700 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-64 bg-destructive/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-destructive/10 transition-colors duration-1000" />
                        
                        <div className="relative z-10 flex items-center gap-6 mb-12">
                            <div className="size-20 rounded-[1.5rem] bg-destructive/10 border-4 border-destructive/20 flex items-center justify-center text-destructive shadow-inner">
                                <AlertTriangle className="size-10" />
                            </div>
                            <div>
                                <span className="text-executive-label font-black text-destructive uppercase tracking-[0.4em] italic mb-2 block">Alerte de Conformité</span>
                                <h2 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">Ouverture de <span className="text-destructive not-italic">Litige.</span></h2>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                            <div className="space-y-4">
                                <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Classification de l'Incident *</label>
                                <div className="relative group/select">
                                    <select
                                        className="w-full h-20 bg-background border-4 border-border rounded-[1.5rem] px-10 text-base font-black italic focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 shadow-inner appearance-none uppercase tracking-widest text-foreground transition-all"
                                        value={disputeData.type}
                                        onChange={e => setDisputeData({ ...disputeData, type: e.target.value })}
                                    >
                                        <option value="qualite">PRODUIT NON CONFORME AUX STANDARDS</option>
                                        <option value="livraison">INCIDENT LOGISTIQUE / RUPTURE DÉLAI</option>
                                        <option value="paiement">ANOMALIE DE FACTURATION / PROTOCOLE GNF</option>
                                        <option value="autre">AUTRE INCIDENT CRITIQUE</option>
                                    </select>
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-primary group-hover/select:scale-125 transition-transform">
                                        <ChevronDown className="size-6" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic leading-none pt-0.5">Exposé des Motifs / Preuves Littérales *</label>
                                <textarea
                                    className="w-full h-56 bg-background border-4 border-border rounded-[2rem] p-10 text-base font-black italic focus:outline-none focus:border-primary/50 focus:ring-8 focus:ring-primary/5 shadow-inner resize-none placeholder:text-muted-foreground/20 uppercase tracking-widest leading-relaxed scrollbar-hide"
                                    placeholder="Détaillez précisément l'anomalie constatée pour l'analyse IA..."
                                    value={disputeData.description}
                                    onChange={e => setDisputeData({ ...disputeData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-24 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-8 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-premium-lg shadow-primary/40 group/btn relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                <div className="relative z-10 flex items-center gap-6">
                                    {loading ? (
                                        <div className="size-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Send className="size-8 group-hover/btn:-translate-y-2 group-hover/btn:translate-x-2 transition-transform" />
                                    )}
                                    <span className="leading-none pt-1">{loading ? "Chiffrement du Dossier..." : "Engager la Médiation"}</span>
                                </div>
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="glass-card border-4 border-emerald-500/20 rounded-[3rem] p-16 shadow-premium-lg animate-in zoom-in-95 duration-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent" />
                        
                        <div className="flex flex-col items-center text-center space-y-12 relative z-10">
                            <div className="size-32 rounded-[2.5rem] bg-emerald-500/10 border-4 border-emerald-500/20 text-emerald-500 flex items-center justify-center shadow-inner animate-bounce">
                                <ShieldCheck className="size-16" />
                            </div>
                            
                            <div className="space-y-4">
                                <span className="text-executive-label font-black text-emerald-500 uppercase tracking-[0.5em] italic block">Protocole Sécurisé v2.1</span>
                                <h2 className="text-6xl font-black italic tracking-tighter text-foreground uppercase leading-[0.85]">Incident <br /> <span className="text-emerald-500 not-italic">Répertorié.</span></h2>
                                <p className="text-muted-foreground/60 font-black uppercase tracking-[0.3em] text-xs mt-6 max-w-lg mx-auto leading-relaxed border-l-8 border-emerald-500/20 pl-8 text-left italic">
                                    Notre moteur de médiation neuronale a analysé votre requête instantanément. Le dossier est scellé.
                                </p>
                            </div>

                            <div className="w-full p-10 bg-primary/5 border-4 border-primary/10 rounded-[2.5rem] text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="p-3 bg-primary rounded-xl font-black text-white text-[10px] tracking-widest uppercase italic">Noyau IA v4.1</div>
                                </div>
                                
                                <h4 className="text-executive-label font-black uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-4 italic shrink-0 leading-none pt-0.5">
                                    <div className="size-2 rounded-full bg-primary animate-pulse" />
                                    Verdict Préliminaire de l'Arbitrage IA
                                </h4>
                                <div className="p-8 bg-background/50 backdrop-blur-md rounded-[1.5rem] border-2 border-primary/10 shadow-inner">
                                    <p className="text-lg font-black italic tracking-tight text-foreground leading-relaxed uppercase">"{mediationResult.solution_proposee_ia}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-full bg-muted/20 border-2 border-border italic text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                <Clock className="size-4 animate-pulse" />
                                Validation Finale par le Conseil d'Administration sous 24h
                            </div>

                            <button
                                onClick={() => navigate('/orders')}
                                className="h-20 px-16 bg-foreground text-background rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs hover:scale-105 active:scale-95 transition-all shadow-premium italic leading-none pt-0.5"
                            >
                                Retour au Centre d'Opérations
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DisputeReport;
