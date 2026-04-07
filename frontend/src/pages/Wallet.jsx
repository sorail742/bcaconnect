import React, { useState } from 'react';
import { useWallet } from '../hooks/useDomainData';
import { LoadingState, ErrorState } from '../components/ui/DataStates';
import { Wallet as WalletIcon, Send, Plus, History, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Wallet = () => {
    const { data: wallet, loading, error } = useWallet();
    const [showTransactions, setShowTransactions] = useState(false);

    const transactions = wallet?.transactions || [];
    const balance = wallet?.solde_virtuel || 0;
    const pending = wallet?.solde_en_attente || 0;

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <WalletIcon className="size-8 text-primary" />
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                            Mon Portefeuille
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        Gérez vos fonds et transactions
                    </p>
                </div>

                {loading ? (
                    <LoadingState message="Chargement du portefeuille..." />
                ) : error ? (
                    <ErrorState error={error} />
                ) : (
                    <div className="space-y-8">
                        {/* Balance Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Balance */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-semibold opacity-90">Solde Principal</h3>
                                    <Lock className="size-5" />
                                </div>
                                <p className="text-4xl font-bold mb-2">
                                    {balance.toLocaleString('fr-FR', {
                                        style: 'currency',
                                        currency: 'GNF'
                                    })}
                                </p>
                                <p className="text-sm opacity-75">Disponible immédiatement</p>
                            </motion.div>

                            {/* Pending Balance */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-card border border-border rounded-2xl p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-semibold text-muted-foreground">En Attente</h3>
                                    <TrendingUp className="size-5 text-yellow-500" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-2">
                                    {pending.toLocaleString('fr-FR', {
                                        style: 'currency',
                                        currency: 'GNF'
                                    })}
                                </p>
                                <p className="text-sm text-muted-foreground">Sera crédité sous 24h</p>
                            </motion.div>

                            {/* Total */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-card border border-border rounded-2xl p-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-sm font-semibold text-muted-foreground">Total</h3>
                                    <WalletIcon className="size-5 text-primary" />
                                </div>
                                <p className="text-3xl font-bold text-foreground mb-2">
                                    {(balance + pending).toLocaleString('fr-FR', {
                                        style: 'currency',
                                        currency: 'GNF'
                                    })}
                                </p>
                                <p className="text-sm text-muted-foreground">Solde total</p>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all">
                                <Plus className="size-5" />
                                Ajouter des fonds
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all">
                                <Send className="size-5" />
                                Envoyer de l'argent
                            </button>
                            <button
                                onClick={() => setShowTransactions(!showTransactions)}
                                className="flex items-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-all"
                            >
                                <History className="size-5" />
                                Historique
                            </button>
                        </div>

                        {/* Transactions */}
                        {showTransactions && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-card border border-border rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold text-foreground mb-6">Historique des transactions</h3>
                                {transactions.length > 0 ? (
                                    <div className="space-y-4">
                                        {transactions.map((tx, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                                                <div>
                                                    <p className="font-semibold text-foreground">{tx.description}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                                <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {tx.type === 'credit' ? '+' : '-'}
                                                    {tx.montant.toLocaleString('fr-FR', {
                                                        style: 'currency',
                                                        currency: 'GNF'
                                                    })}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">Aucune transaction</p>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wallet;
