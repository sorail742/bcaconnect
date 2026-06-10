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
import { ROLE_LABELS } from '../../constants/roles';

const DashboardLayout = ({ children, title, noPadding, noFooter, fullHeight, hideHeader }) => {
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
            // Toast global géré par SocketHandler — éviter les doublons
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
        <div className="flex h-full min-h-0 bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30 selection:text-foreground antialiased relative">
            
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

                {/* Executive Command Bar — masqué sur pages immersives (Messages, etc.) */}
                {!hideHeader && (
                <header className="h-14 shrink-0 border-b border-border bg-background/90 backdrop-blur-md z-40 px-4 md:px-6 flex items-center justify-between sticky top-0 shadow-sm">
                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                        <button
                            id="btn-sidebar-toggle"
                            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                            className="hidden md:flex size-8 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-all"
                        >
                            <LayoutGrid className={cn("size-4 transition-transform duration-300", isSidebarCollapsed ? 'rotate-90' : 'rotate-0')} />
                        </button>

                        <button
                            id="btn-mobile-sidebar-toggle"
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden size-8 flex items-center justify-center text-muted-foreground hover:text-primary border border-border rounded-lg"
                        >
                            <Menu className="size-4" />
                        </button>

                        <h2 className="text-base font-bold text-foreground tracking-tight truncate">
                            {title || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-3 relative z-10 shrink-0">
                        <button
                            onClick={() => { navigate('/messages'); setUnreadMessages(0); }}
                            className="relative size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-all"
                        >
                            <MessageSquare className="size-4" />
                            {unreadMessages > 0 && (
                                <span className="absolute -top-1 -right-1 size-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center border border-background">
                                    {unreadMessages > 9 ? '9+' : unreadMessages}
                                </span>
                            )}
                        </button>

                        <button
                            id="btn-notifications"
                            onClick={() => navigate('/notifications')}
                            className="relative size-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-all"
                        >
                            <Bell className="size-4" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-background" />
                            )}
                        </button>

                        <button
                            id="btn-profile-hub"
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 group p-0.5 pr-3 rounded-lg bg-muted border border-border hover:border-primary/40 transition-all"
                        >
                            <div className="size-8 rounded-lg bg-primary overflow-hidden border border-border shrink-0">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Profil" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-[#FF6600] flex items-center justify-center text-white text-[10px] font-bold">
                                        {user?.nom_complet?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="hidden sm:flex flex-col items-start text-left min-w-0">
                                <p className="text-xs font-semibold text-foreground leading-none truncate max-w-[120px]">
                                    {user?.nom_complet || 'Utilisateur'}
                                </p>
                                <span className="text-[10px] font-medium text-primary uppercase tracking-wide leading-none truncate max-w-[120px]">
                                    {ROLE_LABELS[user?.role] || 'Membre BCA'}
                                </span>
                            </div>
                        </button>
                    </div>
                </header>
                )}

                {/* Intelligence Viewport */}
                <main className={cn(
                    "flex-1 relative bg-background",
                    fullHeight
                        ? "flex flex-col min-h-0 overflow-hidden"
                        : "overflow-y-auto overflow-x-hidden custom-scrollbar",
                    noPadding ? "" : "p-4 md:p-6 pb-10",
                )}>
                    {/* Visual Grain & Scale Layer */}
                    <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
                    
                    {fullHeight ? (
                        <div className={cn(
                            "relative z-10 w-full min-w-0 max-w-full flex flex-col flex-1 min-h-0",
                            !noPadding && "container max-w-full",
                        )}>
                            {children}
                        </div>
                    ) : (
                    <PageTransition
                        className={cn(
                            "relative z-10 w-full min-w-0 max-w-full",
                            !noPadding && "container max-w-full",
                        )}
                    >
                        {children}
                    </PageTransition>
                    )}

                    {/* Infrastructure Ledger Footer */}
                    {!noFooter && (
                        <footer className="mt-8 py-4 px-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-2">
                                <Zap className="size-3.5 text-primary" />
                                <p className="text-[9px] font-semibold uppercase text-muted-foreground">BCA Connect v2.6</p>
                            </div>
                            <p className="text-[9px] font-semibold uppercase text-muted-foreground">© 2026 BCA Connect</p>
                        </footer>
                    )}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
