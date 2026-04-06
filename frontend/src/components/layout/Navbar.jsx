import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, User, ShoppingCart, Menu, X, ChevronDown, Store, Users, Package, Truck, HelpCircle, BookOpen,
    MessageSquare, Info, FileText, ShieldCheck, LogOut, LayoutDashboard,
    Moon, Sun, LogIn, Zap, Cog, Camera, Mic, Bell, Globe, Radar
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { CartDrawer } from '../cart/CartDrawer';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { user } = useAuth();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { lang, changeLanguage, t } = useLanguage();

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    const navStructure = [
        {
            label: t('marketplace'),
            icon: Store,
            children: [
                { to: "/marketplace", label: t('catalog').toUpperCase(), icon: Package, desc: "ACCÉDER AU TERMINAL DE VENTE." },
                { to: "/vendors", label: t('vendors').toUpperCase(), icon: Users, desc: "VOIR LES ENTITÉS CERTIFIÉES." },
                { to: "/tracking", label: t('tracking').toUpperCase(), icon: Truck, desc: "INTERFACE DE TRAÇAGE LOGISTIQUE." },
            ]
        },
        {
            label: t('help'),
            icon: HelpCircle,
            children: [
                { to: "/faq", label: t('faq').toUpperCase(), icon: HelpCircle, desc: "PROTOCOLES DE RÉPONSES BCA." },
                { to: "/help", label: t('guide').toUpperCase(), icon: BookOpen, desc: "MODES OPÉRATOIRES RÉSEAU." },
                { to: "/contact", label: t('contact').toUpperCase(), icon: MessageSquare, desc: "CANAL DE SUPPORT PRIORITAIRE." },
            ]
        }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-[48px] border-b border-border transition-all duration-300 shadow-sm">
            {/* Main Command Bar */}
            <div className="container mx-auto px-6 h-11 flex items-center justify-between gap-5">
                
                {/* Brand Identity — High Density */}
                <Link to="/" className="flex items-center gap-4 shrink-0 group">
                    <div className="size-6 rounded-xl bg-primary flex items-center justify-center text-foreground shadow-[0_0_30px_rgba(255,95,0,0.3)] group-hover:rotate-6 transition-transform duration-500">
                        <span className="font-black text-lg tracking-tighter">BC</span>
                    </div>
                    <span className="text-lg font-bold text-foreground tracking-tight uppercase leading-none">
                        BCA<span className="text-primary">CONNECT</span>
                    </span>
                </Link>

                {/* Tactical Search Terminal */}
                <div className="hidden lg:flex flex-1 max-w-xl relative group">
                    <div className="relative flex items-center w-full h-12 bg-white/[0.02] border border-foreground/10 rounded-2xl pr-1.5 focus-within:border-primary/40 transition-all duration-500 shadow-2xl">
                        <div className="pl-5 pr-3 text-muted-foreground group-focus-within:text-primary transition-colors">
                            <Search className="size-4" />
                        </div>
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder').toUpperCase()}
                            className="flex-1 bg-transparent text-[10px] font-black  text-foreground outline-none placeholder:text-slate-700"
                        />
                        <button className="h-9 px-6 bg-foreground text-background rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all ">
                            {t('explore').toUpperCase()}
                        </button>
                    </div>
                </div>

                {/* Control Hub */}
                <div className="flex items-center gap-5">
                    {/* Compact Language Switcher */}
                    <div className="hidden sm:flex items-center bg-white/[0.02] border border-foreground/5 rounded-xl p-0.5">
                        <button onClick={() => changeLanguage('FR')} className={cn("px-3 h-8 text-[9px] font-black rounded-lg transition-all", lang === 'FR' ? "bg-foreground/10 text-primary" : "text-muted-foreground hover:text-foreground")}>FR</button>
                        <button onClick={() => changeLanguage('EN')} className={cn("px-3 h-8 text-[9px] font-black rounded-lg transition-all", lang === 'EN' ? "bg-foreground/10 text-primary" : "text-muted-foreground hover:text-foreground")}>EN</button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="size-11 rounded-xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.05] transition-all ">
                            {theme === 'dark' ? <Moon className="size-4.5" /> : <Sun className="size-4.5 text-primary" />}
                        </button>

                        <button 
                            onClick={() => setIsCartOpen(true)}
                            className="size-11 rounded-xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center text-muted-foreground/80 hover:text-foreground hover:bg-white/[0.05] transition-all relative "
                        >
                            <ShoppingCart className="size-4.5" />
                            {cartCount > 0 && <span className="absolute -top-1 -right-1 size-5 bg-primary text-foreground text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-[#050505]">{cartCount}</span>}
                        </button>

                        <div className="w-px h-6 bg-foreground/10 mx-2 hidden sm:block" />

                        {user ? (
                            <Link to={user.role === 'admin' ? '/admin/dashboard' : user.role === 'fournisseur' ? '/vendor/dashboard' : '/dashboard'} className="flex items-center gap-4 pl-2 group ">
                                <div className="hidden md:block text-right">
                                    <p className="text-[11px] font-black text-foreground uppercase tracking-tight leading-none pt-0.5">{user.nom_complet?.split(' ')[0] || 'MEMBRE'}</p>
                                    <p className="text-[8px] font-black text-primary uppercase ">{t('dashboard').toUpperCase()}</p>
                                </div>
                                <div className="size-11 rounded-xl bg-foreground text-background flex items-center justify-center border border-transparent shadow-[0_0_40px_rgba(40,40,40,0.1)] group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                    <User className="size-5" />
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="hidden sm:flex items-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-all uppercase  px-3">
                                    {t('login').toUpperCase()}
                                </Link>
                                <Link to="/register">
                                    <button className="h-11 px-7 bg-primary text-foreground rounded-xl font-black text-[10px] uppercase  shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5  transition-all duration-500">
                                        {t('register').toUpperCase()}
                                    </button>
                                </Link>
                            </div>
                        )}

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden size-11 rounded-xl bg-foreground text-background flex items-center justify-center  transition-all duration-500">
                            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-Navigation */}
            <div className="hidden lg:block w-full border-t border-border bg-background">
                <div className="container mx-auto px-6 h-10 flex items-center justify-center gap-6">
                    <Link to="/marketplace" className="text-xs font-semibold text-muted-foreground hover:text-primary uppercase tracking-wide transition-colors">{t('catalog')}</Link>
                    <Link to="/vendors" className="text-xs font-semibold text-muted-foreground hover:text-primary uppercase tracking-wide transition-colors">{t('vendors')}</Link>
                    <Link to="/tracking" className="text-xs font-semibold text-muted-foreground hover:text-primary uppercase tracking-wide transition-colors">{t('tracking')}</Link>
                    <div className="h-4 w-px bg-border mx-2" />
                    {navStructure.map(menu => (
                        <div 
                            key={menu.label} 
                            className="relative h-full flex items-center group"
                            onMouseEnter={() => setActiveDropdown(menu.label)}
                            onMouseLeave={() => setActiveDropdown(null)}
                        >
                            <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground group-hover:text-primary uppercase tracking-wide transition-colors">
                                {menu.label.toUpperCase()}
                                <ChevronDown className={cn("size-3.5 transition-transform duration-500", activeDropdown === menu.label && "rotate-180")} />
                            </button>
                            <AnimatePresence>
                                {activeDropdown === menu.label && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72"
                                    >
                                        <div className="bg-card border border-border rounded-xl shadow-lg p-2 overflow-hidden">
                                            {menu.children.map(child => (
                                                <Link key={child.to} to={child.to} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group/item">
                                                    <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                                        <child.icon className="size-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-foreground">{child.label}</p>
                                                        <p className="text-xs text-muted-foreground">{child.desc}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Mobile Terminal View */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border p-4 space-y-4 overflow-hidden shadow-lg"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className="bg-muted p-4 rounded-xl border border-border text-center space-y-2 hover:border-primary/40 transition-colors">
                                <Package className="size-5 mx-auto text-primary" />
                                <p className="text-xs font-semibold text-foreground">{t('catalog')}</p>
                            </Link>
                            <Link to="/tracking" onClick={() => setIsMenuOpen(false)} className="bg-muted p-4 rounded-xl border border-border text-center space-y-2 hover:border-primary/40 transition-colors">
                                <Radar className="size-5 mx-auto text-primary" />
                                <p className="text-xs font-semibold text-foreground">{t('tracking')}</p>
                            </Link>
                        </div>
                        <div className="space-y-2 border-t border-border pt-4">
                            {user ? (
                                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="h-10 bg-foreground text-background rounded-xl flex items-center justify-center font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors">Mon Dashboard</Link>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="h-10 bg-muted text-foreground rounded-xl flex items-center justify-center font-semibold text-sm border border-border hover:border-primary/40 transition-colors">Connexion</Link>
                                    <Link to="/register" onClick={() => setIsMenuOpen(false)} className="h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-semibold text-sm hover:bg-primary/90 transition-colors">S'inscrire</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
