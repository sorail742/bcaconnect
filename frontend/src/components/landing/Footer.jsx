import { Link } from "react-router-dom"
import { Facebook, Twitter, Linkedin, Instagram, ArrowUpRight, Send, Globe } from "lucide-react"
import { Button } from "../ui/Button"

const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
]

export function Footer() {
    return (
        <footer className="relative py-32 bg-[#0A0D14] overflow-hidden border-t border-white/5">
            {/* Atmospheric Backgrounds */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#FF6600]/50 to-transparent" />
            <div className="absolute bottom-0 right-0 size-[400px] bg-[#FF6600]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-10 group">
                            <div className="size-14 rounded-2xl bg-[#FF6600] text-white flex items-center justify-center shadow-2xl shadow-[#FF6600]/20 group-hover:rotate-6 transition-all duration-500">
                                <span className="font-black text-xl">BC</span>
                            </div>
                            <span className="font-black text-3xl text-white tracking-tighter group-hover:text-[#FF6600] transition-colors">BCA<span className="text-[#FF6600]">Connect</span></span>
                        </Link>
                        <p className="text-lg text-slate-400 mb-10 max-w-sm leading-relaxed font-medium opacity-80">
                            La passerelle moderne du commerce africain.
                            Nous connectons les talents, les produits et les opportunités sur tout le continent.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-[#FF6600] hover:text-white hover:border-[#FF6600] group/social transition-all duration-500 hover:-translate-y-2"
                                    aria-label={social.label}
                                >
                                    <social.icon className="size-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-black text-white mb-8 text-[11px] uppercase tracking-[0.2em] text-[#FF6600]">Marketplace</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Catalogue Global", href: "/marketplace" },
                                { label: "Marchands Élite", href: "/vendors" },
                                { label: "Track System", href: "/tracking" },
                                { label: "Devenir Vendeur", href: "/register" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all">
                                        <ArrowUpRight className="size-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#FF6600]" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 text-[11px] uppercase tracking-[0.2em] text-[#FF6600]">Société</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Notre Vision", href: "/about" },
                                { label: "Impact Social", href: "/impact" },
                                { label: "Partenaires", href: "/partners" },
                                { label: "Assistance", href: "/contact" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="group flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-all">
                                        <ArrowUpRight className="size-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#FF6600]" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-white mb-8 text-[11px] uppercase tracking-[0.2em] text-[#FF6600]">Newsletter</h4>
                        <p className="text-sm text-slate-400 mb-8 font-medium leading-relaxed opacity-80">Recevez l'essentiel de l'actu Tech & Business en Afrique.</p>
                        <div className="relative group/input">
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl text-white text-xs font-bold px-5 focus:outline-none focus:border-[#FF6600]/50 transition-all pr-12"
                            />
                            <button className="absolute right-2 top-2 size-10 rounded-xl bg-[#FF6600] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF6600]/20">
                                <Send className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            © 2026 BCA CONNECT. TOUS DROITS RÉSERVÉS.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Confidentialité</Link>
                            <Link to="/terms" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Conditions</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Opérationnel</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                            <Globe className="size-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">FR / EN / KIK</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
