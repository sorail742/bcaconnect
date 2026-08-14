import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingCart, Store, Receipt,
    Users, MessageSquare, User, Truck, Plus, Landmark,
    Folder, RotateCcw, Bell, Wallet, Settings, LogOut,
    Megaphone, Gavel, X, Shield, Search, Satellite, Zap, Calendar, BarChart2, GraduationCap, Radio, Wrench, FileText, Globe2, History, Activity, Tag, HardHat
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ROLE_LABELS } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';
import { useRBAC } from '../../hooks/useRBAC';
import messageService from '../../message/services/messageService';
import socketService from '../../services/socketService';
import { useLanguage } from '../../context/useLanguage';
import BcaLogo from '../ui/BcaLogo';

const Sidebar = ({ isOpen, isCollapsed, onClose }) => {
    const { user, logout } = useAuth();
    const { can, is } = useRBAC();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Charger le nombre de messages non lus
    useEffect(() => {
        const fetchUnread = async () => {
            const count = await messageService.getUnreadCount();
            setUnreadMessages(count);
        };
        fetchUnread();

        // Écouter les nouveaux messages via socket
        socketService.connect();
        const handleNewMsg = () => {
            setUnreadMessages(prev => prev + 1);
        };
        socketService.on('new_message', handleNewMsg);
        return () => socketService.off('new_message', handleNewMsg);
    }, []);

    const menuItems = {
        admin: [
            { path: '/admin/dashboard', label: t('dashboard') || 'Tableau de bord', icon: LayoutDashboard },
            { path: '/admin/logistics', label: t('logistics') || 'Logistique', icon: Truck },
            { path: '/admin/user-map', label: 'Carte Utilisateurs', icon: Globe2 },
            { path: '/admin/users', label: t('users') || 'Utilisateurs', icon: Users, permission: 'manage_users' },
            { path: '/admin/products', label: t('products') || 'Produits', icon: Package },
            { path: '/admin/categories', label: t('categories') || 'Catégories', icon: Folder, permission: 'manage_categories' },
            { path: '/admin/trends', label: t('trends') || 'IA Trends', icon: Zap },
            { path: '/admin/disputes', label: t('disputes') || 'Litiges', icon: Gavel, permission: 'solve_disputes' },
            { path: '/admin/transactions', label: t('transactions') || 'Transactions', icon: Receipt, permission: 'view_all_transactions' },
            { path: '/admin/financial', label: t('finances') || 'Finances', icon: Landmark, permission: 'view_all_transactions' },
            { path: '/admin/returns', label: t('returns') || 'Retours', icon: RotateCcw },
            { path: '/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/coupons', label: 'Codes promo', icon: Tag },
            { path: '/admin/ads', label: t('ads') || 'Publicités', icon: Megaphone, permission: 'manage_ads' },
            { path: '/admin/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap, permission: 'manage_education' },
            { path: '/admin/webinars', label: 'Webinaires', icon: Radio, permission: 'manage_content' },
            { path: '/admin/certifications', label: 'Certifications', icon: Shield, permission: 'manage_users' },
            { path: '/admin/sav', label: 'SAV', icon: Wrench, permission: 'manage_users' },
            { path: '/admin/documents', label: 'Documents Commerciaux', icon: FileText, permission: 'manage_users' },
            { path: '/admin/deletion-history', label: 'Historique des suppressions', icon: History, permission: 'view_deletion_history' },
            { path: '/admin/audit-log', label: "Journal d'activité", icon: Activity, permission: 'view_audit_logs' },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        fournisseur: [
            { path: '/vendor/dashboard', label: t('dashboard') || 'Tableau de bord', icon: LayoutDashboard },
            { path: '/vendor/products', label: t('myProducts') || 'Mes Produits', icon: Package, permission: 'manage_own_products' },
            { path: '/vendor/orders', label: t('orders') || 'Commandes', icon: ShoppingCart, permission: 'view_own_orders' },
            { path: '/vendor/clients-map', label: 'Carte Clients', icon: Globe2 },
            { path: '/group-purchase', label: t('groupPurchase') || 'Achats groupés', icon: Users },
            { path: '/rfq', label: t('rfq') || 'Demandes de devis', icon: FileText },
            { path: '/rfq/projects', label: "Appels d'offres chantier", icon: HardHat },
            { path: '/coupons', label: 'Codes promo', icon: Tag },
            { path: '/vendor/reports', label: t('reports') || 'Rapports', icon: BarChart2, permission: 'view_vendor_insights' },
            { path: '/disputes', label: t('disputes') || 'Litiges', icon: Gavel },
            { path: '/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/vendor/ads', label: t('myAds') || 'Mes Publicités', icon: Megaphone, permission: 'manage_ads' },
            { path: '/vendor/store', label: t('myStore') || 'Ma Boutique', icon: Store, permission: 'manage_own_store' },
            { path: '/vendor/certifications', label: 'Certifications', icon: Shield },
            { path: '/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        transporteur: [
            { path: '/carrier/dashboard', label: t('missions') || 'Missions', icon: Truck, permission: 'view_available_deliveries' },
            { path: '/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/tracking', label: t('tracking') || 'Suivi colis', icon: Satellite },
            { path: '/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        client: [
            { path: '/dashboard', label: t('myDashboard') || 'Mon Espace', icon: LayoutDashboard },
            { path: '/marketplace', label: t('marketplace') || 'Marché', icon: Store },
            { path: '/dashboard/vendors', label: t('vendors') || 'Fournisseurs', icon: Users },
            { path: '/dashboard/vendors-map', label: 'Carte Marchands', icon: Globe2 },
            { path: '/orders', label: t('myOrders') || 'Mes Commandes', icon: ShoppingCart, permission: 'view_own_history' },
            { path: '/disputes', label: t('myDisputes') || 'Mes Litiges', icon: Gavel },
            { path: '/dashboard/credits', label: t('myCredits') || 'Mes Crédits', icon: Receipt },
            { path: '/dashboard/credit-calendar', label: t('calendar') || 'Calendrier', icon: Calendar },
            { path: '/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/tracking', label: t('deliveries') || 'Livraisons', icon: Truck },
            { path: '/sav/guarantees', label: t('savGuarantees') || 'Garanties SAV', icon: Shield },
            { path: '/group-purchase', label: t('groupPurchase') || 'Achats groupés', icon: Users },
            { path: '/rfq', label: t('rfq') || 'Demandes de devis', icon: FileText },
            { path: '/rfq/projects', label: "Appels d'offres chantier", icon: HardHat },
            { path: '/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        technicien: [
            { path: '/technician/dashboard', label: t('dashboard') || 'Tableau de bord', icon: LayoutDashboard },
            { path: '/technician/missions', label: t('missions') || 'Missions', icon: Zap },
            { path: '/technician/missions-map', label: 'Carte Missions', icon: Globe2 },
            { path: '/technician/equipment', label: t('equipment') || 'Équipements', icon: Package },
            { path: '/group-purchase', label: t('groupPurchase') || 'Achats groupés', icon: Users },
            { path: '/technician/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ],
        banque: [
            { path: '/bank/dashboard', label: t('dashboard') || 'Tableau de bord', icon: LayoutDashboard },
            { path: '/bank/credits', label: t('pendingCredits') || 'Crédits en attente', icon: Receipt, permission: 'manage_credits' },
            { path: '/bank/applicants-map', label: 'Carte Emprunteurs', icon: Globe2, permission: 'manage_credits' },
            { path: '/group-purchase', label: t('groupPurchase') || 'Achats groupés', icon: Users },
            { path: '/wallet', label: t('wallet') || 'Portefeuille', icon: Wallet },
            { path: '/admin/financial', label: t('financialReports') || 'Rapports financiers', icon: Landmark, permission: 'view_financial_reports' },
            { path: '/education', label: t('bcaAcademy') || 'BCA Academy', icon: GraduationCap },
            { path: '/messages', label: t('messages') || 'Messages', icon: MessageSquare, badge: unreadMessages },
        ]
    };

    const currentMenu = (menuItems[user?.role] || menuItems.client).filter(item => {
        if (!item.permission) return true;
        return can(item.permission);
    });

    return (
        <>
            <aside className={cn(
                "fixed inset-y-0 left-0 bg-card border-r border-border flex flex-col z-[70] sidebar-transition md:relative md:translate-x-0 md:flex shadow-sm h-full min-h-0 overflow-hidden",
                isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                isCollapsed ? "w-20" : "w-60"
            )}>
                <div className="flex flex-col h-full min-h-0 overflow-hidden py-4 px-3">
                    <div className={cn(
                        "flex flex-col gap-2 px-1 mb-6 shrink-0",
                        isCollapsed ? "items-center" : "items-start"
                    )}>
                        <BcaLogo type={isCollapsed ? 'icon' : 'full'} size={isCollapsed ? 'h-8' : 'h-11'} />
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0 text-left pl-0.5">
                                <p className="text-primary text-[9px] font-bold uppercase tracking-widest leading-none">
                                    {ROLE_LABELS[user?.role] || 'Membre BCA'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-none">
                        {!isCollapsed && (
                            <div className="px-1 mb-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        className="w-full h-9 pl-9 pr-3 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/40"
                                        placeholder={t('searchDots') || "Rechercher..."}
                                    />
                                </div>
                            </div>
                        )}

                        <nav className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-1">{t('navigation') || 'Navigation'}</p>
                            )}
                            {currentMenu.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3 h-10 rounded-lg transition-all group relative",
                                            isActive
                                                ? "bg-primary/10 text-primary font-semibold border-l-2 border-primary pl-2.5"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent pl-2.5",
                                            isCollapsed && "justify-center px-0 pl-0 border-l-0"
                                        )
                                    }
                                >
                                    <div className="size-7 flex items-center justify-center shrink-0 relative">
                                        <item.icon className="size-4" />
                                        {item.badge > 0 && (
                                            <span className="absolute -top-1 -right-1 size-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                                                {item.badge > 9 ? '9+' : item.badge}
                                            </span>
                                        )}
                                    </div>

                                    {!isCollapsed && (
                                        <span className="text-[13px] font-medium truncate">{item.label}</span>
                                    )}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-border shrink-0">
                        {can('manage_own_products') && is('fournisseur') && !isCollapsed && (
                            <button
                                id="btn-sidebar-add-product"
                                onClick={() => {
                                    navigate('/vendor/products/add');
                                    if (window.innerWidth < 768) onClose();
                                }}
                                className="w-full h-10 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg font-semibold text-xs hover:bg-primary/90"
                            >
                                <Plus className="size-4" />
                                <span>{t('addProduct') || 'Ajouter un produit'}</span>
                            </button>
                        )}

                        <button
                            id="btn-sidebar-logout"
                            onClick={() => {
                                logout();
                                if (window.innerWidth < 768) onClose();
                            }}
                            className={cn(
                                "flex items-center gap-3 px-3 h-10 rounded-lg transition-all text-rose-500 hover:bg-rose-500/10 font-semibold w-full text-left",
                                isCollapsed && "justify-center px-0"
                            )}
                        >
                            <LogOut className="size-4" />
                            {!isCollapsed && <span className="text-xs uppercase tracking-wide">{t('logout') || 'Déconnexion'}</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
