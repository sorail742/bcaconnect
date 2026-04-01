import {
    ShoppingBag,
    Users,
    ClipboardList,
    CreditCard,
    MapPin,
    MessageCircle,
    ArrowRight
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

const features = [
    {
        icon: ShoppingBag,
        title: "Catalogue Produits",
        description: "Un catalogue complet regroupant les meilleurs articles du marché local et international.",
        route: "/marketplace",
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20"
    },
    {
        icon: Users,
        title: "Réseau Marchands",
        description: "Accédez à une liste de vendeurs certifiés et fiables pour toutes vos transactions.",
        route: "/vendors",
        color: "text-secondary",
        bg: "bg-secondary/10",
        border: "border-secondary/20"
    },
    {
        icon: MapPin,
        title: "Suivi Logistique",
        description: "Suivez vos colis en temps réel jusqu'à votre porte avec notre système intégré.",
        route: "/tracking",
        color: "text-accent",
        bg: "bg-accent/10",
        border: "border-accent/20"
    },
    {
        icon: CreditCard,
        title: "Paiements Flexibles",
        description: "Payez en toute sécurité via Mobile Money, carte bancaire ou virement local.",
        route: "/payments",
        color: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20"
    },
    {
        icon: ClipboardList,
        title: "Gestion Commandes",
        description: "Une interface intuitive pour suivre l'historique et l'état de vos achats.",
        route: "/orders",
        color: "text-secondary",
        bg: "bg-secondary/10",
        border: "border-secondary/20"
    },
    {
        icon: MessageCircle,
        title: "Support Client",
        description: "Une assistance dédiée disponible 24h/24 pour répondre à tous vos besoins.",
        route: "/contact",
        color: "text-accent",
        bg: "bg-accent/10",
        border: "border-accent/20"
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-6 uppercase tracking-widest">
                        Nos Services
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Une plateforme pensée <br />
                        <span className="text-primary">pour votre croissance</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                        Des outils modernes pour simplifier le commerce et la distribution partout en Afrique.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.route}
                            className={cn(
                                "group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 block hover:-translate-y-2 hover:shadow-xl hover:border-primary/20"
                            )}
                        >
                            <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 shadow-sm", feature.bg)}>
                                <feature.icon className={cn("size-7 transition-colors", feature.color)} />
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.description}</p>

                            <div className="mt-8 flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                En savoir plus
                                <ArrowRight className="size-3" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
