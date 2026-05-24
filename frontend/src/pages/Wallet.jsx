import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useWallet } from '../hooks/useDomainData';
import { WalletSkeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/DataStates';
import { Wallet as WalletIcon, Send, Plus, Minus, History, TrendingUp, Lock, RefreshCcw, XCircle, Activity, ArrowUpRight, ArrowDownRight, Search, Info, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import walletService from '../services/walletService';
import userService from '../services/userService';
import { toast } from 'sonner';
import { useSocket } from '../hooks/useSocket';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { useAIScore } from '../hooks/useAIScore';

const Wallet = () => {
    const { data: wallet, loading, error, mutate } = useWallet();
    const [showTransactions, setShowTransactions] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
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
            if (response.payment_url) { window.location.href = response.payment_url; }
            else { toast.success("Dépôt simulé réussi !"); mutate(); }
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

    return (
        <DashboardLayout title="Portefeuille BCA" noPadding>
            <div className="min-h-screen bg-[#f7f7f7] pb-16">
                <div className="container px-4 md:px-8 py-8">
                    
                    {/* Header */}
                    <div className="flex items-end justify-between gap-6 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="size-10 rounded-xl bg-orange-100 flex items-center justify-center">
                                    <WalletIcon className="size-5 text-[#FF6600]" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                    Mon <span className="text-[#FF6600]">Portefeuille</span>
                                </h1>
                            </div>
                            <p className="text-sm text-slate-500 font-medium ml-1">
                                Gérez vos fonds, transférez de l'argent et consultez votre historique en toute sécurité.
                            </p>
                        </div>
                        <button onClick={() => mutate()} className="h-10 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold hover:border-[#FF6600] hover:text-[#FF6600] transition-all flex items-center gap-2 shadow-sm text-slate-600">
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
                                
                                {/* 1. Main Balance Card (Alibaba Style Gradient) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="lg:col-span-2 relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#FF6600] via-[#FF7A1A] to-[#FF9A3C] p-8 sm:p-10 text-white shadow-xl"
                                >
                                    <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm">
                                                    Solde Actif
                                                </span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-100 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-sm border border-emerald-400/20">
                                                    <Shield className="size-3" /> Protégé
                                                </div>
                                            </div>
                                            <p className="text-5xl sm:text-6xl font-black mb-1 tabular-nums tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                {balance.toLocaleString('fr-GN')}
                                            </p>
                                            <p className="text-white/80 font-bold uppercase tracking-widest text-sm">Francs Guinéens (GNF)</p>
                                        </div>

                                        {/* Quick Actions inside the main card */}
                                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-6 md:mt-0 shadow-lg p-2 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                            <button 
                                                onClick={handleDeposit}
                                                disabled={isDepositing}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-white text-[#FF6600] rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform"
                                            >
                                                <Plus className="size-4" /> Déposer
                                            </button>
                                            <button 
                                                onClick={() => setIsTransferModalOpen(true)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-2 h-12 px-6 bg-[#FF6600] text-white border border-white/30 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-colors"
                                            >
                                                <Send className="size-4" /> Envoyer
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* 2. Pending Funds Card */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="size-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                                <Activity className="size-5 text-amber-500" />
                                            </div>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">En attente</span>
                                        </div>
                                        <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                            {pending.toLocaleString('fr-GN')} <span className="text-sm text-slate-400 font-bold">GNF</span>
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">
                                            Fonds bloqués en séquestre (Escrow) jusqu'à validation de livraison.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Main Content Grid: Transactions + AI Score */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                
                                {/* Left Side: Transactions List */}
                                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                    <div className="p-6 sm:p-8 border-b border-slate-50 flex items-center justify-between">
                                        <h2 className="text-lg font-black text-slate-900">Historique des transactions</h2>
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-bold text-slate-400">Live</span>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        {transactions.length > 0 ? (
                                            <div className="space-y-3">
                                                {transactions.slice(0, 10).map((tx, idx) => (
                                                    <div key={tx.id || idx} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "size-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                                                                tx.type === 'credit' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-rose-50 border-rose-100 text-rose-500"
                                                            )}>
                                                                {tx.type === 'credit' ? <ArrowDownRight className="size-5" /> : <ArrowUpRight className="size-5" />}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-900 truncate">
                                                                    {tx.description || (tx.type === 'credit' ? 'Dépôt' : 'Paiement')}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {new Date(tx.createdAt || tx.date).toLocaleString('fr-FR', {
                                                                        day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right shrink-0 ml-4">
                                                            <p className={cn(
                                                                "text-base font-black tabular-nums tracking-tight",
                                                                tx.type === 'credit' ? "text-emerald-600" : "text-slate-900"
                                                            )}>
                                                                {tx.type === 'credit' ? '+' : '-'}{parseFloat(tx.montant).toLocaleString('fr-GN')}
                                                            </p>
                                                            <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-200/50 text-slate-500">
                                                                {tx.statut || 'Terminé'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-16 text-center flex flex-col items-center">
                                                <div className="size-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-300">
                                                    <History className="size-8" />
                                                </div>
                                                <p className="font-bold text-slate-500 mb-1">Aucune transaction</p>
                                                <p className="text-sm text-slate-400">Vos prochains flux apparaîtront ici.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: AI Analytics / Promo Box */}
                                <div className="space-y-6">
                                    {/* AI Score (If available) */}
                                    {!scoreLoading && scoreData && (
                                        <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,102,0,0.2),transparent)] pointer-events-none" />
                                            <div className="flex items-center justify-between mb-6 relative z-10">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6600]">Score de Fiabilité</h3>
                                                <Shield className="size-5 text-[#FF6600]" />
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-baseline gap-1 mb-2">
                                                    <p className="text-5xl font-black tabular-nums tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                                        {scoreData.score || 95}
                                                    </p>
                                                    <span className="text-[#FF6600] font-black text-xl">/100</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                                                    <div className="h-full bg-[#FF6600] rounded-full transition-all duration-1000" style={{ width: `${scoreData.score || 95}%` }} />
                                                </div>
                                                <p className="text-xs text-white/60 font-medium">
                                                    Votre profil est considéré comme <b className="text-white">Excellent</b> par notre moteur IA d'analyse des risques.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Simple info banner */}
                                    <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem]">
                                        <div className="size-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                                            <Lock className="size-5 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-black text-blue-900 mb-2">Paiement Sécurisé BCA</h3>
                                        <p className="text-xs text-blue-700/80 leading-relaxed mb-4">
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
                                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-md bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Envoyer de l'argent</h3>
                                        <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 p-2 rounded-full">
                                            <XCircle className="size-5" />
                                        </button>
                                    </div>

                                    {!selectedUser ? (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                                <input
                                                    className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] transition-all"
                                                    placeholder="Nom, email ou ID..."
                                                    value={searchQuery}
                                                    onChange={(e) => handleSearchUsers(e.target.value)}
                                                />
                                            </div>
                                            <div className="min-h-[150px] max-h-[250px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                                {isSearching ? (
                                                    <div className="flex justify-center py-8">
                                                        <div className="size-6 border-2 border-[#FF6600] border-t-transparent rounded-full animate-spin" />
                                                    </div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map(user => (
                                                        <button
                                                            key={user.id}
                                                            onClick={() => setSelectedUser(user)}
                                                            className="w-full flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl text-left transition-all"
                                                        >
                                                            <div className="size-10 rounded-lg bg-orange-50 flex items-center justify-center text-[#FF6600] font-black text-sm">
                                                                {user.nom_complet?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800">{user.nom_complet}</p>
                                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                                                            </div>
                                                        </button>
                                                    ))
                                                ) : searchQuery.length >= 2 ? (
                                                    <div className="text-center py-8 text-sm font-medium text-slate-400">Aucun utilisateur trouvé</div>
                                                ) : (
                                                    <div className="text-center py-8 text-xs font-medium text-slate-400">Recherchez le destinataire pour continuer</div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                                <div className="size-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6600] font-black text-lg">
                                                    {selectedUser.nom_complet?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate">{selectedUser.nom_complet}</p>
                                                    <p className="text-xs text-slate-500 truncate">{selectedUser.email}</p>
                                                </div>
                                                <button onClick={() => setSelectedUser(null)} className="text-[10px] font-black text-slate-400 hover:text-[#FF6600] bg-white border border-slate-200 px-2 py-1 rounded">Changer</button>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700 ml-1">Montant à envoyer (GNF)</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        className="w-full h-14 pl-4 pr-16 bg-white border border-slate-200 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] rounded-xl text-xl font-black tabular-nums transition-all"
                                                        placeholder="0"
                                                        value={amount}
                                                        onChange={(e) => setAmount(e.target.value)}
                                                    />
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">GNF</div>
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        Solde dispo : <span className="font-bold text-slate-900">{balance.toLocaleString()} GNF</span>
                                                    </p>
                                                    <button onClick={() => setAmount(balance.toString())} className="text-[10px] font-black text-[#FF6600] hover:underline">MAX</button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleTransfer}
                                                disabled={isTransferring || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                                                className="w-full h-12 flex items-center justify-center gap-2 bg-[#FF6600] text-white rounded-xl font-black text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
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
            </div>
        </DashboardLayout>
    );
};

export default Wallet;
