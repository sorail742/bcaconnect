import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { 
    AlertTriangle, ChevronLeft, ShieldCheck, Clock, ChevronDown, 
    Activity, Sparkles, Scale, ArrowLeft, Package, Truck, 
    CheckCircle2, AlertCircle, FileText, Camera, Shield, MessageSquare,
    Info, ExternalLink, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import useApiMutation from '../../hooks/useApiMutation';
import { useOrderById } from '../../order/hooks/useOrderData';

const Stepper = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Ouverture', icon: FileText },
        { id: 2, label: 'Médiation IA', icon: Sparkles },
        { id: 3, label: 'Résolution', icon: CheckCircle2 }
    ];

    return (
        <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-10 px-4">
            {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center gap-2 relative z-10">
                        <div className={cn(
                            "size-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm",
                            currentStep >= step.id 
                                ? "bg-orange-500 border-orange-500 text-white" 
                                : "bg-card border-border text-muted-foreground"
                        )}>
                            <step.icon className="size-5" />
                        </div>
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            currentStep >= step.id ? "text-orange-600" : "text-muted-foreground"
                        )}>
                            {step.label}
                        </span>
                    </div>
                    {idx < steps.length - 1 && (
                        <div className="flex-1 h-0.5 mx-4 bg-muted relative -top-3">
                            <motion.div 
                                className="absolute inset-0 bg-orange-500 origin-left"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: currentStep > step.id ? 1 : 0 }}
                                transition={{ duration: 0.8, ease: "easeInOut" }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const DisputeReport = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { data: order, loading: orderLoading } = useOrderById(orderId);
    const [disputeData, setDisputeData] = useState({ type: 'qualite', description: '' });
    const [mediationResult, setMediationResult] = useState(null);
    const [proofUrls, setProofUrls] = useState([]);
    const [uploadingProof, setUploadingProof] = useState(false);

    const handleProofUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (proofUrls.length >= 4) {
            toast.error('Maximum 4 preuves par litige.');
            return;
        }
        setUploadingProof(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setProofUrls(prev => [...prev, res.data.url]);
            toast.success('Preuve ajoutée');
        } catch {
            toast.error('Échec du téléversement');
        } finally {
            setUploadingProof(false);
            e.target.value = '';
        }
    };

    const { mutate: createDispute, isPending: loading } = useApiMutation(
        (data) => api.post('/disputes', { commande_id: orderId, ...data }),
        {
            onSuccess: (res) => {
                setMediationResult(res);
            },
            successMessage: "Litige ouvert avec succès.",
            errorMessage: "Échec de l'ouverture du dossier."
        }
    );

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!disputeData.description.trim()) { 
            toast.error('Veuillez fournir une description détaillée du problème.'); 
            return; 
        }

        // Identifier le défenseur (le vendeur du premier article de la commande)
        const vendorId = order?.details?.[0]?.fournisseur_id;
        
        if (!vendorId) {
            toast.error("Impossible d'identifier le vendeur pour ce litige.");
            return;
        }

        createDispute({ ...disputeData, defenseur_id: vendorId, preuves: proofUrls.length ? proofUrls : undefined });
    };

    const incidentTypes = [
        { id: 'qualite', label: 'Produit non conforme', icon: Package, desc: 'Endommagé, mauvaise taille ou couleur' },
        { id: 'livraison', label: 'Problème de livraison', icon: Truck, desc: 'Colis perdu ou retard excessif' },
        { id: 'paiement', label: 'Anomalie facturation', icon: Shield, desc: 'Montant incorrect ou double débit' },
        { id: 'autre', label: 'Autre incident', icon: Info, desc: 'Problème non listé ci-dessus' }
    ];

    return (
        <DashboardLayout title="Centre de Litiges BCA" noPadding>
            <div className="min-h-screen bg-background pb-20">
                
                {/* Header Section */}
                <div className="bg-card border-b border-border pt-8 pb-12 shadow-sm">
                    <div className="max-w-4xl mx-auto px-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-orange-500 transition-colors mb-6 group"
                        >
                            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" /> Retour à la commande
                        </button>
                        
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="size-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                        <Scale className="size-6 text-white" />
                                    </div>
                                    <h1 className="text-3xl font-black text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Centre de <span className="text-orange-500">Médiation</span>
                                    </h1>
                                </div>
                                <p className="text-sm text-muted-foreground font-medium max-w-md">
                                    Résolvez vos incidents via notre arbitrage intelligent sécurisé.
                                </p>
                            </div>
                            
                            {order && (
                                <div className="p-4 bg-muted rounded-2xl border border-border flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-card border border-border flex items-center justify-center shrink-0">
                                        <Package className="size-5 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Commande associée</p>
                                        <p className="text-sm font-bold text-foreground">#{order.id?.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-orange-600 font-bold">{parseFloat(order.total_ttc).toLocaleString()} GNF</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 -mt-6">
                    
                    <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50">
                        
                        <Stepper currentStep={mediationResult ? 3 : 1} />

                        {!mediationResult ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                {/* Step 1: Type Selection */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">1</div>
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Nature de l'incident</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {incidentTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setDisputeData({ ...disputeData, type: type.id })}
                                                className={cn(
                                                    "flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all group",
                                                    disputeData.type === type.id 
                                                        ? "bg-orange-50 border-orange-500 shadow-md shadow-orange-500/10" 
                                                        : "bg-card border-border hover:border-border"
                                                )}
                                            >
                                                <div className={cn(
                                                    "size-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                                    disputeData.type === type.id ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground group-hover:bg-muted"
                                                )}>
                                                    <type.icon className="size-6" />
                                                </div>
                                                <div>
                                                    <p className={cn(
                                                        "text-sm font-black mb-1",
                                                        disputeData.type === type.id ? "text-orange-600" : "text-foreground"
                                                    )}>{type.label}</p>
                                                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{type.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </section>

                                {/* Step 2: Description */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs">2</div>
                                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Détails & Preuves</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="relative">
                                            <textarea
                                                className="w-full h-48 p-6 bg-muted border-2 border-border rounded-3xl text-sm font-medium outline-none focus:border-orange-500 focus:bg-card transition-all text-foreground resize-none placeholder:text-muted-foreground"
                                                placeholder="Expliquez en détail ce qui ne va pas... Notre IA de médiation analysera vos propos pour proposer une solution équitable."
                                                value={disputeData.description}
                                                onChange={e => setDisputeData({ ...disputeData, description: e.target.value })}
                                            />
                                            <div className="absolute bottom-6 right-6 flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                <Sparkles className="size-3" /> Analyse IA Active
                                            </div>
                                        </div>

                                        {/* Upload preuves */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <label className={cn(
                                                "aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all bg-muted/50 cursor-pointer",
                                                uploadingProof ? "opacity-50 pointer-events-none border-border text-muted-foreground" : "border-border text-muted-foreground hover:border-orange-500 hover:text-orange-500"
                                            )}>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} disabled={uploadingProof} />
                                                {uploadingProof ? (
                                                    <div className="size-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Camera className="size-6" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Photo</span>
                                                    </>
                                                )}
                                            </label>
                                            {proofUrls.map((url, i) => (
                                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border relative group">
                                                    <img src={url} alt={`Preuve ${i + 1}`} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setProofUrls(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="absolute top-2 right-2 size-6 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                            {Array.from({ length: Math.max(0, 3 - proofUrls.length) }).map((_, i) => (
                                                <div key={`empty-${i}`} className="aspect-square rounded-2xl bg-muted/30 border border-border" />
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Security Banner */}
                                <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
                                    <ShieldCheck className="size-6 text-blue-600 mt-1" />
                                    <div>
                                        <p className="text-sm font-black text-blue-900 mb-1 tracking-tight">Protection Acheteur Active</p>
                                        <p className="text-xs text-blue-700/80 leading-relaxed font-medium">
                                            Vos fonds sont actuellement bloqués en séquestre. Ils ne seront libérés au vendeur qu'une fois la médiation terminée et validée par les deux parties.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-900/20 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <><div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Arbitrage en cours...</>
                                    ) : (
                                        <><Scale className="size-5" /> Engager la procédure de médiation</>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center space-y-8"
                            >
                                <div className="size-24 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/30 relative">
                                    <ShieldCheck className="size-12" />
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.5, type: "spring" }}
                                        className="absolute -bottom-2 -right-2 size-10 rounded-full bg-card border-4 border-emerald-500 text-emerald-500 flex items-center justify-center"
                                    >
                                        <CheckCircle2 className="size-5" />
                                    </motion.div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-foreground tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                        Dossier Indexé avec Succès
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
                                        Notre système de médiation IA a analysé votre demande. Le litige a été notifié au vendeur et à l'administration.
                                    </p>
                                </div>

                                {/* AI Verdict Card */}
                                <div className="w-full max-w-lg bg-slate-900 rounded-3xl p-8 text-left relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 size-32 bg-orange-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    
                                    <div className="flex items-center gap-2 mb-6 text-orange-500">
                                        <Sparkles className="size-5" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Recommandation Immédiate IA</span>
                                    </div>
                                    
                                    <p className="text-lg font-bold text-white leading-relaxed italic">
                                        "{mediationResult.solution_proposee_ia}"
                                    </p>
                                    
                                    <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                                <Clock className="size-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Délai estimé</p>
                                                <p className="text-xs text-white font-bold">Moins de 24 heures</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate('/disputes')}
                                            className="flex items-center gap-2 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:underline"
                                        >
                                            Suivre le ticket <ChevronRight className="size-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-sm">
                                    <button 
                                        onClick={() => navigate('/orders')}
                                        className="w-full h-12 bg-muted text-foreground border border-border rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-muted transition-all"
                                    >
                                        Mes commandes
                                    </button>
                                    <button 
                                        onClick={() => {
                                            const vendorId = order?.details?.[0]?.fournisseur_id;
                                            navigate(`/messages${vendorId ? `?recipient=${vendorId}` : ''}`);
                                        }}
                                        className="w-full h-12 bg-orange-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="size-4" /> Discuter avec le vendeur
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer Help */}
                <div className="max-w-4xl mx-auto px-4 mt-12 text-center">
                    <p className="text-xs text-muted-foreground font-medium">
                        Besoin d'aide urgente ? <button onClick={() => navigate('/help')} className="text-orange-500 font-bold hover:underline">Consultez notre FAQ</button> ou contactez le support 24/7.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DisputeReport;

