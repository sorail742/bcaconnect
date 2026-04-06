import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AlertTriangle, ChevronLeft, ShieldCheck, Clock, ChevronDown, Activity, Sparkles, Scale, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DisputeReport = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [disputeData, setDisputeData] = useState({ type: 'qualite', description: '' });
    const [mediationResult, setMediationResult] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!disputeData.description.trim()) { toast.warning('Description requise.'); return; }
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/disputes`, { commande_id: orderId, ...disputeData },
                { headers: { Authorization: `Bearer ${token}` } });
            setMediationResult(response.data);
            toast.success('Litige ouvert avec succès.');
        } catch {
            toast.error("Échec de l'ouverture du dossier.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Résolution de litige">
            <div className="max-w-3xl mx-auto space-y-6 pb-10">

                {/* Header */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="size-9 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
                        <ArrowLeft className="size-4" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                            <AlertTriangle className="size-5 text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-foreground">Litige — Commande</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                                <p className="text-xs text-muted-foreground">Résolution en cours — {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {!mediationResult ? (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 pb-5 border-b border-border">
                            <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                                <AlertTriangle className="size-5 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-foreground">Ouverture d'un dossier de litige</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">Décrivez précisément le problème rencontré</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Activity className="size-3.5 text-primary" /> Type d'incident
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground appearance-none"
                                        value={disputeData.type}
                                        onChange={e => setDisputeData({ ...disputeData, type: e.target.value })}
                                    >
                                        <option value="qualite">Produit non conforme</option>
                                        <option value="livraison">Problème de livraison</option>
                                        <option value="paiement">Anomalie de facturation</option>
                                        <option value="autre">Autre incident</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                    <Activity className="size-3.5 text-primary" /> Description détaillée
                                </label>
                                <textarea
                                    className="w-full h-40 bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-primary/50 transition-all text-foreground resize-none placeholder:text-muted-foreground"
                                    placeholder="Décrivez précisément le problème rencontré..."
                                    value={disputeData.description}
                                    onChange={e => setDisputeData({ ...disputeData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-foreground text-background rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-40"
                            >
                                {loading
                                    ? <><div className="size-4 border-2 border-background/30 border-t-background rounded-full animate-spin" /> Analyse en cours...</>
                                    : <><Scale className="size-4" /> Engager l'arbitrage IA</>
                                }
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-card border border-emerald-500/20 rounded-2xl p-6 shadow-sm space-y-6">
                        <div className="h-1 bg-emerald-500 rounded-full" />

                        <div className="flex flex-col items-center text-center space-y-5">
                            <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                                <ShieldCheck className="size-7" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Décision réseau</p>
                                <h3 className="text-lg font-bold text-foreground mt-1">Incident répertorié et scellé</h3>
                                <p className="text-sm text-muted-foreground mt-2 max-w-md">
                                    L'IA de médiation BCA a analysé votre requête. Le dossier est indexé pour arbitrage final sous 24h.
                                </p>
                            </div>

                            <div className="w-full p-5 bg-muted border border-border rounded-xl text-left space-y-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="size-4 text-primary" />
                                    <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Verdict préliminaire IA</h4>
                                </div>
                                <p className="text-sm font-semibold text-foreground leading-relaxed">"{mediationResult.solution_proposee_ia}"</p>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted border border-border text-xs text-muted-foreground">
                                <Clock className="size-3.5 text-primary" />
                                Validation finale par l'équipe admin (24h max)
                            </div>

                            <button
                                onClick={() => navigate('/orders')}
                                className="h-10 px-6 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                            >
                                <ChevronLeft className="size-4" /> Retour aux commandes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DisputeReport;
