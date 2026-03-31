import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Gavel, MessageSquare, CheckCircle, AlertCircle, ExternalLink, ShieldCheck, Scale, Zap, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDisputes = () => {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [decision, setDecision] = useState('');

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/disputes/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDisputes(response.data);
        } catch (error) {
            toast.error("Échec de la synchronisation des litiges.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id) => {
        if (!decision) return toast.error("Veuillez formuler un décret final.");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/disputes/${id}/resolve`, {
                decision_finale: decision,
                statut: 'resolu'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Décision enregistrée. Litige clôturé.");
            setSelectedDispute(null);
            setDecision('');
            fetchDisputes();
        } catch (error) {
            toast.error("Échec de l'application du jugement.");
        }
    };

    return (
        <DashboardLayout title="CENTRE DE MÉDIATION EXÉCUTIF">
            <div className="space-y-12 animate-in fade-in duration-700 pb-20">
                
                {/* ── Header Executive ──────────────────────────────── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b-4 border-border pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                            <span className="text-executive-label font-black text-primary uppercase tracking-[0.4em] italic leading-none pt-0.5">Directoire de Résolution de Conflits</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-foreground italic tracking-tighter uppercase leading-[0.85]">Justice & <br /><span className="text-primary not-italic underline decoration-primary/20 decoration-8 underline-offset-[-4px]">Médiation.</span></h2>
                        <p className="text-muted-foreground/60 font-medium text-lg italic border-l-4 border-primary/20 pl-8 max-w-xl">Interface de haute précision pour l'arbitrage des litiges commerciaux et la garantie de confiance BCA.</p>
                    </div>
                    <button 
                        onClick={fetchDisputes}
                        className="h-24 w-24 bg-background border-4 border-border rounded-[2.5rem] flex items-center justify-center text-muted-foreground/30 hover:border-primary/40 hover:text-primary transition-all shadow-premium group"
                    >
                        <RefreshCcw className="size-8 group-hover:rotate-180 transition-transform duration-700" />
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    {/* Liste des litiges (Registre) */}
                    <div className="xl:col-span-7 space-y-6">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Dossiers en File d'Attente</h3>
                            <span className="px-4 py-1.5 bg-primary/5 border-2 border-primary/10 rounded-full text-[10px] font-black text-primary italic uppercase tracking-widest">{disputes.length} CAS</span>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => <div key={n} className="h-40 bg-accent/20 rounded-[2.5rem] animate-pulse border-4 border-border" />)}
                            </div>
                        ) : disputes.length === 0 ? (
                            <div className="glass-card rounded-[3rem] border-4 border-dashed border-border p-20 flex flex-col items-center justify-center text-center gap-6 group">
                                <ShieldCheck className="size-20 text-muted-foreground/10 group-hover:scale-110 group-hover:text-emerald-500/20 transition-all duration-700" />
                                <p className="text-2xl font-black italic tracking-tighter text-muted-foreground/30 uppercase">Réseau Intègre — Aucun Litige.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {disputes.map(dispute => (
                                    <div
                                        key={dispute.id}
                                        onClick={() => setSelectedDispute(dispute)}
                                        className={cn(
                                            "glass-card group cursor-pointer border-4 transition-all rounded-[2.5rem] p-8 shadow-premium hover:shadow-premium-lg relative overflow-hidden",
                                            selectedDispute?.id === dispute.id ? 'border-primary bg-primary/[0.02]' : 'border-border'
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-4">
                                                <span className="px-4 py-2 rounded-xl bg-background border-2 border-border text-[10px] font-black text-primary uppercase tracking-widest italic shadow-inner">
                                                    {dispute.type.toUpperCase()}
                                                </span>
                                                <span className="text-[10px] font-black text-muted-foreground/30 italic tracking-widest">REF: #{dispute.id.slice(0, 8).toUpperCase()}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-executive-label font-black text-muted-foreground/20 italic uppercase tracking-widest leading-none pt-0.5">GRAVITÉ IA</span>
                                                <div className="w-24 h-2 bg-background rounded-full overflow-hidden border border-border shadow-inner">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000",
                                                            dispute.ia_score_gravite > 0.6 ? 'bg-rose-500' : 'bg-amber-500'
                                                        )}
                                                        style={{ width: `${dispute.ia_score_gravite * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <h4 className="text-2xl font-black text-foreground italic tracking-tighter uppercase leading-none group-hover:text-primary transition-colors">
                                                {dispute.titre || "Litige Commercial Standard"}
                                            </h4>
                                            <p className="text-muted-foreground font-medium text-sm line-clamp-2 italic leading-relaxed border-l-4 border-border pl-6 group-hover:border-primary/40 transition-colors">
                                                "{dispute.description}"
                                            </p>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between border-t-2 border-border pt-6">
                                            <div className="flex items-center gap-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-background border-2 border-border flex items-center justify-center font-black text-xs text-primary shadow-premium">
                                                        {dispute.demandeur?.nom_complet[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-muted-foreground/20 italic uppercase tracking-widest leading-none mb-1">Requérant</p>
                                                        <p className="text-xs font-black italic uppercase leading-none">{dispute.demandeur?.nom_complet}</p>
                                                    </div>
                                                </div>
                                                <div className="h-4 w-px bg-border rotate-12" />
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-background border-2 border-border flex items-center justify-center font-black text-xs text-muted-foreground/30 shadow-premium">
                                                        {dispute.defenseur?.nom_complet[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-muted-foreground/20 italic uppercase tracking-widest leading-none mb-1">Défendeur</p>
                                                        <p className="text-xs font-black italic uppercase leading-none">{dispute.defenseur?.nom_complet || 'Système BCA'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="size-12 rounded-full border-2 border-border flex items-center justify-center group-hover:border-primary/40 group-hover:text-primary transition-all">
                                                <Scale className="size-5 opacity-20 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Panneau de Médiation (Action) */}
                    <div className="xl:col-span-5">
                        <div className="sticky top-12 space-y-8">
                            <div className="flex items-center gap-4 px-6">
                                <h3 className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 italic">Console d'Arbitrage</h3>
                            </div>

                            {selectedDispute ? (
                                <div className="glass-card border-4 border-primary rounded-[3rem] p-10 shadow-premium-lg space-y-10 animate-in slide-in-from-right-10 duration-700 relative overflow-hidden group/panel">
                                    <div className="absolute top-0 right-0 size-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                                    
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="size-20 rounded-[1.8rem] bg-primary text-white flex items-center justify-center shadow-premium-lg shadow-primary/20 rotate-3 group-hover/panel:rotate-0 transition-transform duration-500">
                                            <Gavel className="size-10" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Rendu du <br /> <span className="text-primary not-italic">Jugement.</span></h3>
                                            <p className="text-executive-label font-black text-muted-foreground/30 italic uppercase tracking-widest leading-none pt-0.5">Arbitre BCA Exécutif #01</p>
                                        </div>
                                    </div>

                                    <div className="p-10 rounded-[2rem] bg-background border-4 border-border shadow-inner space-y-6 relative z-10 group/ia">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                                <Zap className="size-4 text-primary animate-pulse" />
                                            </div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground italic">Préconisation IA BCA v4.5</h4>
                                        </div>
                                        <p className="text-base font-black italic text-muted-foreground/60 leading-relaxed border-l-4 border-primary/20 pl-6 group-hover/ia:border-primary transition-colors">
                                            "{selectedDispute.solution_proposee_ia || "Analyse multicritère en cours. Préconisation standard : Conciliation amiable et compensation partielle."}"
                                        </p>
                                    </div>

                                    <div className="space-y-6 relative z-10">
                                        <label className="text-executive-label font-black uppercase tracking-[0.3em] text-muted-foreground/40 ml-4 italic">Décret Final & Application des Sanctions</label>
                                        <textarea
                                            className="w-full h-48 bg-background border-4 border-border rounded-[2rem] p-10 text-sm font-black italic uppercase tracking-widest focus:outline-none focus:border-primary/40 focus:ring-8 focus:ring-primary/5 shadow-inner transition-all placeholder:text-muted-foreground/10 leading-relaxed"
                                            placeholder="SAISISSEZ LE PROTOCOLE DE RÉSOLUTION..."
                                            value={decision}
                                            onChange={e => setDecision(e.target.value)}
                                        />
                                        <button
                                            onClick={() => handleResolve(selectedDispute.id)}
                                            className="w-full h-24 bg-primary text-white rounded-[2.2rem] font-black uppercase tracking-[0.4em] text-xs flex items-center justify-center gap-6 shadow-premium-lg shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                            <span className="leading-none pt-1">Proclamer le Jugement</span>
                                            <CheckCircle className="size-6 group-hover:scale-125 transition-transform" />
                                        </button>
                                    </div>

                                    <div className="pt-8 border-t-2 border-border flex gap-4 relative z-10">
                                        <button className="flex-1 h-16 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground hover:bg-accent rounded-2xl transition-all italic border-2 border-transparent hover:border-border">
                                            <MessageSquare className="size-4" />
                                            Canal Médiation
                                        </button>
                                        <button className="flex-1 h-16 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-foreground hover:bg-accent rounded-2xl transition-all italic border-2 border-transparent hover:border-border">
                                            <ExternalLink className="size-4" />
                                            Audit Commande
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="glass-card border-4 border-border border-dashed rounded-[4rem] h-[40rem] flex flex-col items-center justify-center text-center p-12 gap-8 group animate-pulse">
                                    <div className="size-32 rounded-[2.5rem] bg-accent/50 flex items-center justify-center border-4 border-border group-hover:scale-110 transition-transform duration-700">
                                        <Scale className="size-16 text-muted-foreground/10" />
                                    </div>
                                    <p className="text-xl font-black italic tracking-tighter text-muted-foreground/20 uppercase max-w-[250px]">
                                        Sélectionnez un dossier pour engager le protocole d'arbitrage.
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
