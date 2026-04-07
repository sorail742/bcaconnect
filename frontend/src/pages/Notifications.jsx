import React, { useState } from 'react';
import { useNotifications } from '../hooks/useDomainData';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/DataStates';
import { Bell, Trash2, CheckCircle, AlertCircle, Info, Package } from 'lucide-react';
import { motion } from 'framer-motion';

const Notifications = () => {
    const { data: notifications = [], loading, error } = useNotifications();
    const [filterType, setFilterType] = useState('all');

    const notificationTypes = {
        order: { label: 'Commandes', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        alert: { label: 'Alertes', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        info: { label: 'Infos', icon: Info, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        success: { label: 'Succès', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    };

    const filteredNotifications = filterType === 'all'
        ? notifications
        : notifications.filter(n => n.type === filterType);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-background pt-32 pb-16">
            <div className="container mx-auto px-4 md:px-8 max-w-2xl">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <Bell className="size-8 text-primary" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                            Notifications
                        </h1>
                    </div>
                    <p className="text-lg text-muted-foreground">
                        {unreadCount} notification{unreadCount !== 1 ? 's' : ''} non lue{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Filters */}
                <div className="mb-8 flex flex-wrap gap-2">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            filterType === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-foreground hover:bg-muted/80'
                        }`}
                    >
                        Toutes ({notifications.length})
                    </button>
                    {Object.entries(notificationTypes).map(([key, type]) => {
                        const count = notifications.filter(n => n.type === key).length;
                        return (
                            <button
                                key={key}
                                onClick={() => setFilterType(key)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                    filterType === key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-foreground hover:bg-muted/80'
                                }`}
                            >
                                <type.icon className="size-4" />
                                {type.label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <LoadingState message="Chargement des notifications..." />
                ) : error ? (
                    <ErrorState error={error} />
                ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                        {filteredNotifications.map((notification, idx) => {
                            const type = notificationTypes[notification.type] || notificationTypes.info;
                            const TypeIcon = type.icon;

                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className={`bg-card border-2 rounded-lg p-4 transition-all ${
                                        notification.read
                                            ? 'border-border'
                                            : 'border-primary/40 bg-primary/5'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${type.bg}`}>
                                            <TypeIcon className={`size-5 ${type.color}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="size-2 rounded-full bg-primary shrink-0 mt-2" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-3">
                                                {new Date(notification.created_at).toLocaleDateString('fr-FR', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <button className="text-muted-foreground hover:text-red-500 transition-colors shrink-0">
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState message="Vous n'avez pas de notifications" icon={Bell} />
                )}
            </div>
        </div>
    );
};

export default Notifications;
