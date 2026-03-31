const steps = [
    {
        number: "01",
        title: "Les clients parcourent",
        description: "Les clients explorent le catalogue, comparent les produits et sélectionnent ce dont ils ont besoin."
    },
    {
        number: "02",
        title: "Les vendeurs vendent",
        description: "Les vendeurs listent leurs produits, gèrent leurs stocks et reçoivent les commandes en temps réel."
    },
    {
        number: "03",
        title: "Les paiements sont traités",
        description: "Transactions sécurisées via Mobile Money, cartes bancaires ou portefeuille électronique."
    },
    {
        number: "04",
        title: "Les livreurs livrent",
        description: "Les transporteurs prennent en charge les commandes et les livrent avec suivi GPS en temps réel."
    }
]

export function HowItWorks() {
    return (
                <section id="how-it-works" className="relative py-32 md:py-48 overflow-hidden isolate">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-blue-500/5 dark:bg-primary/5 blur-[160px] rounded-full pointer-events-none -z-10" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center mb-24 animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/5 border border-primary/20 text-[10px] font-black text-primary mb-8 uppercase tracking-[0.3em] shadow-sm">
                        Processus Intégré
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[1.1]">
                        Simple, rapide et{" "}
                        <span className="text-premium-gradient italic">
                            efficace
                        </span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 text-pretty font-medium leading-relaxed opacity-80">
                        Un flux de travail optimisé pour maximiser votre productivité et vos revenus.
                    </p>
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Premium Connection Line */}
                    <div className="hidden md:block absolute top-12 left-12 right-12 h-[2px] border-t-2 border-dashed border-slate-200 dark:border-white/10 -z-10 opacity-50" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="relative z-10 size-24 rounded-3xl bg-white dark:bg-white/[0.03] border border-white/20 dark:border-white/10 flex items-center justify-center mb-8 shadow-premium group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 active-press">
                                    <div className="absolute inset-0 bg-premium-gradient opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500" />
                                    <span className="text-3xl font-black text-slate-900 dark:text-white tracking-widest">{step.number}</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">{step.title}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium opacity-80 px-4">{step.description}</p>
                                
                                {index < steps.length - 1 && (
                                    <div className="md:hidden size-1 bg-slate-200 dark:bg-white/10 rounded-full my-8" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
