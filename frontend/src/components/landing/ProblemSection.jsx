import { AlertTriangle, Unplug, Truck, CreditCard } from "lucide-react"

const problems = [
    {
        icon: Unplug,
        title: "Marchés fragmentés",
        description: "Les acteurs économiques peinent à accéder à une offre centralisée. Les fournisseurs sont dispersés, compliquant la recherche de partenaires fiables."
    },
    {
        icon: CreditCard,
        title: "Défis de paiement",
        description: "Accès limité aux solutions de paiement digitales. Manque de confiance dans les transactions en ligne et absence de solutions de crédit adaptées."
    },
    {
        icon: Truck,
        title: "Coordination logistique",
        description: "Infrastructures de transport limitées, processus inefficaces, coûts de livraison élevés et délais prolongés, surtout en zones rurales."
    },
    {
        icon: AlertTriangle,
        title: "Manque de transparence",
        description: "Absence de traçabilité des transactions, problèmes de confiance entre parties. Les acheteurs craignent les fraudes, les vendeurs les impayés."
    }
]

export function ProblemSection() {
    return (
        <section className="py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
                        Les défis actuels
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        Le commerce digital en Afrique fait face à des obstacles majeurs
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Des défis structurels et opérationnels freinent l'efficacité et l'impact économique des chaînes d'approvisionnement.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-xl bg-card border border-border hover:border-destructive/30 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                                <problem.icon className="w-6 h-6 text-destructive" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">{problem.title}</h3>
                            <p className="text-muted-foreground">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
