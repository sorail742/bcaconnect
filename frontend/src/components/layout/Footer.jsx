import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Heart } from 'lucide-react';
import Button from '../ui/Button';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = [
        {
            title: 'Marketplace',
            links: [
                { label: 'Tous les produits', to: '/marketplace' },
                { label: 'Vendeurs certifiés', to: '/vendors' },
                { label: 'Promotions', to: '/deals' },
                { label: 'Nouveautés', to: '/new' },
            ]
        },
        {
            title: 'Entreprise',
            links: [
                { label: 'À propos de BCA', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Partenariats', to: '/partners' },
                { label: 'Carrières', to: '/careers' },
            ]
        },
        {
            title: 'Aide & Support',
            links: [
                { label: 'Centre d\'aide', to: '/help' },
                { label: 'FAQ', to: '/faq' },
                { label: 'Livraison', to: '/tracking' },
                { label: 'Retours', to: '/returns' },
            ]
        },
        {
            title: 'Légal',
            links: [
                { label: 'Confidentialité', to: '/privacy' },
                { label: 'Conditions', to: '/terms' },
                { label: 'Cookies', to: '/cookies' },
            ]
        }
    ];

    return (
        <footer className="bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="col-span-2">
                        <Link to="/" className="flex items-center gap-3 mb-6 group">
                            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                <span className="font-bold text-lg">BC</span>
                            </div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white uppercase tracking-tight">BCA Connect</span>
                        </Link>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-sm leading-relaxed">
                            La première plateforme commerciale unifiée d'Afrique.
                            Nous connectons acheteurs, vendeurs et logisticiens pour un commerce sans frontières.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm">
                                    <Icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    {footerLinks.map((section, i) => (
                        <div key={i}>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xs uppercase tracking-widest">{section.title}</h4>
                            <ul className="space-y-4">
                                {section.links.map((link, j) => (
                                    <li key={j}>
                                        <Link to={link.to} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        © {currentYear} BCA Connect Infrastructure.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span className="flex items-center gap-2">
                            FAIT AVEC <Heart className="size-3 text-red-500 fill-current" /> EN GUINÉE
                        </span>
                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-800" />
                        <span>V 4.0.0 Scale-Up</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
