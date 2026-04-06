import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "../ui/Button"
import { motion, AnimatePresence } from "framer-motion"
import {
    Menu, X, ShoppingCart, ChevronDown,
    Store, Users, Package, Truck, HelpCircle,
    BookOpen, MessageSquare, User, Globe, Zap,
    Activity, Shield, Laptop, LogOut, LayoutDashboard
} from "lucide-react"
import { useCart } from "../../context/CartContext"
import { useAuth } from "../../hooks/useAuth"
import ThemeToggle from "../ui/ThemeToggle"
import { cn } from "../../lib/utils"
import { useLanguage } from "../../context/LanguageContext"
import BcaLogo from "../ui/BcaLogo"

export function Header() {
    const { t, lang, setLanguage } = useLanguage()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false)
    const [isSupportDropdownOpen, setIsSupportDropdownOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const { cartItems } = useCart()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
        setIsMenuOpen(false)
    }

    const shopLinks = [
        { to: "/marketplace", label: t('catalog') || "CATALOG_ALPHA", icon: Package, desc: t('catalogDesc') || "EXPLORE_MERC_NODES" },
        { to: "/vendors", label: t('vendors') || "VENDOR_CELLS", icon: Users, desc: t('vendorsDesc') || "CERTIFIED_PROFESSIONALS" },
        { to: "/tracking", label: t('tracking') || "GEO_SYNC", icon: Truck, desc: t('trackingDesc') || "REAL_TIME_LOGISTICS" },
    ]

    const supportLinks = [
        { to: "/faq", label: t('faq') || "KNOWLEDGE_BASE", icon: HelpCircle, desc: t('faqDesc') || "CORE_SYSTEM_FAQ" },
        { to: "/help", label: t('guide') || "USER_PROTOCOLS", icon: BookOpen, desc: t('guideDesc') || "SYSTEM_OPERATIONS" },
        { to: "/contact", label: t('contact') || "SUPPORT_COMMS", icon: MessageSquare, desc: t('contactDesc') || "ENCRYPTED_CHANNELS" },
    ]

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 font-jakarta",
            isScrolled 
                ? "bg-background/95 backdrop-blur-3xl border-b border-foreground/5 py-6" 
                : "bg-transparent py-14"
        )}>
            <div className="max-w-[1700px] mx-auto px-10 md:px-16 flex items-center justify-between">

                {/* Brand Logo */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-6 group">
                        <motion.div 
                            whileHover={{ rotate: 180, scale: 1.15 }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="size-16 rounded-[1.4rem] bg-primary flex items-center justify-center text-foreground shadow-sm border border-foreground/10 "
                        >
                            <BcaLogo className="size-10" />
                        </motion.div>
                        <div className="flex flex-col leading-none text-left">
                            <span className="font-black text-4xl text-foreground tracking-tighter uppercase mb-0.5" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                BCA<span className="text-primary italic">CONNECT.</span>
                            </span>
                            <div className="flex items-center gap-3 opacity-40">
                                <Activity className="size-3 text-primary animate-pulse" />
                                <span className="text-[10px] font-black  text-foreground uppercase pt-0.5">FINTECH_ELEVATED_V4</span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden 2xl:flex items-center gap-8">
                        {/* Marketplace Dropdown */}
                        <div
                            className="relative group/nav"
                            onMouseEnter={() => setIsShopDropdownOpen(true)}
                            onMouseLeave={() => setIsShopDropdownOpen(false)}
                        >
                            <button className={cn(
                                "flex items-center gap-5 px-10 py-4.5 text-[12px] font-black rounded-2xl transition-all duration-700 uppercase  leading-none border border-transparent ",
                                isShopDropdownOpen 
                                    ? "text-primary bg-white/[0.02] border-foreground/5 shadow-inner" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}>
                                <Store className="size-6" />
                                {t('marketplace') || "MARKET_ALPHA"}
                                <ChevronDown className={cn("size-4 transition-transform duration-1000 opacity-40", isShopDropdownOpen && "rotate-180 opacity-100 text-primary")} />
                            </button>
                            
                            <AnimatePresence>
                                {isShopDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                                        transition={{ duration: 0.6, ease: "circOut" }}
                                        className="absolute top-full left-0 pt-8 w-[500px]"
                                    >
                                        <div className="bg-card border border-foreground/10 rounded-3xl shadow-sm p-8 overflow-hidden relative backdrop-blur-3xl executive-card">
                                            <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                                            <div className="space-y-6 relative z-10">
                                                {shopLinks.map(link => (
                                                    <Link
                                                        key={link.to}
                                                        to={link.to}
                                                        onClick={() => setIsShopDropdownOpen(false)}
                                                        className="flex items-center gap-8 p-8 rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] transition-all group/item border border-transparent hover:border-foreground/5 "
                                                    >
                                                        <div className="size-20 rounded-2xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center text-muted-foreground group-hover/item:bg-primary group-hover/item:text-foreground group-hover/item:border-transparent transition-all duration-700 shadow-sm">
                                                            <link.icon className="size-10" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[16px] font-black text-foreground uppercase tracking-tighter leading-none mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{link.label}</p>
                                                            <p className="text-[11px] text-muted-foreground font-black uppercase  leading-none opacity-60 group-hover:opacity-100 transition-opacity">{link.desc}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Support Dropdown */}
                        <div
                            className="relative group/nav"
                            onMouseEnter={() => setIsSupportDropdownOpen(true)}
                            onMouseLeave={() => setIsSupportDropdownOpen(false)}
                        >
                            <button className={cn(
                                "flex items-center gap-5 px-10 py-4.5 text-[12px] font-black rounded-2xl transition-all duration-700 uppercase  leading-none border border-transparent ",
                                isSupportDropdownOpen 
                                    ? "text-primary bg-white/[0.02] border-foreground/5 shadow-inner" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}>
                                <HelpCircle className="size-6" />
                                {t('help') || "CORE_SUPPORT"}
                                <ChevronDown className={cn("size-4 transition-transform duration-1000 opacity-40", isSupportDropdownOpen && "rotate-180 opacity-100 text-primary")} />
                            </button>
                            
                            <AnimatePresence>
                                {isSupportDropdownOpen && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 15, scale: 0.98 }}
                                        transition={{ duration: 0.6, ease: "circOut" }}
                                        className="absolute top-full left-0 pt-8 w-[500px]"
                                    >
                                        <div className="bg-card border border-foreground/10 rounded-3xl shadow-sm p-8 overflow-hidden relative backdrop-blur-3xl executive-card">
                                            <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                                            <div className="space-y-6 relative z-10">
                                                {supportLinks.map(link => (
                                                    <Link
                                                        key={link.to}
                                                        to={link.to}
                                                        onClick={() => setIsSupportDropdownOpen(false)}
                                                        className="flex items-center gap-8 p-8 rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] transition-all group/item border border-transparent hover:border-foreground/5 "
                                                    >
                                                        <div className="size-20 rounded-2xl bg-white/[0.02] border border-foreground/5 flex items-center justify-center text-muted-foreground group-hover/item:bg-primary group-hover/item:text-foreground group-hover/item:border-transparent transition-all duration-700 shadow-sm">
                                                            <link.icon className="size-10" />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[16px] font-black text-foreground uppercase tracking-tighter leading-none mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>{link.label}</p>
                                                            <p className="text-[11px] text-muted-foreground font-black uppercase  leading-none opacity-60 group-hover:opacity-100 transition-opacity">{link.desc}</p>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <Link to="/#features" className="px-8 py-4 text-[12px] font-black text-muted-foreground hover:text-foreground uppercase  decoration-primary transition-all duration-700 hover:underline underline-offset-[1.5rem] ">{t('features') || "PROTOCOLS"}</Link>
                    </nav>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-6 md:gap-8">
                    
                    {/* Language Switcher */}
                    <div className="hidden sm:flex bg-white/[0.02] p-1.5 rounded-2xl border border-foreground/10 shadow-inner">
                        {['FR', 'EN'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLanguage(l)}
                                className={cn(
                                    "px-6 py-2.5 text-[11px] font-black rounded-xl transition-all duration-700 uppercase tracking-widest",
                                    lang === l ? "bg-primary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <ThemeToggle minimal />

                    {/* Cart Button */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Link to="/cart" className="size-18 flex items-center justify-center rounded-[1.8rem] bg-card text-muted-foreground hover:text-primary transition-all relative group border border-foreground/5 shadow-sm ">
                            <ShoppingCart className="size-8 transition-transform duration-700 group-hover:rotate-12" />
                            {cartCount > 0 && (
                                <motion.span 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 size-8 bg-primary text-foreground text-[12px] font-black rounded-full flex items-center justify-center border-4 border-[#050505] shadow-sm"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Link>
                    </motion.div>

                    <div className="h-10 w-px bg-foreground/10 mx-2 hidden md:block" />

                    {/* Desktop Auth */}
                    <div className="hidden md:flex items-center gap-8">
                        {user ? (
                            <Link to="/dashboard" className="flex items-center gap-6 group p-2 pr-10 rounded-[2.8rem] bg-card hover:bg-white/[0.02] border border-foreground/10 transition-all duration-1000 shadow-sm ">
                                <div className="size-16 rounded-[1.6rem] bg-primary flex items-center justify-center text-foreground shadow-sm border border-foreground/10 group-hover:rotate-[360deg] transition-all duration-1000 ease-in-out">
                                    <User className="size-10" />
                                </div>
                                <div className="text-left hidden xl:block">
                                    <p className="text-[15px] font-black text-foreground uppercase tracking-tighter leading-none mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>{user.nom_complet}</p>
                                    <div className="flex items-center gap-4">
                                         <div className="size-2.5 rounded-full bg-primary animate-pulse shadow-sm" />
                                         <p className="text-[10px] text-muted-foreground font-black uppercase  leading-none">{user.role || "MEMBER_CORE"}</p>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-8">
                                <Link to="/login">
                                    <button className="font-black text-muted-foreground hover:text-foreground text-[12px] uppercase  border-none bg-transparent px-6 transition-all ">{t('login') || "SYNC_CORE"}</button>
                                </Link>
                                <Link to="/register">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-18 px-14 rounded-[1.8rem] bg-white text-background font-medium text-sm text-muted-foreground shadow-sm transition-all duration-1000  group relative overflow-hidden"
                                    >
                                         <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                         <span className="relative z-10 group-hover:text-foreground transition-colors">{t('register') || "JOIN_ALPHA"}</span>
                                    </motion.button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="2xl:hidden size-18 flex items-center justify-center rounded-[1.8rem] bg-white text-background  shadow-sm"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="size-10" /> : <Menu className="size-10" />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed inset-0 z-[110] bg-background p-8 pt-40 xl:hidden overflow-y-auto"
                    >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,95,0,0.1)_0%,transparent_70%)] pointer-events-none" />
                        
                        <div className="max-w-2xl mx-auto space-y-24 relative z-10">
                            {/* Mobile Links */}
                            <div className="space-y-20">
                                <div className="space-y-12">
                                    <div className="flex items-center gap-8 px-6 text-left">
                                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                            <Store className="size-6 text-primary" />
                                        </div>
                                        <h5 className="text-[14px] font-black uppercase  text-foreground pt-1">{t('marketplace') || "MERC_ALPHA"}</h5>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        {shopLinks.map(link => (
                                            <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-8 p-8 rounded-3xl bg-white/[0.01] border border-foreground/5 text-foreground font-black text-3xl uppercase tracking-tighter transition-all hover:border-primary/40  shadow-md group">
                                                <div className="size-20 rounded-[1.8rem] bg-primary flex items-center justify-center text-foreground shadow-sm transition-transform group-hover:rotate-12 group-hover:scale-110">
                                                    <link.icon className="size-10" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p style={{ fontFamily: "'Outfit', sans-serif" }}>{link.label}</p>
                                                    <p className="text-[12px] font-black text-muted-foreground mt-3  opacity-60 uppercase">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="h-px bg-foreground/5" />

                                <div className="space-y-12 pb-64">
                                     <div className="flex items-center gap-8 px-6 text-left">
                                        <div className="size-12 rounded-2xl bg-white/[0.05] flex items-center justify-center border border-foreground/10">
                                            <HelpCircle className="size-6 text-muted-foreground/80" />
                                        </div>
                                        <h5 className="text-[14px] font-black uppercase  text-foreground pt-1">{t('help') || "CORE_SUPPORT"}</h5>
                                    </div>
                                    <div className="grid grid-cols-1 gap-8">
                                        {supportLinks.map(link => (
                                            <Link key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-8 p-8 rounded-3xl bg-white/[0.01] border border-foreground/5 text-foreground font-black text-3xl uppercase tracking-tighter transition-all hover:border-primary/40  shadow-md group">
                                                <div className="size-20 rounded-[1.8rem] bg-white/[0.03] border border-foreground/10 flex items-center justify-center text-muted-foreground shadow-inner group-hover:text-primary transition-all duration-700">
                                                    <link.icon className="size-10" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p style={{ fontFamily: "'Outfit', sans-serif" }}>{link.label}</p>
                                                    <p className="text-[12px] font-black text-muted-foreground mt-3  opacity-60 uppercase">{link.desc}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Auth Bottom */}
                            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent backdrop-blur-xl border-t border-foreground/5">
                                <div className="max-w-2xl mx-auto flex flex-col gap-8">
                                    {user ? (
                                        <div className="space-y-6">
                                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <button className="w-full h-28 rounded-3xl bg-primary text-foreground font-black text-2xl tracking-tighter uppercase shadow-sm  border-none flex items-center justify-center gap-8">
                                                    <LayoutDashboard className="size-10" />
                                                    {t('myDashboard') || "ACCESS_COMMAND"}
                                                </button>
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full h-24 rounded-3xl border border-foreground/10 bg-white/[0.02] text-red-500 font-black text-[14px]  uppercase  flex items-center justify-center gap-6"
                                            >
                                                <LogOut className="size-6" />
                                                TERMINATE_SESSION
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-8">
                                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                                <button className="w-full h-28 rounded-3xl border border-foreground/10 bg-card text-foreground font-black text-2xl tracking-widest uppercase  shadow-sm">
                                                    {t('login') || "SYNC_CORE"}
                                                </button>
                                            </Link>
                                            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                                <button className="w-full h-28 rounded-3xl bg-primary text-foreground font-black text-2xl tracking-widest uppercase shadow-sm  border-none">
                                                    {t('register') || "JOIN_ALPHA"}
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
