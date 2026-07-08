import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { Bell, Menu, Zap, Satellite, Activity, LayoutGrid, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import messageService from '../../services/messageService';
import socketService from '../../services/socketService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import PageTransition from '../ui/PageTransition';

const DashboardLayout = ({ children, title, noPadding, noFooter }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        if (!user?.id) return; // 🛡️ Ne pas appeler si pas de session
        try {
            const notifs = await notificationService.getAll({ _bg: true });
            const unread = Array.isArray(notifs) ? notifs.filter(n => !n.est_lu).length : 0;
            setUnreadCount(unread);
        } catch (error) {
            // Silencieux car _bg est actif dans l'intercepteur
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return; // 🛑 Sécurité : Stop total si pas de session

        fetchUnreadCount();
        socketService.connect();

        // Charger messages non lus en arrière-plan
        messageService.getUnreadCount({ _bg: true })
            .then(setUnreadMessages)
            .catch(() => {});

        socketService.on('connect', () => {
            socketService.socket.emit('join', user.id);
        });
        if (socketService.socket?.connected) {
            socketService.socket.emit('join', user.id);
        }

        const handleNewNotification = (notif) => {
            setUnreadCount(prev => prev + 1);
            toast.message(notif.titre || "BCA Connect", {
                description: notif.message,
                action: { label: "Voir", onClick: () => navigate('/notifications') }
            });
        };

        const handleNewMessage = () => {
            setUnreadMessages(prev => prev + 1);
        };

        socketService.on('notification_received', handleNewNotification);
        socketService.on('new_message', handleNewMessage);

        return () => {
            socketService.off('notification_received', handleNewNotification);
            socketService.off('new_message', handleNewMessage);
        };
    }, [navigate, user?.id, fetchUnreadCount]);

    return (
        <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30 selection:text-foreground antialiased relative">
            
            {/* Subtle Atmospheric Influence — Optimized for Performance */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute top-[-5%] right-[-5%] size-[400px] bg-primary/[0.02] rounded-full blur-[60px]" />
                <div className="absolute bottom-[-5%] left-[-5%] size-[300px] bg-secondary/[0.02] rounded-full blur-[60px]" />
            </div>

            {/* Backdrop Overlay for Mobile Navigation */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/60 backdrop-blur-md z-[60] md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Nodal Control Sidebar */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                isCollapsed={isSidebarCollapsed}
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* Central Intelligence Grid */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full z-10">

                {/* Executive Command Bar — Fully Opaque Sticky Header */}
                <header className="h-14 shrink-0 border-b border-border bg-background z-50 px-4 md:px-6 flex items-center justify-between sticky top-0 shadow-sm">
                    <div className="flex items-center gap-5 relative z-10">
                        {/* Intelligent Toggle Hub */}
                        <button
                            id="btn-sidebar-toggle"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex size-7 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 bg-foreground/[0.03] border border-foreground/10 rounded-xl transition-all"
                        >
                            <LayoutGrid className={cn("size-4 transition-transform duration-500", isSidebarCollapsed ? 'rotate-90' : 'rotate-0')} />
                        </button>

                        <button
                            id="btn-mobile-sidebar-toggle"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden size-7 flex items-center justify-center text-muted-foreground hover:text-primary bg-foreground/[0.03] border border-foreground/10 rounded-xl"
                        >
                            <Menu className="size-4" />
                        </button>

                        <div className="space-y-0.5">
                            <h2 className="text-base font-bold text-foreground tracking-tight leading-none">
                                {title || 'Dashboard'}
                            </h2>
                            <div className="flex items-center gap-2">
                                <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[9px] text-primary font-bold uppercase tracking-widest leading-none">Réseau Actif</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 relative z-10">
                        {/* Messages */}
                        <button
                            onClick={() => { navigate('/messages'); setUnreadMessages(0); }}
                            className="relative size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted bg-muted border border-border rounded-xl transition-all group"
                        >
                            <MessageSquare className="size-4" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 size-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center border border-background">
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </button>

                        {/* Notifications Hub */}
                        <button
                            id="btn-notifications"
                            onClick={() => navigate('/notifications')}
                            className="relative size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted bg-muted border border-border rounded-xl transition-all group"
                        >
                            <Bell className="size-4 transition-transform group-hover:rotate-6" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background" />
                            )}
                        </button>

                        {/* Identity Module — Fully Dynamic v2.7 */}
                        <button
                            id="btn-profile-hub"
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 group p-0.5 pr-3 rounded-xl bg-muted border border-border hover:border-primary/40 transition-all"
                        >
                            <div className="size-8 rounded-lg bg-primary p-0.5 transition-all group-hover:scale-105 overflow-hidden border border-border">
                                {user?.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt="Profil"
                                        className="w-full h-full object-cover rounded shadow-md bg-background"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-[#FF6600] flex items-center justify-center text-white text-[10px] font-black">
                                        {user?.nom_complet?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col items-start text-left max-w-[140px]">
                                <p className="text-[10px] font-black text-slate-900 dark:text-foreground leading-none mb-1 w-full truncate">
                                    {user?.nom_complet || 'Utilisateur'}
                                </p>
                                <span className="text-[8px] font-black text-primary uppercase tracking-widest opacity-80 leading-none">
                                    {user?.role === 'admin' ? 'Administrateur' : 
                                     user?.role === 'fournisseur' ? 'Marchand' : 
                                     user?.role === 'transporteur' ? 'Logistique' : 'Client Privilège'}
                                </span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Intelligence Viewport */}
                <main className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden relative bg-background custom-scrollbar",
                    noPadding ? "" : "p-4 md:p-6 pb-10"
                )}>
                    {/* Visual Grain & Scale Layer */}
                    <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
                    
                    <PageTransition
                        className={cn(
                            "relative z-10 w-full min-w-0 max-w-full",
                            !noPadding && "container max-w-full"
                        )}
                    >
                        {children}
                    </PageTransition>

                    {/* Infrastructure Ledger Footer */}
                    {!noFooter && (
                        <footer className="mt-40 py-12 px-10 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-5 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                            <div className="flex items-center gap-5">
                                <Zap className="size-5 text-primary animate-pulse" />
                                <p className="text-[10px] font-black uppercase text-muted-foreground pt-0.5">BCA Connect v2.6</p>
                            </div>
                            <p className="text-[10px] font-black uppercase text-muted-foreground pt-0.5">© 2026 BCA Connect v2.6</p>
                        </footer>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
