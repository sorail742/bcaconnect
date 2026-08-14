import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useWallet } from '../hooks/useWalletData';
import { WalletSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/DataStates';
import { Wallet as WalletIcon, Send, Plus, Minus, History, TrendingUp, Lock, RefreshCcw, XCircle, Activity, ArrowUpRight, ArrowDownRight, Search, Info, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import walletService from '../services/walletService';
import userService from '../../user/services/userService';
import { toast } from 'sonner';
import { useSocket } from '../../hooks/useSocket';
import { Button } from '../../components/ui/Button';
import { cn, adaptiveValueSize } from '../../lib/utils';
import { useAIScore } from '../../credit/hooks/useAIScore';
import { getTransactionDirection, getTransactionLabel } from '../lib/walletUtils';
import MicroCreditModal from '../components/MicroCreditModal';

const Wallet = () => {
    const { data: wallet, loading, error, mutate } = useWallet();
    const [showTransactions, setShowTransactions] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isMicroCreditModalOpen, setIsMicroCreditModalOpen] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawPhone, setWithdrawPhone] = useState('');
    const [withdrawMethod, setWithdrawMethod] = useState('orange_money');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();

    const { scoreData, loading: scoreLoading } = useAIScore();
    const { on, off } = useSocket();

    useEffect(() => {
        const handleWalletUpdate = (payload) => {
            toast.success(`Portefeuille mis à jour : +${payload.amount.toLocaleString()} GNF`, {
                icon: <CheckCircle2 className="size-5 text-emerald-500" />
            });
            mutate();
        };
        on('wallet_updated', handleWalletUpdate);

        // Gestion du retour depuis le paiement externe
        const status = searchParams.get('status');
        if (status === 'success') {
            toast.success('Paiement initié avec succès ! Votre solde sera mis à jour dès la confirmation de l\'opérateur.');
            searchParams.delete('status');
            searchParams.delete('tx');
            setSearchParams(searchParams);
        }

        return () => off('wallet_updated', handleWalletUpdate);
    }, [on, off, mutate, searchParams, setSearchParams]);

    const transactions = wallet?.transactions || [];
    const balance = wallet?.solde_virtuel || 0;
    const pending = wallet?.solde_en_attente || 0;
    const withdrawalFeeRate = wallet?.withdrawal_fee_rate ?? 0.02;
    const withdrawFeeAmount = Math.round((parseFloat(withdrawAmount) || 0) * withdrawalFeeRate * 100) / 100;
    const withdrawNetAmount = Math.max(0, (parseFloat(withdrawAmount) || 0) - withdrawFeeAmount);

    const handleDeposit = async () => {
        const amountPrompt = window.prompt("Entrez le montant à déposer (GNF):", "100000");
        if (!amountPrompt || isNaN(amountPrompt) || parseFloat(amountPrompt) <= 0) return;
        try {
            setIsDepositing(true);
            toast.loading("Initialisation du dépôt...");
            const response = await walletService.initiateDeposit({
                montant: parseFloat(amountPrompt),
                methode_paiement: 'mobile_money', // Defaulting to mobile_money since 'wallet_topup' is invalid
                description: 'Alimentation du portefeuille'
            });
            if (response.payment_url?.includes('/payment/simulate/')) {
                await walletService.captureSimulation(response.transaction_id);
                toast.success('Recharge simulée réussie !');
                mutate();
            } else if (response.payment_url) {
                window.location.href = response.payment_url;
            } else {
                toast.success('Dépôt simulé réussi !');
                mutate();
            }
        } catch (err) { toast.error("Erreur d'initialisation du dépôt."); }
        finally { setIsDepositing(false); toast.dismiss(); }
    };

    const handleSearchUsers = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const data = await userService.getPublicSearch(query);
            setSearchResults(data || []);
        } catch (error) { console.error(error); }
        finally { setIsSearching(false); }
    };

    const handleTransfer = async () => {
        if (!selectedUser || !amount || parseFloat(amount) <= 0) { toast.error("Champs invalides."); return; }
        if (parseFloat(amount) > balance) { toast.error("Solde insuffisant."); return; }
        try {
            setIsTransferring(true);
            await walletService.transfer({ destinataire_id: selectedUser.id, montant: parseFloat(amount), description: `Transfert P2P vers ${selectedUser.nom_complet}` });
            toast.success("Transfert réussi !");
            setIsTransferModalOpen(false); setSelectedUser(null); setAmount(''); mutate();
        } catch (err) { toast.error(err.response?.data?.message || "Erreur lors du transfert."); }
        finally { setIsTransferring(false); }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) { toast.error("Montant invalide."); return; }
        if (parseFloat(withdrawAmount) > balance) { toast.error("Solde insuffisant."); return; }
        if (!withdrawPhone.trim()) { toast.error("Numéro Mobile Money requis."); return; }
        try {
            setIsWithdrawing(true);
            const res = await walletService.requestWithdrawal({
                montant: parseFloat(withdrawAmount),
                destination_phone: withdrawPhone.trim(),
                methode: withdrawMethod,
            });
            toast.success(res.message || "Demande de retrait enregistrée.");
            setIsWithdrawModalOpen(false); setWithdrawAmount(''); setWithdrawPhone(''); mutate();
        } catch (err) { toast.error(err.response?.data?.message || "Erreur lors de la demande de retrait."); }
        finally { setIsWithdrawing(false); }
    };

    return (
        <DashboardLayout title="Portefeuille BCA" noPadding>
            <div className="min-h-screen bg-background pb-16">
                <div className="container px-4 md:px-8 py-8">

                    {/* Header */}
                    <div className="flex items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <WalletIcon className="size-5 text-[#1CA0DB]" />
                                </div>
                                <h1 className="text-3xl font-black text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Mon <span className="text-[#1CA0DB]">Portefeuille</span>
                                </h1>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium ml-1">
                                Gérez vos fonds, transférez de l'argent et consultez votre historique en toute sécurité.
                            </p>
                        </div>
                        <button onClick={() => mutate()} className="h-10 px-4 bg-card border border-border rounded-xl text-xs font-bold hover:border-[#1CA0DB] hover:text-[#1CA0DB] transition-all flex items-center gap-2 shadow-sm text-muted-foreground">
                            <RefreshCcw className="size-3.5" /> <span className="hidden sm:inline">Actualiser</span>
                        </button>
                    </div>

                    {loading ? (
                        <WalletSkeleton />
                    ) : error ? (
                        <ErrorState error={error} />
                    ) : (
                        <div className="space-y-6">

                            {/* Dashboard Top Cards */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* 1. Main Balance Card (BCA Style Gradient) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1CA0DB] via-[#0E86B4] to-[#4FC3F7] p-8 sm:p-10 text-white shadow-xl"
                                >
                                    <div className="absolute top-0 right-0 size-64 bg-card/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />

                                    <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="px-3 py-1 bg-card/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm">
                                                    Solde Actif
                                                </span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm border border-emerald-400/20">
                                                    <Shield className="size-3" /> Protégé
                                                </div>
                                            </div>
                                            <p className={cn(adaptiveValueSize(balance.toLocaleString('fr-GN'), 'text-5xl', 'text-xl'), "font-black mb-1 tabular-nums tracking-tighter break-all")} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {balance.toLocaleString('fr-GN')}
                                            </p>
                                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm">Francs Guinéens (GNF)</p>
                                        </div>

                                        {/* Quick Actions inside the main card */}
                                        <div className="flex flex-wrap gap-3 w-full xl:w-auto shadow-lg p-2 bg-card/10 rounded-2xl backdrop-blur-md border border-white/20">
                                            <button
                                                onClick={handleDeposit}
                                                disabled={isDepositing}
                                                className="flex-1 min-w-[130px] xl:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-card text-[#1CA0DB] rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                                            >
                                                <Plus className="size-4" /> Déposer
                                            </button>
                                            <button
                                                onClick={() => setIsTransferModalOpen(true)}
                                                className="flex-1 min-w-[130px] xl:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-[#1CA0DB] text-white border border-white/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-card/20 transition-colors"
                                            >
                                                <Send className="size-4" /> Envoyer
                                            </button>
                                            <button
                                                onClick={() => setIsWithdrawModalOpen(true)}
                                                className="flex-1 min-w-[130px] xl:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-card/10 text-white border border-white/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-card/20 transition-colors"
                                            >
                                                <Minus className="size-4" /> Retirer
                                            </button>
                                            <button
                                                onClick={() => setIsMicroCreditModalOpen(true)}
                                                className="flex-1 min-w-[130px] xl:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                                            >
                                                <TrendingUp className="size-4" /> Micro-prêt
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 2. Pending Funds Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-card rounded-2xl border border-border p-8 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="size-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                                <Activity className="size-5 text-amber-500" />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">En attente</span>
                                        </div>
                                        <p className={cn(adaptiveValueSize(pending.toLocaleString('fr-GN'), 'text-3xl', 'text-lg'), "font-black text-foreground tabular-nums tracking-tight mb-1")} style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {pending.toLocaleString('fr-GN')} <span className="text-sm text-muted-foreground font-bold">GNF</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground font-medium">
                                            Fonds bloqués en séquestre (Escrow) jusqu'à validation de livraison.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Main Content Grid: Transactions + AI Score */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Left Side: Transactions List */}
                                <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                                    <div className="p-6 sm:p-8 border-b border-border flex items-center justify-between">
                                        <h2 className="text-lg font-black text-foreground">Historique des transactions</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold text-muted-foreground">Live</span>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        {transactions.length > 0 ? (
                                            <div className="space-y-3">
                                                {transactions.slice(0, 10).map((tx, idx) => {
                                                    const direction = getTransactionDirection(tx);
                                                    const isCredit = direction === 'credit';
                                                    return (
                                                    <div key={tx.id || idx} className="flex items-center justify-between p-4 bg-muted/50 hover:bg-muted rounded-2xl border border-border transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                                                                isCredit ? "bg-emerald-50 border-emerald-100 text-emerald-500 dark:bg-emerald-900/30 dark:border-emerald-800" : "bg-rose-50 border-rose-100 text-rose-500 dark:bg-rose-900/30 dark:border-rose-800"
                                                            )}>
                                                                {isCredit ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-foreground truncate">
                                                                    {getTransactionLabel(tx)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {new Date(tx.createdAt || tx.created_at || tx.date).toLocaleString('fr-FR', {
                                                                        day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-4">
                                                            <p className={cn(
                                                                "text-base font-black tabular-nums tracking-tight",
                                                                isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                                            )}>
                                                                {isCredit ? '+' : '-'}{parseFloat(tx.montant).toLocaleString('fr-GN')}
                                                            </p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground">
                                                                {tx.statut || 'Terminé'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center flex flex-col items-center">
                                                <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground/50">
                                                    <History className="size-8" />
                                                </div>
                                                <p className="font-bold text-muted-foreground mb-1">Aucune transaction</p>
                                                <p className="text-sm text-muted-foreground/80">Vos prochains flux apparaîtront ici.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: AI Analytics / Promo Box */}
                                <div className="space-y-6">
                                    {/* AI Score (If available) */}
                                    {!scoreLoading && scoreData && (
                                        <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(28,160,219,0.2),transparent)] pointer-events-none" />
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-[#1CA0DB]">Score de Fiabilité</h3>
                                                <Shield className="size-5 text-[#1CA0DB]" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <p className="text-5xl font-black tabular-nums tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {scoreData.score ?? 0}
                                                    </p>
                                                    <span className="text-[#1CA0DB] font-black text-xl">/100</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-card/10 rounded-full overflow-hidden mb-3">
                                                    <div className="h-full bg-[#1CA0DB] rounded-full transition-all duration-1000" style={{ width: `${scoreData.score ?? 0}%` }} />
                                                </div>
                                                <p className="text-xs text-white/60 font-medium">
                                                    Votre profil est considéré comme <b className="text-white">{scoreData.metadata?.status || 'N/A'}</b> par notre moteur IA d'analyse des risques.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Simple info banner */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-2xl">
                                        <div className="size-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                                            <Lock className="size-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-sm font-black text-blue-900 dark:text-blue-300 mb-2">Paiement Sécurisé BCA</h3>
                                        <p className="text-xs text-blue-700/80 dark:text-blue-300/80 leading-relaxed mb-4">
                                            Tous les fonds en attente sont conservés sur un compte Escrow inviolable et garantis par nos partenaires bancaires.
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}
                </div>

                {/* Transfer Modal */}
                <AnimatePresence>
                    {isTransferModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsTransferModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Envoyer de l'argent</h3>
                                        <button onClick={() => setIsTransferModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors bg-muted p-2 rounded-full">
                                            <XCircle className="size-5" />
                                        </button>
                                    </div>

                                    {!selectedUser ? (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                                <input
                                                    className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-xl text-sm font-medium text-foreground outline-none focus:border-[#1CA0DB] focus:ring-1 focus:ring-[#1CA0DB] transition-all"
                                                    placeholder="Nom, email ou ID..."
                                                    value={searchQuery}
                                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                                />
                                            </div>
                                            <div className="min-h-[150px] max-h-[250px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                {isSearching ? (
                                                    <div className="flex justify-center py-8">
                                                        <div className="size-6 border-2 border-[#1CA0DB] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => setSelectedUser(user)}
                                                            className="w-full flex items-center gap-3 p-3 bg-card hover:bg-muted border border-border rounded-xl text-left transition-all"
                                                        >
                                                            <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-[#1CA0DB] font-black text-sm">
                                                                {user.nom_complet?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground">{user.nom_complet}</p>
                                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{user.role}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : searchQuery.length >= 2 ? (
                                                    <div className="text-center py-8 text-sm font-medium text-muted-foreground">Aucun utilisateur trouvé</div>
                                                ) : (
                                                    <div className="text-center py-8 text-xs font-medium text-muted-foreground">Recherchez le destinataire pour continuer</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-muted border border-border rounded-2xl">
                                                <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[#1CA0DB] font-black text-lg">
                                                    {selectedUser.nom_complet?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{selectedUser.nom_complet}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                                                </div>
                                                <button onClick={() => setSelectedUser(null)} className="text-[10px] font-black text-muted-foreground hover:text-primary bg-background border border-border px-2 py-1 rounded">Changer</button>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-foreground ml-1">Montant à envoyer (GNF)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full h-14 pl-4 pr-16 bg-background border border-border focus:border-[#1CA0DB] focus:ring-1 focus:ring-[#1CA0DB] rounded-xl text-xl text-foreground font-black tabular-nums transition-all"
                                                        placeholder="0"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">GNF</div>
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-xs text-muted-foreground font-medium">
                                                        Solde dispo : <span className="font-bold text-foreground">{balance.toLocaleString()} GNF</span>
                                                    </p>
                                                    <button onClick={() => setAmount(balance.toString())} className="text-[10px] font-black text-[#1CA0DB] hover:underline">MAX</button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleTransfer}
                                                disabled={isTransferring || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                                                className="w-full h-12 flex items-center justify-center gap-2 bg-[#1CA0DB] text-white rounded-xl font-black text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                            >
                                                {isTransferring ? (
                                                    <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <>Envoyer les fonds <ArrowRight className="size-4" /></>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Withdraw Modal */}
                <AnimatePresence>
                    {isWithdrawModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsWithdrawModalOpen(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-foreground tracking-tight">Retirer des fonds</h3>
                                        <button onClick={() => setIsWithdrawModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors bg-muted p-2 rounded-full">
                                            <XCircle className="size-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground ml-1">Montant à retirer (GNF)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                className="w-full h-14 pl-4 pr-16 bg-background border border-border focus:border-[#1CA0DB] focus:ring-1 focus:ring-[#1CA0DB] rounded-xl text-xl text-foreground font-black tabular-nums transition-all"
                                                placeholder="0"
                                                value={withdrawAmount}
                                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground">GNF</div>
                                        </div>
                                        <div className="flex justify-between items-center px-1">
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Solde dispo : <span className="font-bold text-foreground">{balance.toLocaleString()} GNF</span>
                                            </p>
                                            <button onClick={() => setWithdrawAmount(balance.toString())} className="text-[10px] font-black text-[#1CA0DB] hover:underline">MAX</button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground ml-1">Méthode</label>
                                        <select
                                            value={withdrawMethod}
                                            onChange={(e) => setWithdrawMethod(e.target.value)}
                                            className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm font-bold text-foreground outline-none focus:border-[#1CA0DB]"
                                        >
                                            <option value="orange_money">Orange Money</option>
                                            <option value="mtn_money">MTN Mobile Money</option>
                                            <option value="banque">Virement bancaire</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-foreground ml-1">Numéro de destination</label>
                                        <input
                                            type="tel"
                                            className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm font-bold text-foreground outline-none focus:border-[#1CA0DB]"
                                            placeholder="+224 6XX XX XX XX"
                                            value={withdrawPhone}
                                            onChange={(e) => setWithdrawPhone(e.target.value)}
                                        />
                                    </div>

                                    {parseFloat(withdrawAmount) > 0 && (
                                        <div className="p-4 bg-muted rounded-2xl space-y-1.5 text-xs">
                                            <div className="flex justify-between text-muted-foreground">
                                                <span>Frais de retrait ({(withdrawalFeeRate * 100).toFixed(0)}%)</span>
                                                <span className="tabular-nums">-{withdrawFeeAmount.toLocaleString('fr-GN')} GNF</span>
                                            </div>
                                            <div className="flex justify-between font-black text-foreground pt-1.5 border-t border-border">
                                                <span>Vous recevrez</span>
                                                <span className="tabular-nums">{withdrawNetAmount.toLocaleString('fr-GN')} GNF</span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        Le montant est immédiatement bloqué sur votre solde. L'administration valide et vous
                                        envoie les fonds sous peu.
                                    </p>

                                    <button
                                        onClick={handleWithdraw}
                                        disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > balance || !withdrawPhone.trim()}
                                        className="w-full h-12 flex items-center justify-center gap-2 bg-[#1CA0DB] text-white rounded-xl font-black text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                                    >
                                        {isWithdrawing ? (
                                            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>Demander le retrait <ArrowRight className="size-4" /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <MicroCreditModal
                open={isMicroCreditModalOpen}
                onClose={() => setIsMicroCreditModalOpen(false)}
                onSuccess={() => mutate()}
            />
        </DashboardLayout>
    );
};

export default Wallet;
