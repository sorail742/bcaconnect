import {
    TrendingUp,
    Package,
    Users,
    Bell,
    Search,
    ArrowUpRight
} from "lucide-react"
import { cn } from "../../lib/utils"

export function DashboardPreview() {
    return (
        <section className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-6 uppercase tracking-widest">
                        Interface Intuitive
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Une gestion simplifiée <br />
                        <span className="text-primary">pour votre business</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-80">
                        Pilotez votre activité avec une clarté absolue et des outils de performance intégrés.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto animate-fade-in-up">
                    <div className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl group transition-all duration-500 hover:border-primary/20">
                        {/* Fake Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-4">
                                <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-white shadow-md">
                                    <span className="font-bold text-xs uppercase">BC</span>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="font-bold text-slate-900 dark:text-white text-xs tracking-tight leading-none uppercase">BCA Connect</p>
                                    <p className="text-[10px] font-bold text-primary uppercase mt-0.5 opacity-80">Dashboard V4</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                    <Search className="size-3.5 text-slate-400" />
                                    <span className="text-[10px] text-slate-400 font-medium italic">Recherche...</span>
                                </div>
                                <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <Bell className="size-4 text-slate-600 dark:text-slate-400" />
                                    <span className="absolute top-1.5 right-1.5 size-2 bg-primary rounded-full border border-white dark:border-slate-900" />
                                </button>
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                    <Users className="size-4 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Fake Content */}
                        <div className="p-8 lg:p-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {[
                                    { icon: TrendingUp, label: "Volume Ventes", val: "15,2M", unit: "GNF", color: "text-primary", bg: "bg-primary/10" },
                                    { icon: Package, label: "Commandes", val: "284", unit: "Unités", color: "text-secondary", bg: "bg-secondary/10" },
                                    { icon: Users, label: "Clients", val: "1,429", unit: "Actifs", color: "text-accent", bg: "bg-accent/10" },
                                    { icon: TrendingUp, label: "Croissance", val: "94,2", unit: "%", color: "text-primary", bg: "bg-primary/10" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all duration-300">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-sm", stat.bg)}>
                                            <stat.icon className={cn("size-5", stat.color)} />
                                        </div>
                                        <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">{stat.label}</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">{stat.val}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase opacity-60">{stat.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex justify-between items-center">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Dernières Opérations</h4>
                                        <span className="text-[10px] font-bold text-primary cursor-pointer hover:underline uppercase tracking-widest">Voir tout</span>
                                    </div>
                                    <div className="p-2">
                                        {[
                                            { name: "Alpha Diallo", ref: "#BCA-2847", amount: "850k", status: "Livré", color: "text-secondary" },
                                            { name: "Fatou Barry", ref: "#BCA-2846", amount: "1,2M", status: "En cours", color: "text-primary" },
                                            { name: "Ibrahim Sow", ref: "#BCA-2845", amount: "2,5M", status: "Livré", color: "text-secondary" },
                                        ].map((row, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-default">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400">{i + 1}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{row.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold tracking-widest">{row.ref}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{row.amount} GNF</p>
                                                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", row.color)}>{row.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-8 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 cursor-pointer hover:scale-[1.02] transition-all group/promo">
                                        <ArrowUpRight className="size-6 mb-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <h5 className="text-xl font-bold tracking-tight leading-tight mb-2">Passez au niveau supérieur.</h5>
                                        <p className="text-xs font-medium opacity-80 mb-6">Débloquez les analytics avancées et le support premium illimité.</p>
                                        <div className="h-1 rounded-full bg-white/20">
                                            <div className="h-full w-2/3 bg-white rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
