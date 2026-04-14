import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useDomainData';
import { WalletSkeleton } from '../components/ui/Loader';
import { ErrorState } from '../components/ui/DataStates';
import { Wallet as WalletIcon, Send, Plus, Minus, History, TrendingUp, Lock, RefreshCcw, XCircle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import walletService from '../services/walletService';
import userService from '../services/userService';
import { toast } from 'sonner';
import { useSocket } from '../hooks/useSocket';
import { Search, Info, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const Wallet = () => {
    const { data: wallet, loading, error, mutate } = useWallet();
    const [showTransactions, setShowTransactions] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [isTransferring, setIsTransferring] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const { on, off } = useSocket();

    useEffect(() => {
        const handleWalletUpdate = (payload) => {
            toast.success(`Portefeuille mis à jour : +${payload.amount.toLocaleString()} GNF`, {
                icon: <CheckCircle2 className="size-5 text-emerald-500" />
            });
            mutate(); // Refresh the wallet data
        };

        on('wallet_updated', handleWalletUpdate);
        return () => off('wallet_updated', handleWalletUpdate);
    }, [on, off, mutate]);

    const transactions = wallet?.transactions || [];
    const balance = wallet?.solde_virtuel || 0;
    const pending = wallet?.solde_en_attente || 0;

    const handleDeposit = async () => {
        const amount = window.prompt("Entrez le montant à déposer (GNF):", "100000");
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) return;

        try {
            setIsDepositing(true);
            toast.loading("Initialisation du dépôt...");
            
            const response = await walletService.initiateDeposit({
                amount: parseFloat(amount),
                currency: 'GNF',
                method: 'wallet_topup'
            });

            if (response.payment_url) {
                toast.success("Redirection vers la passerelle de paiement...");
                window.location.href = response.payment_url;
            } else {
                toast.success("Dépôt simulé réussi ! (Mode test)");
                mutate(); // Recharger les données
            }
        } catch (err) {
            toast.error("Erreur d'initialisation du dépôt.");
        } finally {
            setIsDepositing(false);
            toast.dismiss();
        }
    };

    const handleSearchUsers = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const data = await userService.getAll(1, 10, query);
            setSearchResults(data.users || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedUser || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
            toast.error("Veuillez remplir correctement les champs.");
            return;
        }

        if (parseFloat(amount) > balance) {
            toast.error("Solde insuffisant.");
            return;
        }

        try {
            setIsTransferring(true);
            toast.loading("Transfert en cours...", { id: 'transfer-toast' });
            
            await walletService.transfer({
                recipientId: selectedUser.id,
                amount: parseFloat(amount),
                description: `Transfert P2P vers ${selectedUser.nom_complet}`
            });

            toast.success("Transfert réussi !", { id: 'transfer-toast' });
            setIsTransferModalOpen(false);
            setSelectedUser(null);
            setAmount('');
            setSearchQuery('');
            setSearchResults([]);
            mutate();
        } catch (err) {
            toast.error(err.response?.data?.message || "Erreur lors du transfert.", { id: 'transfer-toast' });
        } finally {
            setIsTransferring(false);
        }
    };

    const handleSend = () => {
        setIsTransferModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <WalletIcon className="size-6 text-primary" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                                Mon <span className="text-primary">Portefeuille</span>
                            </h1>
                        </div>
                        <p className="text-lg text-muted-foreground uppercase tracking-widest text-[10px] font-black opacity-60">
                            GESTION DES FLUX FINANCIERS ALPHA
                        </p>
                    </div>
                    <button onClick={() => mutate()} className="h-10 px-4 bg-muted border border-border rounded-xl text-xs font-bold hover:bg-muted/80 transition-all flex items-center gap-2">
                        <RefreshCcw className="size-3" /> ACTUALISER LE NOEUD
                    </button>
                </div>

                {loading ? (
                    <WalletSkeleton />
                ) : error ? (
                    <ErrorState error={error} />
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Balance */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 dark:bg-white rounded-3xl p-8 text-white dark:text-slate-900 shadow-2xl relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 size-40 bg-primary/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">ACTIVE_BALANCE_ALPHA</h3>
                                    <Lock className="size-5 opacity-40" />
                                </div>
                                <p className="text-5xl font-black mb-4 tabular-nums tracking-tighter relative z-10">
                                    {balance.toLocaleString('fr-GN')}
                                    <span className="text-sm ml-2 font-black text-primary uppercase">GNF</span>
                                </p>
                                <div className="flex items-center gap-2 relative z-10">
                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[9px] font-black uppercase opacity-60">SÉCURITÉ INFRASTRUCTURE ACTVE</p>
                                </div>
                            </motion.div>

                            {/* Pending Balance */}
                            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">FLUX_EN_SUSPENS</h3>
                                    <TrendingUp className="size-5 text-amber-500" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-foreground mb-2 tabular-nums tracking-tight">
                                        {pending.toLocaleString('fr-GN')} <span className="text-xs font-black text-muted-foreground uppercase">GNF</span>
                                    </p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">CRÉDITÉ SOUS 24H APRÈS VÉRIFICATION</p>
                                </div>
                            </div>

                            {/* Global Total */}
                            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">VALEUR_TOTALE_DES_ACTIFS</h3>
                                    <Activity className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-foreground mb-2 tabular-nums tracking-tight">
                                        {(balance + pending).toLocaleString('fr-GN')} <span className="text-xs font-black text-muted-foreground uppercase">GNF</span>
                                    </p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">FLUX CONSOLIDÉS DÉTECTÉS</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions Control Panel */}
                        <div className="flex flex-wrap items-center gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                            <button 
                                onClick={handleDeposit}
                                disabled={isDepositing}
                                className="h-14 px-8 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                <Plus className="size-5" /> ALIMENTER LE COMPTE
                            </button>
                            <button 
                                onClick={handleSend}
                                className="h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 shadow-xl"
                            >
                                <Send className="size-5" /> TRANSFÉRER
                            </button>
                            <div className="h-14 w-px bg-border mx-2 hidden md:block" />
                            <button
                                onClick={() => setShowTransactions(!showTransactions)}
                                className={cn(
                                    "h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border border-border",
                                    showTransactions ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                                )}
                            >
                                <History className="size-5" /> {showTransactions ? "MASQUER L'HISTORIQUE" : "VOIR L'HISTORIQUE"}
                            </button>
                        </div>

                        {/* Transactions Ledger */}
                        <AnimatePresence>
                            {showTransactions && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-[10px] font-black text-foreground uppercase tracking-widest">REGISTRE_DES_TRANSACTIONS_RÉCENTES</h3>
                                            <div className="flex items-center gap-2">
                                                <div className="size-2 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">SCELLÉ_SUR_BCA_SYNC</span>
                                            </div>
                                        </div>
                                        
                                        {transactions.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {transactions.map((tx, idx) => (
                                                    <div key={tx.id || idx} className="flex items-center justify-between p-5 bg-muted/30 rounded-2xl border border-border/50 hover:bg-muted/50 transition-colors group">
                                                        <div className="flex items-center gap-5">
                                                            <div className={cn(
                                                                "size-10 rounded-xl flex items-center justify-center border",
                                                                tx.type === 'credit' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-primary/10 border-primary/20 text-primary"
                                                            )}>
                                                                {tx.type === 'credit' ? <Plus className="size-5" /> : <Minus className="size-5" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-foreground uppercase tracking-tight">{tx.description || 'TRANSFERT_BCA'}</p>
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
                                                                    {new Date(tx.createdAt || tx.date).toLocaleDateString('fr-GN')} • ID: {(tx.id || 'N/A').slice(0, 8)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={cn(
                                                                "text-sm font-black tabular-nums tracking-tight",
                                                                tx.type === 'credit' ? "text-emerald-500" : "text-foreground"
                                                            )}>
                                                                {tx.type === 'credit' ? '+' : '-'} {parseFloat(tx.montant).toLocaleString('fr-GN')}
                                                            </p>
                                                            <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">{tx.statut?.toUpperCase() || 'VALIDÉ'}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                                                <XCircle className="size-10" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">AUCUN_FLUX_DÉTECTÉ_DANS_CE_NOEUD</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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
                            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-card border border-border rounded-[2rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Transfert Direct</h3>
                                    <button onClick={() => setIsTransferModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                        <XCircle className="size-6" />
                                    </button>
                                </div>

                                {!selectedUser ? (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                            <input
                                                className="w-full h-12 pl-12 pr-4 bg-muted border border-border rounded-2xl text-sm outline-none focus:border-primary transition-all"
                                                placeholder="Rechercher par nom ou email..."
                                                value={searchQuery}
                                                onChange={(e) => handleSearchUsers(e.target.value)}
                                            />
                                        </div>
                                        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {isSearching ? (
                                                <div className="text-center py-4 text-xs font-bold text-muted-foreground animate-pulse">RECHERCHE EN COURS...</div>
                                            ) : searchResults.length > 0 ? (
                                                searchResults.map(user => (
                                                    <button
                                                        key={user.id}
                                                        onClick={() => setSelectedUser(user)}
                                                        className="w-full flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted rounded-2xl border border-border/50 text-left transition-all"
                                                    >
                                                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                                                            {user.nom_complet?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground">{user.nom_complet}</p>
                                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{user.role}</p>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : searchQuery.length >= 2 ? (
                                                <div className="text-center py-4 text-xs font-bold text-muted-foreground">AUCUN RÉSULTAT</div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                                                {selectedUser.nom_complet?.[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-black text-foreground">{selectedUser.nom_complet}</p>
                                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{selectedUser.email}</p>
                                            </div>
                                            <button onClick={() => setSelectedUser(null)} className="text-[10px] font-black text-primary hover:underline">CHANGER</button>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">MONTANT (GNF)</label>
                                            <input
                                                type="number"
                                                className="w-full h-14 px-6 bg-muted border border-border rounded-2xl text-xl font-black tabular-nums outline-none focus:border-primary transition-all"
                                                placeholder="0.00"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            <p className="text-[10px] text-muted-foreground font-medium italic px-1">
                                                Solde disponible : <span className="font-black text-foreground">{balance.toLocaleString()} GNF</span>
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                                            <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 leading-normal">
                                                Les transferts P2P sont instantanés et irréversibles. Assurez-vous de l'identité du destinataire.
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleTransfer}
                                            disabled={isTransferring || !amount || parseFloat(amount) <= 0}
                                            className="w-full h-14 bg-primary text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary/20"
                                        >
                                            {isTransferring ? 'TRAITEMENT EN COURS...' : 'CONFIRMER LE TRANSFERT'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Wallet;
