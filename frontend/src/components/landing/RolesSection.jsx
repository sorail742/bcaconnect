import { User, Store, Truck, Building2, Settings } from "lucide-react"
import { cn } from "../../lib/utils"

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
                <section id="roles" className="relative py-32 md:py-48 overflow-hidden isolate">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-[10px] font-black text-purple-600 dark:text-purple-400 mb-8 uppercase tracking-[0.3em] shadow-sm">
                        Diversité des Acteurs
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                        Un écosystème{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 italic">
                            multi-acteurs
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 text-pretty font-medium leading-relaxed opacity-80">
                        Des espaces de travail sur-mesure pour chaque intervenant de la chaîne de valeur.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {roles.map((role, index) => (
                        <div
                            key={index}
                            className={cn(
                                "group relative p-10 rounded-[2.5rem] glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl border-white/20 dark:border-white/5 active-press",
                                index === 4 ? 'md:col-span-2 lg:col-span-1 lg:col-start-2' : ''
                            )}
                        >
                            <div className={cn("size-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg border border-white/10", role.color)}>
                                <role.icon className="size-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{role.title}</h3>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium opacity-80">{role.description}</p>
                            
                            <div className="mt-8 size-1.5 rounded-full bg-slate-200 dark:bg-white/10 group-hover:w-8 group-hover:bg-primary transition-all duration-500" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
