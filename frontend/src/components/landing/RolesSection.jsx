import { User, Store, Truck, Building2, Settings } from "lucide-react"

const roles = [
    {
        icon: User,
        title: "Clients",
        description: "Particuliers et entreprises qui achètent des produits. Accès au catalogue, comparaison des prix, paiements flexibles et suivi des livraisons.",
        color: "bg-emerald-500"
    },
    {
        icon: Store,
        title: "Vendeurs",
        description: "Fournisseurs et commerçants qui vendent leurs produits. Gestion des stocks, analytics de ventes, certifications et visibilité accrue.",
        color: "bg-primary"
    },
    {
        icon: Truck,
        title: "Livreurs",
        description: "Transporteurs et coursiers qui assurent la logistique. Gestion des tournées, GPS intégré, optimisation des itinéraires.",
        color: "bg-amber-500"
    },
    {
        icon: Building2,
        title: "Banques",
        description: "Institutions financières partenaires. Gestion des transactions, solutions de crédit, microfinance et paiements échelonnés.",
        color: "bg-blue-500"
    },
    {
        icon: Settings,
        title: "Administrateurs",
        description: "Équipe de gestion de la plateforme. Modération, résolution des litiges, analytics globales et support utilisateur.",
        color: "bg-purple-500"
    }
]

export function RolesSection() {
    return (
        <section id="roles" className="py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Les rôles
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        Un écosystème multi-acteurs
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Chaque acteur dispose d'un espace dédié avec des outils adaptés à ses besoins spécifiques.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className={`group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all ${index === 4 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-lg ${role.color} flex items-center justify-center mb-4`}>
                                <role.icon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">{role.title}</h3>
                            <p className="text-muted-foreground">{role.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
