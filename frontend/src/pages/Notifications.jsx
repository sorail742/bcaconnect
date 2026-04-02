import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    ShoppingBag,
    MessageSquare,
    Settings,
    Wallet,
    AlertTriangle,
    CheckCheck,
    Search,
    Clock,
    Trash2,
    Bell,
    Loader2,
    Activity,
    Zap,
    Sparkles,
    Satellite,
    ShieldAlert,
    ChevronRight,
    Fingerprint
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../lib/utils';
import notificationService from '../services/notificationService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const Notifications = () => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const filters = [
        { id: 'all', label: 'GLOBAL' },
        { id: 'order', label: 'COMMANDES' },
        { id: 'payment', label: 'FLUX FINANCIERS' },
        { id: 'message', label: 'COMMS.' },
        { id: 'system', label: 'ALERTES SYSTÈME' }
    ];

    const fetchNotifications = useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await notificationService.getAll();
            setNotifications(data);
        } catch (error) {
            console.error(error);
        } finally {
            if (!silent) setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(() => fetchNotifications(true), 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, est_lu: true } : n));
        } catch (error) {
            toast.error("ÉCHEC DU MARQUAGE RÉSEAU.");
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
            toast.success("TOUS LES SIGNAUX ONT ÉTÉ ARCHIVÉS.");
        } catch (error) {
            toast.error("ERREUR LORS DE L'ARCHIVAGE GLOBAL.");
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success("SIGNAL RÉVOQUÉ DÉFINITIVEMENT.");
        } catch (error) {
            toast.error("ÉCHEC DE LA RÉVOCATION DU SIGNAL.");
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return { icon: ShoppingBag, color: 'text-[#FF6600]', bgColor: 'bg-[#FF6600]/10' };
            case 'payment': return { icon: Wallet, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' };
            case 'message': return { icon: MessageSquare, color: 'text-white', bgColor: 'bg-white/10' };
            case 'dispute': return { icon: AlertTriangle, color: 'text-rose-500', bgColor: 'bg-rose-500/10' };
            default: return { icon: Bell, color: 'text-slate-500', bgColor: 'bg-white/5' };
        }
    };

    const filteredNotifications = notifications
        .filter(n => activeFilter === 'all' || n.type === activeFilter)
        .filter(n =>
            n.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <DashboardLayout title="CENTRE DE SIGNAUX CRITIQUES">
            <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 border-b-4 border-white/5 pb-16 group">
                    <div className="space-y-10">
                        <div className="flex items-center gap-6">
                            <div className="size-4 rounded-full bg-[#FF6600] animate-pulse shadow-[0_0_20px_rgba(255,102,0,0.6)]" />
                            <span className="text-[12px] font-black text-[#FF6600] uppercase tracking-[0.5em] italic leading-none pt-1">VIGILANCE RÉSEAU ALPHA v5.1</span>
                        </div>
                        <h2 className="text-6xl md:text-[8rem] font-black italic tracking-tighter uppercase leading-[0.85] text-white drop-shadow-2xl">
                            LE CENTRE DE <br />
                            <span className="text-[#FF6600] not-italic underline decoration-white/10 decoration-8 underline-offset-[-10px]">SIGNAUX.</span>
                        </h2>
                        <p className="text-slate-500 text-lg font-black uppercase tracking-[0.3em] max-w-2xl leading-relaxed italic border-l-[16px] border-[#FF6600] pl-16 opacity-80">
                            GÉREZ VOS ALERTES STRATÉGIQUES ET FLUX D'ACTIVITÉ SCELLÉS SUR LE PROTOCOLE D'ÉCHANGE BCA.
                        </p>
                    </div>
                    {notifications.some(n => !n.est_lu) && (
                        <button
                            onClick={handleMarkAllRead}
                            className="h-24 px-16 rounded-[2.5rem] bg-white text-black hover:bg-[#FF6600] hover:text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-3xl transition-all duration-700 hover:scale-105 active:scale-95 italic flex items-center gap-8 group/btn"
                        >
                            <CheckCheck className="size-8 group-hover/btn:scale-110 transition-transform" />
                            <span className="pt-1 leading-none">ARCHIVER TOUT</span>
                        </button>
                    )}
                </div>

                {/* Filter & Terminal Interface */}
                <div className="bg-white/[0.01] border-4 border-white/5 rounded-[4rem] p-12 space-y-12 shadow-3xl relative overflow-hidden group/terminal">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="relative w-full xl:w-[500px] group/search">
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-[#FF6600]/20 blur-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity" />
                            <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 size-6 group-focus-within/search:text-[#FF6600] transition-all" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="FILTRER LES SIGNAUX RÉSEAU..."
                                className="w-full pl-20 h-20 bg-white/[0.03] border-4 border-transparent focus:border-[#FF6600]/40 focus:bg-black transition-all rounded-[2rem] text-sm font-black italic uppercase tracking-wider text-white placeholder:text-slate-800 outline-none"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide py-2 px-2 bg-white/[0.02] rounded-[2.5rem] border-2 border-white/5">
                            {filters.map((filter) => (
                                <button
                                    key={filter.id}
                                    onClick={() => setActiveFilter(filter.id)}
                                    className={cn(
                                        "whitespace-nowrap px-10 py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all duration-700 italic border-4",
                                        activeFilter === filter.id
                                            ? "bg-[#FF6600] text-white border-[#FF6600] shadow-3xl scale-110"
                                            : "text-slate-600 border-transparent hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Signals Engine */}
                <div className="space-y-10">
                    {isLoading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-12 opacity-40">
                            <Satellite className="size-24 text-[#FF6600] animate-spin" />
                            <p className="text-[12px] font-black uppercase tracking-[0.6em] text-[#FF6600] italic animate-pulse pt-4">SYNCHRONISATION DES SIGNAUX...</p>
                        </div>
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notif) => {
                            const iconStyle = getIcon(notif.type);
                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.est_lu && handleMarkAsRead(notif.id)}
                                    className={cn(
                                        "group relative p-12 transition-all duration-700 cursor-pointer overflow-hidden rounded-[4rem] border-x-[16px] shadow-3xl",
                                        !notif.est_lu
                                            ? "border-[#FF6600] bg-white text-black scale-[1.02] z-10"
                                            : "border-black/5 bg-white/[0.02] border-y-4 border-white/5 text-white opacity-40 hover:opacity-100 hover:bg-white/[0.04] hover:scale-105"
                                    )}
                                >
                                    <div className="flex items-start gap-12 relative z-10">
                                        <div className={cn(
                                            "size-24 rounded-[2rem] flex items-center justify-center transition-all group-hover:rotate-12 duration-1000 shadow-3xl shrink-0 border-4",
                                            !notif.est_lu ? "bg-black border-black text-[#FF6600]" : "bg-white/5 border-white/5 text-slate-500"
                                        )}>
                                            <iconStyle.icon className="size-10" />
                                        </div>
                                        <div className="flex-1 min-w-0 space-y-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-6">
                                                        {!notif.est_lu && <div className="size-3 rounded-full bg-[#FF6600] animate-pulse" />}
                                                        <h4 className={cn(
                                                            "text-3xl font-black italic tracking-tighter uppercase leading-none pt-1 transition-colors",
                                                            !notif.est_lu ? "text-black" : "text-slate-500 group-hover:text-white"
                                                        )}>
                                                            {notif.titre}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8">
                                                    <div className={cn(
                                                        "flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] italic opacity-60 transition-colors",
                                                        !notif.est_lu ? "text-black" : "text-slate-700 group-hover:text-[#FF6600]"
                                                    )}>
                                                        <Clock className="size-4" />
                                                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleDelete(e, notif.id)}
                                                        className={cn(
                                                            "size-16 rounded-[1.5rem] flex items-center justify-center transition-all border-4 duration-700 opacity-0 group-hover:opacity-100 group-hover:rotate-12",
                                                            !notif.est_lu
                                                                ? "text-rose-500 border-black/5 hover:bg-rose-500 hover:text-white"
                                                                : "text-slate-800 border-white/5 hover:border-rose-500/40 hover:text-rose-500"
                                                        )}
                                                    >
                                                        <Trash2 className="size-6" />
                                                    </button>
                                                </div>
                                            </div>
                                            <p
                                                className={cn(
                                                    "text-xl leading-relaxed font-black italic border-l-8 pl-10 transition-all duration-700 uppercase",
                                                    !notif.est_lu ? "text-black/80 border-black/10" : "text-slate-700 border-white/5 group-hover:text-white/60 group-hover:border-[#FF6600]/20"
                                                )}
                                                dangerouslySetInnerHTML={{ __html: notif.message }}
                                            />
                                        </div>
                                    </div>

                                    {!notif.est_lu && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6600]/5 to-transparent pointer-events-none" />
                                    )}

                                    {/* Interaction Shimmer */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none opacity-20"></div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-40 flex flex-col items-center justify-center text-center gap-16 bg-white/[0.01] border-8 border-dashed border-white/5 rounded-[5rem] shadow-inner animate-in fade-in zoom-in-95 duration-1000 relative group/empty">
                            <div className="size-40 rounded-[3rem] bg-black border-4 border-white/5 flex items-center justify-center shadow-3xl group-hover/empty:scale-110 group-hover/empty:rotate-6 transition-all duration-1000">
                                <ShieldAlert className="size-20 text-slate-900 group-hover/empty:text-[#FF6600]/20 transition-all duration-1000" />
                            </div>
                            <div className="space-y-6 max-w-2xl px-12">
                                <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">SIGNAUX <span className="text-[#FF6600]">NÉANT</span></h3>
                                <p className="text-slate-700 text-lg font-black italic border-r-[16px] border-[#FF6600] pr-12 text-right uppercase tracking-widest">
                                    LE LEDGER D'ACTIVITÉ EST VIERGE. VOS ALERTES CRITIQUES APPARAÎTRONT ICI DÈS DÉTECTION PAR LES SATELLITES BCA.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {filteredNotifications.length > 5 && (
                    <div className="flex justify-center pt-24">
                        <button className="h-24 px-20 rounded-[2.5rem] border-4 border-white/5 bg-white/[0.02] text-white font-black uppercase tracking-[0.6em] text-[10px] hover:bg-white hover:text-black transition-all duration-700 shadow-3xl italic group/history relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/history:animate-[shimmer_2s_infinite]" />
                            <span className="relative z-10 flex items-center gap-6">
                                VOIR L'HISTORIQUE GLOBAL
                                <ChevronRight className="size-6 group-hover/history:translate-x-4 transition-transform duration-700" />
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
