import { Button } from "../ui/Button"
import { ArrowRight, Mail } from "lucide-react"

export function CTASection() {
    return (
        <section id="contact" className="py-20 md:py-32 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="relative max-w-4xl mx-auto">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 rounded-3xl blur-3xl" />

                    <div className="relative p-8 md:p-16 rounded-3xl bg-card border border-border text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
                            Prêt à transformer votre commerce ?
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
                            Rejoignez des milliers d'utilisateurs qui font déjà confiance à BCA Connect pour développer leur activité en Afrique.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button size="lg" className="w-full sm:w-auto gap-2">
                                Commencer avec BCA Connect
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                                <Mail className="w-4 h-4" />
                                Nous contacter
                            </Button>
                        </div>

                        <p className="mt-6 text-sm text-muted-foreground">
                            Essai gratuit de 30 jours. Aucune carte bancaire requise.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
