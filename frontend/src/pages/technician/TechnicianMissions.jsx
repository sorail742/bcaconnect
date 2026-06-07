import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MissionCard from '../../components/technician/MissionCard';
import CompleteMissionModal from '../../components/technician/CompleteMissionModal';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useAllTechnicianMissions,
    useAcceptTechnicianMission,
    useCompleteTechnicianMission,
} from '../../hooks/useDomainData';

const TechnicianMissions = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [completeTarget, setCompleteTarget] = useState(null);

    const { data: missions, loading, error, refetch } = useAllTechnicianMissions();
    const acceptMutation = useAcceptTechnicianMission();
    const completeMutation = useCompleteTechnicianMission();

    const filteredMissions = missions.filter((m) => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return m.status === 'Nouveau';
        if (activeTab === 'active') return m.status === 'En cours';
        if (activeTab === 'completed') return m.status === 'Complété';
        return true;
    });

    const actionLoading = acceptMutation.isPending
        ? acceptMutation.variables
        : completeMutation.isPending
            ? completeMutation.variables?.id
            : null;

    const handleComplete = (data) => {
        if (!completeTarget) return;
        completeMutation.mutate(
            { id: completeTarget.id, data },
            { onSuccess: () => setCompleteTarget(null) },
        );
    };

    return (
        <DashboardLayout title="Missions & Interventions">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            Gestion des Missions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Acceptez vos missions et finalisez vos interventions sur le terrain.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 p-1 bg-muted rounded-lg">
                        {['all', 'pending', 'active', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                    activeTab === tab
                                        ? 'bg-background text-primary shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {tab === 'all' ? 'Toutes' : tab === 'pending' ? 'Nouvelles' : tab === 'active' ? 'En cours' : 'Terminées'}
                            </button>
                        ))}
                    </div>
                </div>

                <DataStateWrapper isLoading={loading} error={error} onRetry={refetch}>
                    {filteredMissions.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-2xl border border-border">
                            <Clock className="size-12 mx-auto text-muted-foreground mb-3" />
                            <h3 className="text-lg font-bold text-foreground">Aucune mission trouvée</h3>
                            <p className="text-muted-foreground mt-1">
                                Vous n'avez pas de missions dans cette catégorie pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-5">
                            {filteredMissions.map((mission, idx) => (
                                <MissionCard
                                    key={mission.id}
                                    mission={mission}
                                    index={idx}
                                    actionLoading={actionLoading}
                                    onAccept={(id) => acceptMutation.mutate(id)}
                                    onComplete={(m) => setCompleteTarget(m)}
                                    onViewEquipment={() => navigate('/technician/equipment')}
                                />
                            ))}
                        </div>
                    )}
                </DataStateWrapper>
            </div>

            <CompleteMissionModal
                isOpen={!!completeTarget}
                onClose={() => setCompleteTarget(null)}
                mission={completeTarget}
                onSubmit={handleComplete}
                isLoading={completeMutation.isPending}
            />
        </DashboardLayout>
    );
};

export default TechnicianMissions;
