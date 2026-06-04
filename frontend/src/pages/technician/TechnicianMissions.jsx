import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { MapPin, Clock, Wrench, CheckCircle2, ChevronRight, AlertCircle, Phone, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import technicianService from '../../services/technicianService';

const TechnicianMissions = () => {
    const [missions, setMissions] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // all, pending, active, completed
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchMissions = useCallback(async () => {
        setLoading(true);
        try {
            const available = await technicianService.getAvailableMissions();
            const myMissions = await technicianService.getMyMissions();
            
            // Format available missions
            const formattedAvailable = available.map(m => ({
                id: m.id,
                title: `Intervention sur ${m.Product?.nom_produit || 'Équipement'}`,
                client: m.demandeur?.nom_complet || 'Inconnu',
                phone: m.demandeur?.telephone || 'Non spécifié',
                location: m.demandeur?.adresse || 'Non spécifiée',
                status: 'Nouveau',
                date: new Date(m.createdAt).toLocaleDateString(),
                type: 'Maintenance',
                description: m.description_probleme || 'Aucune description fournie.'
            }));

            // Format my missions
            const formattedMyMissions = myMissions.map(m => ({
                id: m.id,
                title: `Intervention sur ${m.Product?.nom_produit || 'Équipement'}`,
                client: m.demandeur?.nom_complet || 'Inconnu',
                phone: m.demandeur?.telephone || 'Non spécifié',
                location: m.demandeur?.adresse || 'Non spécifiée',
                status: m.status === 'en_cours' ? 'En cours' : m.status === 'resolu' ? 'Complété' : m.status,
                date: new Date(m.createdAt).toLocaleDateString(),
                type: 'Maintenance',
                description: m.description_probleme || 'Aucune description fournie.'
            }));

            setMissions([...formattedAvailable, ...formattedMyMissions]);
        } catch (error) {
            toast.error("Erreur lors de la récupération des missions.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMissions();
    }, [fetchMissions]);

    const handleAcceptMission = async (id) => {
        setActionLoading(id);
        try {
            await technicianService.acceptMission(id);
            toast.success("Mission acceptée avec succès. Vous pouvez maintenant suivre l'itinéraire.");
            fetchMissions();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de l'acceptation.");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCompleteMission = async (id) => {
        setActionLoading(id);
        try {
            await technicianService.completeMission(id, { rapport_technique: "Réparation effectuée selon les normes." });
            toast.success("Mission marquée comme complétée. La facture électronique est prête à être générée.");
            fetchMissions();
        } catch (error) {
            toast.error(error.response?.data?.error || "Erreur lors de la finalisation.");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredMissions = missions.filter(m => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return m.status === 'Nouveau';
        if (activeTab === 'active') return m.status === 'En cours';
        if (activeTab === 'completed') return m.status === 'Complété';
        return true;
    });

    return (
        <DashboardLayout title="Missions & Interventions">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Gestion des Missions</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Acceptez vos missions et gérez vos interventions sur le terrain.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        {['all', 'pending', 'active', 'completed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${
                                    activeTab === tab 
                                        ? 'bg-white dark:bg-slate-900 text-[#FF6600] shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {tab === 'all' ? 'Toutes' : tab === 'pending' ? 'Nouvelles' : tab === 'active' ? 'En cours' : 'Terminées'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 className="size-10 text-[#FF6600] animate-spin" />
                        </div>
                    ) : filteredMissions.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-[#1A1E24] rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Clock className="size-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aucune mission trouvée</h3>
                            <p className="text-slate-500 dark:text-slate-400">Vous n'avez pas de missions dans cette catégorie pour le moment.</p>
                        </div>
                    ) : (
                        filteredMissions.map((mission, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx * 0.1, 0.5) }}
                                key={mission.id}
                                className="bg-white dark:bg-[#1A1E24] p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 justify-between"
                            >
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-xl ${
                                            mission.status === 'Complété' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                            mission.status === 'En cours' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                            'bg-orange-100 dark:bg-orange-900/30 text-[#FF6600]'
                                        }`}>
                                            {mission.status === 'Complété' ? <CheckCircle2 className="size-6" /> :
                                             mission.status === 'En cours' ? <Wrench className="size-6" /> :
                                             <AlertCircle className="size-6" />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{mission.title}</h2>
                                            <div className="flex items-center gap-2 mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                                                <span className="text-[#FF6600]">{mission.type}</span> • {mission.date}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{mission.description}</p>
                                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <Phone className="size-4 text-slate-400" /> {mission.client} ({mission.phone})
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <MapPin className="size-4 text-slate-400" /> {mission.location}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 justify-center">
                                    {mission.status === 'Nouveau' && (
                                        <button 
                                            onClick={() => handleAcceptMission(mission.id)}
                                            disabled={actionLoading === mission.id}
                                            className="w-full py-2.5 bg-[#FF6600] text-white rounded-xl font-bold text-sm shadow-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex justify-center items-center gap-2"
                                        >
                                            {actionLoading === mission.id ? <Loader2 className="size-4 animate-spin" /> : "Accepter la mission"}
                                        </button>
                                    )}
                                    {mission.status === 'En cours' && (
                                        <button 
                                            onClick={() => handleCompleteMission(mission.id)}
                                            disabled={actionLoading === mission.id}
                                            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {actionLoading === mission.id ? <Loader2 className="size-4 animate-spin" /> : <><CheckCircle2 className="size-4" /> Terminer</>}
                                        </button>
                                    )}
                                    {mission.status === 'Complété' && (
                                        <button 
                                            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <FileText className="size-4" /> Générer Facture
                                        </button>
                                    )}
                                    <button className="w-full py-2.5 bg-white dark:bg-[#1A1E24] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                        Voir l'historique
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TechnicianMissions;
