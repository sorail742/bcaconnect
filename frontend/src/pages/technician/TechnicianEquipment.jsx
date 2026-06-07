import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DataStateWrapper } from '../../components/ui/DataStates';
import { motion } from 'framer-motion';
import {
    Search, Info, Settings, ShieldCheck, History, Wrench, Download,
    AlertTriangle, CheckCircle2, Banknote,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTechnicianEquipments } from '../../hooks/useDomainData';

const formatGnf = (n) => `${Number(n || 0).toLocaleString('fr-FR')} GNF`;

const TechnicianEquipment = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEq, setSelectedEq] = useState(null);
    const { data: equipments, loading, error, refetch } = useTechnicianEquipments();

    const filteredEquipments = equipments.filter((eq) =>
        eq.name.toLowerCase().includes(searchQuery.toLowerCase())
        || String(eq.id).toLowerCase().includes(searchQuery.toLowerCase())
        || eq.client.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const activeSelection = selectedEq && filteredEquipments.find((e) => e.id === selectedEq.id)
        ? selectedEq
        : filteredEquipments[0] || null;

    const handleDownloadManual = () => {
        toast.success('Manuel technique — fonctionnalité à venir.');
    };

    return (
        <DashboardLayout title="Équipements & Diagnostics">
            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                            Base de Connaissances & Équipements
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Historique des appareils que vous avez pris en charge.
                        </p>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Rechercher un ID, nom ou client..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-card text-foreground border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>
                </div>

                <DataStateWrapper isLoading={loading} error={error} onRetry={refetch}>
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b border-border bg-muted/30">
                                <h2 className="font-bold text-foreground flex items-center gap-2">
                                    <Settings className="size-5 text-primary" />
                                    Appareils ({filteredEquipments.length})
                                </h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {filteredEquipments.length === 0 ? (
                                    <div className="text-center p-6 text-muted-foreground text-sm">
                                        Aucun équipement — complétez une mission pour alimenter l'historique.
                                    </div>
                                ) : (
                                    filteredEquipments.map((eq) => (
                                        <button
                                            key={eq.id}
                                            type="button"
                                            onClick={() => setSelectedEq(eq)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all ${
                                                activeSelection?.id === eq.id
                                                    ? 'bg-primary/5 border-primary'
                                                    : 'border-transparent hover:border-border'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-muted-foreground">
                                                    ID: {eq.product_id?.substring(0, 8)}
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                    eq.status === 'Fonctionnel'
                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'
                                                        : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                                                }`}>
                                                    {eq.status}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-foreground truncate">{eq.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate mt-1">{eq.client}</p>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            {activeSelection ? (
                                <motion.div
                                    key={activeSelection.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-card rounded-2xl border border-border p-6 md:p-8"
                                >
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 pb-6 border-b border-border">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold">
                                                    Marque: {activeSelection.brand}
                                                </span>
                                                {activeSelection.cout_estime > 0 && (
                                                    <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1">
                                                        <Banknote className="size-3" />
                                                        {formatGnf(activeSelection.cout_estime)}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="text-2xl font-bold text-foreground">{activeSelection.name}</h2>
                                            <p className="text-muted-foreground mt-1">
                                                Client : <strong className="text-foreground">{activeSelection.client}</strong>
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleDownloadManual}
                                            className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl font-bold text-sm"
                                        >
                                            <Download className="size-4" /> Manuel
                                        </button>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-6 py-6 border-b border-border">
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                                <History className="size-4" /> Première intervention
                                            </p>
                                            <p className="font-bold">{new Date(activeSelection.installDate).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                                <Wrench className="size-4" /> Dernière maintenance
                                            </p>
                                            <p className="font-bold">{new Date(activeSelection.lastMaintenance).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                                <ShieldCheck className="size-4" /> Garantie
                                            </p>
                                            <p className={`font-bold ${activeSelection.warranty.includes('Aucune') ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                {activeSelection.warranty}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                                                <Info className="size-4" /> État
                                            </p>
                                            <p className="font-bold">{activeSelection.status}</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                                <AlertTriangle className="size-5 text-amber-500" />
                                                Problème signalé
                                            </h3>
                                            {activeSelection.issues?.[0] ? (
                                                <p className="text-sm bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                                    {activeSelection.issues[0]}
                                                </p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Aucun détail.</p>
                                            )}
                                        </div>

                                        {activeSelection.rapport && (
                                            <div>
                                                <h3 className="text-lg font-bold flex items-center gap-2 mb-3">
                                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                                    Rapport technique
                                                </h3>
                                                <p className="text-sm bg-muted/50 p-4 rounded-xl border border-border">
                                                    {activeSelection.rapport}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-card rounded-2xl border border-border p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                                    <Info className="size-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-bold">Sélectionnez un équipement</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm">
                                        L'historique se remplit automatiquement après vos interventions.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </DataStateWrapper>
            </div>
        </DashboardLayout>
    );
};

export default TechnicianEquipment;
