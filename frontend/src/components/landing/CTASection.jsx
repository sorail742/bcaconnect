import { Button } from "../ui/Button"
import { ArrowRight, Mail } from "lucide-react"
import { Link } from "react-router-dom"

export function CTASection() {
    return (
                <section id="contact" className="relative py-32 md:py-48 overflow-hidden isolate">
            <div className="container mx-auto px-4 relative z-10">
                <div className="relative max-w-5xl mx-auto">
                    {/* Background Glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[120px] rounded-full -z-10 animate-pulse-glow" />
                    
                    <div className="relative p-12 md:p-24 rounded-[3.5rem] bg-slate-900 border border-white/10 text-center shadow-2xl overflow-hidden group">
                        {/* Interactive Background Gradient */}
                        <div className="absolute inset-0 bg-premium-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                        <div className="absolute -top-24 -right-24 size-96 bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute -bottom-24 -left-24 size-96 bg-indigo-500/20 blur-[100px] rounded-full" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white/60 mb-10 uppercase tracking-[0.4em]">
                                Prêt pour l'étape suivante ?
                            </div>
                            
                            <h2 className="text-4xl md:text-7xl font-black text-white mb-10 text-balance tracking-tighter leading-[0.9]">
                                Propulsez votre commerce vers le{" "}
                                <span className="text-premium-gradient italic">
                                    futur.
                                </span>
                            </h2>
                            
                            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto mb-16 text-pretty font-medium leading-relaxed">
                                Rejoignez l'élite économique africaine. Une plateforme, des possibilités infinies.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <Button variant="premium" size="lg" className="w-full h-16 rounded-2xl px-12 gap-3 text-lg shadow-2xl shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-500">
                                        Démarrer l'aventure
                                        <ArrowRight className="size-6" />
                                    </Button>
                                </Link>
                                <Link to="/contact" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full h-16 rounded-2xl px-12 gap-3 text-lg bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all duration-500 active:scale-95">
                                        <Mail className="size-6" />
                                        Nous contacter
                                    </Button>
                                </Link>
                            </div>

                            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                <p className="text-sm font-black text-white uppercase tracking-widest">Garanti :</p>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-white uppercase tracking-tighter">Sécurisé</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-white uppercase tracking-tighter">Support 24/7</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs font-bold text-white uppercase tracking-tighter">Évolutif</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
