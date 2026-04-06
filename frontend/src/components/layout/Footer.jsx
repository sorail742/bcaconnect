import React from 'react';
import { Link } from 'react-router-dom';
import { Share2, Globe, Mail, ShieldCheck, Send, Zap, Satellite, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer = () => {
    const { t, lang } = useLanguage();
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-10 bg-background overflow-hidden border-t border-border">
            <div className="absolute bottom-0 right-0 size-80 bg-primary/[0.03] rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-8">

                    {/* Brand */}
                    <div className="lg:col-span-5 space-y-4">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                                <Zap className="size-4 fill-current" />
                            </div>
                            <span className="font-bold text-lg text-foreground tracking-tight">
                                BCA<span className="text-primary">Connect</span>
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            {lang === 'FR'
                                ? "La passerelle moderne du commerce africain."
                                : "The modern gateway for African commerce."}
                        </p>
                        <div className="flex items-center gap-2">
                            {[Share2, Globe, Mail].map((Icon, i) => (
                                <a key={i} href="#"
                                    className="size-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                    <Icon className="size-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="lg:col-span-3 space-y-3">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wide">{t('marketplace') || 'Marché'}</h4>
                        <ul className="space-y-2">
                            {[
                                { label: t('catalog') || 'Catalogue', href: '/marketplace' },
                                { label: t('vendors') || 'Vendeurs', href: '/vendors' },
                                { label: t('tracking') || 'Suivi', href: '/tracking' },
                            ].map((link, i) => (
                                <li key={i}>
                                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                        <div className="size-1 bg-border rounded-full group-hover:bg-primary transition-colors" />
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:col-span-4 space-y-3">
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wide">Newsletter</h4>
                        <p className="text-xs text-muted-foreground">
                            {lang === 'FR' ? "Abonnez-vous aux actualités réseau." : "Subscribe to network updates."}
                        </p>
                        <div className="relative">
                            <input type="email" placeholder={lang === 'FR' ? "votre@email.com" : "your@email.com"}
                                className="w-full h-10 bg-background border border-border rounded-xl text-sm px-3 pr-12 outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-muted-foreground" />
                            <button className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-foreground text-background rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                                <Send className="size-3.5" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Activity className="size-3 text-emerald-500 animate-pulse" /> Système actif 100%
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p className="text-xs text-muted-foreground">
                            © {currentYear} BCA Connect. Tous droits réservés.
                        </p>
                        <div className="flex items-center gap-3">
                            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('privacy') || 'Confidentialité'}</Link>
                            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('terms') || 'CGU'}</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                {lang === 'FR' ? 'Opérationnel' : 'Operational'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Satellite className="size-4" />
                            <span>Guinée</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
