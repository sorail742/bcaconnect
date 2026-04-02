import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import { Bell, Search, Menu, Zap, Info, ChevronDown, User, Satellite, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import socketService from '../../services/socketService';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const DashboardLayout = ({ children, title, noPadding }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

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
            toast.message(notif.titre || "Notification Réseau", {
                description: notif.message,
                action: {
                    label: "Voir",
                    onClick: () => navigate('/notifications')
                }
            });
        };

        socketService.on('notification_received', handleNewNotification);

        return () => {
            socketService.off('notification_received', handleNewNotification);
        };
    }, [navigate, user?.id, fetchUnreadCount]);

    return (
        <div className="flex h-screen bg-[#0A0D14] font-inter text-white overflow-hidden selection:bg-[#FF6600]/30 selection:text-white">

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden transition-all duration-500"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar with dark theme */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Principal Content Container */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">

                {/* Executive Topbar - Premium Glass */}
                <header className="h-28 shrink-0 border-b-4 border-white/5 bg-[#0A0D14]/80 backdrop-blur-3xl z-50 px-8 md:px-12 flex items-center justify-between sticky top-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/5 via-transparent to-transparent opacity-50" />

                    <div className="flex items-center gap-8 relative z-10">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-4 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border-2 border-white/5"
                        >
                            <Menu className="size-6" />
                        </button>
                        <div className="flex flex-col">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] leading-none italic">
                                {title || 'ESPACE CONNECT'}
                            </h2>
                            <div className="flex items-center gap-3 mt-2.5">
                                <div className="size-2 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_8px_rgba(255,102,0,0.5)]" />
                                <p className="text-[10px] text-[#FF6600] font-black uppercase tracking-[0.4em] italic leading-none opacity-80">RÉSEAU BCA EXÉCUTIF v4.0</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-10 relative z-10">
                        {/* Global Search Interface - Dark */}
                        <div className="hidden lg:flex relative group w-96">
                            <div className="absolute inset-0 bg-[#FF6600]/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-slate-700 group-focus-within:text-[#FF6600] transition-colors duration-700" />
                            <input
                                type="text"
                                placeholder="INDEXER LE RÉSEAU..."
                                className="h-14 w-full pl-16 pr-6 bg-white/[0.02] border-2 border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white focus:border-[#FF6600]/30 transition-all outline-none placeholder:text-slate-800 placeholder:italic italic"
                            />
                        </div>

                        {/* Network Status */}
                        <div className="hidden xl:flex items-center gap-6 px-10 py-3 bg-white/[0.01] border-2 border-white/5 rounded-2xl">
                            <div className="flex items-center gap-3">
                                <Satellite className="size-4 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic pt-0.5">SATELLITE ACTIVE</span>
                            </div>
                            <div className="h-4 w-px bg-white/10" />
                            <div className="flex items-center gap-3">
                                <Activity className="size-4 text-blue-500" />
                                <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest italic pt-0.5">FLUX : 1.2 GB/S</span>
                            </div>
                        </div>

                        {/* Alerts Hub */}
                        <button
                            onClick={() => navigate('/notifications')}
                            className="relative p-4 text-slate-500 hover:text-[#FF6600] hover:bg-[#FF6600]/10 rounded-2xl transition-all border-2 border-white/5 hover:border-[#FF6600]/40 shadow-3xl group"
                        >
                            <Bell className="size-6 transition-transform group-hover:rotate-12" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 size-7 bg-[#FF6600] text-[10px] font-black text-white rounded-xl flex items-center justify-center shadow-3xl shadow-[#FF6600]/40 border-4 border-[#0A0D14] animate-bounce">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block"></div>

                        {/* Identity Card - Premium */}
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-6 group hover:bg-white/[0.03] p-2 pr-6 rounded-[1.5rem] transition-all border-2 border-transparent hover:border-white/5"
                        >
                            <div className="size-14 rounded-2xl bg-white/5 p-1 border-2 border-white/10 transition-all group-hover:scale-105 group-hover:rotate-6 overflow-hidden shadow-3xl relative">
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6600]/20 to-transparent" />
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'guest'}`}
                                    alt="Identité"
                                    className="w-full h-full object-cover rounded-xl relative z-10"
                                />
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-none gap-2">
                                <p className="text-[12px] font-black text-white uppercase truncate max-w-[160px] transition-colors group-hover:text-[#FF6600] tracking-[0.1em] italic">
                                    {user?.nom_complet || 'MEMBRE BCA'}
                                </p>
                                <div className="flex items-center gap-3 uppercase">
                                    <div className="size-2 bg-[#FF6600] rounded-full shadow-[0_0_10px_rgba(255,102,0,0.5)]" />
                                    <span className="text-[9px] font-black text-slate-600 tracking-[0.2em] italic">{user?.role === 'fournisseur' ? 'MARCHAND' : user?.role || 'CLIENT'}</span>
                                </div>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Dashboard Viewport */}
                <main className={`flex-1 overflow-y-auto relative scroll-smooth thin-scrollbar ${noPadding ? '' : 'p-0 pb-32'}`}>
                    {/* Perspective Line */}
                    <div className="absolute top-0 left-12 w-px h-full bg-white/5 pointer-events-none hidden md:block" />
                    <div className="absolute top-0 right-12 w-px h-full bg-white/5 pointer-events-none hidden md:block" />

                    <div className={cn(
                        "relative z-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000",
                        !noPadding && "max-w-[1600px] mx-auto pt-16 px-12 lg:px-24"
                    )}>
                        {children}
                    </div>

                    {/* Infrastructure Footer Mini */}
                    <div className="mt-32 py-20 px-12 lg:px-24 border-t-4 border-white/5 flex flex-col sm:flex-row items-center justify-between gap-10 opacity-30 group hover:opacity-100 transition-opacity duration-1000">
                        <div className="flex items-center gap-6">
                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-[#FF6600]/10 transition-colors">
                                <Zap className="size-6 text-[#FF6600] group-hover:animate-pulse" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">CONNECT ALPHA NODE v4.51.0</p>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">LIAISON QUANTIQUE SÉCURISÉE</p>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">© 2026 BCA CONNECT • GOUVERNANCE EXÉCUTIVE SANS RÉSERVE</p>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
