import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardCard from "../../components/ui/DashboardCard";
import FilterDropdown from "../../components/ui/FilterDropdown";
import { Button } from "../../components/ui/Button";
import { DataStateWrapper } from "../../components/ui/DataStates";
import MissionCard from "../components/MissionCard";
import CompleteMissionModal from "../components/CompleteMissionModal";
import {
  Clock, Wrench, ClipboardCheck, Wallet, Zap, MapPin, User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useTechnicianStats,
  useAllTechnicianMissions,
  useAcceptTechnicianMission,
  useCompleteTechnicianMission,
} from "../hooks/useTechnicianData";

const formatGnf = (amount) => `${Number(amount || 0).toLocaleString('fr-FR')} GNF`;

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [completeTarget, setCompleteTarget] = useState(null);

  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useTechnicianStats();
  const { data: missions, loading: missionsLoading, error: missionsError, refetch: refetchMissions } = useAllTechnicianMissions();
  const acceptMutation = useAcceptTechnicianMission();
  const completeMutation = useCompleteTechnicianMission();

  const loading = statsLoading || missionsLoading;
  const error = statsError || missionsError;
  const refetch = () => { refetchStats(); refetchMissions(); };

  const filteredMissions = missions.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return m.status === 'Nouveau' || m.status === 'En cours';
    if (activeTab === 'completed') return m.status === 'Complété';
    return true;
  });

  const handleComplete = (data) => {
    if (!completeTarget) return;
    completeMutation.mutate(
      { id: completeTarget.id, data },
      { onSuccess: () => setCompleteTarget(null) },
    );
  };

  return (
    <DashboardLayout title="Espace Technicien">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Tableau de bord Technicien
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos missions SAV, interventions terrain et honoraires.
            </p>
          </div>
          <Button onClick={() => navigate('/technician/wallet')} className="shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5">
            <Wallet className="size-4" />
            Mon portefeuille
          </Button>
        </div>

        {/* Profil rapide */}
        {stats && (
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <User className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Spécialités</p>
                <p className="font-bold text-foreground mt-1">{stats.specialites || 'Non renseignées'}</p>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Zone d'intervention</p>
                <p className="font-bold text-foreground mt-1">{stats.zone_intervention || 'Non renseignée'}</p>
              </div>
            </div>
          </div>
        )}

        {/* KPI */}
        <DataStateWrapper isLoading={loading} error={error} onRetry={refetch} loadingVariant="grid">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Missions disponibles"
              value={String(stats?.available ?? 0)}
              icon={Zap}
              trend="neutral"
              trendValue="Nouvelles"
              description="En attente d'acceptation"
            />
            <DashboardCard
              title="En cours"
              value={String(stats?.active ?? 0)}
              icon={Wrench}
              trend="neutral"
              trendValue="Actif"
              description="Interventions terrain"
            />
            <DashboardCard
              title="Complétées"
              value={String(stats?.completed ?? 0)}
              icon={ClipboardCheck}
              trend="up"
              trendValue={`${formatGnf(stats?.totalEarnings)}`}
              description="Honoraires cumulés"
            />
            <DashboardCard
              title="Portefeuille"
              value={formatGnf(stats?.walletBalance)}
              icon={Wallet}
              trend="up"
              trendValue="Solde actuel"
              description="Disponible immédiatement"
            />
          </div>
        </DataStateWrapper>

        {/* Missions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Missions</h2>
              <p className="text-sm text-muted-foreground">Acceptez et suivez vos interventions.</p>
            </div>
            <FilterDropdown
              value={activeTab}
              onChange={setActiveTab}
              defaultValue="all"
              options={[
                { value: 'all', label: 'Toutes' },
                { value: 'pending', label: 'Actives' },
                { value: 'completed', label: 'Terminées' },
              ]}
            />
          </div>

          <DataStateWrapper isLoading={missionsLoading} error={missionsError} onRetry={refetchMissions}>
            {filteredMissions.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center">
                <Clock className="size-10 mx-auto text-muted-foreground mb-3" />
                <p className="font-bold text-foreground">Aucune mission</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Les demandes SAV des clients apparaîtront ici.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredMissions.slice(0, 6).map((mission, index) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    index={index}
                    compact
                    actionLoading={acceptMutation.isPending ? acceptMutation.variables : completeMutation.isPending ? completeMutation.variables?.id : null}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onComplete={(m) => setCompleteTarget(m)}
                    onViewEquipment={() => navigate('/technician/equipment')}
                  />
                ))}
              </div>
            )}
          </DataStateWrapper>

          {filteredMissions.length > 0 && (
            <button
              onClick={() => navigate('/technician/missions')}
              className="w-full text-center text-sm font-bold text-primary hover:text-primary/80 py-3 transition-colors"
            >
              Voir toutes les missions →
            </button>
          )}
        </div>
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

export default TechnicianDashboard;
