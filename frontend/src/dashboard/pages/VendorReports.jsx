import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { ErrorState } from "../../components/ui/DataStates";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart,
} from "recharts";
import {
    TrendingUp, Activity, DollarSign, Loader2, RefreshCw, Package,
    Sparkles, AlertTriangle, ShoppingCart, ArrowUp, ArrowDown, BarChart2,
    PieChart as PieIcon, Clock, Download, FileText, FileSpreadsheet, FileType, Landmark,
} from "lucide-react";
import { cn, adaptiveValueSize } from "../../lib/utils";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { addPdfLetterhead } from "../../lib/pdfBranding";
import ChartTooltip from "../../components/ui/ChartTooltip";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import { useVendorStats } from "../../shop/hooks/useVendorData";

const COLORS = ["#1CA0DB", "#4fc3f7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = "text-primary", bgColor = "bg-primary/10" }) => {
    const isAnimatable = typeof value === 'number' || /^\d+(\.\d+)?\D*$/.test(String(value ?? '').trim());
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="group relative overflow-hidden bg-card border border-border rounded-2xl p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_32px_-8px_rgba(15,23,42,0.16)] hover:border-primary/30 transition-shadow duration-300"
        >
            <div className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-start justify-between mb-4">
                <div className={cn("size-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110", bgColor)}>
                    <Icon className={cn("size-5", color)} />
                </div>
                {trendValue && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                        trend === "up" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {trend === "up" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className={cn(adaptiveValueSize(value, 'text-3xl', 'text-lg'), "relative font-black text-foreground tabular-nums mb-1")}>
                {isAnimatable ? <AnimatedCounter value={value} duration={1.2} /> : value}
            </p>
            <p className="relative text-sm font-medium text-foreground">{title}</p>
            {subtitle && <p className="relative text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </motion.div>
    );
};

export default function VendorReports() {
    const [chartView, setChartView] = useState("area");
    const [showExportMenu, setShowExportMenu] = useState(false);

    const { data: statsData, loading: loadingStats, error: statsError, refetch: refetchStats, isFetching: fetchingStats } = useVendorStats();

    const { data: performanceData, isLoading: loadingPerf, refetch: refetchPerf } = useQuery({
        queryKey: ["vendor-performance"],
        queryFn: async () => {
            const res = await api.get("/reports/vendor-performance");
            return res.data;
        },
        staleTime: 5_000,
        refetchInterval: 30_000,
    });

    const isLoading = loadingStats || loadingPerf;
    const data = statsData;

    const chartData = useMemo(() => {
        if (data?.sales_chart?.length) return data.sales_chart;
        return (data?.timeseries || []).map((row) => ({
            month: row.day,
            sales: Math.round(row.val || 0),
        }));
    }, [data]);

    const topProductsPie = useMemo(() => {
        return (data?.top_products || []).slice(0, 6).map((p, i) => ({
            name: p.name?.slice(0, 18) + (p.name?.length > 18 ? "..." : ""),
            value: p.revenue || p.quantity || 0,
            qty: p.quantity || 0,
            color: COLORS[i % COLORS.length],
        }));
    }, [data]);

    const revenue = data?.revenue ?? data?.totalRevenue ?? 0;
    const growth = data?.growth;
    const ordersCount = performanceData?.totalSales || data?.orders_count || 0;
    const productsCount = data?.products_count ?? 0;
    const litigesCount = performanceData?.litigesCount || 0;

    const handleRefresh = async () => {
        try {
            await Promise.all([refetchStats(), refetchPerf()]);
            toast.success("Rapports actualisés");
        } catch {
            toast.error("Echec de l'actualisation");
        }
    };

    const getExportData = () => (data?.top_products || []).map((p) => ({
        "PRODUIT": p.name || "N/A",
        "QUANTITÉ VENDUE": p.quantity || 0,
        "CHIFFRE D'AFFAIRES (GNF)": Math.round(p.revenue || 0),
    }));

    const handleExportExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Rapport Boutique");
        XLSX.writeFile(workbook, `BCA_Rapport_Vendeur_${Date.now()}.xlsx`);
        setShowExportMenu(false);
        toast.success("Excel généré avec succès.");
    };

    // Journal des ventes SYSCOHADA Révisé 2017 (analyse concurrentielle #9) —
    // écritures en partie double (411/701/443), importable dans AIRAMA Pro
    // Finance ou tout logiciel conforme au plan comptable OHADA.
    const handleExportSyscohada = async () => {
        try {
            const response = await api.get('/invoices/export/syscohada', { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `Journal_Ventes_SYSCOHADA_${Date.now()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setShowExportMenu(false);
            toast.success('Journal comptable SYSCOHADA généré.');
        } catch {
            toast.error("Impossible de générer l'export comptable.");
        }
    };

    const handleExportCSV = () => {
        const worksheet = XLSX.utils.json_to_sheet(getExportData());
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `BCA_Rapport_Vendeur_${Date.now()}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowExportMenu(false);
        toast.success("Fichier CSV généré.");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF("landscape");
        const headerY = addPdfLetterhead(
            doc,
            "RAPPORT DE PERFORMANCE BOUTIQUE",
            `GÉNÉRÉ LE : ${new Date().toLocaleString()} • CA TOTAL : ${Math.round(performanceData?.totalRevenue || revenue).toLocaleString("fr-GN")} GNF`,
        );

        autoTable(doc, {
            startY: headerY,
            head: [["Produit", "Quantité vendue", "Chiffre d'affaires (GNF)"]],
            body: getExportData().map((row) => [
                row["PRODUIT"],
                row["QUANTITÉ VENDUE"],
                row["CHIFFRE D'AFFAIRES (GNF)"].toLocaleString("fr-GN"),
            ]),
            theme: "grid",
            headStyles: { fillColor: [28, 160, 219], textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            margin: { top: headerY },
        });

        doc.save(`BCA_Rapport_Vendeur_${Date.now()}.pdf`);
        setShowExportMenu(false);
        toast.success("Rapport PDF prêt.");
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Rapports">
                <div className="flex h-[50vh] items-center justify-center gap-3">
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium">Chargement des analyses...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (statsError || !data) {
        return (
            <DashboardLayout title="Rapports">
                <ErrorState message="Impossible de charger vos statistiques." onRetry={handleRefresh} />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Rapports & Analyses">
            <div className="max-w-7xl mx-auto space-y-8 pb-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-foreground">Tableau de bord analytique</h1>
                        <p className="text-muted-foreground text-sm mt-0.5">Vue complete de vos performances commerciales en temps reel.</p>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 bca-live-dot" />
                            Synchronisation automatique toutes les 30s
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowExportMenu((v) => !v)}
                                className="h-10 px-5 rounded-xl bg-card border border-border text-foreground text-sm font-bold flex items-center gap-2 hover:bg-muted transition-colors"
                            >
                                <Download className="size-4" />
                                Exporter
                            </button>
                            {showExportMenu && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                    <div className="absolute right-0 mt-2 w-52 rounded-xl border border-border bg-card shadow-xl z-20 overflow-hidden">
                                        <button
                                            type="button"
                                            onClick={handleExportExcel}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                                        >
                                            <FileSpreadsheet className="size-4 text-emerald-600" />
                                            Excel (.xlsx)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExportCSV}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                                        >
                                            <FileType className="size-4 text-blue-600" />
                                            CSV
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleExportPDF}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                                        >
                                            <FileText className="size-4 text-red-600" />
                                            PDF
                                        </button>
                                        <div className="border-t border-border" />
                                        <button
                                            type="button"
                                            onClick={handleExportSyscohada}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                                            title="Journal des ventes en partie double, plan comptable OHADA"
                                        >
                                            <Landmark className="size-4 text-primary" />
                                            Journal comptable (SYSCOHADA)
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleRefresh}
                            disabled={fetchingStats}
                            className="h-10 px-5 rounded-xl bg-primary text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-60 transition-opacity shadow-lg shadow-primary/20"
                        >
                            <RefreshCw className={cn("size-4", fetchingStats && "animate-spin")} />
                            Actualiser
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        title="Chiffre d'affaires total"
                        value={`${Math.round(performanceData?.totalRevenue || revenue).toLocaleString("fr-GN")} GNF`}
                        subtitle="Toutes periodes confondues"
                        icon={DollarSign}
                        trend={growth?.startsWith("-") ? "down" : "up"}
                        trendValue={growth}
                        color="text-primary"
                        bgColor="bg-primary/10"
                    />
                    <StatCard
                        title="Commandes traitees"
                        value={ordersCount.toLocaleString()}
                        subtitle="Unites vendues"
                        icon={ShoppingCart}
                        color="text-emerald-600"
                        bgColor="bg-emerald-500/10"
                    />
                    <StatCard
                        title="Produits en stock"
                        value={productsCount.toLocaleString()}
                        subtitle="Catalogue actif"
                        icon={Package}
                        color="text-blue-600"
                        bgColor="bg-blue-500/10"
                    />
                    <StatCard
                        title="Litiges ouverts"
                        value={litigesCount}
                        subtitle={litigesCount === 0 ? "Aucun litige actif" : "A traiter en priorite"}
                        icon={AlertTriangle}
                        trend={litigesCount > 0 ? "down" : "up"}
                        trendValue={litigesCount > 0 ? "Attention" : "OK"}
                        color={litigesCount > 0 ? "text-red-600" : "text-emerald-600"}
                        bgColor={litigesCount > 0 ? "bg-red-500/10" : "bg-emerald-500/10"}
                    />
                </div>

                {/* AI Insight Banner */}
                {data.global_trend && (
                    <div className="bg-gradient-to-r from-primary/5 via-amber-500/5 to-emerald-500/5 border border-primary/20 rounded-2xl p-5 flex gap-4 items-start">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="size-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-wider text-primary mb-1">Analyse IA BCA</p>
                            <p className="text-sm text-foreground font-medium leading-relaxed">{data.global_trend}</p>
                        </div>
                    </div>
                )}

                {/* Revenue Chart */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <div className="flex items-center gap-3">
                            <Activity className="size-5 text-primary" />
                            <div>
                                <h3 className="font-bold text-foreground">Evolution des ventes</h3>
                                <p className="text-xs text-muted-foreground">7 derniers jours en GNF</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setChartView("area")}
                                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", chartView === "area" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground")}
                            >
                                <TrendingUp className="size-3.5 inline mr-1" />Aire
                            </button>
                            <button
                                onClick={() => setChartView("bar")}
                                className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", chartView === "bar" ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground")}
                            >
                                <BarChart2 className="size-3.5 inline mr-1" />Barres
                            </button>
                        </div>
                    </div>
                    <div className="p-6">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                {chartView === "area" ? (
                                    <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#1CA0DB" stopOpacity={0.22} />
                                                <stop offset="100%" stopColor="#1CA0DB" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="rgba(128,128,128,0.14)" />
                                        <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#1CA0DB', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area
                                            type="monotone" dataKey="sales" stroke="#1CA0DB" strokeWidth={2} fill="url(#salesGrad)" name="Ventes"
                                            dot={{ r: 3, fill: "#1CA0DB", strokeWidth: 2, stroke: 'var(--card)' }}
                                            activeDot={{ r: 6, stroke: '#1CA0DB', strokeWidth: 3, fill: 'var(--card)' }}
                                            animationDuration={900} animationEasing="ease-out"
                                        />
                                    </AreaChart>
                                ) : (
                                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                                        <CartesianGrid vertical={false} stroke="rgba(128,128,128,0.14)" />
                                        <XAxis dataKey="month" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(28,160,219,0.06)' }} />
                                        <Bar dataKey="sales" fill="#1CA0DB" name="Ventes" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={700} animationEasing="ease-out" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <Clock className="size-10 opacity-30" />
                                <p className="text-sm">Pas encore de ventes sur les 7 derniers jours.</p>
                                <p className="text-xs opacity-70">Vos donnees apparaitront ici des votre premiere vente.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Products — Bar + Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 p-6 border-b border-border">
                            <Package className="size-5 text-blue-500" />
                            <div>
                                <h3 className="font-bold text-foreground">Top produits - Quantites</h3>
                                <p className="text-xs text-muted-foreground">Produits les plus vendus</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {data.top_products?.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={data.top_products.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                                        <CartesianGrid horizontal={false} stroke="rgba(128,128,128,0.14)" />
                                        <XAxis type="number" stroke="currentColor" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" stroke="currentColor" fontSize={10} width={90} tickLine={false} axisLine={false} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(79,195,247,0.06)' }} />
                                        <Bar dataKey="quantity" fill="#4fc3f7" name="Qte vendue" radius={[0, 4, 4, 0]} maxBarSize={22} animationDuration={700} animationEasing="ease-out" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <Package className="size-8 opacity-30" />
                                    <p className="text-sm">Aucun produit vendu pour le moment.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="flex items-center gap-3 p-6 border-b border-border">
                            <PieIcon className="size-5 text-primary" />
                            <div>
                                <h3 className="font-bold text-foreground">Repartition du CA</h3>
                                <p className="text-xs text-muted-foreground">Par produit (Top 6)</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {topProductsPie.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={topProductsPie}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={55}
                                                outerRadius={85}
                                                paddingAngle={3}
                                                dataKey="value"
                                                stroke="var(--card)"
                                                strokeWidth={2}
                                                animationDuration={800}
                                                animationEasing="ease-out"
                                            >
                                                {topProductsPie.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(v, n, props) => [`${Number(v).toLocaleString("fr-GN")} GNF`, props?.payload?.name]}
                                                contentStyle={{ borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 12px 32px -8px rgba(0,0,0,0.2)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="mt-3 space-y-1.5">
                                        {topProductsPie.map((entry, i) => (
                                            <div key={i} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-muted-foreground truncate max-w-[140px]">{entry.name}</span>
                                                </div>
                                                <span className="font-bold text-foreground">{entry.qty} unites</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                                    <PieIcon className="size-8 opacity-30" />
                                    <p className="text-sm">Aucune donnee disponible.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
