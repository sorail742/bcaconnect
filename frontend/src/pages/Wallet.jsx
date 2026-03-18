import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    PlusCircle,
    ArrowUpRight,
    BarChart3,
    ShoppingBag,
    Landmark,
    History,
    CreditCard,
    CheckCircle2,
    Clock,
    TrendingUp,
    Shield,
    Wallet,
    Search,
    Filter,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import walletService from '../services/walletService';

const UserWallet = () => {
    const [wallet, setWallet] = React.useState(null);
    const [transactions, setTransactions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletData, txData] = await Promise.all([
                    walletService.getMyWallet(),
                    walletService.getTransactions()
                ]);
                setWallet(walletData);
                setTransactions(txData);
            } catch (error) {
                console.error("Erreur chargement portefeuille:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'complete': return 'success';
            case 'en_attente': return 'warning';
            case 'echoue': return 'danger';
            default: return 'neutral';
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'depot': return Landmark;
            case 'achat': return ShoppingBag;
            case 'remboursement': return History;
            case 'retrait': return CreditCard;
            default: return History;
        }
    };

    const handleDeposit = async () => {
        const amount = window.prompt("Entrez le montant à déposer (GNF):", "500000");
        if (!amount || isNaN(amount)) return;

        try {
            const data = await walletService.initiateDeposit({
                montant: parseFloat(amount),
                moyen_paiement: 'orange_money'
            });

            if (data.payment_url) {
                alert(`Redirection vers le portail de paiement : ${data.payment_url}`);
                // Simulation d'un succès après redirection (dans un vrai cas, on attendrait le webhook)
                window.location.reload();
            }
        } catch (error) {
            alert("Erreur lors de l'initiation du dépôt.");
        }
    };

    return (
        <DashboardLayout title="Mon Portefeuille">
            <div className="w-full space-y-10 animate-in fade-in duration-700 font-inter pb-20 px-4 md:px-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">Centre Financier</span>
                        <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter italic leading-none">
                            Gérez vos finances <br />
                            <span className="text-primary not-italic text-3xl md:text-4xl">avec une précision totale.</span>
                        </h2>
                        <p className="text-muted-foreground font-medium max-w-xl">Votre solde BCA Connect vous permet de régler vos commandes instantanément et en toute sécurité en Guinée.</p>
                    </div>
                </div>

                {/* Top Section: Balance & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden group border-border bg-slate-900 shadow-2xl rounded-[2.5rem]">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-32 -mb-32"></div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                                    <Wallet className="text-primary size-4" />
                                </div>
                                <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">Solde Disponible</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <h3 className="text-5xl md:text-6xl font-black text-white tracking-tighter italic leading-none">
                                    {isLoading ? "Chargement..." : parseFloat(wallet?.solde_virtuel || 0).toLocaleString('fr-FR')} <span className="text-2xl not-italic opacity-50">GNF</span>
                                </h3>
                                <div className="flex items-center gap-4">
                                    <span className="text-emerald-400 font-black flex items-center text-[10px] bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 uppercase tracking-widest">
                                        <TrendingUp className="size-3 mr-1.5" /> +5.2% ce mois
                                    </span>
                                    <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Sécurisé par BCA Guard</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto relative z-10 self-end md:self-center">
                            <Button
                                onClick={handleDeposit}
                                className="flex-1 md:flex-none h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
                            >
                                <PlusCircle className="size-4 mr-2.5" />
                                Recharger
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] border-white/10 text-white hover:bg-white/5 transition-all">
                                <ArrowUpRight className="size-4 mr-2.5" />
                                Retirer
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-8 border-border bg-card rounded-[2.5rem] shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-700"></div>
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Activité Mensuelle</h4>
                            <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                                <BarChart3 className="text-primary size-4" />
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-end h-28 gap-3 px-2">
                                <div className="w-full bg-primary/10 rounded-xl h-[40%] hover:h-[45%] transition-all cursor-help relative group/bar" title="Semaine 1">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">1.2M</div>
                                </div>
                                <div className="w-full bg-primary/20 rounded-xl h-[60%] hover:h-[65%] transition-all cursor-help relative group/bar" title="Semaine 2">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">2.8M</div>
                                </div>
                                <div className="w-full bg-primary rounded-xl h-[85%] shadow-xl shadow-primary/20 cursor-help relative group/bar" title="Semaine actuelle">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">4.3M</div>
                                </div>
                                <div className="w-full bg-primary/40 rounded-xl h-[50%] hover:h-[55%] transition-all cursor-help relative group/bar" title="Semaine 4">
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">1.9M</div>
                                </div>
                            </div>
                            <div className="flex justify-between text-[9px] text-muted-foreground font-black tracking-[0.3em] border-t border-border pt-5">
                                <span>SEM 01</span><span>SEM 02</span><span>SEM 03</span><span>SEM 04</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Transaction History */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <History className="text-primary size-5" />
                                <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Derniers Mouvements</h3>
                            </div>
                            <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline hover:translate-x-1 transition-transform flex items-center gap-2">
                                Historique Complet <ChevronRight className="size-3" />
                            </button>
                        </div>
                        <Card className="rounded-[2rem] border-border overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                                            <th className="px-8 py-6 italic">ID Transaction</th>
                                            <th className="px-8 py-6">Date</th>
                                            <th className="px-8 py-6">Description</th>
                                            <th className="px-8 py-6">Montant</th>
                                            <th className="px-8 py-6 text-right">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {transactions.map((txn, idx) => {
                                            const Icon = getIcon(txn.type_transaction);
                                            return (
                                                <tr key={txn.id || idx} className="hover:bg-muted/20 transition-all cursor-default group">
                                                    <td className="px-8 py-6 text-[11px] font-black tracking-tight text-primary italic">#{txn.id?.slice(0, 8) || txn.reference_externe}</td>
                                                    <td className="px-8 py-6 text-[11px] text-muted-foreground font-bold uppercase tracking-widest">{new Date(txn.createdAt).toLocaleDateString('fr-FR')}</td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="size-10 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500 border border-border">
                                                                <Icon className="size-4" />
                                                            </div>
                                                            <span className="text-sm font-black text-foreground tracking-tight italic">
                                                                {txn.type_transaction === 'depot' ? 'Rechargement portefeuile' :
                                                                    txn.type_transaction === 'achat' ? 'Achat sur BCA Connect' :
                                                                        txn.metadata?.desc || 'Transaction BCA'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className={cn(
                                                        "px-8 py-6 text-sm font-black tracking-tighter italic",
                                                        txn.type_transaction === 'depot' || txn.type_transaction === 'remboursement' ? "text-emerald-500" : "text-destructive"
                                                    )}>
                                                        {txn.type_transaction === 'depot' || txn.type_transaction === 'remboursement' ? '+' : '-'}{parseFloat(txn.montant).toLocaleString('fr-FR')} <span className="text-[10px] not-italic opacity-70">GNF</span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <StatusBadge status={txn.statut} variant={getStatusVariant(txn.statut)} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {transactions.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-10 text-center text-muted-foreground font-medium italic">Aucune transaction trouvée.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] italic">Cartes & Comptes</h3>
                            <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline transition-all">Gérer</button>
                        </div>
                        <div className="space-y-6">
                            {/* Premium Card Display */}
                            <Card className="relative overflow-hidden bg-slate-900 p-8 text-white shadow-2xl group border-none rounded-[2rem] hover:scale-[1.02] transition-transform duration-500 font-sans aspect-[1.6/1]">
                                <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full blur-[60px] -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 size-48 bg-blue-500/10 rounded-full blur-[50px] -ml-24 -mb-24"></div>

                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="size-12 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-inner">
                                            <CreditCard className="size-6 text-primary" />
                                        </div>
                                        <div className="px-3 py-1 bg-white/10 text-[8px] font-black uppercase tracking-[0.3em] rounded-full backdrop-blur-md border border-white/10">BCA Platinum Elite</div>
                                    </div>
                                    <div>
                                        <p className="text-[8px] opacity-40 mb-2 tracking-[0.3em] font-black uppercase">Numéro de carte</p>
                                        <p className="text-2xl font-black tracking-[0.15em] italic">•••• •••• •••• 8842</p>
                                    </div>
                                    <div className="flex justify-between items-end border-t border-white/5 pt-5">
                                        <div>
                                            <p className="text-[7px] opacity-30 uppercase font-black tracking-[0.2em] mb-1">Titulaire</p>
                                            <p className="text-[11px] font-black truncate uppercase italic tracking-wider">MARC SYLLA</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[7px] opacity-30 uppercase font-black tracking-[0.2em] mb-1">Exp.</p>
                                            <p className="text-[11px] font-black italic tracking-widest">09/26</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Local Bank & Mobile Money */}
                            <div className="grid grid-cols-1 gap-4">
                                <Card className="p-5 flex items-center justify-between hover:border-primary/50 group cursor-pointer transition-all duration-500 border-border bg-card rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/5 transition-colors border border-border group-hover:border-primary/20">
                                            <Landmark className="text-muted-foreground group-hover:text-primary size-6 transition-transform group-hover:scale-110" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight text-foreground italic">Société Générale GN</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5 tracking-tighter opacity-70">GN45 •••• •••• 1234</p>
                                        </div>
                                    </div>
                                    <div className="size-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 scale-0 group-hover:scale-100 transition-all duration-500">
                                        <CheckCircle2 className="size-3" />
                                    </div>
                                </Card>

                                <Card className="p-5 flex items-center justify-between hover:border-primary/50 group cursor-pointer transition-all duration-500 border-border bg-card rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-muted flex items-center justify-center group-hover:bg-[#ff6600]/10 transition-colors border border-border group-hover:border-[#ff6600]/20">
                                            <div className="size-6 bg-[#ff6600] rounded text-white flex items-center justify-center text-[8px] font-black">OM</div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-tight text-foreground italic">Orange Money</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase mt-0.5 tracking-tighter opacity-70">+224 624 •• •• 88</p>
                                        </div>
                                    </div>
                                    <div className="size-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 scale-0 group-hover:scale-100 transition-all duration-500">
                                        <CheckCircle2 className="size-3" />
                                    </div>
                                </Card>
                            </div>

                            <button className="w-full border-2 border-dashed border-border p-5 rounded-2xl text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all duration-500 flex items-center justify-center gap-3">
                                <PlusCircle className="size-4" />
                                Ajouter un support
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-10 border-t border-border mt-10">
                    <div className="flex items-center gap-3 opacity-60">
                        <Shield className="size-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Paiement 100% Sécurisé</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <CheckCircle2 className="size-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Données Chiffrées (AES-256)</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-60">
                        <Clock className="size-5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Support 24/7 Disponible</span>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserWallet;
