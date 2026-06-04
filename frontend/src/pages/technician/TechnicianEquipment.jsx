import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { Search, Info, Settings, ShieldCheck, History, Wrench, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import technicianService from '../../services/technicianService';

const TechnicianEquipment = () => {
    const [equipments, setEquipments] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEq, setSelectedEq] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipments = async () => {
            try {
                const data = await technicianService.getEquipments();
                setEquipments(data);
                if (data.length > 0) {
                    setSelectedEq(data[0]);
                }
            } catch (error) {
                toast.error("Erreur lors de la récupération des équipements.");
            } finally {
                setLoading(false);
            }
        };
        fetchEquipments();
    }, []);

    const filteredEquipments = equipments.filter(eq => 
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        eq.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownloadManual = () => {
        toast.success("Téléchargement du manuel technique en cours...");
    };

    return (
        <DashboardLayout title="Équipements & Diagnostics">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Base de Connaissances & Équipements</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Consultez l'historique et les manuels pour faciliter vos diagnostics.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un ID, nom ou client..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#1A1E24] text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Liste des équipements */}
                    <div className="lg:col-span-1 bg-white dark:bg-[#1A1E24] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Settings className="size-5 text-[#FF6600]" />
                                Appareils enregistrés
                            </h2>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <Loader2 className="size-8 text-[#FF6600] animate-spin" />
                                </div>
                            ) : filteredEquipments.length === 0 ? (
                                <div className="text-center p-6">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Aucun équipement trouvé.</p>
                                </div>
                            ) : (
                                filteredEquipments.map((eq) => (
                                    <button
                                        key={eq.id}
                                        onClick={() => setSelectedEq(eq)}
                                        className={`w-full text-left p-4 rounded-xl border transition-all ${
                                            selectedEq?.id === eq.id 
                                                ? 'bg-orange-50 dark:bg-orange-500/10 border-[#FF6600]' 
                                                : 'bg-white dark:bg-[#1A1E24] border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ID: {eq.product_id?.substring(0, 8)}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                                eq.status === 'Fonctionnel' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                eq.status === 'En Panne' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                            }`}>{eq.status}</span>
                                        </div>
                                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{eq.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">{eq.client}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Détails de l'équipement sélectionné */}
                    <div className="lg:col-span-2 space-y-6">
                        {selectedEq ? (
                            <motion.div 
                                key={selectedEq.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white dark:bg-[#1A1E24] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 md:p-8"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                                                ID: {selectedEq.product_id?.substring(0, 8) || selectedEq.id}
                                            </span>
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                                                Marque: {selectedEq.brand}
                                            </span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedEq.name}</h2>
                                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                                            Propriétaire: <strong className="text-slate-700 dark:text-slate-300">{selectedEq.client}</strong>
                                        </p>
                                    </div>
                                    <button 
                                        onClick={handleDownloadManual}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-xl font-bold text-sm text-slate-700 dark:text-white"
                                    >
                                        <Download className="size-4" /> Manuel
                                    </button>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-slate-100 dark:border-slate-800">
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                            <History className="size-4" /> Date d'intervention
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">{new Date(selectedEq.installDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                            <Wrench className="size-4" /> Dernière maintenance
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">{new Date(selectedEq.lastMaintenance).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                            <ShieldCheck className="size-4" /> Garantie
                                        </p>
                                        <p className={`font-bold ${selectedEq.warranty.includes('Aucune') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                            {selectedEq.warranty}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 mb-1 flex items-center gap-2">
                                            <Info className="size-4" /> État actuel
                                        </p>
                                        <p className="font-bold text-slate-900 dark:text-white">{selectedEq.status}</p>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="size-5 text-amber-500" /> Problèmes signalés
                                    </h3>
                                    {selectedEq.issues && selectedEq.issues[0] ? (
                                        <ul className="space-y-3">
                                            {selectedEq.issues.map((issue, i) => (
                                                <li key={i} className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20">
                                                    <div className="mt-0.5 size-2 bg-amber-500 rounded-full shrink-0" />
                                                    <span className="text-sm font-medium text-amber-900 dark:text-amber-200">{issue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                                                <CheckCircle2 className="size-4" /> Aucun problème signalé. L'équipement fonctionne correctement.
                                            </p>
                                        </div>
                                    )}
                                    
                                    {/* Action Diagnostic */}
                                    <div className="mt-8">
                                        <button className="w-full py-3 bg-[#FF6600] hover:bg-orange-600 transition-colors text-white rounded-xl font-bold text-sm shadow-lg">
                                            Démarrer un diagnostic interactif
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="bg-white dark:bg-[#1A1E24] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-8 text-center h-full flex flex-col items-center justify-center">
                                <Info className="size-12 text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sélectionnez un équipement</h3>
                                <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                    Cliquez sur un équipement dans la liste de gauche pour afficher ses détails, son historique et télécharger les manuels associés.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TechnicianEquipment;
