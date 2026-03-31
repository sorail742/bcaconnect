import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-50 dark:bg-background border-t border-slate-200 dark:border-border pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    <div className="lg:col-span-2">
                        <Link className="flex items-center gap-2 mb-6 group" to="/">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20">
                                <span className="font-bold text-lg">B</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase italic">
                                BCA<span className="text-primary">Connect</span>
                            </span>
                        </Link>
                        <p className="text-slate-600 dark:text-slate-400 max-w-sm mb-8 leading-relaxed">
                            La première marketplace B2B connectant les entreprises guinéennes aux marchés internationaux. Qualité, sécurité et rapidité.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="h-10 w-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all outline-none focus:ring-2 focus:ring-primary/20">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Marketplace</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" to="/catalogue">Catalogue</Link></li>
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" to="/boutiques">Vendeurs certifiés</Link></li>
                            <li><a className="hover:text-primary transition-colors flex items-center gap-2" href="#">Appels d'offres</a></li>
                            <li><Link className="hover:text-primary transition-colors flex items-center gap-2" to="/register">Devenir vendeur</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li><a className="hover:text-primary transition-colors flex items-center gap-2" href="/about">À propos</a></li>
                            <li><a className="hover:text-primary transition-colors flex items-center gap-2" href="/help">Centre d'aide</a></li>
                            <li><a className="hover:text-primary transition-colors flex items-center gap-2" href="/contact">Contact</a></li>
                            <li><a className="hover:text-primary transition-colors flex items-center gap-2" href="/faq">FAQ</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Contact</h4>
                        <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary shrink-0" />
                                <span>Conakry, Guinée</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary shrink-0" />
                                <span>+224 000 00 00 00</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary shrink-0" />
                                <span>contact@bcaconnect.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">© 2024 BCA Connect. Plateforme régulée.</p>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <Link className="hover:text-primary transition-colors" to="/terms">Conditions</Link>
                        <Link className="hover:text-primary transition-colors" to="/privacy">Confidentialité</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
