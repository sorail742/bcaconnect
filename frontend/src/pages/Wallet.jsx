import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
    PlusCircle, ArrowUpRight, ShoppingBag, History,
    CheckCircle2, Clock, TrendingUp, Wallet,
    ArrowDownLeft, Activity, Zap, Lock, Cpu
} from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import walletService from '../services/walletService';
import { toast } from 'sonner';

const UserWallet = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [depositAmount, setDepositAmount] = useState('');
    const [showDepositForm, setShowDepositForm] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletData, txData] = await Promise.all([
                    walletService.getMyWallet(),
                    walletService.getTransactions()
                ]);
                setWallet(walletData);
                setTransactions(txData || []);
            } catch {
                toast.error("Erreur lors du chargement du portefeuille");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDeposit = async (e) => {
        e.preventDefault();
        const amount = parseFloat(depositAmount);
        if (!amount || isNaN(amount) || amount <= 0) {
            toast.error('Veuillez saisir un montant valide');
            return;
        }
        try {
            const data = await walletService.initiateDeposit({ montant: amount, moyen_paiement: 'orange_money' });
            if (data.payment_url) {
                toast.info('Redirection vers le portail de paiement...');
                window.open(data.payment_url, '_blank');
            }
            setShowDepositForm(false);
            setDepositAmount('');
        } catch {
            toast.error("Erreur lors de l'initiation du dépôt");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'depot': return ArrowDownLeft;
            case 'achat': return ShoppingBag;
            case 'remboursement': return History;
            case 'retrait': return ArrowUpRight;
            default: return History;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'depot': return 'Dépôt';
            case 'achat': return 'Achat';
            case 'retrait': return 'Retrait';
            case 'remboursement': return 'Remboursement';
            default: return type;
        }
    };

    return (
        <DashboardLayout title="Mon Portefeuille">
            <div className="space-y-6 pb-10">

                {/* Header card */}
                <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                <Wallet className="size-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Mon Portefeuille</h2>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                    <p className="text-xs text-muted-foreground">Synchronisé en temps réel</p>
                                </div>
                            </div>
                        </div>
                        <Activity className="size-5 text-muted-foreground hidden sm:block" />
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Balance + actions */}
                    <div className="xl:col-span-2 space-y-4">
                        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Solde disponible</p>
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-4xl font-bold text-foreground tabular-nums">
                                            {isLoading ? "••••••" : parseFloat(wallet?.solde_virtuel || 0).toLocaleString('fr-GN')}
                                        </h3>
                                        <span className="text-xl font-bold text-primary">GNF</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mt-2">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.5 }}
                                            className="bg-primary h-full rounded-full"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-48">
                                    {showDepositForm ? (
                                        <form onSubmit={handleDeposit} className="flex flex-col gap-2">
                                            <input
                                                type="number"
                                                min="1"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                placeholder="Montant (GNF)"
                                                className="h-10 w-full px-3 bg-muted border border-border rounded-xl text-sm outline-none focus:border-primary/40 text-foreground"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <button type="submit" className="flex-1 h-9 bg-primary text-primary-foreground rounded-xl font-semibold text-xs transition-all">Confirmer</button>
                                                <button type="button" onClick={() => setShowDepositForm(false)} className="flex-1 h-9 bg-muted border border-border rounded-xl font-semibold text-xs text-muted-foreground hover:text-foreground transition-all">Annuler</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setShowDepositForm(true)}
                                                className="h-10 w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <PlusCircle className="size-4" />
                                                Déposer
                                            </button>
                                            <button className="h-10 w-full bg-muted text-muted-foreground border border-border rounded-xl font-semibold text-sm hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2">
                                                <ArrowUpRight className="size-4" />
                                                Retirer
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-border flex items-center gap-3">
                                <Activity className="size-4 text-primary" />
                                <h3 className="text-sm font-bold text-foreground">Historique des transactions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[600px]">
                                    <thead>
                                        <tr className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            <th className="px-4 py-3 text-left">Référence</th>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-left">Type</th>
                                            <th className="px-4 py-3 text-left">Montant</th>
                                            <th className="px-4 py-3 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {isLoading ? (
                                            [1,2,3,4].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan="5" className="px-4 py-4">
                                                        <div className="h-6 bg-muted rounded-lg w-full" />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : transactions.length > 0 ? (
                                            transactions.map((txn, idx) => {
                                                const Icon = getIcon(txn.type_transaction);
                                                const isPositive = ['depot', 'remboursement'].includes(txn.type_transaction);
                                                return (
                                                    <tr key={txn.id || idx} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="text-xs font-mono font-semibold text-primary">
                                                                #{(txn.id?.slice(0, 10) || txn.reference_externe || 'REF').toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div>
                                                                <p className="text-xs font-medium text-foreground">{new Date(txn.createdAt).toLocaleDateString('fr-GN')}</p>
                                                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                                    <Clock className="size-3" />
                                                                    {new Date(txn.createdAt).toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="size-7 rounded-lg bg-muted border border-border flex items-center justify-center">
                                                                    <Icon className="size-3.5 text-muted-foreground" />
                                                                </div>
                                                                <span className="text-xs font-medium text-foreground">{getTypeLabel(txn.type_transaction)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "text-sm font-bold tabular-nums",
                                                                isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                                                            )}>
                                                                {isPositive ? '+' : '-'}{parseFloat(txn.montant).toLocaleString('fr-GN')}
                                                                <span className="text-xs text-muted-foreground ml-1">GNF</span>
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-right">
                                                            <StatusBadge status={txn.statut} />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-12 text-center">
                                                    <Zap className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                                                    <p className="text-sm text-muted-foreground">Aucune transaction pour le moment</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right panel */}
                    <div className="space-y-4">
                        {/* Virtual card */}
                        <div className="bg-foreground text-background rounded-2xl p-5 shadow-sm aspect-[1.6/1] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
                            <div className="flex justify-between items-start relative z-10">
                                <div className="size-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                                    <Cpu className="size-5 text-primary" />
                                </div>
                                <span className="text-xs font-semibold bg-white/10 border border-white/20 px-3 py-1 rounded-lg">BCA Card</span>
                            </div>
                            <div className="relative z-10 space-y-2">
                                <p className="text-xs text-background/60 font-medium">Identifiant</p>
                                <p className="text-base font-mono font-bold">•••• ••• ••• 4492</p>
                                <div className="flex justify-between items-end pt-2 border-t border-white/10">
                                    <div>
                                        <p className="text-xs text-background/50">Titulaire</p>
                                        <p className="text-sm font-bold">{user?.nom_complet || 'Membre BCA'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-background/50">Exp.</p>
                                        <p className="text-sm font-bold font-mono">12/28</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                            <h4 className="text-sm font-bold text-foreground mb-3">Moyens de paiement</h4>
                            <div className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border hover:border-primary/40 transition-colors cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="size-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                        <span className="text-xs font-bold text-orange-500">OM</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">Orange Money</p>
                                        <p className="text-xs text-muted-foreground">+224 62X XX XX 12</p>
                                    </div>
                                </div>
                                <CheckCircle2 className="size-4 text-emerald-500" />
                            </div>
                            <button className="mt-3 w-full h-9 rounded-xl border-2 border-dashed border-border text-xs font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
                                <PlusCircle className="size-4" />
                                Ajouter un moyen de paiement
                            </button>
                        </div>

                        {/* Security */}
                        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <Lock className="size-4 text-primary" />
                                </div>
                                <h4 className="text-sm font-bold text-foreground">Sécurité</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Votre portefeuille est chiffré et sécurisé. Toutes les opérations nécessitent une validation PIN.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserWallet;
