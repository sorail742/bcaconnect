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
        <section id="how-it-works" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                        Comment ça marche
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                        Simple, rapide et efficace
                    </h2>
                    <p className="text-lg text-muted-foreground text-pretty">
                        Un processus fluide qui connecte tous les acteurs du commerce en quelques étapes simples.
                    </p>
                </div>

                <div className="relative max-w-5xl mx-auto">
                    {/* Connection line */}
                    <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center">
                                <div className="relative z-10 w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
                                    <span className="text-lg font-bold text-primary-foreground">{step.number}</span>
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                                <p className="text-sm text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
