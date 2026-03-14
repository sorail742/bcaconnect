import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
                    <div className="col-span-2 lg:col-span-2">
                        <Link className="flex items-center gap-2 mb-6" to="/">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined !text-xl">hub</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BCA Connect</span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
                            La première marketplace B2B connectant les entreprises guinéennes aux marchés internationaux. Qualité, sécurité et rapidité.
                        </p>
                        <div className="flex gap-4">
                            <a className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
                                <span className="material-symbols-outlined !text-lg">public</span>
                            </a>
                            <a className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-primary hover:text-white transition-all" href="#">
                                <span className="material-symbols-outlined !text-lg">share</span>
                            </a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Marketplace</h4>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link className="hover:text-primary transition-colors" to="/catalogue">Catalogue</Link></li>
                            <li><Link className="hover:text-primary transition-colors" to="/boutiques">Vendeurs certifiés</Link></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Appels d'offres</a></li>
                            <li><Link className="hover:text-primary transition-colors" to="/register">Devenir vendeur</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Solutions</h4>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a className="hover:text-primary transition-colors" href="#">Logistique</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Paiement sécurisé</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Assurance cargo</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Financement</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Société</h4>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li><a className="hover:text-primary transition-colors" href="#">À propos</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Actualités</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Support</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">© 2024 BCA Connect. Tous droits réservés.</p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <a className="hover:text-slate-900 dark:hover:text-white" href="#">Conditions d'utilisation</a>
                        <a className="hover:text-slate-900 dark:hover:text-white" href="#">Confidentialité</a>
                        <a className="hover:text-slate-900 dark:hover:text-white" href="#">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
