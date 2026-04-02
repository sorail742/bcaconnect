import React, { useState, useEffect } from 'react';
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
    ChevronRight,
    ChevronDown,
    ArrowDownLeft,
    Activity,
    Zap,
    Sparkles,
    Satellite,
    Fingerprint,
    ShieldAlert
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import { cn } from '../lib/utils';
import walletService from '../services/walletService';
import { toast } from 'sonner';

const UserWallet = () => {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [walletData, txData] = await Promise.all([
                    walletService.getMyWallet(),
                    walletService.getTransactions()
                ]);
                setWallet(walletData);
                setTransactions(txData || []);
            } catch (error) {
                console.error("Erreur chargement portefeuille:", error);
                toast.error("ÉCHEC DU CHARGEMENT DES DONNÉES FINANCIÈRES.");
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
            case 'depot': return ArrowDownLeft;
            case 'achat': return ShoppingBag;
            case 'remboursement': return History;
            case 'retrait': return ArrowUpRight;
            default: return History;
        }
    };

    const handleDeposit = async () => {
        const amount = window.prompt("ENTREZ LE MONTANT À DÉPOSER (GNF):", "500000");
        if (!amount || isNaN(amount)) return;

        try {
            const data = await walletService.initiateDeposit({
                montant: parseFloat(amount),
                moyen_paiement: 'orange_money'
            });

            if (data.payment_url) {
                toast.info("SYNCHRONISATION AVEC LE PORTAIL DE PAIEMENT...");
                window.open(data.payment_url, '_blank');
            }
        } catch (error) {
            toast.error("ERREUR LORS DE L'INITIATION DU FLUX DÉPÔT.");
        }
    };

    return (
        <DashboardLayout title="TERMINAL FINANCIER EXÉCUTIF">
            <div className="w-full space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 max-w-7xl mx-auto">

                {/* Balance Hero Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 p-12 md:p-16 bg-white rounded-[4rem] border-x-[16px] border-[#FF6600] shadow-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/10 rounded-full blur-[150px] pointer-events-none -mr-64 -mt-64 group-hover:scale-125 transition-transform duration-[4s]"></div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-16 relative z-10">
                            <div className="space-y-12">
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-[2.5rem] bg-black flex items-center justify-center text-[#FF6600] shadow-3xl group-hover:rotate-12 transition-transform duration-1000">
                                        <Wallet className="size-10" />
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none pt-1">SOLDE DISPONIBLE</p>
                                        <div className="flex items-center gap-3">
                                            <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                            <p className="text-[10px] font-black text-black uppercase tracking-[0.3em] italic leading-none opacity-60">PROTOCOLE ALPHA SÉCURISÉ</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-baseline gap-6">
                                        <h3 className="text-7xl md:text-9xl font-black text-black tracking-tighter leading-none italic uppercase">
                                            {isLoading ? "••••••" : parseFloat(wallet?.solde_virtuel || 0).toLocaleString('fr-GN')}
                                        </h3>
                                        <span className="text-3xl font-black text-[#FF6600] uppercase tracking-tighter pt-4">GNF</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden border-2 border-white shadow-inner max-w-sm">
                                        <div className="bg-[#FF6600] h-full w-[100%] rounded-full shadow-[0_0_15px_rgba(255,102,0,0.4)] transition-all duration-[2s]"></div>
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] italic">ACTUALISATION CONTINUE DU FLUX RÉSEAU</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-6 w-full md:w-80">
                                <button
                                    onClick={handleDeposit}
                                    className="h-20 w-full rounded-[2rem] bg-[#FF6600] text-white hover:bg-black font-black text-xs uppercase tracking-[0.4em] shadow-3xl transition-all duration-700 hover:scale-105 active:scale-95 italic group/btn relative overflow-hidden flex items-center justify-center gap-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite]" />
                                    <PlusCircle className="size-6 relative z-10" />
                                    <span className="relative z-10 pt-1">ABONDER LE FLUX</span>
                                </button>
                                <button
                                    className="h-20 w-full rounded-[2rem] bg-black text-white hover:bg-[#FF6600] font-black text-xs uppercase tracking-[0.4em] shadow-3xl transition-all duration-700 hover:scale-105 active:scale-95 italic group/btn_sec relative overflow-hidden flex items-center justify-center gap-6"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn_sec:animate-[shimmer_2s_infinite]" />
                                    <ArrowUpRight className="size-6 relative z-10" />
                                    <span className="relative z-10 pt-1">RETRAIT RÉSEAU</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Widget */}
                    <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] p-12 flex flex-col justify-between shadow-3xl group relative overflow-hidden">
                        <div className="absolute top-0 right-0 size-64 bg-[#FF6600]/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="flex items-center justify-between mb-12 relative z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 italic">FLUX HEBDOMADAIRE</p>
                                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">INDEX ALPHA</h4>
                            </div>
                            <div className="size-16 rounded-[1.5rem] bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border-2 border-[#FF6600]/20 shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                                <TrendingUp className="size-8" />
                            </div>
                        </div>

                        <div className="flex items-end h-40 gap-4 relative z-10">
                            {[40, 70, 45, 90, 60, 80, 50].map((h, i) => (
                                <div key={i} className="flex-1 group/bar relative h-full flex flex-col justify-end">
                                    <div
                                        className={cn(
                                            "w-full rounded-2xl transition-all duration-1000 cursor-pointer shadow-lg",
                                            i === 3 ? "bg-[#FF6600] shadow-[0_0_20px_rgba(255,102,0,0.3)] h-full" : "bg-white/[0.05] group-hover/bar:bg-white/10"
                                        )}
                                        style={{ height: `${h}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-black text-white text-[9px] font-black px-2 py-1 rounded-lg border border-white/10">{h}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-8 text-[9px] font-black text-slate-600 uppercase tracking-widest italic relative z-10 pt-4 border-t-2 border-white/5">
                            <span>LUN</span><span>MAR</span><span>MER</span><span className="text-[#FF6600]">JEU</span><span>VEN</span><span>SAM</span><span>DIM</span>
                        </div>
                    </div>
                </div>

                {/* Transactions Registry */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                    <div className="xl:col-span-8 space-y-10">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-6">
                                <div className="size-3 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
                                <h3 className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic">REGISTRE DES TRANSACTIONS QUANTIQUE</h3>
                            </div>
                            <button className="text-[10px] font-black text-[#FF6600] hover:text-white uppercase tracking-[0.4em] flex items-center gap-3 transition-all duration-700 italic group/more">
                                ARCHIVES COMPLÈTES <ChevronRight className="size-4 group-hover/more:translate-x-2 transition-transform" />
                            </button>
                        </div>

                        <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] overflow-hidden shadow-3xl">
                            <div className="overflow-x-auto scrollbar-hide">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-white/[0.02] text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b-4 border-white/5 italic">
                                            <th className="px-10 py-8">IDENTIFIANT</th>
                                            <th className="px-10 py-8">HORODATAGE</th>
                                            <th className="px-10 py-8">OPÉRATION RÉSEAU</th>
                                            <th className="px-10 py-8">INDEX VALEUR</th>
                                            <th className="px-10 py-8 text-right">STATUT CANAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-white/5">
                                        {isLoading ? (
                                            [1, 2, 3, 4, 5].map(i => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan="5" className="px-10 py-12"><div className="h-4 bg-white/5 rounded-full w-full" /></td>
                                                </tr>
                                            ))
                                        ) : transactions.length > 0 ? (
                                            transactions.map((txn, idx) => {
                                                const Icon = getIcon(txn.type_transaction);
                                                const isPositive = txn.type_transaction === 'depot' || txn.type_transaction === 'remboursement';
                                                return (
                                                    <tr key={txn.id || idx} className="hover:bg-white/[0.03] transition-all duration-700 group/row">
                                                        <td className="px-10 py-8">
                                                            <span className="text-[11px] font-black text-[#FF6600] group-hover/row:text-white transition-colors italic uppercase">#{(txn.id?.slice(0, 8) || txn.reference_externe || 'INDEX').toUpperCase()}</span>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-4 text-slate-500 italic">
                                                                <Clock className="size-4 text-[#FF6600]/40 group-hover/row:text-[#FF6600] transition-colors" />
                                                                <span className="text-[11px] font-black uppercase tracking-wider">{new Date(txn.createdAt).toLocaleDateString('fr-GN')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-6">
                                                                <div className="size-12 rounded-xl bg-white/5 border-2 border-white/5 flex items-center justify-center text-slate-600 group-hover/row:text-[#FF6600] group-hover/row:border-[#FF6600]/20 group-hover/row:scale-110 transition-all duration-700 shadow-xl">
                                                                    <Icon className="size-5" />
                                                                </div>
                                                                <span className="text-xs font-black text-white uppercase tracking-tighter italic">
                                                                    {txn.type_transaction === 'depot' ? 'INDEXATION OM' :
                                                                        txn.type_transaction === 'achat' ? 'COMMANDE MARCHÉ' :
                                                                            txn.type_transaction === 'retrait' ? 'RETRAITS RÉSEAU' :
                                                                                txn.metadata?.desc?.toUpperCase() || 'OPÉRATION BCA'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <div className={cn(
                                                                "text-sm font-black tracking-tighter italic uppercase tabular-nums",
                                                                isPositive ? "text-emerald-500" : "text-white group-hover/row:text-[#FF6600] transition-colors"
                                                            )}>
                                                                {isPositive ? '+' : '-'} {parseFloat(txn.montant).toLocaleString('fr-GN')}
                                                                <span className="text-[10px] ml-3 opacity-40 uppercase non-italic">GNF</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-right">
                                                            <StatusBadge status={txn.statut} variant={getStatusVariant(txn.statut)} className="text-[9px] font-black italic uppercase tracking-widest border-2" />
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-10 py-40 text-center">
                                                    <div className="flex flex-col items-center gap-10 opacity-20 group/empty">
                                                        <Satellite className="size-24 text-slate-500 animate-pulse" />
                                                        <p className="text-[12px] font-black uppercase tracking-[0.6em] italic">AUCUN FLUX DÉTECTÉ DANS LE REGISTRE</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Virtual Privilege Card */}
                    <div className="xl:col-span-4 space-y-12">
                        <div className="px-6 flex items-center gap-4">
                            <div className="size-2 rounded-full bg-[#FF6600] shadow-[0_0_10px_rgba(255,102,0,0.6)]" />
                            <h3 className="text-[12px] font-black text-white uppercase tracking-[0.5em] italic">CARTE PRIVILÈGE BCA</h3>
                        </div>

                        <div className="relative overflow-hidden bg-black p-12 text-white rounded-[4rem] border-x-[16px] border-[#FF6600] shadow-3xl aspect-[1.6/1] flex flex-col justify-between group transition-all duration-1000 hover:scale-[1.05] hover:rotate-2 cursor-pointer">
                            <div className="absolute top-0 right-0 size-[40rem] bg-[#FF6600]/20 rounded-full blur-[150px] -mr-48 -mt-48 transition-transform group-hover:scale-125 duration-[4s] animate-pulse"></div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div className="size-16 rounded-2xl bg-white/5 backdrop-blur-3xl flex items-center justify-center border-2 border-white/10 shadow-3xl group-hover:bg-[#FF6600] group-hover:border-[#FF6600]/20 transition-all duration-700">
                                    <Sparkles className="size-8 text-[#FF6600] group-hover:text-white" />
                                </div>
                                <div className="px-6 py-2 bg-white/5 border-2 border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.5em] italic pt-1 shadow-lg group-hover:border-[#FF6600]/40">ELITE MEMBER</div>
                            </div>

                            <div className="relative z-10 space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic opacity-60">NODE IDENTIFIER</p>
                                <p className="text-3xl md:text-5xl font-black tracking-[0.3em] font-mono group-hover:text-[#FF6600] transition-colors duration-700">•••• ••• ••• 4492</p>
                            </div>

                            <div className="relative z-10 flex justify-between items-end border-t-4 border-white/5 pt-8">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">DÉTENTEUR</p>
                                    <p className="text-sm font-black uppercase tracking-[0.2em] text-[#FF6600] italic">BCA PREMIUM INVEST</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2 italic">EXP</p>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] italic">12 / 28</p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="space-y-6">
                            <div className="p-8 bg-white rounded-[3rem] border-x-[12px] border-black flex items-center justify-between group cursor-pointer hover:border-[#FF6600] transition-all duration-700 shadow-3xl">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-[1.5rem] bg-orange-500 flex items-center justify-center shadow-3xl group-hover:rotate-12 transition-transform duration-700">
                                        <div className="text-[12px] font-black text-white italic tracking-tighter uppercase">OM</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-black uppercase tracking-tighter italic">ORANGE MONEY</p>
                                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] italic opacity-60 mt-1">+224 62X XX XX 12</p>
                                    </div>
                                </div>
                                <ChevronDown className="size-6 text-slate-300 group-hover:text-black transition-colors" />
                            </div>

                            <button className="w-full h-20 rounded-[2.5rem] border-4 border-dashed border-white/10 text-[11px] font-black text-slate-600 uppercase tracking-[0.5em] hover:border-[#FF6600]/40 hover:text-[#FF6600] hover:bg-[#FF6600]/5 transition-all duration-700 flex items-center justify-center gap-6 italic group/add">
                                <PlusCircle className="size-6 group-hover/add:rotate-180 transition-transform duration-700" />
                                AJOUTER UN CANAL
                            </button>
                        </div>
                    </div>
                </div>

                {/* Final Trust Signal Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 py-20 border-t-4 border-white/5 mt-20">
                    <div className="flex items-center gap-6 group/trust">
                        <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border-2 border-[#FF6600]/20 group-hover:shadow-[0_0_20px_rgba(255,102,0,0.3)] transition-all">
                            <ShieldAlert className="size-7" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">INDEX SÉCURITÉ ALPHA</span>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">256-BIT QUANTUM ENCRYPTION</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group/trust">
                        <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/20 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                            <CheckCircle2 className="size-7" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">FLUX CERTIFIÉS BCA</span>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">INDEXATION RÉSEAU VALIDÉE</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group/trust">
                        <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border-2 border-amber-500/20 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
                            <Clock className="size-7" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">TRAITEMENT PRIORITAIRE</span>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 italic">INDEXATION 24/7 EN TEMPS RÉEL</p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserWallet;
