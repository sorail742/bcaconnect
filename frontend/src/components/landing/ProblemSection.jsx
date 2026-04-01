import { AlertTriangle, Unplug, Truck, CreditCard } from "lucide-react"

const problems = [
    {
        icon: Unplug,
        title: "Marchés fragmentés",
        description: "Les acteurs économiques peinent à accéder à une offre centralisée, compliquant la recherche de partenaires fiables."
    },
    {
        icon: CreditCard,
        title: "Défis de paiement",
        description: "Accès limité aux solutions digitales et manque de confiance dans les transactions en ligne sécurisées."
    },
    {
        icon: Truck,
        title: "Coordination logistique",
        description: "Infrastructures limitées et processus inefficaces entraînant des coûts élevés et des délais prolongés."
    },
    {
        icon: AlertTriangle,
        title: "Manque de transparence",
        description: "Absence de traçabilité des transactions et problèmes de confiance récurrents entre les parties prenantes."
    }
]

export function ProblemSection() {
    return (
        <section className="relative py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-600 dark:text-red-400 mb-6 uppercase tracking-widest animate-fade-in-up">
                        Les obstacles actuels
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight animate-fade-in-up">
                        Le commerce fait face à des <br />
                        <span className="text-red-500">défis structurels</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-80 animate-fade-in-up">
                        Des barrières réelles limitent encore l'expansion du commerce digital sur le continent africain.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up">
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="group relative p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-red-500/20"
                        >
                            <div className="absolute top-6 right-8 text-6xl font-bold text-slate-100 dark:text-white/5 select-none leading-none -z-10 transition-transform duration-700 group-hover:scale-110">
                                0{index + 1}
                            </div>
                            <div className="size-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 border border-red-500/20">
                                <problem.icon className="size-7 text-red-600 dark:text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{problem.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
