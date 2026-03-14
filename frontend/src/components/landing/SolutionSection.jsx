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
        <section className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                            Notre solution
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-balance">
                            BCA Connect transforme le commerce digital africain
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8 text-pretty">
                            Une centrale d'achat virtuelle et un écosystème digital complet, reliant efficacement tous les acteurs économiques : ménages, entreprises, institutions, fournisseurs, banques et prestataires de services.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Réduction des coûts logistiques jusqu'à 40%",
                                "Transactions sécurisées et traçables",
                                "Accès à des solutions de financement adaptées",
                                "Support multilingue (Français, Soussou, Peul)"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                                    <span className="text-foreground">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                            >
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                                    <solution.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{solution.title}</h3>
                                <p className="text-sm text-muted-foreground">{solution.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
