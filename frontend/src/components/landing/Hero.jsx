import { Button } from "../ui/Button"
import { ArrowRight, Play } from "lucide-react"
import { Link } from "react-router-dom"

export function Hero() {
    return (
                <section className="relative w-full pt-12 pb-20 md:pt-28 md:pb-40 isolate">
            {/* High-Impact Atmospheric Glows */}
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/20 dark:bg-primary/10 blur-[160px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Premium Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none" />

            <div className="container mx-auto px-4 relative">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl glass border border-white/20 text-xs font-bold text-primary mb-10 animate-fade-in-up shadow-premium">
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </div>
                        <span className="uppercase tracking-[0.2em]">L'excellence Fintech en Afrique</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-fade-in-up text-wrap-balance">
                        L'écosystème qui{" "}
                        <span className="text-premium-gradient italic block md:inline">
                            révolutionne
                        </span>{" "}
                        le futur du commerce.
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 text-pretty font-medium leading-relaxed animate-fade-in-up opacity-90" style={{ animationDelay: '200ms' }}>
                        BCA Connect unifie clients, vendeurs, livreurs et institutions financières dans un hub digital ultra-performant. 
                        Passez à la vitesse supérieure.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                        <Link to="/register" className="w-full sm:w-auto">
                            <Button variant="premium" size="lg" className="w-full h-14 rounded-2xl gap-3 text-base shadow-2xl shadow-blue-500/20">
                                Commencer maintenant
                                <ArrowRight className="size-5" />
                            </Button>
                        </Link>
                        <Link to="/catalog" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl gap-3 text-base glass border-white/20">
                                <Play className="size-5 fill-current" />
                                Découvrir la démo
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                        {[
                            { label: "Utilisateurs", val: "10K+" },
                            { label: "Vendeurs", val: "500+" },
                            { label: "Transactions", val: "50K+" },
                            { label: "Satisfaction", val: "98%", highlight: true },
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <p className={`text-3xl md:text-4xl font-bold tabular-nums tracking-tight leading-normal pb-1 transition-all duration-300 group-hover:scale-105 ${stat.highlight ? 'text-premium-gradient' : 'text-slate-900 dark:text-white'}`}>
                                    {stat.val}
                                </p>
                                <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-slate-400 dark:text-slate-500 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Perspective Dashboard Preview */}
                <div className="mt-32 relative animate-fade-in-up" style={{ animationDelay: '500ms' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#000000] via-transparent to-transparent z-10 pointer-events-none h-20 top-[-20px]" />
                    <div className="relative group max-w-5xl mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
                        <div className="relative rounded-[2rem] overflow-hidden border border-white/20 dark:border-white/5 bg-white/70 dark:bg-white/[0.02] backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40">
                            {/* Browser Header */}
                            <div className="flex items-center justify-between px-6 py-4 bg-white/50 dark:bg-white/5 border-b border-white/10">
                                <div className="flex gap-2">
                                    <div className="size-3 rounded-full bg-red-400/20 border border-red-400/40" />
                                    <div className="size-3 rounded-full bg-amber-400/20 border border-amber-400/40" />
                                    <div className="size-3 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                                </div>
                                <div className="px-4 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-white/10 min-w-[200px] md:min-w-[400px]">
                                    <p className="text-[10px] text-center text-muted-foreground font-medium flex items-center justify-center gap-2">
                                        <ArrowRight className="size-2.5 rotate-180" />
                                        <ArrowRight className="size-2.5" />
                                        dashboard.bcaconnect.com
                                    </p>
                                </div>
                                <div className="size-5 rounded-full bg-white/10" />
                            </div>
                            {/* Inner Dashboard Content Mock */}
                            <div className="p-8 lg:p-12">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        { label: "Revenu Total", val: "2,450,000 GNF", trend: "+12.5%", color: "primary" },
                                        { label: "Commandes Actives", val: "48", trend: "+15.2%", color: "indigo" },
                                        { label: "Performance", val: "94.2%", trend: "Stable", color: "emerald" },
                                    ].map((card, i) => (
                                        <div key={i} className="p-6 rounded-3xl glass-card group/card active-press">
                                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground mb-3">{card.label}</p>
                                            <p className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">{card.val}</p>
                                            <div className="flex items-center gap-2 mt-4 text-[10px] font-black">
                                                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">{card.trend}</span>
                                                <span className="text-slate-400 opacity-60">vs mois dernier</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Visual placeholder for a chart */}
                                <div className="mt-8 h-48 lg:h-64 rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-white/10 relative overflow-hidden group/chart">
                                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-primary/5 to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-full flex items-end justify-between px-8 gap-1 h-32">
                                            {[40, 60, 45, 80, 55, 90, 70, 85, 60, 95, 80, 100].map((h, i) => (
                                                <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all duration-1000 group-hover/chart:bg-primary/40" style={{ height: `${h}%` }} />
                                            ))}
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
