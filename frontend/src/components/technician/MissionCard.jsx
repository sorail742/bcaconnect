import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Phone, Wrench, CheckCircle2, AlertCircle, Loader2, FileText, ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const statusConfig = {
    Nouveau: {
        icon: AlertCircle,
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        iconBg: 'bg-orange-100 text-primary dark:bg-orange-900/30',
    },
    'En cours': {
        icon: Wrench,
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        iconBg: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    Complété: {
        icon: CheckCircle2,
        badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
};

const MissionCard = ({
    mission,
    index = 0,
    onAccept,
    onComplete,
    onViewEquipment,
    actionLoading,
    compact = false,
}) => {
    const config = statusConfig[mission.status] || statusConfig.Nouveau;
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.05, 0.3) }}
            className={cn(
                'bg-card border border-border rounded-2xl overflow-hidden',
                compact ? 'p-4' : 'p-6',
            )}
        >
            <div className={cn('flex gap-4', compact ? 'flex-col' : 'flex-col md:flex-row md:justify-between')}>
                <div className="flex gap-4 flex-1">
                    <div className={cn('p-3 rounded-xl h-fit', config.iconBg)}>
                        <StatusIcon className="size-5" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-foreground">{mission.title}</h3>
                            <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase', config.badge)}>
                                {mission.status}
                            </span>
                        </div>
                        {!compact && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{mission.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Phone className="size-3.5" /> {mission.client}</span>
                            <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {mission.location}</span>
                            <span>{mission.date}</span>
                        </div>
                    </div>
                </div>

                <div className={cn('flex gap-2', compact ? 'w-full' : 'md:flex-col md:min-w-[180px] md:justify-center')}>
                    {mission.status === 'Nouveau' && onAccept && (
                        <button
                            onClick={() => onAccept(mission.id)}
                            disabled={actionLoading === mission.id}
                            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {actionLoading === mission.id ? <Loader2 className="size-4 animate-spin" /> : 'Accepter'}
                        </button>
                    )}
                    {mission.status === 'En cours' && onComplete && (
                        <button
                            onClick={() => onComplete(mission)}
                            disabled={actionLoading === mission.id}
                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {actionLoading === mission.id ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> Terminer</>}
                        </button>
                    )}
                    {mission.status === 'Complété' && (
                        <button
                            onClick={() => onViewEquipment?.()}
                            className="flex-1 py-2.5 bg-muted text-foreground rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                        >
                            <FileText className="size-4" /> Historique
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MissionCard;
