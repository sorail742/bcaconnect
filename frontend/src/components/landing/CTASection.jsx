import { Button } from "../ui/Button"
import { ArrowRight, Mail, Zap, ShieldCheck, Headphones } from "lucide-react"
import { Link } from "react-router-dom"

export function CTASection() {
    return (
        <section id="contact" className="relative py-32 bg-[#0A0D14] overflow-hidden isolate">
            {/* Atmospheric Backgrounds */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF6600]/5 blur-[160px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="relative max-w-6xl mx-auto">
                    <div className="relative p-12 md:p-24 rounded-[4rem] bg-[#11161D]/50 border border-white/5 text-center shadow-2xl overflow-hidden backdrop-blur-3xl group">

                        {/* Interactive Gradient Glow */}
                        <div className="absolute -top-40 -right-40 size-[500px] bg-[#FF6600]/10 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute -bottom-40 -left-40 size-[500px] bg-blue-600/5 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[10px] font-black text-[#FF6600] mb-10 uppercase tracking-[0.2em] animate-fade-in">
                                <Zap className="size-3 fill-current" />
                                Propulsion Digitale
                            </div>

                            <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tight leading-[0.95] max-w-4xl mx-auto">
                                Propulsez votre commerce <br />
                                <span className="text-[#FF6600] italic">vers le futur.</span>
                            </h2>

                            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed opacity-80">
                                Rejoignez l'élite économique africaine. Une seule plateforme pour des possibilités infinies.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 mb-20Scale">
                                <Link to="/register" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full h-16 rounded-[2rem] px-12 gap-3 text-sm font-black uppercase tracking-widest bg-[#FF6600] shadow-2xl shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all border-none">
                                        Démarrer maintenant
                                        <ArrowRight className="size-5" />
                                    </Button>
                                </Link>
                                <Link to="/contact" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full h-16 rounded-[2rem] px-12 gap-3 text-sm font-black uppercase tracking-widest bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white transition-all">
                                        <Mail className="size-5" />
                                        Nous contacter
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-20 pt-16 border-t border-white/5">
                                {[
                                    { icon: ShieldCheck, label: "Sécurité Militaire", desc: "Transactions cryptées de bout en bout." },
                                    { icon: Zap, label: "Vitesse Éclair", desc: "L'interface la plus rapide du marché." },
                                    { icon: Headphones, label: "Support Élite", desc: "Assistance personnalisée disponible 24/7." }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center text-center gap-4 group/item">
                                        <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#FF6600] group-hover/item:bg-[#FF6600] group-hover/item:text-white transition-all duration-500">
                                            <item.icon className="size-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-white mb-1 uppercase tracking-wider">{item.label}</h4>
                                            <p className="text-[11px] text-slate-500 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
