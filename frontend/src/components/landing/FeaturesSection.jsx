import {
    ShoppingBag,
    Users,
    ClipboardList,
    CreditCard,
    MapPin,
    MessageCircle,
    Wallet
} from "lucide-react"
import { Link } from "react-router-dom"

const features = [
    {
        icon: ShoppingBag,
        title: "Marketplace produits",
        description: "Catalogue dynamique multi-catégories avec comparaison des offres, avis clients et certifications fournisseurs.",
        route: "/marketplace"
    },
    {
        icon: Users,
        title: "Gestion des vendeurs",
        description: "Outils complets pour les vendeurs : gestion des stocks, suivi des ventes, analytics et badges de fiabilité.",
        route: "/vendors"
    },
    {
        icon: ClipboardList,
        title: "Gestion des commandes",
        description: "Suivi en temps réel des commandes, automatisation des processus et notifications à chaque étape.",
        route: "/orders"
    },
    {
        icon: CreditCard,
        title: "Paiements sécurisés",
        description: "Mobile Money, cartes bancaires, cryptomonnaies. Authentification biométrique et MFA inclus.",
        route: "/payments"
    },
    {
        icon: MapPin,
        title: "Suivi des livraisons",
        description: "GPS en temps réel, coordination des livreurs, options de transport flexibles et assurance logistique.",
        route: "/tracking"
    },
    {
        icon: MessageCircle,
        title: "Messagerie intégrée",
        description: "Communication directe entre acheteurs, vendeurs et livreurs. Chatbot d'assistance 24/7.",
        route: "/messages"
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Fonctionnalités
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        Tout ce dont vous avez besoin pour réussir
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Une plateforme complète avec des outils puissants pour chaque aspect de votre activité commerciale.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.route}
                            className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all block cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                                <feature.icon className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground">{feature.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
