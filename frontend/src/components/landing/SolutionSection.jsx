import { CheckCircle2, Store, Shield, Truck, MessageSquare } from "lucide-react"

const solutions = [
    {
        icon: Store,
        title: "Marketplace intégrée",
        description: "Une plateforme unique où acheteurs et vendeurs se rencontrent avec un catalogue dynamique."
    },
    {
        icon: Shield,
        title: "Paiements sécurisés",
        description: "Solutions Mobile Money et cartes bancaires avec authentification renforcée."
    },
    {
        icon: Truck,
        title: "Gestion des livraisons",
        description: "Suivi GPS en temps réel et coordination optimisée des prestataires locaux."
    },
    {
        icon: MessageSquare,
        title: "Communication unifiée",
        description: "Messagerie fluide entre tous les acteurs pour une coordination sans faille."
    }
]

export function SolutionSection() {
    return (
        <section className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-secondary/10 border border-secondary/20 text-[10px] font-bold text-secondary mb-6 uppercase tracking-widest">
                            La Solution BCA
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                            BCA Connect transforme <br />
                            <span className="text-secondary">votre expérience commerciale</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed opacity-80">
                            Un écosystème digital complet reliant efficacement tous les acteurs de la chaîne de valeur commerciale.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Réduction des coûts logistiques jusqu'à 40%",
                                "Transactions sécurisées et traçables",
                                "Accès facilité aux financements",
                                "Support local dédié en continu"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="size-6 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="size-4 text-secondary" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 font-bold text-base tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        {solutions.map((solution, index) => (
                            <div
                                key={index}
                                className="group relative p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-secondary/20"
                            >
                                <div className="size-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-secondary/20">
                                    <solution.icon className="size-6 text-secondary" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{solution.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{solution.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
