import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useFinancialStats } from '../../hooks/useDomainData';
import { 
    ResponsiveContainer, 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
import { 
    Landmark, TrendingUp, RefreshCcw, Download,
    FileText, PieChart, Wallet, CreditCard,
    Activity, Zap, ShieldCheck, History
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-2xl shadow-slate-200/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
                <p className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {parseFloat(payload[0].value).toLocaleString('fr-GN')} <span className="text-xs text-primary ml-1">GNF</span>
                </p>
                <div className="mt-2 flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase">
                    <TrendingUp className="size-3" /> Volume Record
                </div>
            </div>
        );
    }
    return null;
};

const StatCard = ({ title, value, icon: Icon, color, trendValue, trend }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group"
    >
        <div className={cn("absolute top-0 right-0 p-5 opacity-5 group-hover:scale-125 transition-transform duration-700", color)}>
            <Icon className="size-10" />
        </div>
        <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
                    {title}
                </p>
                {trendValue && (
                    <div className={cn(
                        "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                        trend === 'up' ? "bg-emerald-50 text-emerald-500 border-emerald-100" : "bg-rose-50 text-rose-500 border-rose-100"
                    )}>
                        {trendValue}
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter tabular-nums leading-none" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {value}
            </h3>
        </div>
    </motion.div>
);

const FinancialReports = () => {
    const { data, loading, refetch } = useFinancialStats();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [filterPeriod, setFilterPeriod] = useState('7J');

    if (loading) return (
        <DashboardLayout title="CENTRE DE TRÉSORERIE" noPadding>
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-8">
                    <div className="size-20 rounded-[2.5rem] bg-primary/10 border-2 border-primary/20 flex items-center justify-center animate-pulse">
                        <Zap className="size-10 text-primary shadow-glow" />
                    </div>
                    <div className="space-y-2 text-center">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Calibration Flux Synergie...</p>
                        <p className="text-[9px] font-bold text-slate-300 uppercase italic">Version Alpha 4.2.0</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );

    const stats = data?.stats || [];
    const transactions = data?.transactions || [];
    const chartData = data?.chartData || { timeseries: [] };

    const getExportData = () => {
        return transactions.map(t => ({
            "Type": t.type || 'N/A',
            "Utilisateur": t.user || 'Système',
            "Montant": `${(t.amount || 0).toLocaleString()} GNF`,
            "Statut": t.status || 'N/A',
            "Date": t.date || new Date().toLocaleDateString()
        }));
    };

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Trésorerie");
        XLSX.writeFile(workbook, `BCA_Financial_Audit_${Date.now()}.xlsx`);
        toast.success("EXCEL GÉNÉRÉ AVEC SUCCÈS.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Livre de Trésorerie - BCA Connect", 14, 15);
        autoTable(doc, {
            startY: 25,
            head: [["TYPE", "USER", "MONTANT", "STATUT", "DATE"]],
            body: getExportData().map(row => Object.values(row)),
            theme: 'grid',
            headStyles: { fillColor: [255, 102, 0] }
        });
        doc.save(`BCA_Audit_${Date.now()}.pdf`);
        toast.success("AUDIT PDF PRÊT.");
    };

    return (
        <DashboardLayout title="INTELLIGENCE FINANCIÈRE" noPadding>
            <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-8 space-y-8 custom-scrollbar">
                
                {/* HUD Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className="size-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
                            <Landmark className="size-7 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Centre <span className="text-primary">Trésorerie</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    Flux de données Satellite • Certification V3
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="h-12 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                        >
                            <Download className="size-4" />
                            Générer Rapport
                        </button>
                        <button onClick={refetch} className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-all shadow-sm shadow-slate-100">
                            <RefreshCcw className="size-5 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* Summary HUD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {stats.map((s, i) => (
                        <StatCard 
                            key={i} 
                            title={s.title}
                            value={s.title.toLowerCase().includes('dépôts') || s.title.toLowerCase().includes('montant') ? `${parseFloat(s.value || 0).toLocaleString('fr-GN')} GNF` : parseFloat(s.value || 0).toLocaleString('fr-GN')}
                            trendValue={s.trendValue}
                            trend={s.trend}
                            icon={[CreditCard, Wallet, TrendingUp, History][i % 4]}
                            color={["text-primary", "text-blue-500", "text-emerald-500", "text-amber-500"][i % 4]}
                        />
                    ))}
                </div>

                {/* Workspace area */}
                <div className="space-y-10">
                    <AnimatePresence>
                        {showExportMenu && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-primary/20 bg-primary/[0.01] grid grid-cols-1 md:grid-cols-3 gap-6 shadow-2xl shadow-primary/5"
                            >
                                <button onClick={handleExportExcel} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="size-7 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Microsoft Excel</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Audit Ledger .xlsx</p>
                                    </div>
                                </button>
                                <button onClick={handleExportPDF} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-rose-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PieChart className="size-7 text-rose-500" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Adobe PDF Audit</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Report Generation .pdf</p>
                                    </div>
                                </button>
                                <button onClick={() => setShowExportMenu(false)} className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-slate-300 hover:shadow-xl flex flex-col items-center gap-4 transition-all group">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <ShieldCheck className="size-7 text-slate-400" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Annuler Opération</p>
                                        <p className="text-[9px] font-bold text-slate-400 mt-1">Fermer Panel Export</p>
                                    </div>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Analyzer Chart */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-4">
                                    <Activity className="size-4 text-primary" />
                                    <div className="flex items-center gap-2">
                                        {['7J', '30J', 'MAX'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setFilterPeriod(p)}
                                                className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest px-5 h-8 rounded-xl transition-all",
                                                    filterPeriod === p ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {p === 'MAX' ? 'ANNÉE' : p}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Fin-Sync Intelligence</span>
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm h-[480px]"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData.timeseries}>
                                        <defs>
                                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#FF6600" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#FF6600" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fontSize: 9, fontWeight: 900, fill: '#cbd5e1' }} 
                                            dy={15}
                                        />
                                        <YAxis hide />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="val" 
                                            stroke="#FF6600" 
                                            fillOpacity={1} 
                                            fill="url(#colorVal)" 
                                            strokeWidth={4} 
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </div>

                        {/* Recent Activity Ledger */}
                        <div className="lg:col-span-4 flex flex-col gap-6 font-jakarta">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter px-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                Flux en <span className="text-primary">Direct</span>
                            </h3>

                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex-1 min-h-[500px] overflow-y-auto no-scrollbar space-y-2"
                            >
                                {transactions.map((tx, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100 group">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase">{tx.type}</span>
                                                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight truncate max-w-[100px]">{tx.user}</p>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-300 uppercase italic">{tx.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-slate-900 tabular-nums">
                                                {(tx.amount || 0).toLocaleString()} <span className="text-[10px] text-slate-300 ml-0.5">GNF</span>
                                            </p>
                                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                                <div className={cn("size-1 rounded-full", tx.statusVariant === 'success' ? "bg-emerald-500" : "bg-amber-500")} />
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-widest",
                                                    tx.statusVariant === 'success' ? "text-emerald-500" : "text-amber-500"
                                                )}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                            
                            <div className="bg-slate-900 p-6 rounded-[2rem] border border-slate-800 flex items-center gap-4 overflow-hidden relative group">
                                <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                    <Zap className="size-6 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Sécurité Chiffrée</p>
                                    <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase italic opacity-60">
                                        Audit scellé via Protocole BCA-SEC v4.2
                                    </p>
                                </div>
                                <History className="absolute -right-4 -bottom-4 size-20 text-white/[0.02] rotate-12" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FinancialReports;
