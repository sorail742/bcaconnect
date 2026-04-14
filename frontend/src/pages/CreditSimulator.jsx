import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, TrendingUp, ShieldCheck, Zap, ArrowRight, Info, 
    AlertCircle, Sparkles, Landmark, Calendar, RefreshCcw, X, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import creditService from '../services/creditService';
import { toast } from 'sonner';
import { creditRequestSchema } from '../lib/validation';
import { cn } from '../lib/utils';

export default function CreditSimulator() {
    const [amount, setAmount] = useState(5000000); // 5M GNF
    const [duration, setDuration] = useState(12);   // 12 mois
    const [simulation, setSimulation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const performSimulation = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await creditService.simulate({
                montant: amount,
                duree_mois: duration,
                type_credit: 'personnel'
            });
            setSimulation(data);
        } catch (err) {
            setError("Échec de la simulation. Veuillez vérifier les paramètres.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [amount, duration]);

    // Débouncing de la simulation
    useEffect(() => {
        const timer = setTimeout(() => {
            performSimulation();
        }, 500);
        return () => clearTimeout(timer);
    }, [amount, duration, performSimulation]);

    const [motif, setMotif] = useState('');
    const [garanties, setGaranties] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);
    const navigate = useNavigate();

    const handleRequest = async () => {
        const validation = creditRequestSchema.safeParse({
            montant_principal: amount,
            duree_mois: duration,
            motif: motif,
            garanties: garanties
        });

        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }
        
        setIsRequesting(true);
        try {
            await creditService.request({
                montant_principal: amount,
                duree_mois: duration,
                taux_interet: simulation?.taux || 0,
                motif: motif,
                garanties: garanties
            });
            toast.success("Demande de crédit soumise avec succès !");
            navigate('/credits');
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors de la soumission.");
        } finally {
            setIsRequesting(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
        <main className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                
                {/* Header Professionnel */}
                <div className="max-w-4xl mx-auto mb-12 text-center space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-black text-primary uppercase tracking-widest"
                    >
                        <Landmark className="size-3" /> BCA FINANCE v2.6
                    </motion.div>
                    <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
                        Simulateur de <span className="text-primary">Micro-Crédit IA</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                        Analysez vos capacités de financement en temps réel grâce à notre moteur de scoring prédictif.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Colonne de Configuration (Left) */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="p-8 border-border/50 shadow-xl space-y-8">
                            
                            {/* Montant Selector */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Zap className="size-4 text-primary" /> Montant Souhaité
                                    </label>
                                    <span className="text-2xl font-black text-primary tabular-nums">
                                        {amount.toLocaleString()} <span className="text-xs">GNF</span>
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min={500000} 
                                    max={100000000} 
                                    step={500000}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                                />
                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                    <span>500.000 GNF</span>
                                    <span>100.000.000 GNF</span>
                                </div>
                            </div>

                            {/* Durée Selector */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="size-4 text-primary" /> Durée du Prêt
                                    </label>
                                    <span className="text-2xl font-black text-primary tabular-nums">
                                        {duration} <span className="text-xs">MOIS</span>
                                    </span>
                                </div>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {[3, 6, 12, 18, 24, 36].map(m => (
                                        <button 
                                            key={m}
                                            onClick={() => setDuration(m)}
                                            className={cn(
                                                "h-12 rounded-xl text-xs font-bold transition-all border",
                                                duration === m 
                                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                                                    : "bg-muted border-border text-muted-foreground hover:border-primary/40"
                                            )}
                                        >
                                            {m} M
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trust Info */}
                            <div className="pt-6 border-t border-border flex items-start gap-4">
                                <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="size-5 text-emerald-500" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-foreground uppercase">Financement Sécurisé</p>
                                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                                        Nos algorithmes évaluent votre solvabilité sur la base de votre historique Wallet et de votre score de confiance BCA.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Colonne de Résultat (Right) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="relative p-0 border-primary/20 overflow-hidden shadow-2xl shadow-primary/5">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />
                            
                            <div className="p-8 space-y-8">
                                <div className="flex items-center gap-3">
                                    <TrendingUp className="size-5 text-primary" />
                                    <h3 className="text-xs font-black text-foreground uppercase tracking-widest">Projection de Remboursement</h3>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.div 
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-6 py-4"
                                        >
                                            <div className="h-12 bg-muted animate-pulse rounded-xl" />
                                            <div className="h-12 bg-muted animate-pulse rounded-xl" />
                                            <div className="h-12 bg-muted animate-pulse rounded-xl" />
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="result"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="space-y-6"
                                        >
                                            <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Mensualité Estimée</p>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-black text-foreground tracking-tighter tabular-nums">
                                                        {simulation?.mensualite?.toLocaleString() || '---'}
                                                    </span>
                                                    <span className="text-sm font-bold text-primary">GNF / MOIS</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-4 bg-muted rounded-2xl border border-border/50">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Cout Total</p>
                                                    <p className="text-sm font-black text-foreground tabular-nums">
                                                        {simulation?.total_remboursement?.toLocaleString() || '---'} GNF
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-muted rounded-2xl border border-border/50">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Taux Annuel</p>
                                                    <p className="text-sm font-black text-emerald-500 tabular-nums">
                                                        {simulation?.taux || '12'}% <span className="text-[8px] text-muted-foreground tracking-normal">(TDR)</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Sparkles className="size-4 text-amber-500" />
                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Analysis IA Score</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: '85%' }}
                                                        className="h-full bg-amber-500"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-white/60 font-medium">
                                                    Confiance estimée : <span className="text-amber-500 font-black">HÉROÏQUE (85/100)</span>
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button 
                                    onClick={() => setShowConfirm(true)}
                                    className="w-full h-14 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest border-none shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                >
                                    DEMANDER CE FINANCEMENT <ArrowRight className="size-5 ml-2" />
                                </Button>
                            </div>
                        </Card>

                        <div className="p-4 bg-muted border border-border rounded-2xl flex items-center gap-3">
                            <Info className="size-4 text-primary shrink-0" />
                            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                                Les taux peuvent varier en fonction de vos scores de fiabilité et de la période de souscription.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </main>

        {/* ── Modal Confirmation Demande ── */}
        <AnimatePresence>
            {showConfirm && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                        onClick={() => setShowConfirm(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-card border-2 border-border rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
                    >
                        <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                    <Shield className="size-5" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Détails de la demande</h3>
                            </div>
                            <button onClick={() => setShowConfirm(false)} className="size-8 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors">
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-muted rounded-2xl border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Montant</p>
                                    <p className="text-sm font-black text-foreground">{amount.toLocaleString()} GNF</p>
                                </div>
                                <div className="p-4 bg-muted rounded-2xl border border-border">
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Durée</p>
                                    <p className="text-sm font-black text-foreground">{duration} mois</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest">Motif du Financement *</label>
                                    <textarea
                                        className="w-full h-24 bg-background border border-border rounded-xl p-3 text-sm focus:border-primary transition-all outline-none resize-none"
                                        placeholder="Ex: Achat de stock, Développement boutique..."
                                        value={motif}
                                        onChange={e => setMotif(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-foreground uppercase tracking-widest">Garanties ou Références</label>
                                    <input
                                        className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:border-primary transition-all outline-none"
                                        placeholder="Ex: Titre foncier, Caution solidaire..."
                                        value={garanties}
                                        onChange={e => setGaranties(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3">
                                <AlertCircle className="size-5 text-primary shrink-0" />
                                <p className="text-[10px] text-primary/80 leading-relaxed font-bold uppercase">
                                    En soumettant cette demande, vous autorisez BCA Finance à analyser vos données de transactions pour le scoring IA.
                                </p>
                            </div>

                            <button
                                onClick={handleRequest}
                                disabled={isRequesting || !motif}
                                className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-40"
                            >
                                {isRequesting ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                                {isRequesting ? 'ANALYSE IA EN COURS...' : 'CONFIRMER LA DEMANDE'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        </>
    );
}
