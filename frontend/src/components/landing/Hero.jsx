import { Button } from "../ui/Button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),_linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,_black_70%,_transparent_110%)]" />

            <div className="container mx-auto px-4 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-sm text-muted-foreground">La marketplace digitale africaine</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 text-balance">
                        Connectez tous les acteurs du{" "}
                        <span className="text-primary">commerce africain</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 text-pretty">
                        BCA Connect unifie clients, vendeurs, livreurs et banques dans un écosystème digital intégré.
                        Simplifiez le commerce en ligne, les paiements et la livraison en Afrique.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" className="w-full sm:w-auto gap-2">
                            Commencer gratuitement
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                            <Play className="w-4 h-4" />
                            Explorer la plateforme
                        </Button>
                    </div>

                    <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-foreground">10K+</p>
                            <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-foreground">500+</p>
                            <p className="text-sm text-muted-foreground">Vendeurs</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-foreground">50K+</p>
                            <p className="text-sm text-muted-foreground">Transactions</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl md:text-4xl font-bold text-foreground">98%</p>
                            <p className="text-sm text-muted-foreground">Satisfaction</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="mt-20 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-2xl shadow-primary/10">
                        <div className="flex items-center gap-2 px-4 py-3 bg-secondary border-b border-border">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                            </div>
                            <div className="flex-1 text-center">
                                <span className="text-xs text-muted-foreground">dashboard.bcaconnect.com</span>
                            </div>
                        </div>
                        <div className="p-6 bg-card">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-secondary border border-border">
                                    <p className="text-sm text-muted-foreground mb-1">Ventes du jour</p>
                                    <p className="text-2xl font-bold text-foreground">2,450,000 GNF</p>
                                    <p className="text-xs text-emerald-500 mt-1">+12% vs hier</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary border border-border">
                                    <p className="text-sm text-muted-foreground mb-1">Commandes en cours</p>
                                    <p className="text-2xl font-bold text-foreground">48</p>
                                    <p className="text-xs text-primary mt-1">15 en livraison</p>
                                </div>
                                <div className="p-4 rounded-lg bg-secondary border border-border">
                                    <p className="text-sm text-muted-foreground mb-1">Nouveaux clients</p>
                                    <p className="text-2xl font-bold text-foreground">127</p>
                                    <p className="text-xs text-emerald-500 mt-1">+8% cette semaine</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
