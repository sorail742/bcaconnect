import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-8">
                    <Link className="flex items-center gap-2" to="/">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                            <span className="material-symbols-outlined !text-xl">hub</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">BCA Connect</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/catalogue">Catalogue</Link>
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">Solutions</a>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/boutiques">Vendeurs</Link>
                        <a className="text-sm font-medium hover:text-primary transition-colors" href="#">À propos</a>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined !text-lg">search</span>
                        </span>
                        <input
                            className="h-9 w-64 rounded-full border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50"
                            placeholder="Rechercher un produit..."
                            type="text"
                        />
                    </div>
                    <Link to="/login">
                        <button className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary px-3">Connexion</button>
                    </Link>
                    <Link to="/register">
                        <Button className="h-10 px-6 rounded-full shadow-lg shadow-primary/25">
                            S'inscrire
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
