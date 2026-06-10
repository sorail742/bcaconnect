import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Share2, Globe, Mail, ShieldCheck, Send, Zap, Satellite, Activity, 
    Truck, CreditCard, Headphones, Shield, Smartphone, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../context/useLanguage';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../lib/utils';
import BcaLogo from '../ui/BcaLogo';
import mtnLogo from '../../assets/mtn_mobile_money.png';
import orangeLogo from '../../assets/orange_money.png';
import paycardLogo from '../../assets/paycard.png';
import areerbaLogo from '../../assets/areeba.png';
import { toast } from 'sonner';

const Footer = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { lang, t } = useLanguage();
    const currentYear = new Date().getFullYear();
    const [newsletterEmail, setNewsletterEmail] = useState('');

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (!newsletterEmail) {
            toast.error(t('toastEnterEmail') || 'Veuillez entrer votre email');
            return;
        }
        
        toast.success(t('toastNewsletterSuccess') || 'Inscription réussie');
        setNewsletterEmail('');
    };

    const handleSocialClick = (name) => {
        toast.info(`${name} ${t('soonAvailable') || 'sera bientôt disponible'}`);
    };

    const handleLanguageClick = () => {
        toast.info(t('soonAvailable') || 'Bientôt disponible');
    };

    const footerSections = useMemo(() => [
        {
            title: t('footerHelpTitle') || "Centre d'Aide",
            links: [
                { label: t('helpCenter') || "Aide", href: "/help" },
                { label: t('trackOrder') || "Suivi", href: "/tracking" },
                { label: t('returnsRefunds') || "Retours", href: "/returns" },
                { label: t('reportProduct') || "Signaler", href: "/report" },
                { label: t('faq') || "FAQ", href: "/faq" },
            ]
        },
        {
            title: t('footerAboutTitle') || "À Propos",
            links: [
                { label: t('whoWeAre') || "Qui sommes-nous", href: "/about" },
                { label: t('careers') || "Carrières", href: "/careers" },
                { label: t('newsBlog') || "Blog", href: "/blog" },
                { label: t('investors') || "Investisseurs", href: "/investors" },
                { label: t('contactUs') || "Contact", href: "/contact" },
            ]
        },
        {
            title: t('footerOpportunityTitle') || "Opportunités",
            links: [
                
                { label: t('becomeCarrier') || "Devenir Transporteur", href: "/carrier-join" },
                { label: t('becomeConsultant') || "Devenir Consultant", href: "/consultant" },
                { label: t('bcaLogistics') || "BCA Logistique", href: "/logistics" },
            ]
        },
        {
            title: t('footerEcosystemTitle') || "Écosystème",
            links: [
                { label: "BCA Wallet", href: "/wallet" },
                { label: "BCA Ads", href: "/marketplace" },
                { label: "BCA Insights", href: "/about" },
                { label: "BCA AI Engine", href: "/education" }
            ]
        }
    ], [t]);

    const topCategories = useMemo(() => {
        return [
            t('catElectronics') || "Électronique",
            t('catFashion') || "Mode & Beauté",
            t('catHome') || "Maison & Bureau",
            t('catSupermarket') || "Supermarché",
            t('catAgriculture') || "Agriculture",
            t('catAuto') || "Pièces Auto",
            t('catComputing') || "Informatique",
            t('catGames') || "Jeux Vidéo"
        ];
    }, [t]);

    return (
        <footer className="relative bg-background text-foreground overflow-hidden pt-20 border-t-4 border-primary">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
            
            {/* 1. Value Props Bar */}
            <div className="container mx-auto px-6 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: ShieldCheck, title: t('footerSecureTitle') || 'Paiement Sécurisé', desc: t('footerSecureDesc') || 'Protection Escrow' },
                        { icon: Truck, title: t('footerFastTitle') || 'Livraison Rapide', desc: t('footerFastDesc') || 'Partout en Guinée' },
                        { icon: Headphones, title: t('footerSupportTitle') || 'Support 24/7', desc: t('footerSupportDesc') || 'À votre écoute' },
                        { icon: Globe, title: t('footerUnifiedTitle') || 'Réseau National', desc: t('footerUnifiedDesc') || 'Toutes les régions' }
                    ].map((prop, i) => (
                        <div key={i} className="flex items-center gap-5 group">
                            <div className="size-16 rounded-2xl bg-muted border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-md">
                                <prop.icon className="size-8" />
                            </div>
                            <div>
                                <h3 className="text-base font-black uppercase tracking-wider text-foreground">{prop.title}</h3>
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">{prop.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
                    
                    {/* Brand & Newsletter */}
                    <div className="lg:col-span-4 space-y-8">
                        <Link to="/" className="flex items-center gap-4 group w-fit">
                            <BcaLogo variant="light" size="h-16" />
                        </Link>
                        
                        <div className="space-y-4 pt-4">
                            <p className="text-sm font-black uppercase tracking-widest text-primary">Newsletter</p>
                            <form onSubmit={handleNewsletterSubmit} className="relative group max-w-sm">
                                <input 
                                    type="email" 
                                    placeholder={t('formEmail') || (lang === 'FR' ? "votre@email.com" : "your@email.com")}
                                    value={newsletterEmail}
                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                    className="w-full h-14 bg-muted border border-border rounded-2xl text-base px-6 pr-14 outline-none focus:border-primary transition-all text-foreground placeholder:text-muted-foreground/60" 
                                />
                                <button 
                                    type="submit"
                                    className="absolute right-2 top-2 bottom-2 px-6 bg-primary text-primary-foreground rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95 font-bold"
                                >
                                    <Send className="size-5" />
                                </button>
                            </form>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            {[
                                { Icon: Share2, name: "Instagram" },
                                { Icon: Globe, name: "LinkedIn" },
                                { Icon: Mail, name: "Email" },
                                { Icon: Zap, name: "Twitter" }
                            ].map(({ Icon, name }, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleSocialClick(name)}
                                    className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
                                >
                                    <Icon className="size-6" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {footerSections.map((section, i) => (
                            <div key={i} className="space-y-8">
                                <h4 className="text-base font-black text-foreground uppercase tracking-[0.1em] relative inline-block">
                                    {section.title}
                                    <div className="absolute -bottom-3 left-0 w-12 h-1 bg-primary" />
                                </h4>
                                <ul className="space-y-4">
                                    {section.links.map((link, j) => (
                                        <li key={j}>
                                            <Link to={link.href} className="text-base font-semibold text-slate-500 hover:text-primary hover:translate-x-2 transition-all flex items-center gap-2 group">
                                                <ArrowRight className="size-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Categories Bar */}
                <div className="py-12 border-t border-border">
                    <div className="flex flex-wrap gap-x-10 gap-y-6 justify-center">
                        {topCategories.map((cat, i) => (
                            <Link key={i} to="/marketplace" className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground transition-colors">
                                {cat}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Bottom Trust Bar & Payment Hub */}
                <div className="py-10 border-t border-border flex flex-col items-center justify-between gap-10">
                    <div className="w-full bg-muted/50 backdrop-blur-md border border-border rounded-[2rem] px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-12 shadow-sm">
                        <div className="space-y-1 text-center md:text-left">
                            <h5 className="text-sm font-black uppercase tracking-[0.2em] text-primary">{t('footerCertifiedPartners') || 'Partenaires Certifiés'}</h5>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('footerSecurePaymentGN') || 'Paiement Sécurisé en Guinée'}</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4">
                             {[
                                { src: mtnLogo, alt: "MTN MoMo", bg: "bg-white", label: "MTN Money" },
                                { src: orangeLogo, alt: "Orange Money", bg: "bg-white", label: "Orange Money" },
                                { src: paycardLogo, alt: "PayCard", bg: "bg-white", label: "PayCard" }
                             ].map((op, i) => (
                                <div key={i} className="group relative">
                                    <div className={cn(
                                        "h-16 px-6 rounded-2xl flex items-center justify-center shadow-lg border border-border bg-white transition-all duration-500 hover:scale-105 hover:shadow-primary/20",
                                        "overflow-hidden mb-6"
                                    )}>
                                        <img 
                                            src={op.src} 
                                            alt={op.alt} 
                                            className="h-10 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
                                        />
                                    </div>
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-tighter text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        {op.label}
                                    </span>
                                </div>
                             ))}
                        </div>

                        <button 
                            onClick={handleLanguageClick}
                            className="flex items-center gap-3 px-6 py-3 bg-muted border border-border rounded-2xl cursor-pointer hover:bg-muted/80 transition-colors"
                        >
                            <Globe className="size-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-widest text-foreground">{lang === 'FR' ? 'FR | GNF' : lang + ' | GNF'}</span>
                        </button>
                    </div>

                    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col items-center lg:items-start gap-4">
                            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                <Link to="/privacy" className="hover:text-primary transition-colors">{t('privacy') || "Confidentialité"}</Link>
                                <div className="size-1 rounded-full bg-slate-700" />
                                <Link to="/terms" className="hover:text-primary transition-colors">{t('terms') || "Conditions"}</Link>
                                <div className="size-1 rounded-full bg-slate-700" />
                                <Link to="/legal" className="hover:text-primary transition-colors">{t('legalNotice') || "Mentions Légales"}</Link>
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                © {currentYear} BCA Connect Ecosystem. {t('poweredBy') || "Propulsé par la Technologie 224."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
