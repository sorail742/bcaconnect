import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import { AlertTriangle, Send, ChevronLeft, ShieldCheck } from 'lucide-react';
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
            toast.success("Litige ouvert. Analyse IA en cours...");
        } catch (error) {
            toast.error("Erreur lors de l'ouverture du litige");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Signaler un Problème">
            <div className="max-w-2xl mx-auto space-y-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="size-4" />
                    Retour à la commande
                </button>

                {!mediationResult ? (
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                                <AlertTriangle className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black">Ouverture de Litige</h2>
                                <p className="text-sm text-muted-foreground">Expliquez-nous le problème rencontré avec votre commande.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest ml-1">Type de problème</label>
                                <select
                                    className="w-full h-14 bg-muted/50 border-none rounded-2xl px-6 text-sm font-medium focus:ring-2 focus:ring-primary/50"
                                    value={disputeData.type}
                                    onChange={e => setDisputeData({ ...disputeData, type: e.target.value })}
                                >
                                    <option value="qualite">Qualité du produit non conforme</option>
                                    <option value="livraison">Problème de livraison / Retard</option>
                                    <option value="paiement">Problème de facturation</option>
                                    <option value="autre">Autre problème</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest ml-1">Description détaillée</label>
                                <textarea
                                    className="w-full h-40 bg-muted/50 border-none rounded-[1.5rem] p-6 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                                    placeholder="Décrivez précisément ce qui ne va pas..."
                                    value={disputeData.description}
                                    onChange={e => setDisputeData({ ...disputeData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform disabled:opacity-50"
                            >
                                {loading ? "Traitement..." : "Envoyer le Signalement"}
                                <Send className="size-4" />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-xl animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="size-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                <ShieldCheck className="size-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-foreground">Litige Enregistré</h2>
                                <p className="text-muted-foreground mt-2">Notre IA de médiation a analysé votre demande instantanément.</p>
                            </div>

                            <div className="w-full p-6 bg-primary/5 border border-primary/20 rounded-2xl text-left">
                                <h4 className="text-xs font-black uppercase tracking-tighter text-primary mb-2 flex items-center gap-2">
                                    <span className="p-1 rounded bg-primary text-white text-[8px]">IA</span>
                                    Proposition de Médiation Automatique
                                </h4>
                                <p className="text-sm font-medium italic">"{mediationResult.solution_proposee_ia}"</p>
                            </div>

                            <p className="text-xs text-muted-foreground max-w-sm">
                                Un administrateur va examiner cette proposition et valider la décision finale très prochainement.
                            </p>

                            <button
                                onClick={() => navigate('/orders')}
                                className="px-8 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80 transition-colors"
                            >
                                Retour à mes commandes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default DisputeReport;
