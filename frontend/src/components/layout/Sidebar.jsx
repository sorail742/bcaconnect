import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Store,
    Receipt,
    Users,
    MessageSquare,
    User,
    Truck,
    Plus,
    Landmark,
    Folder,
    RotateCcw,
    Bell,
    Wallet,
    Settings,
    LogOut,
    Megaphone,
    Gavel,
    X,
    Sparkles,
    Shield
} from 'lucide-react';
import BcaLogo from '../ui/BcaLogo';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useRBAC } from '../../hooks/useRBAC';
import { cn } from '../../lib/utils';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { can } = useRBAC();

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', label: 'TABLEAU DE BORD', icon: LayoutDashboard },
            { path: '/admin/users', label: 'UTILISATEURS', icon: Users, permission: 'manage_users' },
            { path: '/admin/products', label: 'PRODUITS', icon: Package },
            { path: '/admin/categories', label: 'GESTION CATÉGORIES', icon: Folder, permission: 'manage_categories' },
            { path: '/admin/disputes', label: 'MÉDIATION LITIGES', icon: Gavel, permission: 'solve_disputes' },
            { path: '/admin/transactions', label: 'TRANSACTIONS', icon: Receipt, permission: 'view_all_transactions' },
            { path: '/admin/ads', label: 'GESTION PUBS', icon: Megaphone, permission: 'manage_ads' },
            { path: '/bank/dashboard', label: 'PANEL FINANCIER', icon: Landmark, permission: 'view_all_transactions' },
        ],
        fournisseur: [
            { path: '/vendor/dashboard', label: 'TABLEAU DE BORD', icon: LayoutDashboard },
            { path: '/vendor/products', label: 'MES PRODUITS', icon: Package, permission: 'manage_own_products' },
            { path: '/vendor/orders', label: 'COMMANDES REÇUES', icon: ShoppingCart, permission: 'view_own_orders' },
            { path: '/admin/ads', label: 'MES PUBLICITÉS', icon: Megaphone, permission: 'manage_ads' },
            { path: '/vendor/store', label: 'PARAMÈTRES BOUTIQUE', icon: Store, permission: 'manage_own_store' },
        ],
        transporteur: [
            { path: '/carrier/dashboard', label: 'TABLEAU DE BORD', icon: LayoutDashboard },
            { path: '/tracking', label: 'LIVRAISONS', icon: Truck, permission: 'view_available_deliveries' },
        ],
        client: [
            { path: '/dashboard', label: 'MON ESPACE', icon: LayoutDashboard },
            { path: '/marketplace', label: 'MARCHÉ', icon: Store },
            { path: '/vendors', label: 'VENDEURS', icon: Users },
            { path: '/orders', label: 'MES COMMANDES', icon: ShoppingCart, permission: 'view_own_history' },
            { path: '/payments', label: 'PAIEMENTS', icon: Wallet },
            { path: '/tracking', label: 'LIVRAISONS', icon: Truck },
        ]
    };

    const currentMenu = (menuItems[user?.role] || menuItems.client).filter(item => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <>
            {/* Overlay Mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 md:hidden animate-in fade-in duration-500"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 w-80 bg-[#0A0D14] border-r-4 border-white/5 flex flex-col justify-between py-12 px-8 z-50 transition-all duration-700 ease-in-out md:relative md:translate-x-0 md:flex md:w-[22rem]",
                isOpen ? 'translate-x-0 shadow-[40px_0_100px_rgba(0,0,0,0.5)]' : '-translate-x-full md:translate-x-0'
            )}>
                {/* Close button mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-3 text-slate-500 hover:bg-white/5 rounded-2xl md:hidden transition-all active:scale-90"
                >
                    <X className="size-6" />
                </button>

                <div className="flex flex-col gap-16">
                    {/* Logo Section */}
                    <div className="flex items-center gap-6 px-4 group cursor-default" translate="no">
                        <div className="shrink-0 relative">
                            <div className="absolute inset-0 bg-[#FF6600]/20 blur-xl rounded-full scale-150 animate-pulse" />
                            <BcaLogo className="size-12 drop-shadow-[0_0_10px_rgba(255,102,0,0.4)] relative z-10 group-hover:rotate-12 transition-transform duration-700" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-white text-xl font-black leading-none tracking-tight italic uppercase">BCA CONNECT</h1>
                            <div className="flex items-center gap-2.5 mt-3">
                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse" />
                                <p className="text-[#FF6600] text-[10px] font-black uppercase tracking-[0.3em] leading-none italic" translate="yes">
                                    {user?.role === 'fournisseur' ? 'MARCHAND ELITE' : user?.role === 'admin' ? 'SUPER ADMIN' : user?.role === 'transporteur' ? 'LIVREUR PRO' : 'CLIENT PRIVILÈGE'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex flex-col gap-3">
                        {currentMenu.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-5 px-6 py-4.5 rounded-[1.5rem] transition-all duration-700 group relative overflow-hidden",
                                        isActive
                                            ? "bg-white/[0.03] text-white border-2 border-[#FF6600]/40 shadow-3xl scale-[1.05]"
                                            : "text-slate-500 border-2 border-transparent hover:bg-white/5 hover:text-white"
                                    )
                                }
                            >
                                <div className={cn(
                                    "size-10 rounded-xl flex items-center justify-center transition-all duration-700 group-hover:rotate-6",
                                    "bg-white/5 text-slate-500 group-[.active]:bg-[#FF6600] group-[.active]:text-white group-[.active]:shadow-[0_0_20px_rgba(255,102,0,0.4)]"
                                )}>
                                    <item.icon className="size-5 transition-transform duration-700 group-hover:scale-110" />
                                </div>
                                <span className="text-[11px] font-black tracking-[0.2em] italic uppercase whitespace-nowrap">{item.label}</span>

                                {/* Active Indicator Dot */}
                                <div className={cn(
                                    "absolute right-6 size-2 rounded-full bg-[#FF6600] transition-all duration-700 scale-0 shadow-[0_0_10px_rgba(255,102,0,0.5)]",
                                    "group-[.active]:scale-100"
                                )}></div>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="flex flex-col gap-10">
                    {can('manage_own_products') && (
                        <div className="px-2">
                            <Button
                                onClick={() => {
                                    window.location.href = '/vendor/products/add';
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className="w-full text-[11px] font-black uppercase tracking-[0.4em] gap-4 h-20 rounded-[1.5rem] shadow-3xl shadow-[#FF6600]/20 bg-[#FF6600] hover:bg-[#FF6600] text-white border-0 hover:scale-105 transition-all duration-700 italic"
                            >
                                <Plus className="size-6" />
                                NOUVEAU PRODUIT
                            </Button>
                        </div>
                    )}

                    <div className="pt-10 border-t-4 border-white/5 space-y-3">
                        <div className="px-4 mb-8">
                            <ThemeToggle className="w-full h-14 rounded-2xl bg-white/[0.02] border-2 border-white/5" />
                        </div>

                        <NavLink
                            to="/profile"
                            onClick={() => { if (window.innerWidth < 768) onClose(); }}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-700 group",
                                    isActive
                                        ? "bg-white/[0.03] text-white border-2 border-white/10"
                                        : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
                                )
                            }
                        >
                            <User className="size-5 group-hover:scale-110 transition-transform" />
                            <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">MON PROFIL</span>
                        </NavLink>

                        <button
                            onClick={() => {
                                logout();
                                if (window.innerWidth < 768) onClose();
                            }}
                            className="flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-700 text-rose-500 hover:bg-rose-500/5 font-black w-full text-left group"
                        >
                            <LogOut className="size-5 group-hover:-translate-x-2 transition-transform" />
                            <span className="text-[12px] uppercase tracking-[0.2em] italic">DÉCONNEXION</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
