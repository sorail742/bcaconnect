import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Landmark, Hourglass, CreditCard, CheckCircle2, TrendingUp, Activity, Zap, Sparkles, Satellite } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { Card } from '../../components/ui/Card';
import statService from '../../services/statService';
import { cn } from '../../lib/utils';

const BankDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await statService.getFinancialStats();
                setDashboardData(data);
            } catch (err) {
                console.error("Erreur stats financières:", err);
                setHasError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    const stats = dashboardData?.stats || [
        { title: 'DÉPÔTS TOTAUX', value: '0 GNF', trendValue: 'OPTIMAL', trend: 'up', icon: Landmark, color: 'primary' },
        { title: 'DÉPÔTS EN ATTENTE', value: '0', trendValue: 'VALIDE', trend: 'up', icon: Hourglass, color: 'primary' },
        { title: 'RETRAITS EN ATTENTE', value: '0', trendValue: 'SECURE', trend: 'down', icon: CreditCard, color: 'primary' },
        { title: 'TRANSACTIONS TRAITÉES', value: '0', trendValue: 'TOTAL', trend: 'up', icon: CheckCircle2, color: 'primary' },
    ];

    const transactions = dashboardData?.transactions || [];

    const transactionColumns = [
        {
            label: 'ID TRANSACTION',
            render: (row) => <span className="font-black text-[#FF6600] uppercase text-[10px] tracking-widest italic">#{row.id?.toString().toUpperCase() || 'TX-8392'}</span>
        },
        {
            label: 'OPÉRATEUR RÉSEAU',
            render: (row) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="size-10 rounded-xl bg-white/[0.03] border-2 border-white/5 flex items-center justify-center overflow-hidden shadow-2xl relative group-hover:rotate-6 transition-transform">
                        <img alt={row.user} src={row.avatar} className="size-full object-cover relative z-10" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent" />
                    </div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest italic truncate max-w-[140px]">{row.user?.toUpperCase() || 'MEMBRE'}</span>
                </div>
            )
        },
        {
            label: 'CATÉGORIE',
            render: (row) => (
                <span className={cn(
                    "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border-2",
                    row.typeVariant === 'emerald' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                        row.typeVariant === 'rose' ? "bg-rose-500/5 border-rose-500/20 text-rose-500" :
                            "bg-[#FF6600]/5 border-[#FF6600]/20 text-[#FF6600]"
                )}>
                    {row.type?.toUpperCase() || 'TRANSFERT'}
                </span>
            )
        },
        {
            label: 'VOLUME',
            render: (row) => <span className="font-black text-white italic tracking-tighter text-sm uppercase">{row.amount}</span>
        },
        {
            label: 'INFRASTRUCTURE',
            render: (row) => <span className="font-black text-slate-500 text-[10px] uppercase tracking-widest italic">{row.method}</span>
        },
        {
            label: 'CANAL STATUT',
            render: (row) => <StatusBadge status={row.status} className="text-[9px] font-black italic uppercase tracking-widest border-2" />
        },
        {
            label: 'GOUVERNANCE',
            render: (row) => (
                <div className="text-right space-x-4">
                    {row.status === 'En attente' && (
                        <>
                            <button className="text-emerald-500 hover:text-white hover:bg-emerald-500 px-3 py-1 rounded-lg border-2 border-emerald-500/20 font-black text-[9px] uppercase tracking-[0.2em] transition-all italic">APPROUVER</button>
                            <button className="text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1 rounded-lg border-2 border-rose-500/20 font-black text-[9px] uppercase tracking-[0.2em] transition-all italic">REJETER</button>
                        </>
                    )}
                    <button className="text-slate-500 hover:text-white font-black text-[9px] uppercase tracking-[0.2em] italic border-b-2 border-transparent hover:border-[#FF6600] transition-all pb-1 pt-1">DÉTAILS</button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="CENTRE DE COMMANDEMENT FINANCIER">
            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} className="hover:border-[#FF6600]/40 transition-all duration-700" />
                        ))
                    )}
                </div>

                {/* Financial Activity Chart */}
                <div className="bg-white/[0.02] border-4 border-white/5 rounded-[4rem] p-12 shadow-3xl group relative overflow-hidden">
                    <div className="absolute top-0 right-0 size-80 bg-[#FF6600]/5 rounded-full blur-[120px] -mr-40 -mt-40 group-hover:bg-[#FF6600]/10 transition-colors duration-1000" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 relative z-10">
                        <div className="flex items-center gap-6">
                            <div className="size-14 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center shadow-3xl border-2 border-[#FF6600]/20 group-hover:rotate-12 transition-transform duration-700">
                                <Activity className="size-7 text-[#FF6600]" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-[0.3em] italic leading-none pt-1">FLUX TRANSACTIONNEL TOTAL</h3>
                                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3 italic opacity-60">SYNCHRONISATION NOEUD FINANCIER (7 DERNIERS JOURS)</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 bg-white/[0.01] border-4 border-white/5 px-10 py-5 rounded-[2rem] shadow-inner group/val">
                            <span className="text-3xl font-black text-white tracking-tighter italic uppercase">{dashboardData?.chartData?.total?.toLocaleString() || '0'} <small className="text-[12px] non-italic text-[#FF6600]">GNF</small></span>
                            <div className="h-10 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <TrendingUp className="size-5 text-emerald-500 group-hover/val:scale-125 transition-transform" />
                                <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] italic pt-1">{dashboardData?.chartData?.delta || '+12.4%'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full group/graph relative z-10">
                        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#FF6600" stopOpacity="0.4"></stop>
                                    <stop offset="100%" stopColor="#FF6600" stopOpacity="0"></stop>
                                </linearGradient>
                            </defs>
                            <path d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,40 V200 H0 Z" fill="url(#chartGradient)"></path>
                            <path d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,40" fill="none" stroke="#FF6600" strokeWidth="8" strokeLinecap="round" className="drop-shadow-[0_0_20px_rgba(255,102,0,0.6)]"></path>
                        </svg>
                        <div className="flex justify-between mt-10 text-[11px] font-black text-slate-600 uppercase tracking-[0.4em] italic border-t-4 border-white/5 pt-8">
                            <span>LUNDI</span><span>MARDI</span><span>MERCREDI</span><span>JEUDI</span><span>VENDREDI</span><span>SAMEDI</span><span>DIMANCHE</span>
                        </div>
                    </div>

                    {/* Scanning Line Effect */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#FF6600]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                </div>

                {/* Transactions Table */}
                <div className="bg-white/[0.01] rounded-[4rem] border-4 border-white/5 overflow-hidden shadow-3xl">
                    {isLoading ? (
                        <div className="p-12 space-y-8">
                            <div className="h-10 w-1/4 bg-white/5 rounded-xl animate-pulse" />
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        </div>
                    ) : hasError ? (
                        <ErrorState className="p-20" />
                    ) : (
                        <DataTable
                            title="AUDIT TRANSACTIONNEL EN TEMPS RÉEL"
                            columns={transactionColumns}
                            data={transactions}
                            className="bg-transparent"
                            actions={
                                <button className="text-[#FF6600] text-[10px] font-black uppercase tracking-[0.4em] italic hover:text-white transition-all border-b-2 border-[#FF6600]/20 pb-1">VOIR L'HISTORIQUE COMPLET DU RÉSEAU</button>
                            }
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BankDashboard;
