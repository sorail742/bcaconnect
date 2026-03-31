import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
import { Menu, X, ShoppingCart, Search, Bell, ChevronDown, Store, Users, Package, Truck, Sparkles, User, LogIn, HelpCircle, BookOpen, MessageSquare, Info, FileText, ShieldCheck } from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../hooks/useAuth"
import ThemeToggle from "../ui/ThemeToggle"

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
    const { cartItems, cartTotal, removeFromCart } = useCart()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

    const shopLinks = [
        { to: "/marketplace", label: "Catalogue Produits", icon: Package, desc: "Parcourir tous les produits" },
        { to: "/vendors", label: "Liste des Vendeurs", icon: Users, desc: "Trouver un marchand certifié" },
        { to: "/tracking", label: "Suivi de Colis", icon: Truck, desc: "Où est ma commande ?" },
    ]

    const supportLinks = [
        { to: "/faq", label: "FAQ", icon: HelpCircle, desc: "Réponses à vos questions" },
        { to: "/help", label: "Guide & Aide", icon: BookOpen, desc: "Ressources pour démarrer" },
        { to: "/contact", label: "Nous contacter", icon: MessageSquare, desc: "Support technique 24/7" },
    ]

    const companyLinks = [
        { to: "/about", label: "À propos de BCA", icon: Info, desc: "Notre mission et vision" },
        { to: "/terms", label: "Conditions", icon: FileText, desc: "Règles d'utilisation" },
        { to: "/privacy", label: "Confidentialité", icon: ShieldCheck, desc: "Protection de vos données" },
    ]
    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border transition-all duration-500">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-4 group px-3 py-2 rounded-2xl hover:bg-accent/40 transition-all" translate="no">
                        <div className="w-12 h-12 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-premium group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                            <span className="font-black text-lg italic tracking-tighter">BC</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-2xl text-foreground italic tracking-tighter leading-none uppercase">BCA Connect</span>
                            <span className="text-executive-label text-primary opacity-80">Fintech Marketplace</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Shop Mega-Dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setIsShopDropdownOpen(true)}
                            onMouseLeave={() => setIsShopDropdownOpen(false)}
                        >
                            <button className="relative flex items-center gap-3 px-5 py-3 rounded-xl text-executive-label text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-all duration-500 group">
                                <Store className="size-4.5" />
                                MARKETPLACE
                                <ChevronDown className={`size-4 transition-transform duration-500 ${isShopDropdownOpen ? 'rotate-180 text-primary' : ''}`} />
                                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 h-1 bg-primary transition-all duration-500 rounded-full shadow-premium ${isShopDropdownOpen ? 'w-1/3 opacity-100' : 'w-0 opacity-0'}`} />
                            </button>
                            {isShopDropdownOpen && (
                                <div className="absolute top-full left-0 pt-3 w-80 animate-in fade-in slide-in-from-top-4 duration-300 scale-100 origin-top">
                                    <div className="glass border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/20 p-2 overflow-hidden">
                                        <div className="px-4 py-3 mb-2 border-b border-white/10">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-60">Solutions Digitales</span>
                                        </div>
                                        {shopLinks.map(link => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className="flex items-center gap-4 px-3 py-3 rounded-2xl hover:bg-primary/5 dark:hover:bg-white/5 transition-all group/item active-press"
                                            >
                                                <div className="size-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all shadow-sm">
                                                    <link.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{link.label}</p>
                                                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Support Dropdown */}
                        <div className="relative group/help">
                            <button className="relative flex items-center gap-3 px-5 py-3 rounded-xl text-executive-label text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-all duration-500 group">
                                <HelpCircle className="size-4.5" />
                                AIDE
                                <ChevronDown className="size-4 group-hover/help:rotate-180 transition-transform duration-500" />
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary group-hover/help:w-1/3 transition-all duration-500 opacity-0 group-hover/help:opacity-100 rounded-full shadow-premium" />
                            </button>
                            <div className="absolute top-full left-0 pt-4 opacity-0 translate-y-4 pointer-events-none group-hover/help:opacity-100 group-hover/help:translate-y-0 group-hover/help:pointer-events-auto transition-all duration-500 z-50 origin-top">
                                <div className="w-80 glass border-2 border-border rounded-[2rem] shadow-premium p-3">
                                    {supportLinks.map((link) => (
                                        <Link key={link.to} to={link.to} className="flex items-center gap-5 px-4 py-4 rounded-2xl hover:bg-accent transition-all group/item active-press">
                                            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-background transition-all">
                                                <link.icon className="size-6" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground italic">{link.label}</p>
                                                <p className="text-executive-label opacity-40 mt-1">{link.desc}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <a href="/#features" className="relative px-5 py-3 rounded-xl text-executive-label text-foreground/60 hover:text-foreground hover:bg-accent/50 transition-all duration-500 group whitespace-nowrap">
                            FONCTIONNALITÉS
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-1 bg-primary group-hover:w-1/3 transition-all duration-500 opacity-0 group-hover:opacity-100 rounded-full shadow-premium" />
                        </a>
                    </nav>

                    {/* Right Side Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="w-px h-8 bg-border mx-2" />
                        <ThemeToggle minimal />

                        {/* Cart Button */}
                        <div className="relative">
                            <button
                                onClick={() => setIsCartOpen(!isCartOpen)}
                                className="relative flex items-center justify-center size-12 rounded-2xl text-foreground/60 hover:bg-accent hover:text-primary transition-all group active-press"
                            >
                                <ShoppingCart className="size-6 group-hover:scale-110 transition-transform duration-300" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 size-6 bg-primary text-background text-[11px] font-black rounded-lg flex items-center justify-center shadow-premium border-2 border-background animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Cart Dropdown */}
                            {isCartOpen && (
                                <div className="absolute top-full right-0 pt-4 w-[420px] z-50 animate-in fade-in slide-in-from-top-4 duration-500 origin-top-right">
                                    <div className="glass border-2 border-border rounded-[2.5rem] shadow-premium overflow-hidden">
                                        <div className="flex items-center justify-between px-8 py-6 border-b-2 border-border">
                                            <div>
                                                <p className="text-executive-label text-primary opacity-80">VOTRE PANIER</p>
                                                <p className="text-lg font-black text-foreground italic uppercase">{cartCount} article(s) sélectionnés</p>
                                            </div>
                                            <button onClick={() => setIsCartOpen(false)} className="p-3 rounded-2xl hover:bg-accent transition-all active-press">
                                                <X className="size-6 text-muted-foreground" />
                                            </button>
                                        </div>

                                        {cartItems.length === 0 ? (
                                            <div className="py-20 text-center space-y-6">
                                                <div className="size-24 mx-auto rounded-[2rem] bg-accent/30 flex items-center justify-center border-2 border-dashed border-border shadow-inner">
                                                    <ShoppingCart className="size-10 text-muted-foreground/20" />
                                                </div>
                                                <p className="text-executive-label text-muted-foreground italic">LE PANIER EST ENCORE VIDE</p>
                                            </div>
                                        ) : (
                                            <div className="max-h-[500px] overflow-y-auto px-6 py-4 scrollbar-thin">
                                                {cartItems.map((item, i) => {
                                                    const name = item.nom_produit || item.name || 'Produit';
                                                    const price = parseFloat(item.prix_unitaire || item.price || 0);
                                                    const img = item.image || 'https://images.unsplash.com/photo-1523275319145-80b01958f7a2?auto=format&fit=crop&q=80&w=60';
                                                    return (
                                                        <div key={i} className="flex items-center gap-6 p-4 rounded-[1.5rem] hover:bg-accent transition-all group border-b border-transparent last:border-0 my-2">
                                                            <div className="relative shrink-0">
                                                                <img src={img} className="size-20 rounded-2xl object-cover border-2 border-border shadow-premium" alt={name} />
                                                                <div className="absolute inset-0 rounded-2xl bg-foreground/0 group-hover:bg-foreground/5 transition-colors" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-base font-black text-foreground italic truncate leading-tight uppercase">{name}</p>
                                                                <div className="flex items-center gap-3 mt-2">
                                                                    <span className="text-executive-label px-2 py-0.5 rounded bg-primary/10 text-primary italic font-black">QTE: {item.quantity || 1}</span>
                                                                    <p className="text-sm text-primary font-black italic">{(price * (item.quantity || 1)).toLocaleString('fr-FR')} GNF</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeFromCart(item.id)} className="p-3 rounded-2xl hover:bg-destructive/10 text-destructive/30 hover:text-destructive transition-all active-press">
                                                                <X className="size-5" />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {cartItems.length > 0 && (
                                            <div className="p-10 border-t-2 border-border bg-accent/30 space-y-8">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-executive-label text-muted-foreground italic uppercase">Sous-total</span>
                                                    <span className="text-3xl font-black text-foreground italic tabular-nums tracking-tighter">{cartTotal.toLocaleString('fr-FR')} <span className="text-sm not-italic opacity-50">GNF</span></span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <Link to="/cart" onClick={() => setIsCartOpen(false)}>
                                                        <Button variant="outline" className="w-full h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-executive-label">
                                                            VOIR PANIER
                                                        </Button>
                                                    </Link>
                                                    <Link to="/checkout" onClick={() => setIsCartOpen(false)}>
                                                        <Button className="w-full h-16 rounded-[1.25rem] font-black uppercase tracking-widest text-executive-label shadow-premium">
                                                            PAIEMENT
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Auth Buttons */}
                        <div className="w-px h-8 bg-border mx-2" />
                        {user ? (
                            <div className="flex items-center gap-4 pl-2">
                                <div className="hidden lg:flex flex-col items-end">
                                    <p className="text-sm font-black text-foreground italic leading-none truncate max-w-[120px]">{user.nom_complet}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <p className="text-executive-label text-primary italic uppercase">{user.role}</p>
                                    </div>
                                </div>
                                <Link to="/dashboard" className="active-press">
                                    <div className="size-14 rounded-2xl bg-foreground text-background p-[2px] shadow-premium hover:shadow-primary/30 transition-all group">
                                        <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                                            <User className="size-6 text-foreground group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login">
                                    <Button variant="ghost" className="font-black text-foreground/60 hover:text-foreground hover:bg-accent rounded-[1.25rem] px-8 h-12 text-executive-label uppercase tracking-widest">
                                        CONNEXION
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="font-black rounded-[1.25rem] px-10 h-12 text-executive-label uppercase tracking-widest shadow-premium">
                                        DÉMARRER
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle minimal />
                        <button
                            className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white active-press"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer */}
                {isMenuOpen && (
                    <div className="md:hidden py-6 animate-in slide-in-from-top-4 duration-300">
                        <nav className="flex flex-col gap-2">
                            <div className="px-4 py-2">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary opacity-80">Navigation Principale</span>
                            </div>
                            {shopLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary transition-all active-press"
                                >
                                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <link.icon className="size-5 text-primary" />
                                    </div>
                                    <span className="text-base font-bold">{link.label}</span>
                                </Link>
                            ))}
                            <div className="h-px bg-white/10 dark:bg-white/5 my-4 mx-4"></div>
                            <div className="grid grid-cols-1 gap-3 px-4 pt-2">
                                {user ? (
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20">Mon Dashboard</Button>
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="outline" className="w-full h-14 rounded-2xl font-black text-base">Se connecter</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="premium" className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-blue-500/20">Commencer l'aventure</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
