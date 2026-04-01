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
        <footer className="relative py-24 overflow-hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-8 group">
                            <div className="size-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-500">
                                <span className="font-bold text-lg">BC</span>
                            </div>
                            <span className="font-bold text-2xl text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">BCA Connect</span>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 max-w-sm leading-relaxed font-medium">
                            La plateforme commerciale qui connecte l'Afrique.
                            BCA Connect propulse votre entreprise vers une nouvelle ère digitale d'excellence.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white group/social transition-all duration-300 hover:-translate-y-1"
                                    aria-label={social.label}
                                >
                                    <social.icon className="size-4 transition-colors" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xs uppercase tracking-widest">Marketplace</h4>
                        <ul className="space-y-3">
                            {[
                                { label: "Catalogue", href: "/marketplace" },
                                { label: "Nos Marchands", href: "/vendors" },
                                { label: "Suivi colis", href: "/tracking" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xs uppercase tracking-widest">Entreprise</h4>
                        <ul className="space-y-3">
                            {[
                                { label: "À propos", href: "/about" },
                                { label: "Contact", href: "/contact" },
                                { label: "Légal", href: "/privacy" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="col-span-2">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xs uppercase tracking-widest">Newsletter</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">Restez informé des dernières pépites locales et offres exclusives.</p>
                        <div className="flex gap-2">
                            <input type="text" placeholder="votre@email.com" className="h-11 flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-xs font-semibold px-4 focus:ring-2 focus:ring-primary/20" />
                            <Button size="sm" className="h-11 px-6 rounded-xl font-bold">OK</Button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        © 2026 BCA Connect Infrastructure.
                    </p>
                    <div className="flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2 text-secondary">
                            <div className="size-1.5 rounded-full bg-secondary animate-pulse" />
                            SYSTÈME OPÉRATIONNEL
                        </span>
                        <span>FINTECH SCALE-UP</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
