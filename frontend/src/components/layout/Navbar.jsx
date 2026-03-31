import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import { Search, User, ShoppingCart, Menu, WifiOff, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const location = useLocation();
    const { cartItems } = useCart();
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [shouldPulse, setShouldPulse] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Trigger pulse on cart update (Friction reduction / Feedback)
    useEffect(() => {
        if (cartItems.length > 0) {
            setShouldPulse(true);
            const timer = setTimeout(() => setShouldPulse(false), 1000);
            return () => clearTimeout(timer);
        }
    }, [cartItems.length]);
    
    const navLinks = [
        { label: 'Catalogue', path: '/catalogue' },
        { label: 'Vendeurs', path: '/boutiques' },
        { label: 'Aide', path: '/help' }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-2xl shadow-premium transition-all duration-500">
            <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
                <div className="flex items-center gap-8">
                    <Link className="flex items-center gap-2 group" to="/">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="font-bold text-lg">B</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
                            BCA<span className="text-primary">Connect</span>
                        </span>
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                className={cn(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                                    location.pathname === link.path 
                                        ? "text-primary bg-primary/5" 
                                        : "text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-900"
                                )}
                                to={link.path}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 max-w-md mx-8 hidden lg:block z-50">
                    <div className="relative group">
                        <Search className={cn(
                            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                            isSearchFocused ? "text-primary" : "text-slate-400"
                        )} />
                        <input
                            className={cn(
                                "h-11 w-full rounded-xl border bg-slate-50 dark:bg-slate-900 pl-10 pr-10 text-sm transition-all duration-300",
                                isSearchFocused 
                                    ? "border-primary ring-4 ring-primary/10 bg-white dark:bg-background scale-[1.02] shadow-lg" 
                                    : "border-slate-100 dark:border-slate-800 focus:outline-none"
                            )}
                            placeholder="Chercher un article, une catégorie..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                            >
                                <X className="size-3" />
                            </button>
                        )}
                        
                        {/* Search Dropdown / Trending (Conversion boost) */}
                        {isSearchFocused && (
                            <div className="absolute top-14 left-0 right-0 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Recherches populaires</p>
                                <div className="flex flex-wrap gap-2">
                                    {['Ciment', 'Fer à béton', 'Électroménager', 'Panneaux Solaires'].map(tag => (
                                        <button key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Dark Overlay when search is active */}
                {isSearchFocused && (
                    <div className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-40 animate-in fade-in duration-300" />
                )}

                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-1 mr-2">
                        {!navigator.onLine && (
                            <WifiOff className="h-4 w-4 text-orange-500 animate-pulse" title="Mode hors-ligne actif" />
                        )}
                    </div>

                    <Link to="/cart" className={cn(
                        "relative p-2.5 text-slate-600 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all",
                        shouldPulse && "scale-110 text-primary bg-primary/5 ring-4 ring-primary/10"
                    )}>
                        <ShoppingCart className="h-5.5 w-5.5" />
                        {cartItems.length > 0 && (
                            <span className={cn(
                                "absolute -top-1 -right-1 h-5 w-5 bg-primary text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white dark:border-background transition-transform duration-500",
                                shouldPulse && "scale-125"
                            )}>
                                {cartItems.length}
                            </span>
                        )}
                    </Link>

                    <Link to="/login" className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="font-semibold">
                            Connexion
                        </Button>
                    </Link>

                    <Link to="/register" className="hidden md:block">
                        <Button size="sm" className="px-5">
                            S'inscrire
                        </Button>
                    </Link>

                    <button className="p-2 md:hidden text-slate-600 dark:text-slate-400">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
