import React from "react";
import {
  Wrench,
  ClipboardList,
  Navigation,
  History,
  FileText,
  Wallet,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

const TechnicianDashboard = () => {
  const stats = [
    {
      label: "Interventions Finies",
      value: "42",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      label: "Missions en cours",
      value: "2",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Revenus (Portefeuille)",
      value: "1.450.000 FG",
      icon: Wallet,
      color: "text-purple-600",
    },
    {
      label: "Note Moyenne",
      value: "4.8/5",
      icon: Wrench,
      color: "text-orange-600",
    },
  ];

  const activeMissions = [
    {
      id: 1,
      task: "Réparation Climatiseur",
      client: "Alpha Barry",
      location: "Kaloum, Conakry",
      urgency: "Haute",
    },
    {
      id: 2,
      task: "Maintenance Groupe Électrogène",
      client: "Binta Diallo",
      location: "Dixinn",
      urgency: "Normal",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-background text-foreground">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Espace Technicien</h1>
          <p className="text-muted-foreground text-lg">Gérez vos missions de maintenance et vos outils SAV.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all">
          <Navigation size={20} />
          Passer en "Disponible"
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-xl bg-muted ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ClipboardList className="text-primary" />
            Missions et Tâches à accomplir
          </h2>
          <div className="space-y-4">
            {activeMissions.map((mission) => (
              <div key={mission.id} className="bg-card border border-border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-all">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">{mission.task}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin size={14} />
                    {mission.location} • Client: {mission.client}
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${mission.urgency === "Haute" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}>{mission.urgency}</span>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80">Itinéraire</button>
                  <button className="flex-1 md:flex-none px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">Détails</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicianDashboard;