import { Button } from "../ui/Button"
import { ArrowRight, Mail } from "lucide-react"
import { Link } from "react-router-dom"

export function CTASection() {
    return (
        <section id="contact" className="relative py-24 bg-white dark:bg-slate-950 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="relative max-w-5xl mx-auto">
                    <div className="relative p-10 md:p-20 rounded-[3rem] bg-slate-900 border border-slate-800 text-center shadow-2xl overflow-hidden group">
                        {/* Decorative Background */}
                        <div className="absolute -top-24 -right-24 size-80 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 size-80 bg-secondary/10 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 mb-8 uppercase tracking-widest">
                                Prêt pour l'aventure ?
                            </div>

                            <h2 className="text-3xl md:text-6xl font-bold text-white mb-8 tracking-tight leading-tight">
                                Propulsez votre commerce <br />
                                <span className="text-primary font-bold">vers le futur.</span>
                            </h2>

                            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                                Rejoignez l'élite économique africaine. Une seule plateforme pour des possibilités infinies.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full h-14 rounded-xl px-10 gap-3 text-base font-bold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                        Démarrer maintenant
                                        <ArrowRight className="size-5" />
                                    </Button>
                                </Link>
                                <Link to="/contact" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full h-14 rounded-xl px-10 gap-3 text-base font-bold bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all">
                                        <Mail className="size-5" />
                                        Nous contacter
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-secondary" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Sécurisé</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-secondary" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Support 24/7</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-secondary" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Évolutif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
