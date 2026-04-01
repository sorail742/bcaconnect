import { User, Store, Truck, Building2, Settings } from "lucide-react"
import { cn } from "../../lib/utils"

const roles = [
    {
        icon: User,
        title: "Clients",
        description: "Accès au catalogue complet, comparaison des prix, paiements flexibles et suivi en temps réel.",
        color: "bg-primary",
        textColor: "text-primary"
    },
    {
        icon: Store,
        title: "Vendeurs",
        description: "Gestion des stocks, outils de vente, analytics de performance et visibilité accrue sur le marché.",
        color: "bg-secondary",
        textColor: "text-secondary"
    },
    {
        icon: Truck,
        title: "Livreurs",
        description: "Optimisation des tournées, GPS intégré et gestion simplifiée des livraisons de proximité.",
        color: "bg-accent",
        textColor: "text-accent"
    },
    {
        icon: Building2,
        title: "Banques",
        description: "Gestion sécurisée des transactions, solutions de microfinance et crédits de campagne.",
        color: "bg-primary/80",
        textColor: "text-primary/80"
    },
    {
        icon: Settings,
        title: "Admin",
        description: "Modération, résolution des litiges et support utilisateur pour un écosystème sain.",
        color: "bg-secondary/80",
        textColor: "text-secondary/80"
    }
]

export function RolesSection() {
    return (
        <section id="roles" className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-6 uppercase tracking-widest">
                        Écosystème Connecté
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Un espace de travail pour <br />
                        <span className="text-primary">chaque acteur</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-80">
                        Des interfaces spécialisées pour optimiser le travail de tous les intervenants.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up">
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/20",
                                index === 4 ? 'lg:col-start-2' : ''
                            )}
                        >
                            <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm", role.color)}>
                                <role.icon className="size-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{role.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{role.description}</p>

                            <div className={cn("mt-6 h-1 w-12 rounded-full opacity-30", role.color)} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
