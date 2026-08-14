import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import MissionCard from '../components/MissionCard';
import CompleteMissionModal from '../components/CompleteMissionModal';
import { DataStateWrapper } from '../../components/ui/DataStates';
import FilterDropdown from '../../components/ui/FilterDropdown';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    useAllTechnicianMissions,
    useAcceptTechnicianMission,
    useCompleteTechnicianMission,
} from '../hooks/useTechnicianData';

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
                    <FilterDropdown
                        value={activeTab}
                        onChange={setActiveTab}
                        defaultValue="all"
                        options={[
                            { value: 'all', label: 'Toutes' },
                            { value: 'pending', label: 'Nouvelles' },
                            { value: 'active', label: 'En cours' },
                            { value: 'completed', label: 'Terminées' },
                        ]}
                    />
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
