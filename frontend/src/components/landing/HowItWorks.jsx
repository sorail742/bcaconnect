const steps = [
    {
        number: "01",
        title: "Parcourir le catalogue",
        description: "Explorez les produits, comparez les prix et sélectionnez vos articles favoris."
    },
    {
        number: "02",
        title: "Passer commande",
        description: "Validez votre panier et payez en toute sécurité via nos solutions intégrées."
    },
    {
        number: "03",
        title: "Traitement rapide",
        description: "Le vendeur prépare votre colis et notre système logistique prend le relais."
    },
    {
        number: "04",
        title: "Livraison suivie",
        description: "Recevez votre colis à l'endroit de votre choix avec un suivi en temps réel."
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative py-24 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary mb-6 uppercase tracking-widest">
                        Processus Simple
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-tight">
                        Comment ça <span className="text-primary">marche ?</span>
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed opacity-80">
                        Un flux optimisé pour une expérience fluide de la commande à la livraison.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-12 left-12 right-12 h-px border-t-2 border-dashed border-slate-200 dark:border-slate-800 -z-0 opacity-50" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group animate-fade-in-up">
                                <div className="relative z-10 size-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6 shadow-md group-hover:scale-105 group-hover:border-primary/30 transition-all duration-300">
                                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-4">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
