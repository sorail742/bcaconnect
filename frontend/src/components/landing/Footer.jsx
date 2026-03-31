import { Link } from "react-router-dom"
import { Facebook, Twitter, Linkedin, Instagram } from "lucide-react"

const footerLinks = {
    product: [
        { label: "Catalogue", href: "/catalog" },
        { label: "Nos Marchands", href: "/vendors" },
        { label: "Suivi de commande", href: "/tracking" },
        { label: "Devenir fournisseur", href: "/register" }
    ],
    company: [
        { label: "À propos de BCA", href: "/about" },
        { label: "Notre Mission", href: "/mission" },
        { label: "Contact", href: "/contact" },
        { label: "Presse", href: "/press" }
    ],
    resources: [
        { label: "FAQ", href: "/faq" },
        { label: "Centre d'Aide", href: "/help" },
        { label: "S'inscrire", href: "/register" },
        { label: "Se connecter", href: "/login" }
    ],
    legal: [
        { label: "Confidentialité", href: "/privacy" },
        { label: "Conditions d'utilisation", href: "/terms" },
        { label: "Remboursement", href: "/faq" },
        { label: "Avis Légal", href: "/privacy" }
    ]
}

const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" }
]

export function Footer() {
    return (
        <footer className="relative py-32 overflow-hidden isolate bg-background">
            {/* Ambient Bottom Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-20">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-4 mb-10 group" translate="no">
                            <div className="size-14 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-premium group-hover:scale-110 transition-transform duration-500">
                                <span className="font-black text-lg italic">BC</span>
                            </div>
                            <span className="font-black text-2xl text-foreground tracking-tighter group-hover:text-primary transition-colors uppercase italic underline decoration-primary/30 decoration-4 underline-offset-8">BCA Connect</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-12 max-w-sm leading-relaxed font-bold italic">
                            La première marketplace fintech panafricaine, propulsant le commerce vers une nouvelle ère digitale d'excellence opérationnelle.
                        </p>
                        <div className="flex items-center gap-6">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="size-12 rounded-2xl bg-accent/50 border-2 border-border flex items-center justify-center hover:bg-primary hover:border-primary group/social transition-all duration-300 hover:-translate-y-2 shadow-sm active-press"
                                    aria-label={social.label}
                                >
                                    <social.icon className="size-5 text-muted-foreground group-hover/social:text-background transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 text-[10px] uppercase tracking-[0.3em]">Produit</h4>
                        <ul className="space-y-4">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group/link">
                                        <div className="size-1 rounded-full bg-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 text-[10px] uppercase tracking-[0.3em]">Entreprise</h4>
                        <ul className="space-y-4">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group/link">
                                        <div className="size-1 rounded-full bg-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 text-[10px] uppercase tracking-[0.3em]">Ressources</h4>
                        <ul className="space-y-4">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group/link">
                                        <div className="size-1 rounded-full bg-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white mb-8 text-[10px] uppercase tracking-[0.3em]">Légal</h4>
                        <ul className="space-y-4">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors flex items-center gap-2 group/link">
                                        <div className="size-1 rounded-full bg-primary opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-16 border-t-2 border-border flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 text-center md:text-left">
                        <p className="text-executive-label text-muted-foreground italic uppercase" translate="no">
                            © 2026 BCA Connect Infrastructure.
                        </p>
                        <div className="flex items-center gap-8">
                            <span className="text-executive-label text-primary italic uppercase hover:text-foreground cursor-pointer transition-colors flex items-center gap-2">
                                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                SYSTÈME OPÉRATIONNEL
                            </span>
                            <span className="text-executive-label text-muted-foreground italic uppercase hover:text-primary cursor-pointer transition-colors">V 4.0.0 EXECUTIVE EDITION</span>
                        </div>
                    </div>
                    
                    <div className="px-8 py-3 rounded-full bg-accent/50 border-2 border-border shadow-inner">
                        <p className="text-executive-label text-muted-foreground italic uppercase">
                            Fait avec ❤️ en <span className="text-primary italic font-black">Guinée</span> • High Performance Fintech
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
