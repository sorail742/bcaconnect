import React, { useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useNotificationsList } from '../hooks/useNotificationData';
import notificationService from '../services/notificationService';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/DataStates';
import {
    Bell, Trash2, Package, Wallet, MessageSquare,
    Info, Gavel, Truck, Shield, CheckCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';
import ConfirmDeleteModal from '../../components/ui/ConfirmDeleteModal';
import FilterDropdown from '../../components/ui/FilterDropdown';

const notificationTypes = {
    order:    { label: 'Commandes',  icon: Package,       color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
    payment:  { label: 'Paiements',  icon: Wallet,        color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    message:  { label: 'Messages',   icon: MessageSquare, color: 'text-cyan-500',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20'    },
    system:   { label: 'Système',    icon: Info,          color: 'text-muted-foreground', bg: 'bg-muted',          border: 'border-border'   },
    dispute:  { label: 'Litiges',    icon: Gavel,         color: 'text-rose-500',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20'    },
    delivery: { label: 'Livraison',  icon: Truck,         color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/20'     },
    sav:      { label: 'SAV',        icon: Shield,        color: 'text-violet-500',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20'  },
};

const Notifications = () => {
    const { data: notifications = [], loading, error, mutate: refetch } = useNotificationsList();
    const [filterType, setFilterType] = useState('all');
    const [actionId, setActionId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const unreadCount = notifications.filter(n => !n.est_lu).length;

    const handleMarkAsRead = useCallback(async (id) => {
        const notif = notifications.find(n => n.id === id);
        if (!notif || notif.est_lu) return;
        setActionId(id);
        try {
            await notificationService.markAsRead(id);
            await refetch();
        } catch {
            toast.error('Impossible de marquer la notification comme lue.');
        } finally {
            setActionId(null);
        }
    }, [notifications, refetch]);

    const handleMarkAllAsRead = useCallback(async () => {
        if (unreadCount === 0) return;
        setActionId('all');
        try {
            await notificationService.markAllAsRead();
            await refetch();
            toast.success('Toutes les notifications ont été marquées comme lues.');
        } catch {
            toast.error('Impossible de marquer toutes les notifications.');
        } finally {
            setActionId(null);
        }
    }, [unreadCount, refetch]);

    const handleDelete = useCallback((notification, e) => {
        e.stopPropagation();
        setDeleteTarget(notification);
    }, []);

    const confirmDelete = useCallback(async (confirmationText) => {
        const id = deleteTarget?.id;
        if (!id) return;
        setActionId(id);
        try {
            await notificationService.delete(id, confirmationText);
            await refetch();
            toast.success('Notification supprimée.');
            setDeleteTarget(null);
        } catch {
            toast.error('Impossible de supprimer la notification.');
        } finally {
            setActionId(null);
        }
    }, [refetch, deleteTarget]);

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.type === filterType);

    const activeTypes = [...new Set(notifications.map(n => n.type).filter(Boolean))];

    return (
        <DashboardLayout title="CENTRE DE NOTIFICATIONS" noPadding>
            <div className="min-h-screen pb-16">

                <div className="bg-white/50 dark:bg-[#0F1219]/50 backdrop-blur-xl border-b border-border">
                    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">

                        <div className="flex items-center justify-between gap-4">
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
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={actionId === 'all'}
                                    className="h-9 px-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-border bg-muted hover:border-primary/30 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                                >
                                    <CheckCheck className="size-3.5" />
                                    Tout lire
                                </button>
                            )}
                        </div>

                        <FilterDropdown
                            icon={Bell}
                            value={filterType}
                            onChange={setFilterType}
                            defaultValue="all"
                            options={[
                                { value: 'all', label: `Toutes (${notifications.length})` },
                                ...activeTypes.map((key) => {
                                    const type = notificationTypes[key] || notificationTypes.system;
                                    const count = notifications.filter(n => n.type === key).length;
                                    return { value: key, label: `${type.label} (${count})` };
                                }),
                            ]}
                        />
                    </div>
                </div>

                <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">
                    {loading ? (
                        <LoadingState message="Chargement des notifications..." />
                    ) : error ? (
                        <ErrorState error={error} />
                    ) : filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification, idx) => {
                            const type = notificationTypes[notification.type] || notificationTypes.system;
                            const TypeIcon = type.icon;
                            const isUnread = !notification.est_lu;

                            return (
                                <motion.div
                                    key={notification.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleMarkAsRead(notification.id)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={cn(
                                        "group flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300 cursor-pointer",
                                        isUnread
                                            ? "bg-primary/5 border-primary/30 shadow-sm"
                                            : "bg-card border-border hover:border-primary/20",
                                        actionId === notification.id && "opacity-60 pointer-events-none"
                                    )}
                                >
                                    <div className={cn(
                                        "size-11 rounded-2xl flex items-center justify-center shrink-0 border",
                                        type.bg, type.border
                                    )}>
                                        <TypeIcon className={cn("size-5", type.color)} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-black text-sm text-foreground uppercase tracking-tight">
                                                    {notification.titre || 'Notification'}
                                                </h3>
                                                <p
                                                    className="text-xs text-muted-foreground mt-1 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: notification.message }}
                                                />
                                            </div>
                                            {isUnread && (
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

                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(notification, e)}
                                        disabled={actionId === notification.id}
                                        className="text-muted-foreground/40 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover:opacity-100 disabled:opacity-30"
                                        title="Supprimer"
                                    >
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

            <ConfirmDeleteModal
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                itemName={deleteTarget?.titre || 'Notification'}
                itemLabel="cette notification"
                onConfirm={confirmDelete}
            />
        </DashboardLayout>
    );
};

export default Notifications;
