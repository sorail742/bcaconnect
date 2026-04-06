import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import { Landmark, Hourglass, CreditCard, CheckCircle2, TrendingUp, Activity, Zap, RefreshCcw, Landmark as Bank, Search, Shield } from 'lucide-react';
import statService from '../../services/statService';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const BankDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchStats = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await statService.getFinancialStats();
            setDashboardData(data);
        } catch (err) {
            console.error("Erreur stats financières:", err);
            setHasError(true);
            toast.error("ÉCHEC DE LA SYNCHRONISATION FINANCIÈRE.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const stats = [
        { title: 'DÉPÔTS CUMULÉS', value: dashboardData?.stats?.[0]?.value || '0 GNF', icon: Landmark, trend: 'up', trendValue: 'OPTIMAL' },
        { title: 'OPÉ. EN ATTENTE', value: dashboardData?.stats?.[1]?.value || '0', icon: Hourglass, trend: 'up', trendValue: 'SYNC' },
        { title: 'RETRAITS ACTIFS', value: dashboardData?.stats?.[2]?.value || '0', icon: CreditCard, trend: 'down', trendValue: 'SECURE' },
        { title: 'VOLUME TRAITÉ', value: dashboardData?.stats?.[3]?.value || '0', icon: CheckCircle2, trend: 'up', trendValue: 'TOTAL' },
    ];

    const transactions = dashboardData?.transactions || [];

    const transactionColumns = [
        {
            label: 'ID TX SOURCE',
            render: (row) => (
                <span className="font-black text-[#FF6600] uppercase text-[9px] tracking-widest bg-[#FF6600]/5 px-2 py-1 rounded-lg border border-[#FF6600]/10 shadow-sm">
                    #{row.id?.toString().toUpperCase().slice(0, 8) || 'TX-ALPHA'}
                </span>
            )
        },
        {
            label: 'ACTEUR RÉSEAU',
            render: (row) => (
                <div className="flex items-center gap-4 py-1 group/actor">
                    <div className="size-6 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-foreground/5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative">
                        <img alt="" src={row.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${row.user}`} className="size-full object-cover relative z-10 group-hover/actor:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/10 to-transparent" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-slate-800 dark:text-foreground uppercase truncate tracking-tight leading-none pt-0.5">{row.user?.toUpperCase() || 'MEMBRE'}</p>
                        <p className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest leading-none mt-1 opacity-70">UID: {row.userId?.slice(0, 5).toUpperCase() || 'N/A'}</p>
                    </div>
                </div>
            )
        },
        {
            label: 'FLUX COMPTA',
            render: (row) => (
                <span className={cn(
                    "px-4 h-8 rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 border w-fit",
                    row.typeVariant === 'emerald' ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-500 shadow-sm shadow-emerald-500/5" :
                        row.typeVariant === 'rose' ? "bg-rose-500/5 border-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/5" :
                            "bg-[#FF6600]/5 border-[#FF6600]/10 text-[#FF6600] shadow-sm shadow-[#FF6600]/5"
                )}>
                    <Activity className="size-3" />
                    {row.type?.toUpperCase() || 'TRANSFERT'}
                </span>
            )
        },
        {
            label: 'VOLUME GNF',
            render: (row) => (
                <span className="text-[12px] font-black text-slate-900 dark:text-foreground tracking-tighter tabular-nums uppercase">
                    {row.amount} <small className="text-[8px] font-black text-[#FF6600]">GNF</small>
                </span>
            )
        },
        {
            label: 'INFRA INFOS',
            render: (row) => (
                <span className="font-black text-muted-foreground/80 dark:text-muted-foreground text-[9px] uppercase tracking-widest leading-relaxed pt-0.5">{row.method?.toUpperCase() || 'CANAL RÉSEAU'}</span>
            )
        },
        {
            label: 'AUDIT STATUT',
            render: (row) => {
                const status = row.status;
                return (
                    <div className="flex items-center gap-3">
                         <div className={cn(
                            "size-1.5 rounded-full",
                            status === 'Validé' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                status === 'En attente' ? "bg-amber-500 animate-pulse" : "bg-rose-500"
                        )} />
                        <span className={cn(
                            "text-[8px] font-black uppercase tracking-widest",
                            status === 'Validé' ? "text-emerald-500" :
                                status === 'En attente' ? "text-amber-500" : "text-rose-500"
                        )}>
                            {status?.toUpperCase() || 'INDEXÉ'}
                        </span>
                    </div>
                );
            }
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="text-right flex items-center justify-end gap-3 pr-4">
                    {row.status === 'En attente' && (
                        <>
                            <button className="size-6 rounded-lg bg-emerald-500 text-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md group/btn" title="APPROUVER FLUX">
                                <CheckCircle2 className="size-4" />
                            </button>
                            <button className="size-6 rounded-lg bg-rose-500 text-foreground flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-md group/btn" title="REJETER FLUX">
                                <Zap className="size-4 rotate-12" />
                            </button>
                        </>
                    )}
                    <button className="h-8 px-4 bg-slate-50 dark:bg-foreground/5 border border-slate-200 dark:border-foreground/10 text-muted-foreground/80 hover:text-[#FF6600] rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">AUDIT</button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE BANQUE RÉSEAU">
            <div className="space-y-4 animate-in fade-in duration-700 pb-24">

                {/* Compact Command Bar */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-white dark:bg-[#0F1219] p-4 rounded-2xl border border-slate-200 dark:border-foreground/5 shadow-sm overflow-hidden relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/[0.01] to-transparent pointer-events-none" />
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="size-6 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border border-[#FF6600]/5 group-hover:rotate-6 transition-transform">
                            <Bank className="size-6 shadow-sm" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-900 dark:text-foreground uppercase tracking-tight leading-none pt-0.5">
                                OPS <span className="text-[#FF6600]">FINANCIÈRES</span>.
                            </h2>
                            <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest opacity-80 decoration-[#FF6600]/20 underline underline-offset-4">
                                TERMINAL BANQUE — SYNC : {new Date().toLocaleTimeString('fr-GN', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <button onClick={fetchStats} className="size-6 rounded-xl bg-slate-50 dark:bg-foreground/5 border border-slate-100 dark:border-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-[#FF6600] transition-all shadow-sm">
                            <RefreshCcw className={cn("size-5", isLoading && "animate-spin")} />
                        </button>
                        <div className="flex items-center gap-3 px-5 h-10 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <Shield className="size-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest pt-0.5">VAULT SECURE</span>
                        </div>
                    </div>
                </div>

                {/* KPI Area — Strategic Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.map((stat, idx) => (
                        <DashboardCard key={idx} {...stat} className="h-32" />
                    ))}
                </div>

                {/* Financial Activity — Strategic Matrix */}
                <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden relative group">
                    <div className="p-4 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                             <div className="size-11 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] border border-[#FF6600]/5 group-hover:rotate-12 transition-transform shadow-sm">
                                <Activity className="size-5" />
                             </div>
                             <div className="space-y-1">
                                 <h3 className="text-sm font-black text-slate-800 dark:text-foreground uppercase tracking-tight">FLUX TRANSACTIONNEL RÉSEAU</h3>
                                 <p className="text-[8px] font-black text-muted-foreground/80 uppercase tracking-widest opacity-60">SYNCHRONISATION NOEUD_BANQUE — 7D INDEX</p>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-foreground/10 px-8 py-4 rounded-xl shadow-inner group/val">
                            <div className="text-right">
                                <p className="text-[7px] font-black text-muted-foreground/80 uppercase tracking-widest mb-1">VOLUME INDEXÉ</p>
                                <p className="text-sm font-black text-slate-900 dark:text-foreground tracking-tighter uppercase tabular-nums leading-none">{dashboardData?.chartData?.total?.toLocaleString() || '0'} <small className="text-[10px] font-black text-[#FF6600]">GNF</small></p>
                            </div>
                            <div className="h-10 w-px bg-slate-200 dark:bg-foreground/10" />
                            <div className="flex items-center gap-3">
                                <TrendingUp className="size-4 text-emerald-500 group-hover/val:scale-125 transition-transform" />
                                <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest pt-1">{dashboardData?.chartData?.delta || '+14.2%'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 h-[300px] w-full group/graph pt-10">
                         {/* Simulation de graphique architectural */}
                         <div className="h-full w-full flex items-end gap-3 px-4">
                             {[40, 20, 60, 45, 90, 70, 55, 80, 40, 65, 30, 85, 50, 75].map((h, i) => (
                                <div key={i} className="flex-1 bg-slate-100 dark:bg-foreground/5 rounded-t-lg relative group/bar hover:bg-[#FF6600]/20 transition-all" style={{ height: `${h}%` }}>
                                    <div 
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#FF6600]/40 to-[#FF6600]/80 rounded-t-lg opacity-0 group-hover/bar:opacity-100 transition-opacity" 
                                        style={{ height: '30%' }} 
                                    />
                                    {i % 2 === 0 && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] font-black text-muted-foreground/80 uppercase tracking-widest">D_{i+1}</div>
                                    )}
                                </div>
                             ))}
                         </div>
                    </div>
                </div>

                {/* Audited Transaction Surface */}
                <div className="bg-white dark:bg-[#0F1219] border border-slate-200 dark:border-foreground/5 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100 dark:border-foreground/5 bg-slate-50/20 dark:bg-white/[0.01] flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                         <div className="flex items-center gap-3 text-muted-foreground/80">
                             <Shield className="size-4" />
                             <span className="text-[9px] font-semibold pt-0.5">REGISTRE D'AUDIT TRANSACTIONNEL</span>
                         </div>
                         <div className="relative group w-full xl:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/80 size-4 group-focus-within:text-[#FF6600] transition-colors z-10" />
                            <input
                                className="w-full pl-11 pr-4 h-9 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-foreground/10 rounded-xl text-[9px] font-black tracking-widest placeholder:text-muted-foreground/80 outline-none transition-all focus:border-[#FF6600]/30"
                                placeholder="IDENTIFIER ALPHA_TX..."
                            />
                         </div>
                    </div>

                    <div className="p-2">
                        <DataTable
                            columns={transactionColumns}
                            data={transactions}
                            isLoading={isLoading}
                            className="bg-transparent border-0"
                        />
                        {!isLoading && transactions.length === 0 && (
                            <div className="py-24 text-center opacity-20 flex flex-col items-center gap-3">
                                <CreditCard className="size-6 animate-pulse text-muted-foreground/80" />
                                <p className="text-[10px] font-black uppercase ">AUCUN FLUX FINANCIER DÉTECTÉ</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BankDashboard;
