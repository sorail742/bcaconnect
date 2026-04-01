import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Search, User, ShoppingCart, Menu, X, ChevronDown,
    Store, Users, Package, Truck, HelpCircle, BookOpen,
    MessageSquare, Info, FileText, ShieldCheck, LogOut, LayoutDashboard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems, removeFromCart, cartTotal } = useCart();
    const { user, logout } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const navStructure = [
        {
            label: 'Marketplace',
            icon: Store,
            children: [
                { to: "/marketplace", label: "Catalogue Produits", icon: Package, desc: "Parcourir tous les produits" },
                { to: "/vendors", label: "Liste des Vendeurs", icon: Users, desc: "Trouver un marchand certifié" },
                { to: "/tracking", label: "Suivi de Colis", icon: Truck, desc: "Où est ma commande ?" },
            ]
        },
        {
            label: 'Aide',
            icon: HelpCircle,
            children: [
                { to: "/faq", label: "FAQ", icon: HelpCircle, desc: "Réponses à vos questions" },
                { to: "/help", label: "Guide & Aide", icon: BookOpen, desc: "Ressources pour démarrer" },
                { to: "/contact", label: "Nous contacter", icon: MessageSquare, desc: "Support technique 24/7" },
            ]
        },
        {
            label: 'Entreprise',
            icon: Info,
            children: [
                { to: "/about", label: "À propos de BCA", icon: Info, desc: "Notre mission et vision" },
                { to: "/terms", label: "Conditions", icon: FileText, desc: "Règles d'utilisation" },
                { to: "/privacy", label: "Confidentialité", icon: ShieldCheck, desc: "Protection de vos données" },
            ]
        }
    ];

    const simpleLinks = [
        { to: "/#features", label: "Fonctionnalités" },
        { to: "/#how-it-works", label: "Comment ça marche" }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">

                {/* Logo & Desktop Nav */}
                <div className="flex items-center gap-10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                            <span className="font-bold text-lg">BC</span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white hidden sm:block">
                            BCA<span className="text-primary">Connect</span>
                        </span>
                    </Link>

                    <nav className="hidden xl:flex items-center gap-2">
                        {navStructure.map((menu) => (
                            <div
                                key={menu.label}
                                className="relative group"
                                onMouseEnter={() => setActiveDropdown(menu.label)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <button className={cn(
                                    "flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300",
                                    activeDropdown === menu.label ? "text-primary bg-primary/5" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                )}>
                                    <menu.icon className="size-4" />
                                    {menu.label}
                                    <ChevronDown className={cn("size-4 opacity-50 transition-transform duration-300", activeDropdown === menu.label && "rotate-180 text-primary")} />
                                </button>

                                {activeDropdown === menu.label && (
                                    <div className="absolute top-full left-0 pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-2">
                                            {menu.children.map(child => (
                                                <Link
                                                    key={child.to}
                                                    to={child.to}
                                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group/item"
                                                >
                                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                                        <child.icon className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{child.label}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{child.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {simpleLinks.map(link => (
                            <a
                                key={link.label}
                                href={link.to}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3 sm:gap-6">
                    {/* Search - Icon only on mobile/tablet */}
                    <div className="hidden lg:flex relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="h-10 w-full pl-10 pr-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Cart */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="size-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all relative"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 size-5 bg-primary text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {isCartOpen && (
                                <div className="absolute top-full right-0 pt-3 w-80 sm:w-96 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                            <h4 className="font-bold">Mon Panier</h4>
                                            <button onClick={() => setIsCartOpen(false)}><X className="size-4 opacity-50" /></button>
                                        </div>
                                        {cartItems.length === 0 ? (
                                            <div className="p-10 text-center text-slate-400 text-sm italic">Panier vide.</div>
                                        ) : (
                                            <>
                                                <div className="p-4 max-h-72 overflow-y-auto space-y-3">
                                                    {cartItems.map(item => (
                                                        <div key={item.id} className="flex items-center gap-4">
                                                            <img src={item.image_url || item.image || 'https://via.placeholder.com/60'} className="size-12 rounded-lg object-cover" alt="" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold truncate">{item.nom_produit || item.name}</p>
                                                                <p className="text-xs text-primary font-bold">{(item.prix_unitaire * (item.quantity || 1)).toLocaleString()} GNF</p>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.id)}><X className="size-4 text-red-500/50 hover:text-red-500" /></button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4">
                                                    <div className="flex justify-between font-bold">
                                                        <span>Total</span>
                                                        <span className="text-primary">{cartTotal.toLocaleString()} GNF</span>
                                                    </div>
                                                    <Button className="w-full h-12 rounded-xl" onClick={() => navigate('/checkout')}>Payer</Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Auth */}
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

                        {user ? (
                            <div className="flex items-center gap-3 ml-2 group relative">
                                <Link to="/dashboard" className="flex items-center gap-3 pl-2 pr-1 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                    <div className="hidden sm:block text-right">
                                        <p className="text-xs font-bold leading-none">{user.nom_complet}</p>
                                        <p className="text-[10px] text-primary font-bold uppercase mt-1 leading-none">{user.role}</p>
                                    </div>
                                    <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <User className="size-4" />
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link to="/login" className="hidden sm:block">
                                    <Button variant="ghost" size="sm" className="font-bold text-slate-600 dark:text-slate-400">Connexion</Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="font-bold px-6 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Démarrer</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        <button
                            className="xl:hidden size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white active:scale-95 transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="xl:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 p-4 space-y-4 animate-in slide-in-from-top-2 duration-300 overflow-y-auto max-h-[80vh]">
                    {navStructure.map(menu => (
                        <div key={menu.label} className="space-y-2">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">{menu.label}</h5>
                            <div className="grid grid-cols-1 gap-1">
                                {menu.children.map(child => (
                                    <Link
                                        key={child.to}
                                        to={child.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 text-slate-700 dark:text-slate-300 font-bold text-sm"
                                    >
                                        <child.icon className="size-4 text-primary" />
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="h-px bg-slate-100 dark:bg-slate-900 mx-2" />
                    <div className="p-2 space-y-4">
                        {user ? (
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block">
                                <Button className="w-full h-12 rounded-xl">Mon Dashboard</Button>
                            </Link>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button variant="outline" className="w-full h-12 rounded-xl">Se connecter</Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="block">
                                    <Button className="w-full h-12 rounded-xl">S'inscrire</Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
