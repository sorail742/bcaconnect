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
        title: "Marketplace produits",
        description: "Catalogue dynamique multi-catégories avec comparaison des offres, avis clients et certifications.",
        route: "/marketplace",
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-50 dark:bg-blue-500/10",
        borderHover: "hover:border-blue-200 dark:hover:border-blue-500/30",
        glow: "group-hover:bg-blue-500/5 dark:group-hover:bg-blue-500/20"
    },
    {
        icon: Users,
        title: "Gestion des vendeurs",
        description: "Outils complets pour les vendeurs : gestion des stocks, suivi des ventes, analytics et badges.",
        route: "/vendors",
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-50 dark:bg-emerald-500/10",
        borderHover: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
        glow: "group-hover:bg-emerald-500/5 dark:group-hover:bg-emerald-500/20"
    },
    {
        icon: ClipboardList,
        title: "Gestion des commandes",
        description: "Suivi en temps réel des commandes, automatisation des processus et notifications à chaque étape.",
        route: "/orders",
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-50 dark:bg-amber-500/10",
        borderHover: "hover:border-amber-200 dark:hover:border-amber-500/30",
        glow: "group-hover:bg-amber-500/5 dark:group-hover:bg-amber-500/20"
    },
    {
        icon: CreditCard,
        title: "Paiements sécurisés",
        description: "Mobile Money, cartes bancaires, cryptomonnaies. Authentification biométrique et MFA inclus.",
        route: "/payments",
        color: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-50 dark:bg-purple-500/10",
        borderHover: "hover:border-purple-200 dark:hover:border-purple-500/30",
        glow: "group-hover:bg-purple-500/5 dark:group-hover:bg-purple-500/20"
    },
    {
        icon: MapPin,
        title: "Suivi des livraisons",
        description: "GPS en temps réel, coordination des livreurs, options de transport flexibles et logistique.",
        route: "/tracking",
        color: "text-rose-600 dark:text-rose-400",
        bg: "bg-rose-50 dark:bg-rose-500/10",
        borderHover: "hover:border-rose-200 dark:hover:border-rose-500/30",
        glow: "group-hover:bg-rose-500/5 dark:group-hover:bg-rose-500/20"
    },
    {
        icon: MessageCircle,
        title: "Messagerie intégrée",
        description: "Communication directe entre acheteurs, vendeurs et livreurs. Chatbot d'assistance 24/7.",
        route: "/messages",
        color: "text-cyan-600 dark:text-cyan-400",
        bg: "bg-cyan-50 dark:bg-cyan-500/10",
        borderHover: "hover:border-cyan-200 dark:hover:border-cyan-500/30",
        glow: "group-hover:bg-cyan-500/5 dark:group-hover:bg-cyan-500/20"
    }
]

export function FeaturesSection() {
    return (
                <section id="features" className="relative py-32 md:py-48 overflow-hidden isolate">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
            <div className="absolute top-[10%] right-[-10%] w-[600px] h-[600px] bg-blue-500/5 dark:bg-primary/5 blur-[140px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-[10%] left-[-10%] w-[700px] h-[700px] bg-indigo-500/5 dark:bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary mb-8 uppercase tracking-[0.3em] shadow-sm">
                        Écosystème Complet
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                        Tout ce dont vous avez besoin{" "}
                        <span className="text-premium-gradient italic">
                            pour exceller
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 text-pretty font-medium leading-relaxed opacity-80">
                        Une suite d'outils puissants conçus pour répondre aux exigences du Marché Africain moderne.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            to={feature.route}
                            className={cn(
                                "group relative p-10 rounded-[2.5rem] glass-card transition-all duration-500 block hover:-translate-y-2 hover:shadow-2xl border-white/20 dark:border-white/5 active-press overflow-hidden",
                                "dark:hover:shadow-primary/10"
                            )}
                        >
                            {/* Animated Hover Glow */}
                            <div className="absolute inset-0 bg-radial-glow opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                            
                            <div className={cn("size-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/10 shadow-inner relative z-10", feature.bg)}>
                                <feature.icon className={cn("size-8 transition-colors", feature.color)} />
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight relative z-10">{feature.title}</h3>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium opacity-80 relative z-10">{feature.description}</p>
                            
                            <div className="mt-8 flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500 relative z-10">
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
