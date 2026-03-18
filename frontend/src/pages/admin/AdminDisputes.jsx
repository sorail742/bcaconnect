import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Gavel, MessageSquare, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [decision, setDecision] = useState('');

    const fetchDisputes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/disputes/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/disputes/${id}/resolve`, {
                decision_finale: decision,
                statut: 'resolu'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Litige résolu avec succès !");
            setSelectedDispute(null);
            setDecision('');
            fetchDisputes();
        } catch (error) {
            toast.error("Erreur lors de la résolution");
        }
    };

    return (
        <DashboardLayout title="Médiation & Litiges">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Liste des litiges */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-4">Litiges en attente</h3>
                    {loading ? (
                        <p>Chargement...</p>
                    ) : disputes.length === 0 ? (
                        <div className="bg-muted/20 border border-dashed border-border rounded-3xl p-12 text-center text-muted-foreground italic">
                            Aucun litige en cours. Tout est calme !
                        </div>
                    ) : disputes.map(dispute => (
                        <div
                            key={dispute.id}
                            onClick={() => setSelectedDispute(dispute)}
                            className={`group cursor-pointer bg-card border transition-all rounded-[2rem] p-6 hover:shadow-lg ${selectedDispute?.id === dispute.id ? 'border-primary shadow-md' : 'border-border'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    {dispute.type}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground font-medium">Gravité IA :</span>
                                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${dispute.ia_score_gravite > 0.6 ? 'bg-destructive' : 'bg-orange-400'}`}
                                            style={{ width: `${dispute.ia_score_gravite * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <h4 className="font-bold text-foreground mb-1">Litige #{dispute.id.slice(0, 8)}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">"{dispute.description}"</p>

                            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                                <div className="flex items-center gap-2">
                                    <div className="size-6 rounded-full bg-slate-200" />
                                    <span className="text-xs font-bold">{dispute.demandeur?.nom_complet}</span>
                                </div>
                                <div className="text-[10px] font-black uppercase text-muted-foreground">
                                    Vs {dispute.defenseur?.nom_complet || 'Système'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Panneau de médiation */}
                <div className="lg:col-span-1">
                    {selectedDispute ? (
                        <div className="sticky top-8 bg-card border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-6 animate-in slide-in-from-right-4">
                            <div className="flex items-center gap-3">
                                <Gavel className="size-6 text-primary" />
                                <h3 className="text-xl font-black">Décision de Médiation</h3>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-2xl space-y-2">
                                <h4 className="text-[10px] font-black uppercase text-muted-foreground">Proposition de l'IA</h4>
                                <p className="text-xs font-medium italic">"{selectedDispute.solution_proposee_ia}"</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase tracking-widest ml-1">Décret Final</label>
                                    <textarea
                                        className="w-full h-32 bg-muted/50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary/50 resize-none"
                                        placeholder="Saisissez la décision finale..."
                                        value={decision}
                                        onChange={e => setDecision(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={() => handleResolve(selectedDispute.id)}
                                    className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    Appliquer le Jugement
                                    <CheckCircle className="size-4" />
                                </button>
                            </div>

                            <div className="pt-4 border-t border-border flex gap-4">
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    <MessageSquare className="size-3" />
                                    Ouvrir Chat
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold text-muted-foreground hover:bg-muted rounded-lg transition-colors">
                                    <ExternalLink className="size-3" />
                                    Voir Commande
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border rounded-[2.5rem] text-muted-foreground animate-pulse">
                            <AlertCircle className="size-12 mb-4 opacity-20" />
                            <p className="text-sm font-medium">Sélectionnez un litige pour commencer la médiation</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
