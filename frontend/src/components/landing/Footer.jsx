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
        { label: "Notre Mission", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Presse", href: "/contact" }
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
        <footer className="py-16 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
                    {/* Brand */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4" translate="no">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <span className="text-primary-foreground font-bold text-sm">BC</span>
                            </div>
                            <span className="font-bold text-xl text-foreground">BCA Connect</span>
                        </Link>
                        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                            La marketplace digitale qui connecte tous les acteurs du commerce en Afrique.
                        </p>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-muted-foreground" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Produit</h4>
                        <ul className="space-y-3">
                            {footerLinks.product.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Entreprise</h4>
                        <ul className="space-y-3">
                            {footerLinks.company.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Ressources</h4>
                        <ul className="space-y-3">
                            {footerLinks.resources.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Légal</h4>
                        <ul className="space-y-3">
                            {footerLinks.legal.map((link, index) => (
                                <li key={index}>
                                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground" translate="no">
                        © 2026 BCA Connect. Tous droits réservés.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Conçu avec passion en Guinée 🇬🇳
                    </p>
                </div>
            </div>
        </footer>
    )
}
