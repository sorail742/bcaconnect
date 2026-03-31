import { CheckCircle2, Store, Shield, Truck, MessageSquare } from "lucide-react"

const solutions = [
    {
        icon: Store,
        title: "Marketplace intégrée",
        description: "Une plateforme unique où acheteurs et vendeurs se rencontrent avec un catalogue dynamique multi-catégories."
    },
    {
        icon: Shield,
        title: "Paiements sécurisés",
        description: "Solutions de paiement multicanal (Mobile Money, cartes bancaires) avec authentification renforcée et portefeuille électronique."
    },
    {
        icon: Truck,
        title: "Gestion des livraisons",
        description: "Suivi GPS en temps réel, coordination des livraisons groupées et partenariats avec des prestataires locaux."
    },
    {
        icon: MessageSquare,
        title: "Communication unifiée",
        description: "Système de messagerie intégré pour une communication fluide entre tous les acteurs de l'écosystème."
    }
]

export function SolutionSection() {
    return (
                <section className="relative py-32 md:py-48 overflow-hidden isolate">
            {/* Soft Atmospheric Glows */}
            <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-blue-500/10 dark:bg-primary/5 blur-[160px] rounded-full pointer-events-none -translate-y-1/2 -z-10" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary mb-8 uppercase tracking-[0.3em] shadow-sm">
                            La Réponse BCA
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                            BCA Connect transforme le{" "}
                            <span className="text-premium-gradient italic">
                                commerce digital
                            </span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 text-pretty font-medium leading-relaxed opacity-80">
                            Une centrale d'achat virtuelle et un écosystème digital complet, reliant efficacement tous les acteurs de la chaîne de valeur.
                        </p>

                        <div className="space-y-6">
                            {[
                                "Réduction des coûts logistiques jusqu'à 40%",
                                "Transactions sécurisées et traçables",
                                "Accès à des solutions de financement",
                                "Support multilingue local"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-4 group cursor-default">
                                    <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white shadow-sm">
                                        <CheckCircle2 className="size-5 text-primary group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="text-slate-900 dark:text-white font-bold text-lg tracking-tight group-hover:translate-x-1 transition-transform">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        {solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="group relative p-10 rounded-[2.5rem] glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-white/20 dark:border-white/5 active-press"
                            >
                                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-primary/20 shadow-inner">
                                    <solution.icon className="size-7 text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{solution.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium opacity-80">{solution.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
