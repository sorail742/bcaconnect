import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFinancialStats } from '../../hooks/useDomainData';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    AreaChart, Area, BarChart, Bar, Cell 
} from 'recharts';
import { Landmark, TrendingUp, ArrowDownLeft, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCcw, Download } from 'lucide-react';
import { LoadingState, ErrorState } from '../../components/ui/DataStates';
import { cn } from '../../lib/utils';

const COLORS = ['#FF6600', '#2563eb', '#10b981', '#f59e0b'];

const FinancialReports = () => {
    const { data, loading, error, refetch } = useFinancialStats();

    if (loading) return (
        <DashboardLayout title="Rapports Financiers">
            <LoadingState message="Génération des rapports financiers en temps réel..." />
        </DashboardLayout>
    );

    if (error) return (
        <DashboardLayout title="Rapports Financiers">
            <ErrorState error={error} />
        </DashboardLayout>
    );

    const stats = data?.stats || [];
    const transactions = data?.transactions || [];
    const chartData = data?.chartData || { timeseries: [] };

    return (
        <DashboardLayout title="Rapports Financiers">
            <div className="space-y-6 pb-12">
                
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                            <Landmark className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-foreground uppercase tracking-tight">Console de Trésorerie</h2>
                            <p className="text-xs text-muted-foreground">Données certifiées V2.6 — {new Date().toLocaleDateString('fr-GN')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={refetch}
                            className="size-10 rounded-xl bg-muted border border-border flex items-center justify-center hover:text-primary transition-all"
                        >
                            <RefreshCcw className="size-4" />
                        </button>
                        <button className="h-10 px-6 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-2">
                            <Download className="size-4" />
                            Exporter PDF
                        </button>
                    </div>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/30 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                <div className={cn(
                                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                                    stat.trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                                )}>
                                    {stat.trendValue}
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                                {stat.value}
                            </h3>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Flow Chart */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <TrendingUp className="size-4" />
                                </div>
                                <h3 className="font-bold text-lg">Variation des Flux (7j)</h3>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-primary" /> Entrants</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.timeseries}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF6600" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="val" stroke="#FF6600" fillOpacity={1} fill="url(#colorVal)" strokeWidth={4} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Recent Transactions Panel */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm flex flex-col"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h3 className="font-bold">Flux Récents</h3>
                            <CheckCircle2 className="size-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {transactions.map((tx, idx) => (
                                <div key={idx} className="p-3 rounded-2xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{tx.type}</span>
                                        <span className="text-[10px] text-muted-foreground">{tx.date}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold truncate max-w-[120px]">{tx.user}</p>
                                        <p className="text-sm font-black tabular-nums">{tx.amount}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-2">
                                        <div className={cn(
                                            "size-1.5 rounded-full",
                                            tx.statusVariant === 'success' ? "bg-emerald-500" : "bg-primary animate-pulse"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-bold uppercase tracking-tight",
                                            tx.statusVariant === 'success' ? "text-emerald-500" : "text-primary"
                                        )}>
                                            {tx.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="p-4 border-t border-border text-xs font-bold text-center text-primary hover:bg-primary/5 transition-all">
                            Voir toute l'activité
                        </button>
                    </motion.div>
                </div>

                {/* Audit Information */}
                <div className="flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-2xl text-xs text-muted-foreground">
                    <AlertCircle className="size-4 shrink-0" />
                    <p>Ce rapport est généré automatiquement par le moteur financier de BCA Connect. Les données sont agrégées à partir des transactions de portefeuille validées (RS256 Signature verified).</p>
                </div>

            </div>
        </DashboardLayout>
    );
};

export default FinancialReports;
