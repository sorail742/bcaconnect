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
    Wallet,
    Settings,
    LogOut
} from 'lucide-react';
import BcaLogo from '../ui/BcaLogo';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
    const { user, logout } = useAuth();

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/admin/users', label: 'Utilisateurs', icon: Users },
            { path: '/admin/products', label: 'Produits', icon: Package },
            { path: '/admin/categories', label: 'Gestion Catégories', icon: Folder },
            { path: '/admin/returns', label: 'Retours & Litiges', icon: RotateCcw },
            { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
            { path: '/bank/dashboard', label: 'Panel Financier', icon: Landmark },
        ],
        fournisseur: [
            { path: '/vendor/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/vendor/products', label: 'Mes Produits', icon: Package },
            { path: '/vendor/orders', label: 'Commandes reçues', icon: ShoppingCart },
            { path: '/vendor/store', label: 'Paramètres Boutique', icon: Store },
        ],
        transporteur: [
            { path: '/carrier/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
            { path: '/tracking', label: 'Livraisons', icon: Truck },
        ],
        client: [
            { path: '/dashboard', label: 'Mon Espace', icon: LayoutDashboard },
            { path: '/marketplace', label: 'Marché', icon: Store },
            { path: '/vendors', label: 'Vendeurs', icon: Users },
            { path: '/orders', label: 'Mes Commandes', icon: ShoppingCart },
            { path: '/payments', label: 'Paiements', icon: Wallet },
            { path: '/tracking', label: 'Livraisons', icon: Truck },
        ]
    };

    const currentMenu = menuItems[user?.role] || menuItems.client;

    return (
        <aside className="w-64 flex-shrink-0 bg-card border-r border-border flex flex-col justify-between py-8 px-5 hidden md:flex relative z-30">
            <div className="flex flex-col gap-10">
                {/* Logo Section */}
                <div className="flex items-center gap-4 px-2" translate="no">
                    <div className="shrink-0">
                        <BcaLogo className="size-11" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-foreground text-lg font-black leading-none tracking-tighter italic">BCA Connect</h1>
                        <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1 leading-none" translate="yes">
                            {user?.role || 'Membre'}
                        </p>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col gap-1">
                    {currentMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted font-medium'
                                }`
                            }
                        >
                            <item.icon className="size-5" />
                            <span className="text-sm font-semibold">{item.label}</span>
                        </NavLink>
                    ))}

                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted font-medium'
                            }`
                        }
                    >
                        <Bell className="size-5" />
                        <span className="text-sm font-semibold">Notifications</span>
                    </NavLink>

                    <NavLink
                        to="/messages"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted font-medium'
                            }`
                        }
                    >
                        <MessageSquare className="size-5" />
                        <span className="text-sm font-semibold">Messages</span>
                    </NavLink>
                </nav>
            </div>

            <div className="flex flex-col gap-4">
                {user?.role === 'fournisseur' && (
                    <Button
                        onClick={() => window.location.href = '/vendor/products/add'}
                        className="w-full text-sm font-bold gap-2"
                    >
                        <Plus className="size-4" />
                        Ajouter un produit
                    </Button>
                )}

                <div className="pt-4 border-t border-border space-y-1">
                    <ThemeToggle className="w-full mb-2" />
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted font-medium'
                            }`
                        }
                    >
                        <User className="size-5" />
                        <span className="text-sm font-medium">Mon Profil</span>
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-muted font-medium'
                            }`
                        }
                    >
                        <Settings className="size-5" />
                        <span className="text-sm font-medium">Paramètres</span>
                    </NavLink>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-destructive hover:bg-destructive/10 font-medium w-full text-left"
                    >
                        <LogOut className="size-5" />
                        <span className="text-sm font-medium">Déconnexion</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
