import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Users,
    Download,
    TrendingUp,
    Store,
    Gavel,
    ChevronDown,
    MoreHorizontal,
    Activity
} from 'lucide-react';
import statService from '../../services/statService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border border-foreground/10 rounded-xl p-4 shadow-2xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-foreground">
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-[10px] text-muted-foreground ml-1">GNF</span>
                </p>
            </div>
        );
    }
    return null;
};

const AdminDashboard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchGlobalStats = useCallback(async () => {
        try {
            const data = await statService.getAdminStats();
            setDashboardData(data);
        } catch (err) {
            toast.error("Error loading indicators.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGlobalStats();
    }, [fetchGlobalStats]);

    const stats = [
        { title: "Membres du Réseau", value: dashboardData?.overview?.usersCount?.toString() || '0', icon: Users, change: '+12.5%', isPositive: true },
        { title: 'Volume d\'Affaires', value: `${(dashboardData?.overview?.totalRevenue || 0).toLocaleString('fr-GN')} GNF`, icon: TrendingUp, change: '+8.2%', isPositive: true },
        { title: 'Boutiques Actives', value: dashboardData?.overview?.storesCount?.toString() || '0', icon: Store, change: '+3.1%', isPositive: true },
        { title: 'Litiges en Cours', value: dashboardData?.overview?.disputesCount?.toString() || '0', icon: Gavel, change: '-2.4%', isPositive: false },
    ];

    const transactions = dashboardData?.recentTransactions || [];

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    return (
        <DashboardLayout title="Overview" noPadding>
            <div className="p-4 md:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6">

                {/* Sub-navigation */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
                    <button className="px-5 py-2 bg-foreground text-background text-xs font-bold rounded-xl whitespace-nowrap">Vue d'ensemble</button>
                    <button className="px-5 py-2 bg-foreground/[0.03] text-muted-foreground text-xs font-bold rounded-xl hover:bg-foreground/5 whitespace-nowrap">Transactions</button>
                    <button className="px-5 py-2 bg-foreground/[0.03] text-muted-foreground text-xs font-bold rounded-xl hover:bg-foreground/5 whitespace-nowrap">Litiges</button>
                    <button className="px-5 py-2 bg-foreground/[0.03] text-muted-foreground text-xs font-bold rounded-xl hover:bg-foreground/5 whitespace-nowrap">Archives</button>
                </div>

                <div>
                    <h2 className="text-[22px] font-semibold tracking-tight text-foreground">Global Overview</h2>
                    <p className="text-[13px] text-muted-foreground mt-1">Platform consumption and metrics analysis</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div 
                            key={idx} 
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="bg-card rounded-2xl p-5 border border-foreground/[0.03] flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{stat.title}</p>
                                <div className="size-8 rounded-xl bg-foreground/[0.03] flex items-center justify-center">
                                    <stat.icon className="size-4 text-primary" />
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground mb-1 tracking-tight">{stat.value}</p>
                                <p className={cn(
                                    "text-[10px] font-bold flex items-center gap-1",
                                    stat.isPositive ? "text-emerald-500" : "text-rose-500"
                                )}>
                                    {stat.isPositive ? <TrendingUp className="size-3" /> : <TrendingUp className="size-3 rotate-180" />}
                                    {stat.change} ce mois
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Core Chart mirroring VEiD "Usage Trend" */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-card rounded-2xl p-6 border border-foreground/[0.03] shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-base font-bold tracking-tight text-foreground">Tendance d'utilisation</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Revenus plateforme sur 7 jours</p>
                        </div>
                        <button className="size-8 rounded-xl hover:bg-foreground/[0.05] flex items-center justify-center transition-colors border border-foreground/5">
                            <MoreHorizontal className="size-4 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="h-[220px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dashboardData?.weeklyChart?.timeseries || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
                                    tickFormatter={(val) => `${val >= 1000 ? (val/1000)+'k' : val}`}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--foreground)', strokeOpacity: 0.1, strokeWidth: 1 }} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--foreground)" strokeOpacity={0.05} />
                                <Area 
                                    type="monotone" 
                                    dataKey="val" 
                                    stroke="var(--primary)" 
                                    strokeWidth={3} 
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Transactions Grid mirroring "By Category" block */}
                <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-card rounded-[20px] p-5 border border-foreground/[0.04]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">Recent Transactions</h3>
                        <button className="text-[12px] font-medium text-primary hover:underline">View All</button>
                    </div>
                    
                    <div className="space-y-4">
                        {transactions.slice(0, 5).map((row, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-[38px] rounded-full bg-foreground/[0.03] flex items-center justify-center shrink-0 overflow-hidden border border-foreground/[0.05]">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${row.name || 'BCA'}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-medium text-foreground">{row.name || "System Node"}</p>
                                        <p className="text-[11px] text-muted-foreground">{row.status || 'INDEXED'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[14px] font-medium text-foreground">{row.amount?.toLocaleString('fr-GN')} GNF</p>
                                    <p className={cn(
                                        "text-[11px] font-medium",
                                        row.status === 'SUCCESS' ? "text-emerald-500" : "text-amber-500"
                                    )}>
                                        {row.status === 'SUCCESS' ? 'Completed' : 'Pending'}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {transactions.length === 0 && (
                            <div className="py-10 text-center">
                                <p className="text-[13px] text-muted-foreground">No recent transactions to display.</p>
                            </div>
                        )}
                    </div>
                </motion.div>

            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
