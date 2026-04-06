import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Headphones, Store, Wallet, HelpCircle, SearchX, Bell } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            {/* Top Navigation Bar */}
            <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="text-primary">
                            <svg className="size-8" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_6_330)">
                                    <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                                </g>
                                <defs>
                                    <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                                </defs>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">BCA Connect</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 rounded-full p-2 text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                            <Bell className="size-5" />
                        </div>
                        <div
                            className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 bg-cover bg-center border-2 border-primary/20 cursor-pointer"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCH5DZ71aAPw_UBTKtVErHDP7llRx2LtSpXZGh7XjdvbDPC2Cp6e0I_5gfNNzn7qNIwcWumFvp7EoBZoVWNK0DQEk-b5Zkkecr1wI3Lw_2WS6T9aBZ1JE26zQ_yYEYgC_D25Bm7PT8-kiTnImxaZvTebXdFQ6yl9-b976e8yAzggcWXlb_cMFqMbFwwVYGpyMRK0yoSTez7_-4-8JJWzlqP5RAMgGlMJz94gKqpUpkbgQ6-aZSYxb6EYKBhV1tmyD8u9Ym_2lajaMEP")' }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-12">
                <div className="max-w-2xl w-full text-center flex flex-col items-center">
                    {/* Illustration Area */}
                    <div className="relative w-full max-w-md aspect-square mb-8 flex items-center justify-center">
                        {/* Large 404 Background Text */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                            <span className="text-[20rem] font-bold tracking-tighter">404</span>
                        </div>
                        {/* Main Illustration */}
                        <div className="relative z-10 w-full aspect-video rounded-lg overflow-hidden bg-white dark:bg-slate-900 shadow-2xl shadow-primary/10 border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <SearchX className="size-10" />
                                </div>
                                <div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-primary animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="space-y-4 px-4">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-900 dark:text-foreground">
                            Oups ! Cette page est <span className="text-primary">introuvable</span>.
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-600 dark:text-muted-foreground/80 max-w-lg mx-auto leading-relaxed">
                            Le lien est peut-être rompu ou la page a été déplacée. Ne vous inquiétez pas, nous allons vous aider à retrouver votre chemin sur BCA Connect.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                        <Link
                            to="/"
                            className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-slate-900 dark:text-foreground font-bold h-14 flex items-center justify-center rounded-lg transition-all shadow-lg shadow-primary/20"
                        >
                            <Home className="mr-2 size-5" />
                            Retourner à l'accueil
                        </Link>
                        <Link
                            to="/contact"
                            className="w-full sm:flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-900 dark:text-foreground font-bold h-14 flex items-center justify-center rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-display"
                        >
                            <Headphones className="mr-2 size-5" />
                            Nous contacter
                        </Link>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                        <Link to="/marketplace" className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors">
                            <Store className="size-4" />
                            Marché B2B
                        </Link>
                        <Link to="/wallet" className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors">
                            <Wallet className="size-4" />
                            Portefeuille
                        </Link>
                        <Link to="/help" className="text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors">
                            <HelpCircle className="size-4" />
                            Centre d'aide
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer Space */}
            <footer className="w-full py-8 border-t border-slate-200 dark:border-slate-800 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-slate-600 dark:text-muted-foreground/80 text-xs gap-4">
                    <p>© 2024 BCA Connect. Tous droits réservés.</p>
                    <div className="flex gap-6">
                        <Link to="/conditions" className="hover:text-primary transition-colors">Conditions d'utilisation</Link>
                        <Link to="/confidentialite" className="hover:text-primary transition-colors">Politique de confidentialité</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NotFound;
