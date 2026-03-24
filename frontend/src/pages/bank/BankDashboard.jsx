import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DashboardCard from '../../components/ui/DashboardCard';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import { Landmark, Hourglass, CreditCard, CheckCircle2 } from 'lucide-react';
import { Skeleton, CardSkeleton, TableRowSkeleton } from '../../components/ui/Loader';
import { ErrorState } from '../../components/ui/StatusStates';
import { Card } from '../../components/ui/Card';
import statService from '../../services/statService';

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
        { title: 'Dépôts totaux', value: '0 GNF', trendValue: '...', trend: 'up', icon: Landmark },
        { title: 'Dépôts en attente', value: '0', trendValue: '...', trend: 'up', icon: Hourglass },
        { title: 'Retraits en attente', value: '0', trendValue: '...', trend: 'down', icon: CreditCard },
        { title: 'Transactions traitées', value: '0', trendValue: '...', trend: 'up', icon: CheckCircle2 },
    ];

    const transactions = dashboardData?.transactions || [];

    const transactionColumns = [
        {
            label: 'ID Transaction',
            render: (row) => <span className="font-black text-primary italic tracking-tighter">{row.id}</span>
        },
        {
            label: 'Utilisateur',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-110">
                        <img alt={row.user} src={row.avatar} className="size-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{row.user}</span>
                </div>
            )
        },
        {
            label: 'Type',
            render: (row) => (
                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-${row.typeVariant}-500/10 text-${row.typeVariant}-600 border border-${row.typeVariant}-500/20`}>
                    {row.type}
                </span>
            )
        },
        { label: 'Montant', key: 'amount' },
        { label: 'Méthode', key: 'method' },
        {
            label: 'Statut',
            render: (row) => <StatusBadge status={row.status} variant={row.statusVariant} />
        },
        {
            label: 'Actions',
            render: (row) => (
                <div className="text-right space-x-3">
                    {row.status === 'En attente' && (
                        <>
                            <button className="text-emerald-500 hover:text-emerald-600 font-black text-[10px] uppercase tracking-widest">Approuver</button>
                            <button className="text-rose-500 hover:text-rose-600 font-black text-[10px] uppercase tracking-widest">Rejeter</button>
                        </>
                    )}
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black text-[10px] uppercase tracking-widest">Détails</button>
                </div>
            )
        }
    ];

    return (
        <DashboardLayout title="Tableau de bord financier">
            <div className="space-y-8 animate-in fade-in duration-500 font-inter">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        [1, 2, 3, 4].map(i => <CardSkeleton key={i} />)
                    ) : (
                        stats.map((stat, idx) => (
                            <DashboardCard key={idx} {...stat} />
                        ))
                    )}
                </div>

                {/* Financial Activity Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Activité financière</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Aperçu des 7 derniers jours</p>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">{dashboardData?.chartData?.total?.toLocaleString() || '0'} GNF</span>
                            <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">{dashboardData?.chartData?.delta || '+0%'}</span>
                        </div>
                    </div>
                    <div className="h-64 w-full group relative">
                        <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                            <defs>
                                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                    <stop offset="0%" stopColor="#2b6cee" stopOpacity="0.15"></stop>
                                    <stop offset="100%" stopColor="#2b6cee" stopOpacity="0"></stop>
                                </linearGradient>
                            </defs>
                            <path d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,40 V200 H0 Z" fill="url(#chartGradient)"></path>
                            <path d="M0,150 Q100,50 200,120 T400,80 T600,140 T800,40" fill="none" stroke="#2b6cee" strokeWidth="4" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(43,108,238,0.4)]"></path>
                        </svg>
                        <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-t border-slate-100 dark:border-slate-800 pt-4">
                            <span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span>
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div>
                    {isLoading ? (
                        <Card className="rounded-2xl border border-border shadow-sm p-0 overflow-hidden bg-card">
                            <div className="p-6 border-b border-border">
                                <Skeleton className="h-6 w-1/4" />
                            </div>
                            <div className="divide-y divide-border/50">
                                {[1, 2, 3, 4, 5].map(i => <TableRowSkeleton key={i} />)}
                            </div>
                        </Card>
                    ) : hasError ? (
                        <ErrorState />
                    ) : (
                        <DataTable
                            title="Transactions récentes"
                            icon="receipt_long"
                            columns={transactionColumns}
                            data={transactions}
                            actions={
                                <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline hover:translate-x-1 transition-transform">Voir tout l'historique</button>
                            }
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BankDashboard;

