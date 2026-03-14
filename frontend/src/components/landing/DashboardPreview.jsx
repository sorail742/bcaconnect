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

export function DashboardPreview() {
    return (
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Aperçu du dashboard
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        Une interface moderne et intuitive
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Gérez votre activité avec un tableau de bord puissant, conçu pour la performance.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />

                    <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-2xl shadow-primary/5">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-secondary border-b border-border">
                            <div className="flex items-center gap-4" translate="no">
                                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                    <span className="text-primary-foreground font-bold text-xs">BC</span>
                                </div>
                                <span className="font-semibold text-foreground">BCA Connect</span>
                            </div>
                            <div className="hidden md:flex items-center gap-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
                                    <Search className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Rechercher...</span>
                                </div>
                                <button className="relative p-2 rounded-lg hover:bg-card transition-colors">
                                    <Bell className="w-5 h-5 text-muted-foreground" />
                                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                                </button>
                                <div className="w-8 h-8 rounded-full bg-primary/20" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-foreground">Tableau de bord</h3>
                                    <p className="text-sm text-muted-foreground">Bienvenue, Mamadou</p>
                                </div>
                                <div className="flex items-center gap-2 mt-4 md:mt-0">
                                    <span className="text-sm text-muted-foreground">Mars 2026</span>
                                    <button className="p-2 rounded-lg hover:bg-secondary transition-colors">
                                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-4 rounded-xl bg-secondary border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +12.5%
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">15.2M GNF</p>
                                    <p className="text-xs text-muted-foreground">Chiffre d'affaires</p>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +8.3%
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">284</p>
                                    <p className="text-xs text-muted-foreground">Commandes</p>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-destructive">
                                            <ArrowDownRight className="w-3 h-3" />
                                            -2.1%
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">1,429</p>
                                    <p className="text-xs text-muted-foreground">Clients actifs</p>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary border border-border">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <span className="flex items-center gap-1 text-xs text-emerald-500">
                                            <ArrowUpRight className="w-3 h-3" />
                                            +5.7%
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-foreground">94.2%</p>
                                    <p className="text-xs text-muted-foreground">Taux de livraison</p>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="rounded-xl bg-secondary border border-border overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                    <h4 className="font-medium text-foreground">Commandes récentes</h4>
                                    <button className="text-sm text-primary hover:underline">Voir tout</button>
                                </div>
                                <div className="divide-y divide-border">
                                    {[
                                        { id: "#BCA-2847", client: "Alpha Diallo", product: "Matériaux construction", amount: "850,000 GNF", status: "Livré", statusColor: "text-emerald-500 bg-emerald-500/10" },
                                        { id: "#BCA-2846", client: "Fatou Barry", product: "Électroménager", amount: "1,200,000 GNF", status: "En cours", statusColor: "text-amber-500 bg-amber-500/10" },
                                        { id: "#BCA-2845", client: "Ibrahim Sow", product: "Équipement agricole", amount: "2,500,000 GNF", status: "En attente", statusColor: "text-muted-foreground bg-muted" }
                                    ].map((order, index) => (
                                        <div key={index} className="flex items-center justify-between px-4 py-3">
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-mono text-muted-foreground">{order.id}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{order.client}</p>
                                                    <p className="text-xs text-muted-foreground">{order.product}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm font-medium text-foreground">{order.amount}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.statusColor}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
