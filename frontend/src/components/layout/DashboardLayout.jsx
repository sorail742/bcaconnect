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

const DashboardLayout = ({ children, title, noPadding }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadMessages, setUnreadMessages] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const notifs = await notificationService.getAll();
            const unread = notifs.filter(n => !n.est_lu).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("DashboardLayout: Error fetching notifications", error);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        socketService.connect();

        // Charger messages non lus
        messageService.getUnreadCount().then(setUnreadMessages).catch(() => {});

        if (user?.id) {
            socketService.on('connect', () => {
                socketService.socket.emit('join', user.id);
            });
            if (socketService.socket?.connected) {
                socketService.socket.emit('join', user.id);
            }
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
            
            {/* Massive Atmospheric Pulse — Executive Ambiance */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] size-[800px] bg-primary/[0.03] rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-20%] size-[600px] bg-secondary/[0.03] rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '3s' }} />
            </div>

            {/* Backdrop Overlay for Mobile Navigation */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/90 backdrop-blur-3xl z-[60] md:hidden"
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

                {/* Executive Command Bar — Glass High-Density */}
                <header className="h-14 shrink-0 border-b border-border bg-background/80 backdrop-blur-[48px] z-40 px-4 md:px-6 flex items-center justify-between sticky top-0 shadow-sm">
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
                        {/* Intelligent Data Module */}
                        <div className="hidden xl:flex items-center gap-4 px-4 h-9 bg-muted border border-border rounded-xl">
                            <div className="flex items-center gap-2.5">
                                <Satellite className="size-4 text-primary" />
                                <span className="text-[9px] font-bold text-foreground uppercase tracking-widest opacity-80">Satellite Link</span>
                            </div>
                            <div className="h-4 w-px bg-foreground/10" />
                            <div className="flex items-center gap-2.5">
                                <Activity className="size-4 text-emerald-500" />
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest tabular-nums">4.8 GB/s</span>
                            </div>
                        </div>

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

                        {/* Identity Module */}
                        <button
                            id="btn-profile-hub"
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-3 group p-0.5 pr-3 rounded-xl bg-muted border border-border hover:border-primary/40 transition-all"
                        >
                            <div className="size-8 rounded-lg bg-primary p-0.5 transition-all group-hover:scale-105 overflow-hidden">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}`}
                                    alt="Identité"
                                    className="w-full h-full object-cover rounded shadow-md bg-background"
                                />
                            </div>
                            <div className="hidden sm:flex flex-col items-start text-left">
                                <p className="text-[10px] font-bold text-foreground">
                                    {user?.nom_complet || 'Utilisateur'}
                                </p>
                                <span className="text-[8px] font-bold text-primary uppercase opacity-70 leading-none">{user?.role === 'fournisseur' ? 'Marchand' : 'Administrateur'}</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Intelligence Viewport */}
                <main data-lenis-prevent="true" className={cn(
                    "flex-1 overflow-y-auto scroll-smooth relative bg-background",
                    noPadding ? "" : "p-4 md:p-6 pb-10"
                )}>
                    {/* Visual Grain & Scale Layer */}
                    <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-primary/[0.01] to-transparent pointer-events-none" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                            "relative z-10 w-full",
                            !noPadding && "max-w-[1700px] mx-auto"
                        )}
                    >
                        {children}
                    </motion.div>

                    {/* Infrastructure Ledger Footer */}
                    <footer className="mt-40 py-12 px-10 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-5 opacity-20 hover:opacity-100 transition-opacity duration-1000">
                        <div className="flex items-center gap-5">
                            <Zap className="size-5 text-primary animate-pulse" />
                            <p className="text-[10px] font-black uppercase  text-muted-foreground pt-0.5">BCA_TERMINAL_CORE_8.2X</p>
                        </div>
                        <p className="text-[10px] font-black uppercase  text-muted-foreground pt-0.5">© 2026 BCA_CONNECT • GOUVERNANCE_NODALE_SÉCURISÉE</p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
