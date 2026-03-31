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
                <section className="relative py-32 md:py-48 overflow-hidden isolate">
            {/* Minimalist Atmospheric Glows */}
            <div className="absolute top-1/4 right-[5%] w-[600px] h-[600px] bg-red-500/10 dark:bg-red-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 left-[-5%] w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none -z-10" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500/5 border border-red-500/20 text-[10px] font-black text-red-600 dark:text-red-400 mb-8 uppercase tracking-[0.3em] shadow-sm animate-fade-in-up">
                        Les points de friction
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1] animate-fade-in-up">
                        Le commerce en Afrique fait face à des{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-orange-500 dark:from-red-400 dark:to-orange-400 italic">
                            défis réels
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 text-pretty font-medium leading-relaxed opacity-80 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        Des barrières structurelles limitent encore l'expansion du commerce digital sur le continent.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {problems.map((problem, index) => (
                        <div
                            key={index}
                            className="group relative p-10 rounded-[2.5rem] glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-red-500/10 border-white/20 dark:border-white/5 active-press"
                        >
                            <div className="absolute top-6 right-8 text-[120px] font-black text-slate-900/5 dark:text-white/5 select-none leading-none -z-10 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
                                0{index + 1}
                            </div>
                            <div className="size-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-red-500/20">
                                <problem.icon className="size-8 text-red-600 dark:text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{problem.title}</h3>
                            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium opacity-90">{problem.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
