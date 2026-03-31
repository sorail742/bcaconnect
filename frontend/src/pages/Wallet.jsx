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
        <DashboardLayout title="CENTRE DE FLUX">
            <div className="w-full space-y-16 animate-in fade-in duration-1000 pb-32 px-6 md:px-10">
                {/* ══════════════════════════════════════════════════
                    EXECUTIVE HEADER — FINANCIAL CENTER
                ══════════════════════════════════════════════════ */}
                <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-4">
                        <div className="size-3 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(43,90,255,0.6)]" />
                        <span className="text-executive-label font-black text-primary uppercase tracking-widest italic">FINTECH ELITE BCA CONNECT</span>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-8xl font-black text-foreground tracking-tighter italic leading-[0.85] uppercase">
                                GESTION DU <br />
                                <span className="text-primary underline decoration-primary/20 decoration-[12px] underline-offset-[-4px]">PATRIMOINE SCELLÉ.</span>
                            </h1>
                            <p className="text-lg text-muted-foreground/60 font-bold max-w-2xl leading-relaxed italic border-l-8 border-primary/20 pl-8 opacity-80">
                                Vos actifs sont protégés par le protocole BCA Guard. Le solde en séquestre garantit la sécurité de chaque transaction marketplace jusqu'à validation finale de l'ordre logistique.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-6 bg-accent/40 p-3 rounded-[2.5rem] border-2 border-border shadow-inner">
                             <div className="px-8 py-5 flex flex-col items-end">
                                 <span className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-widest leading-none mb-2">SCORE DE CONFIANCE</span>
                                 <span className="text-xl font-black text-foreground italic">AA+ PREMIUM</span>
                             </div>
                             <div className="size-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-background shadow-premium-lg">
                                 <Shield className="size-7" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* ══════════════════════════════════════════════════
                    SECTION 1 — THE ELITE BALANCE HUB
                ══════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 p-16 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-12 relative overflow-hidden group border-4 border-foreground bg-foreground text-background shadow-premium-lg rounded-[3.5rem]">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_0%,rgba(43,90,255,0.3),transparent_50%)]"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -ml-64 -mb-64 opacity-60"></div>
                        
                        <div className="space-y-10 relative z-10 w-full">
                            <div className="flex items-center gap-5">
                                <div className="size-14 rounded-[1.5rem] bg-background/10 backdrop-blur-3xl border-2 border-background/20 flex items-center justify-center shadow-premium">
                                    <Wallet className="text-primary size-7" />
                                </div>
                                <div className="flex flex-col">
                                     <p className="text-background/40 font-black uppercase tracking-widest text-executive-label italic opacity-60">LIQUIDITÉ MARKETPLACE BCA</p>
                                     <p className="text-executive-label font-black text-primary uppercase tracking-widest leading-none mt-1">PROTOCOLE DE SÉQUESTRE ACTIF</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-baseline gap-6">
                                    <h3 className="text-7xl md:text-9xl font-black text-background tracking-tighter leading-none italic">
                                        {isLoading ? "••••••" : parseFloat(wallet?.solde_virtuel || 0).toLocaleString('fr-FR')}
                                    </h3>
                                    <span className="text-4xl font-black text-primary uppercase italic tracking-tighter">GNF</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-8 mt-4">
                                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/20 border-2 border-emerald-500/30 rounded-full shadow-premium">
                                         <div className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                                         <span className="text-executive-label font-black text-emerald-400 uppercase tracking-widest italic leading-none">VÉRIFIÉ & SCARLÉ</span>
                                    </div>
                                    <div className="flex items-center gap-3 group/trend">
                                         <TrendingUp className="size-5 text-primary group-hover/trend:translate-y-[-4px] transition-transform" />
                                         <span className="text-executive-label font-black text-background/40 uppercase tracking-widest italic opacity-60">+5.2% FLUX MENSUEL</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 w-full xl:w-80 relative z-10">
                            <Button
                                onClick={handleDeposit}
                                className="h-24 w-full rounded-[2rem] bg-background text-foreground hover:bg-primary hover:text-background font-black uppercase tracking-widest text-executive-label italic shadow-premium-lg transition-all hover:scale-[1.05] active:scale-[0.95] border-transparent"
                            >
                                <PlusCircle className="size-6 mr-4" />
                                ABONDER
                            </Button>
                            <Button 
                                variant="outline" 
                                className="h-24 w-full rounded-[2rem] border-background/20 text-background hover:bg-background/10 font-black uppercase tracking-widest text-executive-label italic backdrop-blur-3xl transition-all shadow-premium"
                            >
                                <ArrowUpRight className="size-6 mr-4 text-primary" />
                                DÉCAISSER
                            </Button>
                        </div>
                    </div>

                    <div className="p-12 border-4 border-border bg-card rounded-[3.5rem] shadow-premium relative overflow-hidden group/chart">
                        <div className="flex items-center justify-between mb-16">
                            <div className="space-y-2">
                                <h4 className="text-executive-label font-black uppercase tracking-widest text-muted-foreground/60 italic leading-none">FLUX DE TRÉSORERIE</h4>
                                <p className="text-executive-label font-black text-muted-foreground/20 uppercase tracking-widest leading-none opacity-40">ANALYSE HEBDOMADAIRE SCELLÉE</p>
                            </div>
                            <div className="size-16 rounded-[1.5rem] bg-primary/5 flex items-center justify-center border-2 border-primary/10 shadow-inner group-hover/chart:rotate-12 transition-transform">
                                <BarChart3 className="text-primary size-7" />
                            </div>
                        </div>
                        <div className="space-y-10">
                            <div className="flex justify-between items-end h-40 gap-5 px-2">
                                {[40, 65, 95, 55].map((height, i) => (
                                    <div key={i} className="w-full relative group/bar">
                                        <div 
                                            style={{ height: `${height}%` }}
                                            className={cn(
                                                "w-full rounded-[1rem] transition-all duration-700 cursor-pointer relative",
                                                i === 2 ? "bg-primary shadow-[0_20px_40px_rgba(43,90,255,0.4)]" : "bg-accent/40 hover:bg-primary/20 shadow-inner"
                                            )}
                                        />
                                        <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-foreground text-background text-executive-label font-black px-4 py-2 rounded-[1rem] opacity-0 group-hover/bar:opacity-100 transition-all scale-75 group-hover/bar:scale-100 whitespace-nowrap shadow-premium-lg z-20 italic">
                                            {(i + 1) * 1.2}M GNF
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-executive-label text-muted-foreground/40 font-black tracking-widest border-t-2 border-border pt-8 uppercase italic opacity-60">
                                <span>SEM 01</span><span>SEM 02</span><span className="text-primary opacity-100">SEM 03</span><span>SEM 04</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
                    {/* ══════════════════════════════════════════════════
                        SECTION 2 — TRANSACTION LEDGER
                    ══════════════════════════════════════════════════ */}
                    <div className="xl:col-span-2 space-y-10">
                        <div className="flex items-center justify-between px-6">
                            <div className="flex items-center gap-5">
                                <div className="size-3 rounded-full bg-primary shadow-[0_0_8px_rgba(43,90,255,0.6)]" />
                                <h3 className="text-executive-label font-black uppercase tracking-widest text-foreground italic">REGISTRE DES MOUVEMENTS EXÉCUTIFS</h3>
                            </div>
                            <button className="px-8 py-3 rounded-full border-2 border-border text-executive-label font-black uppercase tracking-widest text-muted-foreground/60 hover:bg-accent/40 hover:text-foreground transition-all flex items-center gap-4 italic shadow-sm group">
                                EXPORT PDF <ChevronRight className="size-4 group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                        <div className="rounded-[3.5rem] border-4 border-border overflow-hidden shadow-premium bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-accent/20 text-muted-foreground/40 text-executive-label font-black uppercase tracking-widest border-b-4 border-border italic">
                                            <th className="px-12 py-8">ID / RÉFÉRENCE</th>
                                            <th className="px-12 py-8">CHRONOLOGIE</th>
                                            <th className="px-12 py-8">DÉSIGNATION</th>
                                            <th className="px-12 py-8">FLUX</th>
                                            <th className="px-12 py-8 text-right">STATUT</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y-4 divide-border">
                                        {transactions.map((txn, idx) => {
                                            const Icon = getIcon(txn.type_transaction);
                                            const isPositive = txn.type_transaction === 'depot' || txn.type_transaction === 'remboursement';
                                            return (
                                                <tr key={txn.id || idx} className="hover:bg-accent/20 transition-all cursor-default group">
                                                    <td className="px-12 py-10">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-lg font-black text-primary italic">#{txn.id?.slice(0, 8) || txn.reference_externe}</span>
                                                            <span className="text-executive-label font-black text-muted-foreground/20 uppercase tracking-widest opacity-40">BCA-TX-GLOBAL</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-10">
                                                        <div className="flex items-center gap-4">
                                                            <Clock className="size-4 text-muted-foreground/30" />
                                                            <span className="text-executive-label text-muted-foreground/60 font-bold uppercase tracking-widest italic">{new Date(txn.createdAt).toLocaleDateString('fr-FR')}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-10">
                                                        <div className="flex items-center gap-6">
                                                            <div className="size-14 rounded-[1.5rem] bg-accent/40 flex items-center justify-center border-2 border-border text-muted-foreground/40 group-hover:bg-background group-hover:text-primary transition-all shadow-inner">
                                                                <Icon className="size-6" />
                                                            </div>
                                                            <span className="text-lg font-black text-foreground uppercase tracking-tighter italic">
                                                                {txn.type_transaction === 'depot' ? 'INCRÉMENTATION CAPITAL' :
                                                                    txn.type_transaction === 'achat' ? 'ACQUISITION MARKETPLACE' :
                                                                        txn.type_transaction === 'retrait' ? 'LIQUIDATION FONDS' :
                                                                        txn.metadata?.desc || 'ORDRE LOGISTIQUE'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-10">
                                                        <div className={cn(
                                                            "text-xl font-black tracking-tighter italic",
                                                            isPositive ? "text-emerald-500" : "text-foreground"
                                                        )}>
                                                            {isPositive ? '+ ' : '- '}{parseFloat(txn.montant).toLocaleString('fr-FR')} 
                                                            <span className="text-executive-label ml-3 opacity-40 uppercase tracking-widest">GNF</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-12 py-10 text-right">
                                                        <StatusBadge status={txn.statut} variant={getStatusVariant(txn.statut)} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {transactions.length === 0 && !isLoading && (
                                            <tr>
                                                <td colSpan="5" className="px-8 py-32 text-center">
                                                    <div className="flex flex-col items-center gap-8">
                                                         <div className="size-24 rounded-full bg-accent/40 flex items-center justify-center text-muted-foreground/20 border-2 border-dashed border-border shadow-inner">
                                                              <History className="size-10" />
                                                         </div>
                                                         <p className="text-executive-label font-black text-muted-foreground/40 uppercase tracking-widest italic">AUCUN MOUVEMENT SCELLÉ DANS LE LEDGER</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-12">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-executive-label font-black uppercase tracking-widest text-foreground italic">ACTIF & IDENTITÉ RÉSEAU</h3>
                            <button className="text-primary text-executive-label font-black uppercase tracking-widest hover:text-primary/70 transition-all italic opacity-80 decoration-primary/30 underline underline-offset-4">PARAMÈTRES</button>
                        </div>
                        <div className="space-y-12">
                            {/* ══════════════════════════════════════════════════
                                THE BCA PRIVILEGE CARD — VISUAL ANCHOR
                            ══════════════════════════════════════════════════ */}
                            <div className="relative overflow-hidden bg-foreground p-12 text-background shadow-premium-lg group border-4 border-foreground rounded-[3.5rem] font-sans aspect-[1.6/1] transition-transform duration-1000 hover:scale-[1.03] active:scale-[0.98] cursor-pointer">
                                <div className="absolute top-0 right-0 size-[400px] bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 size-[300px] bg-background/10 rounded-full blur-[80px] -ml-36 -mb-36"></div>
                                
                                <div className="relative z-10 flex flex-col justify-between h-full">
                                    <div className="flex justify-between items-start">
                                        <div className="size-16 rounded-[1.5rem] bg-background/10 backdrop-blur-3xl border-2 border-background/20 flex items-center justify-center shadow-premium group-hover:rotate-12 transition-transform">
                                            <CreditCard className="size-8 text-primary" />
                                        </div>
                                        <div className="px-6 py-3 bg-primary/30 backdrop-blur-3xl text-executive-label font-black uppercase tracking-widest rounded-[1.5rem] border-2 border-primary/40 italic shadow-premium">BCA PRIVILEGE ELITE</div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <p className="text-executive-label opacity-40 tracking-widest font-black uppercase italic leading-none">CAPITAL ACCESSION CODE</p>
                                        <p className="text-3xl md:text-5xl font-black tracking-[0.25em] italic drop-shadow-2xl">•••• •••• •••• 8842</p>
                                    </div>
                                    
                                    <div className="flex justify-between items-end border-t-2 border-background/10 pt-8">
                                        <div className="space-y-2">
                                            <p className="text-[10px] opacity-30 uppercase font-black tracking-widest mb-1 italic">DÉTENTEUR DE L'ACTIF</p>
                                            <p className="text-lg font-black truncate uppercase tracking-widest italic text-primary leading-none">ELITE INVESTOR</p>
                                        </div>
                                        <div className="text-right space-y-2">
                                            <p className="text-[10px] opacity-30 uppercase font-black tracking-widest mb-1 italic">VALIDITÉ</p>
                                            <p className="text-lg font-black tracking-widest italic leading-none">09 / 26</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* High-End Shimmer */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] ease-in-out"></div>
                            </div>

                            {/* Local Bank & Mobile Money */}
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-8 flex items-center justify-between border-4 border-border bg-card rounded-[2.5rem] shadow-premium hover:border-primary/40 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[1.5rem] bg-accent/40 flex items-center justify-center text-muted-foreground/40 group-hover/item:bg-primary/10 group-hover/item:text-primary transition-all border-2 border-border shadow-inner">
                                            <Landmark className="size-7" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-lg font-black text-foreground uppercase tracking-tight italic leading-none">COMMERCE & INDUSTRIE GUINÉE</p>
                                            <p className="text-executive-label text-muted-foreground/40 font-bold uppercase tracking-widest opacity-60">GU45 •••• •••• 8291</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex items-center justify-between border-4 border-border bg-card rounded-[2.5rem] shadow-premium hover:border-primary/40 transition-all cursor-pointer group/item">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-[1.5rem] bg-accent/40 flex items-center justify-center border-2 border-border shadow-inner">
                                            <div className="size-10 bg-orange-500 rounded-xl text-background flex items-center justify-center text-xs font-black italic shadow-lg">OM</div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <p className="text-lg font-black text-foreground uppercase tracking-tight italic leading-none">ORANGE PARTNER HUB</p>
                                            <p className="text-executive-label text-muted-foreground/40 font-bold uppercase tracking-widest opacity-60">+224 624 88 •• 12</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="w-full border-4 border-dashed border-border p-10 rounded-[3rem] text-muted-foreground/40 font-black uppercase tracking-widest text-executive-label hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-center gap-5 group/add italic shadow-inner">
                                <PlusCircle className="size-6 group-hover/add:rotate-90 transition-transform" />
                                INTÉGRER UN NOUVEAU FLUX
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Badge - Standardized Elite */}
                <div className="flex flex-wrap items-center justify-center gap-x-24 gap-y-10 py-20 border-t-8 border-border mt-20 animate-in fade-in duration-1000 delay-500">
                    <div className="flex items-center gap-6 group/sec">
                        <div className="size-14 rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary border-2 border-primary/10 group-hover/sec:scale-110 transition-transform shadow-inner">
                             <Shield className="size-6" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-executive-label font-black uppercase tracking-widest text-foreground italic">CRYPTAGE MILITAIRE</span>
                             <span className="text-executive-label font-bold text-muted-foreground/40 uppercase tracking-widest opacity-60 leading-none mt-1">SSL 256-BIT SCELLÉ</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group/sec">
                        <div className="size-14 rounded-[1.5rem] bg-emerald-500/5 flex items-center justify-center text-emerald-500 border-2 border-emerald-500/10 group-hover/sec:scale-110 transition-transform shadow-inner">
                             <CheckCircle2 className="size-6" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-executive-label font-black uppercase tracking-widest text-foreground italic">PROTECTION ACTIVE</span>
                             <span className="text-executive-label font-bold text-muted-foreground/40 uppercase tracking-widest opacity-60 leading-none mt-1">ANTI-FRAUDE IA BCA</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 group/sec">
                        <div className="size-14 rounded-[1.5rem] bg-accent/40 flex items-center justify-center text-muted-foreground/40 border-2 border-border group-hover/sec:scale-110 transition-transform shadow-inner">
                             <Clock className="size-6" />
                        </div>
                        <div className="flex flex-col">
                             <span className="text-executive-label font-black uppercase tracking-widest text-foreground italic">SUPPORT PRIORITAIRE</span>
                             <span className="text-executive-label font-bold text-muted-foreground/40 uppercase tracking-widest opacity-60 leading-none mt-1">ASSISTANCE 24/7/365</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserWallet;
