import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import DashboardCard from "../../components/ui/DashboardCard";
import { DataStateWrapper } from "../../components/ui/DataStates";
import { Clock, Wrench, ClipboardCheck, Wallet, CheckCircle2, AlertCircle, ChevronRight, MapPin, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMyTechnicianMissions } from "../../hooks/useDomainData";

const TechnicianDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { data: missions, loading, error, refetch } = useMyTechnicianMissions();
  const navigate = useNavigate();

  const stats = {
    total: missions.length,
    active: missions.filter(m => m.status === 'En cours').length,
    completed: missions.filter(m => m.status === 'Complété').length,
    revenue: "1 450 KGN" // Temporary static revenue, requires wallet integration
  };

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return m.status === 'Nouveau' || m.status === 'En cours';
    if (activeTab === 'completed') return m.status === 'Complété';
    return true;
  });

  return (
    <DashboardLayout title="Espace Technicien">
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Tableau de bord Technicien</h1>
            <p className="text-muted-foreground mt-1">Gérez vos missions, facturations et votre portefeuille numérique.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
            <Receipt className="size-4" />
            Nouvelle Facture
          </button>
        </div>

        {/* KPI Cards */}
        <DataStateWrapper isLoading={loading} error={error} onRetry={refetch} loadingVariant="grid">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Missions Totales"
                value={stats.total.toString()}
                icon={Clock}
                trend="neutral"
                trendValue="Global"
                description="Toutes les missions acceptées"
              />
              <DashboardCard
                title="En cours"
                value={stats.active.toString()}
                icon={Wrench}
                trend="neutral"
                trendValue="Actif"
                description="Interventions en cours"
              />
              <DashboardCard
                title="Missions complétées"
                value={stats.completed.toString()}
                icon={ClipboardCheck}
                trend="up"
                trendValue="Félicitations"
                description="Interventions terminées"
              />
              <DashboardCard
                title="Portefeuille"
                value={stats.revenue}
                icon={Wallet}
                trend="up"
                trendValue="+12%"
                description="Solde disponible"
              />
            </div>
        </DataStateWrapper>

        {/* Missions Section */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Missions Récentes</h2>
              <p className="text-sm text-muted-foreground">Historique et suivi de vos interventions techniques.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center p-1 bg-muted rounded-lg">
              {['all', 'pending', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab 
                      ? 'bg-background text-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'all' ? 'Toutes' : tab === 'pending' ? 'En attente' : 'Terminées'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {!loading && filteredMissions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                    Aucune mission trouvée pour cette catégorie.
                </div>
            ) : filteredMissions.map((mission, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.1, 0.5) }}
                key={mission.id} 
                className="p-4 sm:p-6 hover:bg-muted/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer"
                onClick={() => navigate('/technician/missions')}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full mt-1 ${
                    mission.status === 'Complété' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    mission.status === 'En cours' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-orange-100 text-primary dark:bg-orange-900/30 dark:text-primary'
                  }`}>
                    {mission.status === 'Complété' ? <CheckCircle2 className="size-5" /> :
                     mission.status === 'En cours' ? <Wrench className="size-5" /> :
                     <AlertCircle className="size-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-base sm:text-lg">{mission.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="size-4" /> {mission.client} - {mission.location}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="font-medium text-foreground">{mission.date}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    mission.status === 'Complété' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    mission.status === 'En cours' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {mission.status}
                  </span>
                  <button className="p-2 text-muted-foreground hover:text-foreground bg-muted hover:bg-border rounded-full transition-colors">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredMissions.length > 0 && (
              <div className="p-4 border-t border-border bg-muted/30">
                <button 
                  onClick={() => navigate('/technician/missions')}
                  className="w-full text-center text-sm font-bold text-primary hover:text-primary/80 py-2 transition-colors"
                >
                  Voir toutes les missions
                </button>
              </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TechnicianDashboard;
