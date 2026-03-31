import {
    TrendingUp,
    Package,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    MoreHorizontal,
    Bell,
    Search
} from "lucide-react"
import { cn } from "../../lib/utils"

export function DashboardPreview() {
    return (
                <section className="relative py-32 md:py-48 overflow-hidden isolate">
            {/* Atmospheric Depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-blue-500/5 dark:bg-primary/5 blur-[160px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary mb-8 uppercase tracking-[0.3em] shadow-sm">
                        Expérience Utilisateur
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                        Une interface pensée pour la{" "}
                        <span className="text-premium-gradient italic">
                            performance
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 text-pretty font-medium leading-relaxed opacity-80">
                        Gérez chaque aspect de votre activité avec une clarté absolue et une vitesse fulgurante.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {/* Shadow & Glow behind the dashboard */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 via-transparent to-indigo-500/10 blur-3xl opacity-50 -z-10" />
                    
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/20 dark:border-white/5 bg-white/80 dark:bg-background/40 backdrop-blur-3xl shadow-2xl transition-all duration-700 hover:shadow-primary/5 group">
                        {/* Dashboard Header Bar */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/20 dark:bg-white/5">
                            <div className="flex items-center gap-6" translate="no">
                                <div className="size-10 rounded-xl bg-premium-gradient flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="text-white font-black text-xs">BC</span>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight leading-none">BCA Connect</p>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Dashboard Pro</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/50 dark:bg-white/5 border border-white/10 group-hover:border-primary/20 transition-colors">
                                    <Search className="size-4 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground font-medium">Rechercher une transaction...</span>
                                </div>
                                <button className="relative p-2.5 rounded-xl bg-white/50 dark:bg-white/5 border border-white/10 hover:bg-white hover:dark:bg-white/10 transition-all active-press">
                                    <Bell className="size-5 text-slate-600 dark:text-slate-300" />
                                    <span className="absolute top-2 right-2 size-2.5 bg-primary rounded-full border-2 border-white dark:border-slate-900 shadow-sm" />
                                </button>
                                <div className="size-10 rounded-xl bg-premium-gradient p-[2px]">
                                    <div className="size-full rounded-[9px] bg-white dark:bg-background flex items-center justify-center">
                                        <Users className="size-5 text-primary" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Body */}
                        <div className="p-8 lg:p-12">
                            <div className="flex flex-col md:flex-row items-baseline justify-between mb-10 gap-4">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Vue d'ensemble</h3>
                                    <p className="text-sm text-muted-foreground font-medium mt-1">Bienvenue dans votre centre de contrôle, Mamadou</p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                                    <span className="text-xs font-black text-primary uppercase tracking-widest">Mars 2026</span>
                                    <div className="w-px h-3 bg-primary/20" />
                                    <TrendingUp className="size-4 text-primary" />
                                </div>
                            </div>

                            {/* Premium Stats Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {[
                                    { icon: TrendingUp, label: "Volume Ventes", val: "15.2M", unit: "GNF", trend: "+12.5%", color: "primary" },
                                    { icon: Package, label: "Commandes", val: "284", unit: "Actives", trend: "+8.3%", color: "indigo" },
                                    { icon: Users, label: "Clients", val: "1,429", unit: "Fidèles", trend: "-2.1%", color: "amber", neg: true },
                                    { icon: TrendingUp, label: "Réussite", val: "94.2", unit: "%", trend: "+5.7%", color: "emerald" },
                                ].map((stat, i) => (
                                    <div key={i} className="p-6 rounded-[2rem] glass-card group/stat active-press relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <stat.icon className="size-16" />
                                        </div>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={cn("size-12 rounded-xl flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform", 
                                                stat.color === 'primary' ? 'bg-primary/10 text-primary' : 
                                                stat.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-500' :
                                                stat.color === 'amber' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                                            )}>
                                                <stat.icon className="size-6" />
                                            </div>
                                            <span className={cn("px-2 py-1 rounded-lg text-[10px] font-black border", 
                                                stat.neg ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            )}>
                                                {stat.trend}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground mb-1">{stat.label}</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">{stat.val}</span>
                                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60 tracking-widest">{stat.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Transactions Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 rounded-[2rem] glass-card overflow-hidden">
                                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/5">
                                        <h4 className="font-black text-lg text-slate-900 dark:text-white tracking-tight">Opérations récentes</h4>
                                        <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline active-press">Export .CSV</button>
                                    </div>
                                    <div className="p-4">
                                        {[
                                            { id: "#BCA-2847", client: "Alpha Diallo", product: "BTP Pro", amount: "850k", status: "Livré", trend: "up" },
                                            { id: "#BCA-2846", client: "Fatou Barry", product: "Tech Pack", amount: "1.2M", status: "En cours", trend: "up" },
                                            { id: "#BCA-2845", client: "Ibrahim Sow", product: "Agri Gear", amount: "2.5M", status: "Action req.", trend: "down" },
                                        ].map((order, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all group/row cursor-default">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-muted-foreground group-hover/row:bg-primary group-hover/row:text-white transition-all shadow-sm">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{order.client}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{order.product} • {order.id}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-sm font-black text-slate-900 dark:text-white italic">{order.amount} GNF</p>
                                                    <span className={cn("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", 
                                                        order.status === 'Livré' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10' : 
                                                        order.status === 'En cours' ? 'bg-blue-500/5 text-blue-500 border-blue-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
                                                    )}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Right Sidebar - Action center */}
                                <div className="space-y-6">
                                    <div className="p-8 rounded-[2rem] bg-premium-gradient text-white shadow-xl shadow-blue-500/20 active-press cursor-pointer group/promo">
                                        <div className="flex items-center justify-between mb-6">
                                            <ArrowUpRight className="size-8 group-hover:rotate-45 transition-transform duration-500" />
                                            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase">Plus Pro</div>
                                        </div>
                                        <h5 className="text-2xl font-black tracking-tight leading-tight mb-3">Passez au niveau supérieur.</h5>
                                        <p className="text-sm font-medium opacity-80 mb-6">Débloquez les analytics avancées et le support premium.</p>
                                        <div className="h-1 rounded-full bg-white/20 overflow-hidden">
                                            <div className="h-full w-2/3 bg-white animate-pulse" />
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 rounded-[2rem] glass-card border-white/10 active-press">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Support Direct</p>
                                        <div className="flex -space-x-4 mb-6">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="size-10 rounded-xl bg-slate-800 border-4 border-background flex items-center justify-center font-black text-[10px] text-white">Agent</div>
                                            ))}
                                            <div className="size-10 rounded-xl bg-primary border-4 border-background flex items-center justify-center font-black text-xs text-white shadow-lg">+12</div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Agents en ligne</p>
                                        <p className="text-[10px] text-muted-foreground font-medium mt-1">Réponse moyenne: ~2 mins</p>
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
