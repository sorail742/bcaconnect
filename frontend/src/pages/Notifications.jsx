import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useNotificationsList } from '../hooks/useDomainData';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

const Notifications = () => {
    const { data: notifications = [], loading, error } = useNotificationsList();
    const [filterType, setFilterType] = useState('all');

    const notificationTypes = {
        order:   { label: 'Commandes', icon: Package,       color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
        alert:   { label: 'Alertes',   icon: AlertCircle,   color: 'text-red-500',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
        info:    { label: 'Infos',     icon: Info,           color: 'text-cyan-500',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    },
        success: { label: 'Succès',    icon: CheckCircle,   color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    };

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.type === filterType);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DashboardLayout title="CENTRE DE NOTIFICATIONS" noPadding>
            <div className="min-h-screen pb-16">

                {/* ── Header ─────────────────────────────────── */}
                <div className="bg-white/50 dark:bg-[#0F1219]/50 backdrop-blur-xl border-b border-border">
                    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <div className="relative">
                                    <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <Bell className="size-6 text-primary" />
                                    </div>
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black uppercase tracking-tighter">
                                        Notifications
                                    </h1>
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        {unreadCount} non lue{unreadCount !== 1 ? 's' : ''} • Sync temps réel
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* ── Filter Pills ─────────────────────── */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterType('all')}
                                className={cn(
                                    "h-9 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border",
                                    filterType === 'all'
                                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                        : "bg-muted border-border hover:border-primary/30 text-muted-foreground"
                                )}
                            >
                                Toutes ({notifications.length})
                            </button>
                            {Object.entries(notificationTypes).map(([key, type]) => {
                                const count = notifications.filter(n => n.type === key).length;
                                if (count === 0) return null;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilterType(key)}
                                        className={cn(
                                            "h-9 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border flex items-center gap-2",
                                            filterType === key
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                                                : "bg-muted border-border hover:border-primary/30 text-muted-foreground"
                                        )}
                                    >
                                        <type.icon className="size-3.5" />
                                        {type.label} ({count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Content ──────────────────────────────── */}
                <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
                    {loading ? (
                        <LoadingState message="Chargement des notifications..." />
                    ) : error ? (
                        <ErrorState error={error} />
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification, idx) => {
                            const type = notificationTypes[notification.type] || notificationTypes.info;
                            const TypeIcon = type.icon;

                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "group flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300",
                                        notification.read
                                            ? "bg-card border-border hover:border-primary/20"
                                            : "bg-primary/5 border-primary/30 shadow-sm"
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        "size-11 rounded-2xl flex items-center justify-center shrink-0 border",
                                        type.bg, type.border
                                    )}>
                                        <TypeIcon className={cn("size-5", type.color)} />
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-black text-sm text-foreground uppercase tracking-tight">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                                    {notification.message}
                                                </p>
                                            </div>
                                            {!notification.read && (
                                                <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-3 opacity-60">
                                            {new Date(notification.created_at || notification.createdAt).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    {/* Delete */}
                                    <button className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100">
                                        <Trash2 className="size-4" />
                                    </button>
                                </motion.div>
                            );
                        })
                    ) : (
                        <EmptyState message="Vous n'avez pas de notifications" icon={Bell} />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Notifications;
