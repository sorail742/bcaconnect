import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calculator, TrendingUp, ShieldCheck, Zap, ArrowRight, Info, 
    AlertCircle, Sparkles, Landmark, Calendar, RefreshCcw, X, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ModalOverlay from '../../components/ui/ModalOverlay';

import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { toast } from 'sonner';
import { creditRequestSchema } from '../../lib/validation';
import { cn } from '../../lib/utils';
import { useCreditSimulation, useCreditScore, useRequestCredit } from '../hooks/useCreditData';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

export default function CreditSimulator() {
    const [amount, setAmount] = useState(5000000); // 5M GNF
    const [duration, setDuration] = useState(12);   // 12 mois
    const [interestRate, setInterestRate] = useState(12); // Taux d'intérêt par défaut 12%
    const [debouncedParams, setDebouncedParams] = useState({ montant: amount, mois: duration, taux: interestRate });

    // Debouncing simulation params
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedParams({ montant: amount, mois: duration, taux: interestRate });
        }, 500);
        return () => clearTimeout(timer);
    }, [amount, duration, interestRate]);

    // React Query Hooks
    const { data: simulation, isLoading: isSimulating } = useCreditSimulation(debouncedParams);
    const { data: aiScore, isLoading: isScoreLoading } = useCreditScore();
    const requestCreditMutation = useRequestCredit();

    const [motif, setMotif] = useState('');
    const [garanties, setGaranties] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
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
        
        requestCreditMutation.mutate({
            montant_principal: amount,
            duree_mois: duration,
            taux_interet: simulation?.taux || 0,
            motif: motif,
            garanties: garanties
        }, {
            onSuccess: () => {
                setShowConfirm(false);
                navigate('/dashboard/credits');
            }
        });
    };

    return (
        <DashboardLayout title="Simulateur crédit">
        <div className="p-4 md:p-8 pb-16">
                
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

                            {/* Taux d'Intérêt Selector */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                                        <TrendingUp className="size-4 text-primary" /> Taux d'Intérêt Annuel
                                    </label>
                                    <span className="text-2xl font-black text-emerald-500 tabular-nums">
                                        {interestRate}%
                                    </span>
                                </div>
                                <input 
                                    type="range" 
                                    min={0} 
                                    max={30} 
                                    step={0.5}
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(Number(e.target.value))}
                                    className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-emerald-500"
                                />
                                <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                    <span>0% (Sans Intérêt)</span>
                                    <span>30%</span>
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
                                    {isSimulating ? (
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
                                                        {simulation?.total_a_rembourser?.toLocaleString() || '---'} GNF
                                                    </p>
                                                </div>
                                                <div className="p-4 bg-muted rounded-2xl border border-border/50">
                                                    <p className="text-[9px] font-black text-muted-foreground uppercase mb-1">Cout du Crédit</p>
                                                    <p className="text-sm font-black text-rose-500 tabular-nums">
                                                        +{simulation?.cout_du_credit?.toLocaleString() || '---'} GNF
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Graphique de Répartition */}
                                            {simulation && (
                                                <div className="h-40 w-full pt-4">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={[
                                                                    { name: 'Capital', value: simulation.montant_principal || amount },
                                                                    { name: 'Intérêts', value: simulation.cout_du_credit || 0 }
                                                                ]}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={40}
                                                                outerRadius={60}
                                                                paddingAngle={5}
                                                                dataKey="value"
                                                                stroke="none"
                                                            >
                                                                <Cell fill="hsl(var(--primary))" />
                                                                <Cell fill="#f43f5e" />
                                                            </Pie>
                                                            <RechartsTooltip 
                                                                formatter={(value) => `${value.toLocaleString()} GNF`}
                                                                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}
                                                            />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}

                                            <div className="p-4 bg-slate-900 rounded-2xl border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="size-4 text-amber-500" />
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">ANALYSE ALPHA-BCA</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-amber-500">{aiScore?.score || '65'}/100</span>
                                                </div>
                                                
                                                <div className="space-y-2">
                                                    <div className="h-1.5 w-full bg-card/10 rounded-full overflow-hidden">
                                                        <motion.div 
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${aiScore?.score || 65}%` }}
                                                            className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                                                        />
                                                    </div>
                                                    
                                                    {/* Breakdown compact */}
                                                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                                                        {aiScore?.breakdown && Object.entries(aiScore.breakdown).map(([key, val]) => (
                                                            <div key={key} className="space-y-1">
                                                                <div className="h-1 bg-card/5 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-card/40" style={{ width: `${val}%` }} />
                                                                </div>
                                                                <p className="text-[6px] font-black text-white/40 uppercase tracking-tighter truncate text-center">{key}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className="text-[9px] text-white/60 font-medium pt-1">
                                                    Statut prédictif : <span className="text-amber-500 font-black uppercase">{aiScore?.metadata?.status || 'ANALYSE EN COURS'}</span>
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <Button 
                                    onClick={() => setShowConfirm(true)}
                                    disabled={isScoreLoading || !aiScore || aiScore?.score < 50}
                                    className="w-full h-14 bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest border-none shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {isScoreLoading || !aiScore ? 'ANALYSE EN COURS...' : aiScore.score < 50 ? 'SCORE INSUFFISANT POUR LE CRÉDIT' : 'DEMANDER CE FINANCEMENT'} 
                                    {(aiScore?.score >= 50 && !isScoreLoading) && <ArrowRight className="size-5 ml-2" />}
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

        <ModalOverlay
            open={showConfirm}
            onClose={() => setShowConfirm(false)}
            maxWidth="max-w-lg"
        >
            <div className="p-6 border-b border-border bg-muted/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Shield className="size-5" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-tight">Détails de la demande</h3>
                </div>
                <button type="button" onClick={() => setShowConfirm(false)} className="size-8 rounded-lg bg-muted hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-colors">
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
                            className="w-full h-24 bg-background border border-border rounded-xl p-3 text-sm focus:border-primary transition-all outline-none resize-none text-foreground"
                            placeholder="Ex: Achat de stock, Développement boutique..."
                            value={motif}
                            onChange={e => setMotif(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-foreground uppercase tracking-widest">Garanties ou Références</label>
                        <input
                            className="w-full h-10 bg-background border border-border rounded-xl px-3 text-sm focus:border-primary transition-all outline-none text-foreground"
                            placeholder="Ex: Titre foncier, Caution solidaire..."
                            value={garanties}
                            onChange={e => setGaranties(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex gap-3">
                        <AlertCircle className="size-5 text-primary shrink-0" />
                        <p className="text-[10px] text-primary/80 leading-relaxed font-bold uppercase">
                            En soumettant cette demande, vous autorisez BCA Finance à analyser vos données de transactions pour le scoring IA.
                        </p>
                    </div>
                    {/* 11.4. Sensibilisation sur l'Utilisation des Crédits et Financements */}
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex gap-3">
                        <Info className="size-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <h4 className="text-[11px] text-amber-800 dark:text-amber-500 font-black uppercase tracking-widest">Un crédit vous engage et doit être remboursé</h4>
                            <p className="text-[10px] text-amber-700 dark:text-amber-600/80 leading-relaxed font-medium">
                                Vérifiez vos capacités de remboursement avant de vous engager. En cas de non-remboursement, des pénalités s'appliqueront et votre accès aux services BCA Connect pourrait être restreint.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleRequest}
                    disabled={requestCreditMutation.isPending || !motif}
                    className="w-full h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-40 border-none"
                >
                    {requestCreditMutation.isPending ? <RefreshCcw className="size-5 animate-spin" /> : <ShieldCheck className="size-5" />}
                    {requestCreditMutation.isPending ? 'ANALYSE IA EN COURS...' : 'CONFIRMER LA DEMANDE'}
                </button>
            </div>
        </ModalOverlay>
        </DashboardLayout>
    );
}
