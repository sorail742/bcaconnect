import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Mail, MapPin, Phone, ShieldCheck, Zap, Star, Globe, Share2, Activity } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { toast } from 'sonner';

export function Footer() {
    const { t, lang } = useLanguage();
    const currentYear = new Date().getFullYear();
    const [newsletterEmail, setNewsletterEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!newsletterEmail) {
            toast.error(lang === 'FR' ? "Veuillez entrer une adresse email." : "Please enter an email address.");
            return;
        }
        
        // Simuler un appel API
        toast.success(lang === 'FR' 
            ? "Merci ! Vous êtes maintenant inscrit à notre newsletter." 
            : "Thank you! You are now subscribed to our newsletter."
        );
        setNewsletterEmail('');
    };

    const handleSocialClick = (name) => {
        toast.info(lang === 'FR' 
            ? `${name} sera bientôt disponible !` 
            : `${name} will be available soon!`
        );
    };

    const footerLinks = [
        {
            title: t('marketplace') || "Marché",
            links: [
                { to: "/marketplace", label: t('catalog') || "Catalogue" },
                { to: "/vendors", label: t('vendors') || "Fournisseurs" },
                { to: "/tracking", label: t('tracking') || "Suivi" },
            ]
        },
        {
            title: t('help') || "Aide",
            links: [
                { to: "/faq", label: t('faq') || "FAQ" },
                { to: "/help", label: t('guide') || "Guide" },
                { to: "/contact", label: t('contact') || "Contact" },
            ]
        },
        {
            title: t('company') || "Entreprise",
            links: [
                { to: "/about", label: t('about') || "À propos" },
                { to: "/terms", label: t('terms') || "CGU" },
                { to: "/privacy", label: t('privacy') || "Confidentialité" },
            ]
        },
        {
            title: "Réseaux",
            links: [
                { to: "https://linkedin.com", label: "LinkedIn", external: true },
                { to: "https://instagram.com", label: "Instagram", external: true },
                { to: "https://twitter.com", label: "Twitter / X", external: true },
            ]
        }
    ];

    return (
        <footer className="relative bg-background text-foreground py-12 overflow-hidden border-t border-border">
            <div className="absolute top-0 right-0 size-96 bg-primary/[0.03] blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">

                    {/* Brand */}
                    <div className="lg:col-span-4 space-y-5">
                        <Link to="/" className="flex items-center gap-3 group w-fit">
                            <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
                                <Zap className="size-5 fill-current" />
                            </div>
                            <span translate="no" className="font-bold text-xl text-foreground tracking-tight">
                                <span className="text-slate-950 dark:text-white">BCA</span><span className="text-primary italic">CONNECT</span>
                            </span>
                        </Link>

                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs border-l-4 border-primary/30 pl-4">
                            {lang === 'FR'
                                ? "La passerelle moderne du commerce africain. Connectez acheteurs, fournisseurs et prestataires en un seul écosystème."
                                : "The modern gateway for African commerce. Connect buyers, sellers and service providers in one ecosystem."}
                        </p>

                        <div className="flex items-center gap-3">
                            <button onClick={() => handleSocialClick("LinkedIn")} aria-label="LinkedIn"
                                className="size-9 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                <Share2 className="size-4" />
                            </button>
                            <a href="mailto:contact@bcaconnect.gn" aria-label="Email"
                                className="size-9 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                <Mail className="size-4" />
                            </a>
                            <button onClick={() => handleSocialClick("Website")} aria-label="Globe"
                                className="size-9 rounded-xl bg-muted border border-border/50 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                                <Globe className="size-4" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            {[
                                lang === 'FR' ? 'Sécurisé' : 'Secure', 
                                lang === 'FR' ? 'Rapide' : 'Fast', 
                                '99%'
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg">
                                    {[ShieldCheck, Zap, Star][i]({ className: "size-3.5 text-primary" })}
                                    <span className="text-xs text-muted-foreground">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Nav links */}
                    <div className="lg:col-span-5 grid grid-cols-2 md:grid-cols-4 gap-6">
                        {footerLinks.map((section, idx) => (
                            <div key={idx} className="space-y-3">
                                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide border-l-2 border-primary pl-2">
                                    {section.title}
                                </h4>
                                <ul className="space-y-2">
                                    {section.links.map((link, lIdx) => (
                                        <li key={lIdx}>
                                            {link.external ? (
                                                <a href={link.to} target="_blank" rel="noopener noreferrer"
                                                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                                    <div className="size-1 bg-border rounded-full group-hover:bg-primary transition-colors" />
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link to={link.to}
                                                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                                                    <div className="size-1 bg-border rounded-full group-hover:bg-primary transition-colors" />
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter + Contact */}
                    <div className="lg:col-span-3 space-y-5">
                        <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4">
                            <div>
                                <h5 className="text-xs font-bold text-primary uppercase tracking-wide">Newsletter</h5>
                                <p className="text-xs text-muted-foreground mt-1">{lang === 'FR' ? "Restez informé des dernières actualités." : "Stay informed with the latest news."}</p>
                            </div>
                            <form onSubmit={handleNewsletterSubmit} className="relative">
                                <input
                                    type="email"
                                    placeholder={lang === 'FR' ? "votre@email.com" : "your@email.com"}
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="w-full bg-muted border border-border/50 rounded-xl text-sm px-4 py-3 outline-none focus:border-primary transition-all pr-12 text-foreground placeholder:text-foreground/30"
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    <Send className="size-3.5" />
                                </button>
                            </form>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Activity className="size-3 text-emerald-500 animate-pulse" /> {lang === 'FR' ? "Système actif 100%" : "System 100% active"}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                <MapPin className="size-4 text-primary shrink-0" />
                                <span>Kipé, Ratoma, Conakry, Guinée</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                <Phone className="size-4 text-emerald-500 shrink-0" />
                                <span>+224 6XX XX XX XX</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="py-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                        © 2024 BCA Connect Ecosystem. Prototype.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('privacy') || 'Confidentialité'}</Link>
                        <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t('terms') || 'CGU'}</Link>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400">
                            {lang === 'FR' ? 'Opérationnel' : 'Operational'}
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
