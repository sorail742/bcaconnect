import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Search, User, ShoppingCart, Menu, X, ChevronDown,
    Store, Users, Package, Truck, HelpCircle, BookOpen,
    MessageSquare, Info, FileText, ShieldCheck, LogOut, LayoutDashboard,
    Moon, LogIn
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
    const [lang, setLang] = useState('FR');

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
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0D14]/80 dark:bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
            <div className="container mx-auto px-4 h-24 flex items-center justify-between">

                {/* Logo & Desktop Nav */}
                <div className="flex items-center gap-12">
                    <Link to="/" className="flex items-center gap-3 group shrink-0">
                        <div className="size-11 rounded-xl bg-[#FF6600] flex items-center justify-center text-white shadow-lg shadow-[#FF6600]/20 group-hover:scale-105 transition-transform">
                            <span className="font-black text-lg">BC</span>
                        </div>
                        <span className="text-2xl font-black text-white italic tracking-tighter">
                            BCA Connect
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
                                    "flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all duration-300",
                                    activeDropdown === menu.label ? "text-[#FF6600] bg-[#FF6600]/5" : "text-slate-400 hover:text-white"
                                )}>
                                    <menu.icon className={cn("size-4", activeDropdown === menu.label ? "text-[#FF6600]" : "text-[#FF6600]/60")} />
                                    {menu.label}
                                    <ChevronDown className={cn("size-3.5 opacity-40 transition-transform duration-300", activeDropdown === menu.label && "rotate-180 text-primary")} />
                                </button>

                                {activeDropdown === menu.label && (
                                    <div className="absolute top-full left-0 pt-2 w-80 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="bg-[#0F1219] border border-white/5 rounded-3xl shadow-2xl p-2 backdrop-blur-2xl">
                                            {menu.children.map(child => (
                                                <Link
                                                    key={child.to}
                                                    to={child.to}
                                                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all group/item"
                                                >
                                                    <div className="size-10 rounded-xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600] group-hover/item:bg-[#FF6600] group-hover/item:text-white transition-all">
                                                        <child.icon className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{child.label}</p>
                                                        <p className="text-[11px] text-slate-500 font-medium">{child.desc}</p>
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
                                className="px-5 py-2 text-sm font-bold text-slate-400 hover:text-white transition-all"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="hidden lg:flex items-center bg-[#151921] rounded-full p-1 border border-white/5">
                        <button
                            onClick={() => setLang('FR')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-black rounded-full transition-all",
                                lang === 'FR' ? "bg-[#FF6600] text-white" : "text-slate-500 hover:text-slate-300"
                            )}>
                            FR
                        </button>
                        <button
                            onClick={() => setLang('EN')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-black rounded-full transition-all",
                                lang === 'EN' ? "bg-[#FF6600] text-white" : "text-slate-500 hover:text-slate-300"
                            )}>
                            EN
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="size-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                            <Moon className="size-5" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="size-10 flex items-center justify-center text-slate-400 hover:text-white transition-all relative"
                            >
                                <ShoppingCart className="size-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 size-4 bg-[#FF6600] text-white text-[9px] font-black rounded-full flex items-center justify-center border border-[#0A0D14]">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="h-8 w-px bg-white/10 hidden lg:block" />

                        {user ? (
                            <Link to="/dashboard" className="flex items-center gap-3 pl-2 group">
                                <div className="hidden sm:block text-right">
                                    <p className="text-xs font-bold text-white">{user.nom_complet || 'Membre BCA'}</p>
                                    <p className="text-[10px] text-[#FF6600] font-black uppercase tracking-tighter">Tableau de bord</p>
                                </div>
                                <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-[#FF6600] transition-all">
                                    <User className="size-5" />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-5">
                                <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-white hover:text-[#FF6600] transition-all group">
                                    <LogIn className="size-4 opacity-60 group-hover:opacity-100" />
                                    Connexion
                                </Link>
                                <Link to="/register">
                                    <Button size="lg" className="h-11 px-8 rounded-2xl bg-[#FF6600] border-none shadow-lg shadow-[#FF6600]/20 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-wider">
                                        S'inscrire
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu */}
                        <button
                            className="xl:hidden size-11 flex items-center justify-center rounded-2xl bg-white/5 text-white active:scale-95 transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Drawer */}
            {isMenuOpen && (
                <div className="xl:hidden bg-[#0A0D14] border-t border-white/5 p-6 pb-12 space-y-8 animate-in slide-in-from-top-2 duration-300 overflow-y-auto max-h-[85vh]">
                    {navStructure.map(menu => (
                        <div key={menu.label} className="space-y-4">
                            <h5 className="text-[11px] font-black uppercase tracking-widest text-[#FF6600]/60">{menu.label}</h5>
                            <div className="grid grid-cols-1 gap-2">
                                {menu.children.map(child => (
                                    <Link
                                        key={child.to}
                                        to={child.to}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5 text-white font-bold text-base"
                                    >
                                        <div className="size-10 rounded-2xl bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600]">
                                            <child.icon className="size-5" />
                                        </div>
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="pt-6 space-y-4">
                        <div className="flex items-center justify-between px-2 mb-6">
                            <span className="text-xs font-bold text-slate-500">Langue</span>
                            <div className="flex items-center bg-[#151921] rounded-full p-1 border border-white/5">
                                <button onClick={() => setLang('FR')} className={cn("px-4 py-1.5 text-xs font-black rounded-full", lang === 'FR' ? "bg-[#FF6600] text-white" : "text-slate-500")}>FR</button>
                                <button onClick={() => setLang('EN')} className={cn("px-4 py-1.5 text-xs font-black rounded-full", lang === 'EN' ? "bg-[#FF6600] text-white" : "text-slate-500")}>EN</button>
                            </div>
                        </div>

                        {user ? (
                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full h-14 rounded-2xl text-base font-black">MON TABLEAU DE BORD</Button>
                            </Link>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                    <Button variant="outline" className="w-full h-14 rounded-2xl text-sm font-black border-white/10">CONNEXION</Button>
                                </Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                    <Button className="w-full h-14 rounded-2xl text-sm font-black bg-[#FF6600]">REJOINDRE</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
