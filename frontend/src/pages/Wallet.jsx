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
            <div className="w-full space-y-12 animate-in fade-in duration-1000 font-inter pb-24 px-4 md:px-8">
                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HEADER — FINANCIAL CENTER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="size-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Fintech Elite BCA Connect</span>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic leading-[0.85] uppercase">
                                Gestion du <br />
                                <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-[-2px]">Patrimoine Scellé.</span>
                            </h1>
                            <p className="text-sm text-slate-500 font-bold max-w-xl leading-relaxed italic border-l-4 border-primary/20 pl-6">
                                Vos actifs sont protégés par le protocole BCA Guard. Le solde en séquestre garantit la sécurité de chaque transaction marketplace jusqu'à validation finale.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                             <div className="px-6 py-4 flex flex-col items-end">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score de Confiance</span>
                                 <span className="text-lg font-black text-slate-900 dark:text-white italic">AA+ PREMIUM</span>
                             </div>
                             <div className="size-14 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                 <Shield className="size-6" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — THE ELITE BALANCE HUB
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 p-12 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 relative overflow-hidden group border-2 border-slate-900 dark:border-white bg-slate-950 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] rounded-[3.5rem]">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,rgba(43,90,255,0.15),transparent_50%)]"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -ml-40 -mb-40"></div>
                        
                        <div className="space-y-8 relative z-10 w-full">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                                    <Wallet className="text-primary size-5" />
                                </div>
                                <div className="flex flex-col">
                                     <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Liquidité Marketplace BCA</p>
                                     <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">Protocole de Séquestre Actif</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-baseline gap-4">
                                    <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none italic">
                                        {isLoading ? "••••••" : parseFloat(wallet?.solde_virtuel || 0).toLocaleString('fr-FR')}
                                    </h3>
                                    <span className="text-3xl font-black text-primary uppercase italic tracking-tighter">GNF</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-6 mt-6">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                         <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                         <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">SÉCURISÉ</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                         <TrendingUp className="size-4 text-primary" />
                                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">+5.2% FLUX MENSUEL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 w-full xl:w-72 relative z-10">
                            <Button
                                onClick={handleDeposit}
                                className="h-20 w-full rounded-2xl bg-white text-slate-900 hover:bg-primary hover:text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.97]"
                            >
                                <PlusCircle className="size-5 mr-3" />
                                Abonder
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-20 w-full rounded-2xl border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-[0.3em] text-[12px] backdrop-blur-xl transition-all"
                            >
                                <ArrowUpRight className="size-5 mr-3 text-primary" />
                                Décaisser
                            </Button>
                        </div>
                    </div>

                    <div className="p-10 border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-12">
                            <div className="space-y-1">
                                <h4 className="font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Flux de Trésorerie</h4>
                                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest leading-none">Analyse Hebdomadaire</p>
                            </div>
                            <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10">
                                <BarChart3 className="text-primary size-5" />
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="flex justify-between items-end h-32 gap-4 px-2">
                                {[40, 65, 95, 55].map((height, i) => (
                                    <div key={i} className="w-full relative group/bar">
                                        <div 
                                            style={{ height: `${height}%` }}
                                            className={cn(
                                                "w-full rounded-xl transition-all duration-500 cursor-pointer relative",
                                                i === 2 ? "bg-primary shadow-[0_15px_30px_-5px_rgba(43,90,255,0.4)]" : "bg-slate-100 dark:bg-slate-800 hover:bg-primary/20"
                                            )}
                                        />
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap shadow-2xl z-20">
                                            {(i + 1) * 1.2}M GNF
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400 font-black tracking-[0.2em] border-t border-slate-50 dark:border-slate-800 pt-6 uppercase italic">
                                <span>Sem 01</span><span>Sem 02</span><span className="text-primary">Sem 03</span><span>Sem 04</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                    {/* ══════════════════════════════════════════════════
                        SECTION 2 — TRANSACTION LEDGER
                    ══════════════════════════════════════════════════ */}
                    <div className="xl:col-span-2 space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-4">
                                <div className="size-1.5 rounded-full bg-primary" />
                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Registre des Mouvements</h3>
                            </div>
                            <button className="px-6 py-2 rounded-full border border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3">
                                Export PDF <ChevronRight className="size-3" />
                            </button>
                        </div>
                        <div className="rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800 overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] border-b-2 border-slate-50 dark:border-slate-800">
                                            <th className="px-10 py-6">ID / RÉFÉRENCE</th>
                                            <th className="px-10 py-6">CHRONOLOGIE</th>
                                            <th className="px-10 py-6">DÉSIGNATION</th>
                                            <th className="px-10 py-6">FLUX</th>
                                            <th className="px-10 py-6 text-right">STATUT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {transactions.map((txn, idx) => {
                                            const Icon = getIcon(txn.type_transaction);
                                            const isPositive = txn.type_transaction === 'depot' || txn.type_transaction === 'remboursement';
                                            return (
                                                <tr key={txn.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all cursor-default group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[10px] font-black text-primary italic">#{txn.id?.slice(0, 8) || txn.reference_externe}</span>
                                                            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">BCA-TX-GLOBAL</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-3">
                                                            <Clock className="size-3 text-slate-300" />
                                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(txn.createdAt).toLocaleDateString('fr-FR')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-5">
                                                            <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors shadow-sm">
                                                                <Icon className="size-5" />
                                                            </div>
                                                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                                                                {txn.type_transaction === 'depot' ? 'Incrémentation Capital' :
                                                                    txn.type_transaction === 'achat' ? 'Acquisition Marketplace' :
                                                                        txn.type_transaction === 'retrait' ? 'Liquidation Fonds' :
                                                                        txn.metadata?.desc || 'Ordre Logistique'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className={cn(
                                                            "text-sm font-black tracking-tighter italic",
                                                            isPositive ? "text-emerald-500" : "text-slate-900 dark:text-white"
                                                        )}>
                                                            {isPositive ? '+ ' : '- '}{parseFloat(txn.montant).toLocaleString('fr-FR')} 
                                                            <span className="text-[9px] ml-2 opacity-50 uppercase tracking-widest">GNF</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8 text-right">
                                                        <StatusBadge status={txn.statut} variant={getStatusVariant(txn.statut)} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {transactions.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                         <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200">
                                                              <History className="size-8" />
                                                         </div>
                                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Aucun mouvement scellé</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 dark:text-white">Actif & Identité</h3>
                            <button className="text-primary text-[9px] font-black uppercase tracking-widest hover:text-primary/70 transition-all italic">Paramètres</button>
                        </div>
                        <div className="space-y-8">
                            {/* ══════════════════════════════════════════════════
                                THE BCA PRIVILEGE CARD — VISUAL ANCHOR
                            ══════════════════════════════════════════════════ */}
                            <div className="relative overflow-hidden bg-slate-950 p-10 text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] group border-2 border-slate-900 rounded-[3rem] font-sans aspect-[1.6/1] transition-transform duration-700 hover:scale-[1.02]">
                                <div className="absolute top-0 right-0 size-80 bg-primary/20 rounded-full blur-[80px] -mr-40 -mt-40 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 size-60 bg-white/5 rounded-full blur-[60px] -ml-30 -mb-30"></div>
                                
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="size-14 rounded-2xl bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                                            <CreditCard className="size-7 text-primary" />
                                        </div>
                                        <div className="px-5 py-2 bg-primary/20 backdrop-blur-md text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border border-primary/30 italic shadow-lg">BCA PRIVILEGE ELITE</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[9px] opacity-40 tracking-[0.4em] font-black uppercase">Capital Accession Code</p>
                                        <p className="text-2xl md:text-3xl font-black tracking-[0.25em] italic">•••• •••• •••• 8842</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-end border-t border-white/10 pt-6">
                                        <div className="space-y-1">
                                            <p className="text-[8px] opacity-30 uppercase font-black tracking-widest mb-1">Détenteur de l'Actif</p>
                                            <p className="text-sm font-black truncate uppercase tracking-widest italic text-primary">ELITE INVESTOR</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[8px] opacity-30 uppercase font-black tracking-widest mb-1">Validité</p>
                                            <p className="text-sm font-black tracking-[0.2em] italic">09 / 26</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Shimmer Effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            </div>

                            {/* Local Bank & Mobile Money */}
                            <div className="grid grid-cols-1 gap-5">
                                <div className="p-6 flex items-center justify-between border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-5">
                                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/item:bg-primary/5 group-hover/item:text-primary transition-colors border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <Landmark className="size-6" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Commerce & Industrie Guinée</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">GU45 •••• •••• 8291</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 flex items-center justify-between border-2 border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-5">
                                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-sm">
                                            <div className="size-8 bg-orange-500 rounded-lg text-white flex items-center justify-center text-[10px] font-black italic">OM</div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Orange Partner Hub</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">+224 624 88 •• 12</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full border-2 border-dashed border-slate-100 dark:border-slate-800 p-8 rounded-[2rem] text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-4 group/add">
                                <PlusCircle className="size-5 group-hover/add:rotate-90 transition-transform" />
                                Intégrer un Nouveau Flux
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Badge - Standardized Elite */}
                <div className="flex flex-wrap items-center justify-center gap-x-20 gap-y-8 py-16 border-t border-slate-50 dark:border-slate-800 mt-16 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-4 group/sec">
                        <div className="size-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 group-hover/sec:scale-110 transition-transform">
                             <Shield className="size-5" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Cryptage Militaire</span>
                             <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">SSL 256-BIT Scellé</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group/sec">
                        <div className="size-12 rounded-2xl bg-emerald-500/5 flex items-center justify-center text-emerald-600 border border-emerald-500/10 group-hover/sec:scale-110 transition-transform">
                             <CheckCircle2 className="size-5" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Protection Active</span>
                             <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Anti-Fraude IA BCA</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group/sec">
                        <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800 group-hover/sec:scale-110 transition-transform">
                             <Clock className="size-5" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white">Support Prioritaire</span>
                             <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Assistance 24/7/365</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserWallet;
